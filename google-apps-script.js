// ============================================================
// Google Apps Script — New Hire PDF Email Sender
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Go to https://script.google.com → New Project
// 2. Delete the default code and paste this entire file
// 3. Click Deploy → New Deployment
// 4. Type = "Web app"
// 5. Execute as: "Me" (your Google account)
// 6. Who has access: "Anyone"
// 7. Click Deploy → Authorize when prompted
// 8. Copy the Web App URL
// 9. Paste it into newhire.html replacing PASTE_YOUR_APPS_SCRIPT_URL_HERE
// ============================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var pdfBytes = Utilities.base64Decode(data.pdfBase64);
    var pdfBlob = Utilities.newBlob(pdfBytes, 'application/pdf', data.filename);

    var subject = 'New Hire Application - ' + data.applicantName + ' - ' + data.position;

    var body = 'A new hire onboarding packet has been submitted.\n\n' +
               'Applicant: ' + data.applicantName + '\n' +
               'Position: ' + data.position + '\n' +
               'Date: ' + data.date + '\n\n' +
               'The completed PDF is attached to this email.';

    MailApp.sendEmail({
      to: 'jobapplications@polarisfp.com',
      subject: subject,
      body: body,
      attachments: [pdfBlob]
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS preflight (optional, but good practice)
function doGet(e) {
  return ContentService
    .createTextOutput('New Hire Email Service is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
