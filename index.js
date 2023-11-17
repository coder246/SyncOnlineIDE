//load syncconfig.json file

import fs from "fs";
import fetch from 'node-fetch';

async function main() {

    console.log("\n" +
        "  /$$$$$$                                       /$$$$$$            /$$ /$$                           /$$$$$$ /$$$$$$$  /$$$$$$$$\n" +
        " /$$__  $$                                     /$$__  $$          | $$|__/                          |_  $$_/| $$__  $$| $$_____/\n" +
        "| $$  \\__/ /$$   /$$ /$$$$$$$   /$$$$$$$      | $$  \\ $$ /$$$$$$$ | $$ /$$ /$$$$$$$   /$$$$$$         | $$  | $$  \\ $$| $$      \n" +
        "|  $$$$$$ | $$  | $$| $$__  $$ /$$_____/      | $$  | $$| $$__  $$| $$| $$| $$__  $$ /$$__  $$ /$$$$$$| $$  | $$  | $$| $$$$$   \n" +
        " \\____  $$| $$  | $$| $$  \\ $$| $$            | $$  | $$| $$  \\ $$| $$| $$| $$  \\ $$| $$$$$$$$|______/| $$  | $$  | $$| $$__/   \n" +
        " /$$  \\ $$| $$  | $$| $$  | $$| $$            | $$  | $$| $$  | $$| $$| $$| $$  | $$| $$_____/        | $$  | $$  | $$| $$      \n" +
        "|  $$$$$$/|  $$$$$$$| $$  | $$|  $$$$$$$      |  $$$$$$/| $$  | $$| $$| $$| $$  | $$|  $$$$$$$       /$$$$$$| $$$$$$$/| $$$$$$$$\n" +
        " \\______/  \\____  $$|__/  |__/ \\_______/       \\______/ |__/  |__/|__/|__/|__/  |__/ \\_______/      |______/|_______/ |________/\n" +
        "           /$$  | $$                                                                                                            \n" +
        "          |  $$$$$$/                                                                                                            \n" +
        "           \\______/                                                                                                             \n");

    let oldConsoleError = console.error;
    console.error = function(string) {
        if(string.startsWith("(node:")){
            return;
        }
        oldConsoleError(string);
    };
    //if file does not exist, exit
    if (!fs.existsSync('./syncconfig.json')) {
        console.warn("syncconfig.json not found");
        process.exit(1);
    }

    let configJSON = JSON.parse(fs.readFileSync('./syncconfig.json', 'utf8'));

    let user = configJSON.user;
    if (user == null) {
        console.warn("Attribute user not found in syncconfig.json");
        process.exit(1);
    }

    let password = configJSON.password;
    if (password == null) {
        console.warn("Attribute password not found in syncconfig.json");
        process.exit(1);
    }

    let workspace = configJSON.workspace;
    if (workspace == null) {
        console.warn("Attribute workspace not found in syncconfig.json");
        process.exit(1);
    }

    let path = configJSON.path;
    if (path == null) {
        console.warn("Attribute path not found in syncconfig.json");
        process.exit(1);
    }

    if(configJSON.localPath == null){
        console.log("Attribute localPath not found in syncconfig.json - using default value ./");
    }

    let localPath = configJSON.localPath;


    if(localPath===""||localPath==null){
        localPath = "./";
    }

    //check if localPath exists
    if (!fs.existsSync(localPath)) {
        console.warn("localPath does not exist");
        process.exit(1);
    }


    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

     console.log("Logging in...");
    let {workspaces, cookie, userID, token} = await getProjects();

    //find given workspace

    let syncingWorkspace = workspaces.find((workspaceObject) => {
        return workspaceObject.name === workspace && workspaceObject.path === path && workspaceObject.isFolder === false;
    });

    if (syncingWorkspace == null) {
        console.warn("Workspace on remote not found");
        process.exit(1);
    }

    syncingWorkspace.files.forEach(async (file) => {
        await deleteFile(file.id, userID, cookie, token);
    });

    console.log("Workspace cleared");
    console.log("");

    //find all files in current directory *.java
    let localFiles = fs.readdirSync(localPath).filter((file) => {
        return file.endsWith(".java");
    });

    //log all files
    console.log("Files to upload:");
    localFiles.forEach((file) => {
        console.warn("- "+file);
    });

    //upload all files

    for (let i = 0; i < localFiles.length; i++) {
        let file = localFiles[i];
        console.log("");
        console.log("Uploading "+file+" ("+(i+1)+"/"+localFiles.length+")");
        await uploadFile(file.toString(), userID, fs.readFileSync(localPath+file, 'utf8').toString(), syncingWorkspace.id, token, cookie);
    }


    console.log("");
    console.log("Sync complete");
    console.log("");
    console.log("-------");
    console.log("Script by Tim Arnold");
    console.log("This script is not affiliated with the Online-IDE.de project or Martin Pabst.");
    console.log("-------");

    async function getProjects() {

        let loginResult = await fetch("https://online-ide.de/servlet/login", {
            "headers": {
                "accept": "*/*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "pragma": "no-cache",
                "Referer": "https://online-ide.de/",
            },
            "body": JSON.stringify({username: user, password: password}),
            "method": "POST"
        })


        let userObject = await loginResult.json();
        if(userObject.success === false){
            console.warn("Login failed. Check your credentials in syncconfig.json");
            process.exit(1);
        }else{
            console.log("Login successful");
        }

        let cookie = loginResult.headers.get('set-cookie').split(";")[0];

        return {
            workspaces: userObject.workspaces.workspaces,
            cookie: cookie,
            userID: userObject.user.id,
            token: userObject.csrfToken
        };
    }

    async function deleteFile(file, user, cookie, token) {
        let result = await fetch("https://online-ide.de/servlet/createOrDeleteFileOrWorkspace", {
            "headers": {
                "accept": "*/*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "pragma": "no-cache",
                "cookie": cookie,
                "Referer": "https://online-ide.de/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "x-token-pm": token,

            },
            "body": JSON.stringify({type: "delete", entity: "file", id: file, userId: user}),
            "method": "POST"
        });
    }

    async function uploadFile(name, user, content, workspaceID, token, cookie) {
        let result = await fetch("https://online-ide.de/servlet/createOrDeleteFileOrWorkspace", {
            "headers": {
                "accept": "*/*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "pragma": "no-cache",

                "x-token-pm": token,
                "cookie": cookie,
                "Referer": "https://online-ide.de/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },

            "body": JSON.stringify({
                type: "create",
                entity: "file",
                data: {
                    name: name,
                    text: content,
                    text_before_revision: null,
                    submitted_date: null,
                    student_edited_after_revision: false,
                    version: 1,
                    identical_to_repository_version: false,
                    workspace_id: workspaceID,
                    forceUpdate: false
                },
                owner_id: user,
                userId: user
            }),
            "method": "POST"
        });

    }
}

main()