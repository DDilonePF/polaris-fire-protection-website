// ============================================================
// Google Apps Script — New Hire PDF Email Sender
// Sends via Microsoft Graph API as helpdesk@polarisfp.com
// ============================================================
// SETUP:
// 1. Paste this code into your Apps Script project
// 2. Fill in the credentials below (they stay in Apps Script, not in GitHub)
// 3. Deploy → Manage deployments → Edit → New version → Deploy
// ============================================================

// *** FILL THESE IN INSIDE APPS SCRIPT — DO NOT COMMIT TO GITHUB ***
var TENANT_ID     = 'YOUR_TENANT_ID';
var APP_ID        = 'YOUR_APP_ID';
var CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
var FROM_EMAIL    = 'helpdesk@polarisfp.com';
var TO_EMAIL      = 'jobapplications@polarisfp.com';

// See README or ask the developer for actual credential values.
// ============================================================

function getGraphToken() {
  var url = 'https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token';
  var payload = {
    grant_type: 'client_credentials',
    client_id: APP_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default'
  };

  var options = {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: payload,
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());
  Logger.log('Token response status: ' + response.getResponseCode());
  if (json.error) {
    Logger.log('Token error: ' + json.error_description);
    throw new Error('Token error: ' + json.error_description);
  }
  return json.access_token;
}

function doPost(e) {
  try {
    Logger.log('doPost called');

    var raw = e.parameter.payload || e.postData.contents;
    var data = JSON.parse(raw);
    Logger.log('Applicant: ' + data.applicantName + ', Position: ' + data.position);

    // Get Graph API token
    var token = getGraphToken();
    Logger.log('Got Graph token');

    // Build email
    var subject = 'New Hire Application - ' + data.applicantName + ' - ' + data.position;
    var htmlBody = '<p>A new hire onboarding packet has been submitted.</p>' +
                   '<p><strong>Applicant:</strong> ' + data.applicantName + '<br>' +
                   '<strong>Position:</strong> ' + data.position + '<br>' +
                   '<strong>Date:</strong> ' + data.date + '</p>' +
                   '<p>The completed PDF is attached to this email.</p>';

    var message = {
      message: {
        subject: subject,
        body: { contentType: 'HTML', content: htmlBody },
        toRecipients: [{ emailAddress: { address: TO_EMAIL } }],
        from: { emailAddress: { address: FROM_EMAIL, name: 'Polaris Fire Protection' } },
        attachments: [{
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: data.filename,
          contentBytes: data.pdfBase64,
          contentType: 'application/pdf'
        }]
      },
      saveToSentItems: true
    };

    // Send via Graph API
    var graphUrl = 'https://graph.microsoft.com/v1.0/users/' + FROM_EMAIL + '/sendMail';
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      payload: JSON.stringify(message),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(graphUrl, options);
    Logger.log('Graph API response: ' + response.getResponseCode());
    Logger.log('Graph API body: ' + response.getContentText());

    if (response.getResponseCode() === 202) {
      Logger.log('Email sent successfully');
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      Logger.log('Graph API error: ' + response.getContentText());
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: response.getContentText() }))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (err) {
    Logger.log('ERROR: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('New Hire Email Service is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
