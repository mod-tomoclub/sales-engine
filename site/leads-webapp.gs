/**
 * TomoClub – Build With Us leads → Google Sheet
 *
 * Sheet: https://docs.google.com/spreadsheets/d/1AMHDM6ZiPFvTaiKWG-BFfwkxshPgTTcW5618g_5EpZY
 *
 * One-time setup (about 3 minutes, needs your Google login):
 *   1. Open the sheet above → Extensions → Apps Script.
 *   2. Replace the default code with this file. Save.
 *   3. Deploy → New deployment → Type: Web app.
 *        Execute as: Me   ·   Who has access: Anyone
 *      Authorise when prompted. Copy the URL ending in /exec.
 *   4. In site/custom-projects.html set  SHEET_ENDPOINT = '<that /exec URL>'.
 *   5. Optional: set NOTIFY_EMAIL below to get an email per lead.
 *
 * Every form submission appends one row (Timestamp … Source page) and,
 * if NOTIFY_EMAIL is set, sends you a short email with the lead.
 */

var SHEET_ID = '1AMHDM6ZiPFvTaiKWG-BFfwkxshPgTTcW5618g_5EpZY';
var SHEET_NAME = 'Sheet1';
var NOTIFY_EMAIL = 'avinash@tomoclub.org'; // '' to disable

function doPost(e) {
  var p = (e && e.parameter) || {};
  var row = [
    new Date(),
    p.name || '',
    p.role || '',
    p.district || '',
    p.email || '',
    p.phone || '',
    p.size || '',
    p.goal || '',
    p.areas || '',
    p.next || '',
    p.timing || '',
    p.page || 'build-with-us'
  ];
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  sheet.appendRow(row);

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'New lead: ' + (p.district || p.name || 'Build With Us'),
      body:
        'Name: ' + p.name + '\nRole: ' + p.role + '\nDistrict/School: ' + p.district +
        '\nEmail: ' + p.email + '\nPhone: ' + (p.phone || '-') + '\nStudents: ' + (p.size || '-') +
        '\n\nWhat they need:\n' + p.goal +
        '\n\nTouches: ' + (p.areas || '-') + '\nCome back as: ' + p.next +
        '\nCalendar: ' + (p.timing || '-') +
        '\n\nSheet: https://docs.google.com/spreadsheets/d/' + SHEET_ID
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Lets you hit the /exec URL in a browser to confirm the deployment is live.
function doGet() {
  return ContentService.createTextOutput('TomoClub leads endpoint is live.');
}
