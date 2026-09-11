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
 *   4. In build-with-us/index.html set  SHEET_ENDPOINT = '<that /exec URL>'.
 *   5. Optional: set NOTIFY_EMAIL below to get an email per lead.
 *
 * The form sends four fields: name, district, email, goal.
 * Row layout matches the sheet headers: Timestamp, Name, District / School,
 * Email, What's on your mind, Source page. (If the sheet still has the older
 * 12-column header row, delete the unused columns or leave them blank.)
 */

var SHEET_ID = '1AMHDM6ZiPFvTaiKWG-BFfwkxshPgTTcW5618g_5EpZY';
var NOTIFY_EMAIL = 'avinash@tomoclub.org'; // '' to disable

function doPost(e) {
  var p = (e && e.parameter) || {};
  var row = [
    new Date(),
    p.name || '',
    p.district || '',
    p.email || '',
    p.goal || '',
    p.page || 'build-with-us'
  ];
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0]; // first tab, whatever it is named
  sheet.appendRow(row);

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'New lead: ' + (p.district || p.name || 'Build With Us'),
      body:
        'Name: ' + p.name + '\nDistrict/School: ' + p.district + '\nEmail: ' + p.email +
        '\n\nWhat\'s on their mind:\n' + p.goal +
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
