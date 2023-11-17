# Online IDE Sync Script

This script automates the synchronization of files from a local directory to the Online-IDE.de project. It utilizes the Online-IDE.de API to log in, clear the existing workspace, and upload Java files from the specified local directory.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)
- [Author](#author)

## Introduction

The Online IDE Sync Script is designed to streamline the process of synchronizing your local Java files with the Online-IDE.de project. It performs login, clears the existing workspace, and uploads the Java files from the specified local directory.

## Installation

1. Download SyncOnlineIDE.exe from the latest release. (preferred)

or:

1. Clone the repository or download the script file.
2. Make sure you have Node.js installed.
3. Install dependencies by running: `npm install` or `yarn install`

## Usage

(preferred)

Download the latest release and run the .exe-file in your local directory containing the Java files you want to upload to Online-IDE.de.

Don't forget to configure the credentials before running it. See [Configuration](#configuration) for more information.

or:

Run the script using the command:

```bash
node script.js
```

The script will prompt you with updates as it progresses through the synchronization process.

## Configuration

Before running the script, ensure that you have a `syncconfig.json` file with the required configuration parameters:

- `user`: Your Online-IDE.de username.
- `password`: Your Online-IDE.de password.
- `workspace`: The name of the workspace on Online-IDE.de.
- `path`: The path within the Online-IDE.de workspace. Keep empty if you want to upload to the root directory.
- `localPath`: The local directory path for Java files. If not specified, the default is set to `./`.

Example `syncconfig.json`:

```json
{
  "user": "your_username",
  "password": "your_password",
  "workspace": "your_workspace",
  "path": "your_path",
  "localPath": "./your_local_directory"
}

```

## License

This script is licensed under the [MIT License](LICENSE).

## Disclaimer

```
This script is not affiliated with the Online-IDE.de project or Martin Pabst.
```

