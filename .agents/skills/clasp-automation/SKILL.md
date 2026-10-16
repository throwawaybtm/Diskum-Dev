---
name: clasp-automation
description: >-
  Automate Google Apps Script workflows using Google clasp (Command Line Apps Script Projects).
  Use this skill when developing, pulling, pushing, deploying, versioning, or synchronizing
  Google Apps Script projects (such as Google Sheets, Docs, Forms, or standalone web apps)
  and managing .clasp.json configurations.
---

# Clasp Automation

This skill provides step-by-step guidance and automation helpers for developing, synchronizing, and deploying Google Apps Script (GAS) projects locally using **Google clasp** (`@google/clasp`).

---

## 1. Prerequisites & Environment Setup

Before executing clasp commands:

1. **Verify Node.js & Clasp**:
   - Verify Node.js is installed: `node -v`
   - Clasp is typically installed globally via `npm install -g @google/clasp`.
   - **Windows Notice**: In Windows PowerShell, running `clasp` directly may fail if script execution policies block `clasp.ps1`. Always use `clasp.cmd` or the included runner scripts:
     - PowerShell: [scripts/clasp-runner.ps1](./scripts/clasp-runner.ps1)
     - Command Prompt / Batch: [scripts/clasp-runner.cmd](./scripts/clasp-runner.cmd)
     - Or invoke directly: `cmd.exe /c "clasp <command>"`

2. **Google Apps Script API Access**:
   - The user must turn on the Google Apps Script API in user settings:
     [https://script.google.com/home/usersettings](https://script.google.com/home/usersettings)
   - If disabled, clasp push/pull commands will fail with API authorization errors.

3. **Authentication**:
   - Check login status: `clasp.cmd login --status`
   - Log in if needed: `clasp.cmd login` (opens browser OAuth consent)
   - Global credentials reside in `~/.clasprc.json`.

---

## 2. Project Configuration (`.clasp.json`)

Ensure `.clasp.json` is located in the target project folder (or root directory):

```json
{
  "scriptId": "<YOUR_SCRIPT_ID>",
  "rootDir": "",
  "scriptExtensions": [".js", ".gs"],
  "htmlExtensions": [".html"],
  "jsonExtensions": [".json"],
  "filePushOrder": [],
  "skipSubdirectories": false
}
```

- `scriptId`: The unique Apps Script ID (found in Project Settings or URL `https://script.google.com/d/<scriptId>/edit`).
- `rootDir`: Relative path to code directory (e.g. `""` if `.clasp.json` is in the source folder, or `"AWAN"` if `.clasp.json` is in repo root).
- See full example in [examples/.clasp.json.example](./examples/.clasp.json.example).

---

## 3. Standard Workflows

### Workflow A: Synchronize Remote Changes Locally (`pull`)

Run when changes were made in the web editor and need to be pulled to the local workspace:

1. Navigate to the project directory containing `.clasp.json`:
   ```powershell
   cd AWAN
   ```
2. Check differences:
   ```powershell
   clasp.cmd status
   ```
3. Pull remote files:
   ```powershell
   clasp.cmd pull
   ```
4. Verify pulled files (e.g., `Code.js`, `appsscript.json`, HTML templates).

### Workflow B: Push Local Changes to Apps Script (`push`)

Run after editing local code or templates:

1. Validate local syntax and ensure `appsscript.json` is valid JSON.
2. Check untracked/modified files:
   ```powershell
   clasp.cmd status
   ```
3. Push changes:
   ```powershell
   clasp.cmd push
   ```
4. (Optional) Force push if remote changes should be overwritten:
   ```powershell
   clasp.cmd push --force
   ```
5. (Optional) Continuous sync during active development:
   ```powershell
   clasp.cmd push --watch
   ```

### Workflow C: Versioning & Deployment (`deploy`)

For web apps or published add-ons:

1. **Create an immutable version**:
   ```powershell
   clasp.cmd version "Release description"
   ```
2. **List existing deployments**:
   ```powershell
   clasp.cmd deployments
   ```
3. **Deploy a new version**:
   ```powershell
   clasp.cmd deploy --description "v1.0.1 release"
   ```
4. **Update an existing deployment** (e.g., the production web app deployment ID):
   ```powershell
   clasp.cmd deploy -i <DEPLOYMENT_ID> -d "Updated production build"
   ```
5. **Open project in browser**:
   ```powershell
   clasp.cmd open
   ```

---

## 4. Helper Scripts & Examples

- **Windows Runner Script**: [scripts/clasp-runner.ps1](./scripts/clasp-runner.ps1) wraps execution without execution policy obstacles.
- **Batch Runner**: [scripts/clasp-runner.cmd](./scripts/clasp-runner.cmd) for cmd environments.
- **CI/CD Pipeline**: [examples/github-actions-deploy.yml](./examples/github-actions-deploy.yml) provides automated deployments via GitHub Actions.
- **Complete Command Reference**: [references/clasp-commands.md](./references/clasp-commands.md) lists all clasp flags and subcommands.
- **Troubleshooting Guide**: [references/troubleshooting.md](./references/troubleshooting.md) covers common errors (auth, execution policies, manifest conflicts).
