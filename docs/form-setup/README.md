# Site Forms → Google Sheet

Two forms feed the same **Google Apps Script Web App**, which appends each
submission as a row in a **Google Sheet** you own. Free, no submission cap, and
you can download the sheet as Excel anytime.

| Form | Where | Lands in Sheet tab |
|------|-------|--------------------|
| "View Course Details" modal | courses.html | **Submissions** |
| "Send Us a Message" | contact.html | **Contact Messages** |

The script routes by a `formType` field in the payload and auto-creates each tab
(with a bold header row) the first time it receives that form.

## One-time setup (~15 minutes)

### 1. Create the Google Sheet
1. Go to <https://sheets.google.com> and create a new blank spreadsheet.
2. Name it e.g. **"CyLens Course Enquiries"**.
   (You don't need to add headers — the script writes them on the first submission.)

### 2. Add the Apps Script
1. In the sheet: **Extensions → Apps Script**.
2. Delete any starter code in `Code.gs`.
3. Copy the entire contents of [`Code.gs`](./Code.gs) (in this folder) and paste it in.
4. Click the **Save** icon (💾).

### 3. Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Click the gear ⚙ next to "Select type" → choose **Web app**.
3. Set:
   - **Description:** `CyLens form` (anything)
   - **Execute as:** **Me** (your Google account)
   - **Who has access:** **Anyone**
4. Click **Deploy**.
5. Google will ask you to **authorize** — approve it (click *Advanced → Go to
   project (unsafe)* if it warns; it's your own script).
6. Copy the **Web app URL** — it ends in `/exec`.
   Example: `https://script.google.com/macros/s/AKfycb..../exec`

### 4. Plug the URL into the site
Open `js/main.js`, find this line near the top of the course-modal block:

```js
const FORM_ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```

Replace the placeholder with your `/exec` URL, save, commit, and push.
(Or send the URL to Claude and it will paste + push for you.)

## Testing
1. Open the deployed site → **Courses** → click **View Course Details**.
2. Fill in the form and submit. You should see "✓ Submitted!".
3. Check your Google Sheet — a new row should appear within a second or two.

## Adding the contact form (if you set this up before the contact form existed)
The contact form needs the newer `Code.gs` that routes by `formType`. If your
Apps Script still has the old single-tab version:
1. Open **Extensions → Apps Script**, replace `Code.gs` with the current version
   in this folder, **Save**.
2. **Deploy → Manage deployments → Edit (✏) → Version: New version → Deploy.**
   The `/exec` URL stays the same, so no site change is needed.

## Notes
- **Updating the script later:** after editing `Code.gs`, you must
  **Deploy → Manage deployments → Edit (✏) → Version: New version → Deploy**,
  otherwise the live URL keeps running the old code.
- **Spam:** the form has a hidden "honeypot" field; bots that fill it are dropped
  client-side. For a low-traffic site this is usually enough.
- **Export to Excel:** in the sheet, **File → Download → Microsoft Excel (.xlsx)**.
- **Email alerts (optional):** add a `MailApp.sendEmail(...)` call inside `doPost`
  in `Code.gs` if you want a notification on each submission.
