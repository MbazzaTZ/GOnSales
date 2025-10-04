# GoNSales — Local development

This repository contains a static dashboard. The project is served as static files.

Quick start (recommended)

1. Open PowerShell and change to the project folder:

```powershell
Set-Location 'C:\Users\Admin\Documents\GoNsales'
```

2. Run the helper script (it will check for `npm`, attempt to install Node.js via `winget` if missing, then run the dev server):

```powershell
# If PowerShell blocks the script due to execution policy, run the next line first:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\dev.ps1
```

Alternative (if you already have Node.js/npm):

```powershell
Set-Location 'C:\Users\Admin\Documents\GoNsales'
npm install
npm run dev
```

This will start a static server (http-server) on port 8000 by default. Open http://localhost:8000 in your browser.

Alternative without Node.js (if you have Python):

```powershell
Set-Location 'C:\Users\Admin\Documents\GoNsales'
python -m http.server 8000
```

Notes
- The helper script will try to install Node.js LTS via `winget` when `npm` is missing. That requires `winget` and may prompt for elevation.
- If `npm` is not available after an automated install, restart PowerShell and re-run the script.
# GoNsales SPA Example

This is a minimal Single Page Application (SPA) setup using vanilla JavaScript.

## Files
- `index.html`: Main HTML file with navigation and SPA container.
- `main.js`: JavaScript router for SPA navigation.
- `style.css`: Basic styling for the app.

## Usage
Open `index.html` in your browser to view the SPA.

## Routing
Navigation uses hash-based routing (`#/home`, `#/about`, `#/contact`).

## Firebase + Firestore Emulator (local testing)

This project can connect to a real Firebase project or to the local Firestore emulator for safe development.

1) Install Firebase CLI globally (if not already):

```powershell
npm install -g firebase-tools
```

2) Start the local static dev server:

```powershell
npm run dev
```

3) To start the Firestore emulator (recommended for testing writes):

```powershell
npm run emulator:start
```

This runs the Firestore emulator via the Firebase CLI. The app will still try to initialize Firebase using the config in `index.html`. To point your app at the emulator you can run this in the browser console after app load:

```javascript
if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.connectFirestoreEmulator) {
	window.firebase.firestore.connectFirestoreEmulator(window.firebase.db, 'localhost', 8080);
}
```

4) Run the headless checks (uses `tools/check_page.js`):

```powershell
npm run check
```

Or, to run checks while the emulator is running, ensure emulator is started first and then run the check command in another terminal.

Notes:
- Firestore security rules still apply. For emulator testing you can use open rules in emulator mode or configure auth emulation.
- If you want, I can add a small script to automatically connect to the emulator from the app at startup when an env flag is set.
