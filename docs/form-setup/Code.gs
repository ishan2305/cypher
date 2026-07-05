/**
 * CyLens — Course Enquiry Form Handler (Google Apps Script)
 * ---------------------------------------------------------
 * Appends each submission from the website's "View Course Details"
 * modal as a new row in the bound Google Sheet.
 *
 * SETUP: see docs/form-setup/README.md
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000); // avoid two simultaneous submissions clobbering a row

  try {
    // Parse the JSON body sent by the site
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (err) { data = {}; }
    }
    // Fallback if the body ever comes through form-encoded
    if ((!data || !data.name) && e && e.parameter) { data = e.parameter; }

    var formType = String(data.formType || 'course').toLowerCase();

    if (formType === 'contact') {
      // "Send Us a Message" form on contact.html
      writeRow('Contact Messages',
        ['Received At', 'Name', 'Email', 'Phone', 'Service Interest', 'Message', 'Page', 'Submitted At (client)'],
        [new Date(), data.name || '', data.email || '', data.phone || '',
         data.service || '', data.message || '', data.page || '', data.submittedAt || '']);
    } else {
      // "View Course Details" modal on courses.html
      writeRow('Submissions',
        ['Received At', 'Name', 'Email', 'Phone', 'Qualification', 'Course', 'Page', 'Submitted At (client)'],
        [new Date(), data.name || '', data.email || '', data.phone || '',
         data.qualification || '', data.course || '', data.page || '', data.submittedAt || '']);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Append a row to the named tab, creating the tab + bold header row
 * on first use.
 */
function writeRow(sheetName, headers, row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  sheet.appendRow(row);
}

// Lets you sanity-check the deployment by opening the URL in a browser
function doGet() {
  return ContentService.createTextOutput('CyLens form endpoint is live.');
}
