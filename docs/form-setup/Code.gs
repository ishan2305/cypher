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
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Submissions') || ss.insertSheet('Submissions');

    // Write a header row the first time the sheet is used
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Received At', 'Name', 'Email', 'Phone',
        'Qualification', 'Course', 'Page', 'Submitted At (client)'
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }

    // Parse the JSON body sent by the site
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (err) { data = {}; }
    }
    // Fallback if the body ever comes through form-encoded
    if ((!data || !data.name) && e && e.parameter) { data = e.parameter; }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.qualification || '',
      data.course || '',
      data.page || '',
      data.submittedAt || ''
    ]);

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

// Lets you sanity-check the deployment by opening the URL in a browser
function doGet() {
  return ContentService.createTextOutput('CyLens form endpoint is live.');
}
