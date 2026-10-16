# Clasp Troubleshooting & Solutions

Common issues encountered when working with Google clasp, particularly on Windows and automated environments.

---

## 1. Windows PowerShell: Script Execution Policy Error

### Symptom:
```text
clasp : File C:\Users\...\AppData\Roaming\npm\clasp.ps1 cannot be loaded because running scripts is disabled on this system.
```

### Cause:
Windows PowerShell restricts `.ps1` execution by default (`Restricted` execution policy).

### Solutions:
1. **Use `clasp.cmd`**: Run `clasp.cmd <args>` instead of `clasp <args>`.
2. **Use the helper runner**: Run `.\scripts\clasp-runner.ps1 <args>` or `.\scripts\clasp-runner.cmd <args>`.
3. **Use cmd wrapper**: `cmd.exe /c "clasp <args>"`.
4. **Change Current User Policy** (if permitted):
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

---

## 2. Google Apps Script API Not Enabled

### Symptom:
```text
User has not enabled the Apps Script API. Enable it by visiting https://script.google.com/home/usersettings
```

### Solution:
1. Open [https://script.google.com/home/usersettings](https://script.google.com/home/usersettings) in your web browser.
2. Toggle **Google Apps Script API** to **ON**.
3. Retry the clasp command.

---

## 3. Remote Changes Conflict on Push

### Symptom:
```text
Manifest file has been updated remotely. Use --force to push anyway.
```

### Solution:
- If remote edits should be preserved: run `clasp.cmd pull` first to synchronize changes to local disk, merge any conflicts in git, then push.
- If local edits are canonical and should overwrite remote: run `clasp.cmd push --force`.

---

## 4. `appsscript.json` Parsing or Validation Error

### Symptom:
```text
SyntaxError: Unexpected token in appsscript.json
```

### Solution:
- Validate JSON structure using a linter or `Get-Content appsscript.json | ConvertFrom-Json`.
- Ensure critical manifest properties (`timeZone`, `runtimeVersion: "V8"`, `dependencies`) are intact.
- For web apps, make sure `webapp` block conforms to:
  ```json
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
  ```

---

## 5. Token Expiration or Authentication Loss

### Symptom:
```text
GaxiosError: invalid_grant
```

### Solution:
1. Re-authenticate:
   ```powershell
   clasp.cmd login
   ```
2. If working on a headless or remote machine without local browser access:
   ```powershell
   clasp.cmd login --no-localhost
   ```
3. Copy the URL into your browser, grant permissions, and paste the authorization token back into the terminal.
