const https = require('https');
const querystring = require('querystring');

// Credentials loaded from Azure App Settings (environment variables), never in code
const TENANT_ID     = process.env.GRAPH_TENANT_ID;
const APP_ID        = process.env.GRAPH_APP_ID;
const CLIENT_SECRET = process.env.GRAPH_CLIENT_SECRET;
const FROM_EMAIL    = process.env.GRAPH_FROM_EMAIL || 'jobapplications@polarisfp.com';
const TO_EMAIL      = process.env.GRAPH_TO_EMAIL || 'jobapplications@polarisfp.com';

function httpReq(url, method, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = { hostname: u.hostname, path: u.pathname + u.search, method, headers: headers || {} };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

module.exports = async function (context, req) {
  context.res = { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } };

  if (req.method === 'OPTIONS') {
    context.res.status = 204;
    return;
  }

  try {
    const data = req.body;
    if (!data || !data.pdfBase64) {
      context.res.status = 400;
      context.res.body = { success: false, error: 'Missing data' };
      return;
    }

    // Get Graph token
    const tokenBody = querystring.stringify({
      grant_type: 'client_credentials',
      client_id: APP_ID,
      client_secret: CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default'
    });
    const tokenRes = await httpReq(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, 'POST',
      { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(tokenBody) },
      tokenBody
    );
    const token = JSON.parse(tokenRes.body).access_token;
    if (!token) {
      context.res.status = 500;
      context.res.body = { success: false, error: 'Authentication failed' };
      return;
    }

    // Send email via Graph API
    const mail = JSON.stringify({
      message: {
        subject: 'New Hire Application - ' + data.applicantName + ' - ' + data.position,
        body: {
          contentType: 'HTML',
          content: '<p>A new hire onboarding packet has been submitted.</p>' +
            '<p><strong>Applicant:</strong> ' + data.applicantName + '<br>' +
            '<strong>Position:</strong> ' + data.position + '<br>' +
            '<strong>Date:</strong> ' + data.date + '</p>' +
            '<p>The completed PDF is attached to this email.</p>'
        },
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
    });

    const mailRes = await httpReq(
      `https://graph.microsoft.com/v1.0/users/${FROM_EMAIL}/sendMail`, 'POST',
      { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(mail) },
      mail
    );

    if (mailRes.status === 202) {
      context.res.status = 200;
      context.res.body = { success: true };
    } else {
      context.res.status = 500;
      context.res.body = { success: false, error: 'Email delivery failed' };
    }
  } catch (err) {
    context.res.status = 500;
    context.res.body = { success: false, error: 'Server error' };
  }
};
