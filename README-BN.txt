SMART TAILORS — Cloud Sync build

Files to upload to the ROOT of the existing GitHub repository (replace same-name files):
1. index.html
2. firebase.js
3. Firestore-Rules.txt (reference only; paste into Firebase Firestore Rules if rules differ)

Requirements already configured in Firebase: Email/Password sign-in, Firestore database, authorized domain atik-dev904.github.io.

Firestore path used: /users/{uid}/businessData/main
Each account can read/write only its own user document tree under the supplied rules.

IMPORTANT: This build intentionally does not import old browser localStorage test data into a new cloud account. Existing backups should be imported after login using Settings > Data Backup > Restore. Keep a backup JSON before replacing the live app.

The app retains the existing fabric sales, multi-item tailoring orders and measurements, customer payments/due, expenses, payment history, customer notes, settings, backup/restore, and calculator. Calculator styling is refreshed.
