# Google Clasp Command Reference

Comprehensive list of commands provided by `@google/clasp`.

---

## Authentication & Setup

### `clasp login`
Logs the user into Google via OAuth2.
- Options:
  - `--no-localhost`: Do not run a local server; copy-paste the authorization code manually.
  - `--creds <path>`: Use custom OAuth Client ID credentials JSON instead of the default clasp client.
  - `--status`: Check current logged-in user email and authorization state.

### `clasp logout`
Logs out of Google and deletes local credential tokens in `~/.clasprc.json`.

---

## Project Initialization & Configuration

### `clasp create [options]`
Creates a new Google Apps Script project.
- Options:
  - `--title <title>`: Script title.
  - `--type <type>`: Project type: `standalone`, `docs`, `sheets`, `slides`, `forms`, `webapp`, `api`.
  - `--rootDir <dir>`: Local directory where code lives.
  - `--parentId <id>`: Drive folder ID or bound document ID.

### `clasp clone <scriptId> [options]`
Clones an existing Apps Script project locally.
- Options:
  - `--rootDir <dir>`: Local directory destination.
  - `--versionNumber <version>`: Clone a specific immutable version.

### `clasp setting [key] [val]`
Inspects or updates settings in `.clasp.json`.

---

## Code Synchronization

### `clasp status [options]`
Lists local files that are tracked, modified, or untracked compared to the remote Apps Script project.
- Options:
  - `--json`: Output status as JSON.

### `clasp pull [options]`
Fetches files from Google Apps Script and overwrites local files.
- Options:
  - `--versionNumber <version>`: Pull a specific version.

### `clasp push [options]`
Uploads local project files to Google Apps Script.
- Options:
  - `-f`, `--force`: Overwrites remote files even if they were edited in the web browser after last pull.
  - `-w`, `--watch`: Watches local files and auto-pushes on save.

---

## Deployments & Versions

### `clasp version [description]`
Creates a new immutable numbered version of the script project.

### `clasp versions`
Lists all immutable versions created for the project.

### `clasp deploy [options]`
Deploys the project (e.g. as a web app, library, or API executable).
- Options:
  - `-v`, `--versionNumber <version>`: Deploy a specific version number.
  - `-d`, `--description <desc>`: Deployment description.
  - `-i`, `--deploymentId <id>`: Redeploy an existing deployment ID (preserves the live web app URL).

### `clasp deployments`
Lists all active deployments, their deployment IDs, versions, and descriptions.

### `clasp undeploy [deploymentId]`
Removes a deployment.
- Options:
  - `-a`, `--all`: Undeploy all deployments.

---

## Inspection & Utilities

### `clasp open [options]`
Opens the Apps Script project in your default web browser.
- Options:
  - `--webapp`: Open the deployed web app URL instead of the script editor.
  - `--creds`: Open the Google Cloud Console credentials page for this project.

### `clasp logs [options]`
Streams Google Cloud Stackdriver / Cloud Logging logs to terminal.
- Options:
  - `--json`: Output logs in JSON format.
  - `--open`: Open Google Cloud Logging in browser.
  - `--setup`: Setup Google Cloud Logging project.

### `clasp run [functionName]`
Remotely executes a function in your Google Apps Script project via the Execution API.
