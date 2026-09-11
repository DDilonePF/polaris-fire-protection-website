# Polaris Fire Protection Website Documentation

## Overview

Static website for Polaris Fire Protection, hosted on Azure Static Web Apps.

- **Live URL:** https://www.polarisfp.com (apex https://polarisfp.com also serves)
- **Azure default URL:** https://purple-mud-05a08090f.1.azurestaticapps.net (still resolves, useful for testing)
- **Azure Resource Group:** polaris-website-rg
- **Azure Static Web App Name:** polaris-fire-protection
- **Azure Region:** East US 2
- **Azure Subscription:** Azure subscription 1 (4b3db3d9-95d4-4e5f-9b17-ef71da2bf7f5)
- **Azure Account:** admin@polarisfp365.onmicrosoft.com

---

## File Structure

```
Website/
  index.html            Home page (hero, services, stats, why us, contact form)
  about.html            About page (company story, capabilities)
  projects.html         Project gallery (21 photos with lightbox)
  contact.html          Contact form + office locations
  employment.html       Job postings + online application (English/Spanish toggle)
  newhire.html          New hire onboarding portal (5-step wizard, generates PDF)
  css/
    styles.css          Main stylesheet (DM Sans font, charcoal/red/blue color scheme)
  js/
    main.js             Navigation, scroll effects, reveal animations, contact form submit
  api/
    send-newhire-email/ Azure Function: sends all form mail via Microsoft Graph
  images/
    logo.png            Polaris Fire Protection logo
    hero-bg.jpg         Homepage hero background (sprinkler head)
    about-bg.jpg        About page photo (construction site)
    gallery-bg.jpg      Projects page hero background
    service-1.jpg       Estimating (calculator image)
    service-2.jpg       Design & Engineering (blueprints)
    service-3.jpg       Service & Repairs (technician at fire system)
    service-4.jpg       New Installations (worker on lift)
    service-5.jpg       Inspections & Maintenance (construction inspection)
    gallery-*.jpg       Project photos (34 on disk, 21 referenced by projects.html)
```

---

## Design Details

### Fonts
- **Barlow** (Google Fonts) weights: 400, 500, 600
- **Barlow Condensed** (Google Fonts) weights: 400, 600, 700, 800 (headings)

### Color Palette (from logo)
| Variable       | Value      | Usage                          |
|----------------|------------|--------------------------------|
| --c-bg-dark    | #1C1C1E    | Dark backgrounds (footer, nav) |
| --c-text       | #222222    | Body text                      |
| --c-text-muted | #5C6370    | Secondary text                 |
| --c-red        | #CC2936    | Primary accent (buttons, CTAs) |
| --c-red-hover  | #A8212C    | Button hover                   |
| --c-blue       | #1A5DAB    | Secondary accent (icons, checks, card hovers) |
| --c-blue-soft  | #EDF3FB    | Blue tinted backgrounds        |
| --c-bg-alt     | #F5F7FA    | Alternate section backgrounds  |
| --c-border     | #E0E4EA    | Borders and dividers           |

### Key Design Choices
- Service strip below hero is solid red bar with dot separators
- Service card icons and checklist circles use blue (from logo star)
- Cards hover with blue border tint
- Stats bar has red top border accent
- Hero eyebrow badge is solid red pill
- Buttons have 5px border radius
- Scroll reveal animations on all sections

---

## Pages

### Home (index.html)
- Transparent nav that turns solid on scroll
- Full-height hero with background image, eyebrow "South Florida's Premier Fire Protection Specialist"
- Red service strip listing all 5 services
- Service cards (3-column grid) with images and SVG icons
- Stats section (5 Locations, 24/7 Emergency, 100% Licensed, NFPA Compliant)
- "Why Choose Polaris" section with checkmark list and photo
- Contact form (posts to /api/send-newhire-email)
- Full footer with 4 columns

### About (about.html)
- Company description (original content from polarisfp.com)
- Capabilities statement
- Stats bar
- CTA banner

### Projects (projects.html)
- 15 project photos in responsive grid (gallery-1.jpg is the logo, removed from gallery)
- Clickable lightbox with arrow key navigation
- CTA banner

### Contact (contact.html)
- Contact form (posts to /api/send-newhire-email, delivered to jobapplications@polarisfp.com)
- All 4 office locations:
  - Polaris HQ, Ft Lauderdale, FL (Alex Romero, aromero@polarisfp.com, 954-678-3934)
  - West Palm, FL
  - Tampa, FL
  - Mid Atlantic (Baltimore, MD)

### Employment (employment.html)
- 6 job postings with color-coded badges (Field/Engineering/Admin)
- Online application form with English/Spanish language toggle
- Form sections: Position Info, Personal Info, Education, Employment History (2 employers), Certifications, Resume, Additional Notes
- Renders the completed application to a PDF with jsPDF, then posts it to /api/send-newhire-email
- On a failed send the PDF downloads so the applicant does not lose their work
- Spanish translation built into the page (no separate page needed)

### New Hire Portal (newhire.html)
- NOT linked from public navigation (accessed via direct URL only)
- Has `noindex, nofollow` meta tag
- 5-step wizard with progress pills:
  1. Employment Application (same fields as employment.html, both employers required)
  2. New Employee Information Sheet (personal, date of birth, SSN, direct deposit, emergency contact, garnishments)
  3. Confidential Information Sheet (voluntary EEO demographics, disability, veteran status)
  4. Work Rules (all 30 rules displayed, must acknowledge)
  5. Fall Protection Training Checklist (9 items)
- W-4 and I-9 are no longer steps in this form and are handled separately
- On submit, generates a multi-page PDF using jsPDF, then posts it to /api/send-newhire-email
- The success screen only appears once the server confirms delivery
- On a failed send the PDF downloads so the new hire does not lose their work
- PDF filename: NewHire_LastName_FirstName_YYYY-MM-DD.pdf

---

## Forms & Email

> **Changed 2026-09-09.** The site no longer uses EmailJS. Both EmailJS templates
> were deleted from the account, which made every contact message and every
> employment application fail silently with "template ID not found". All forms
> now post to the Azure Function described below. The EmailJS account is unused
> and can be cancelled.

### Architecture

All three public forms post JSON to a single Azure Function, which sends mail
through the Microsoft Graph API using app-only client credentials. There is no
third-party email service and no user OAuth grant to expire.

```
Browser form  ->  POST /api/send-newhire-email  ->  Microsoft Graph  ->  inbox
```

| Form                   | Page(s)                  | Sends            | formType      |
|------------------------|--------------------------|------------------|---------------|
| Contact form           | index.html, contact.html | Message body     | `contact`     |
| Employment application | employment.html          | PDF attachment   | `application` |
| New hire onboarding    | newhire.html             | PDF attachment   | *(omitted)*   |

All three deliver to the address in the `GRAPH_TO_EMAIL` app setting, currently
`jobapplications@polarisfp.com`. The applicant's own address is set as both the
CC and the reply-to, so replying reaches them directly.

### The function

**Location:** `api/send-newhire-email/index.js`
**Route:** `POST /api/send-newhire-email` (anonymous auth, CORS open)

Credentials come from Azure App Settings and are never in code:

| App Setting           | Purpose                                    |
|-----------------------|--------------------------------------------|
| `GRAPH_TENANT_ID`     | Entra tenant                               |
| `GRAPH_APP_ID`        | App registration client ID                 |
| `GRAPH_CLIENT_SECRET` | Client secret                              |
| `GRAPH_FROM_EMAIL`    | Sending mailbox (default jobapplications@) |
| `GRAPH_TO_EMAIL`      | Destination inbox (default jobapplications@)|

### Request fields

A submission is accepted if it carries **either** an attachment **or** a message
body. Anything else returns `400 {"success": false, "error": "Missing data"}`.

| Field           | Used by            | Notes                                     |
|-----------------|--------------------|-------------------------------------------|
| `formType`      | all                | `contact`, `application`, or omitted       |
| `message`       | contact            | Plain text, newlines become line breaks    |
| `pdfBase64`     | application, newhire | Base64 PDF body, no data URI prefix      |
| `filename`      | application, newhire | Attachment filename                      |
| `attachments[]` | any                | Optional multi-file form: `{name, base64, contentType}` |
| `applicantName` | application, newhire | Falls back to `fromName`                 |
| `fromName`      | contact            |                                            |
| `fromEmail`     | all                | Becomes the reply-to address               |
| `phone`         | all                |                                            |
| `position`      | application, newhire |                                          |
| `subject`       | contact            |                                            |
| `date`          | application, newhire |                                          |
| `ccEmail`       | any                | Copies the submitter                       |

`formType` drives the subject line, so the three form types sort cleanly in the
inbox. Omitting it keeps the original onboarding wording, which is why
newhire.html needed no change when contact and application were migrated.

| formType      | Subject line                                       |
|---------------|----------------------------------------------------|
| `contact`     | `Website Contact - {subject} - {name}`             |
| `application` | `Employment Application - {name} - {position}`     |
| *(omitted)*   | `New Hire Application - {name} - {position}`       |

All user-supplied values are HTML-escaped before going into the mail body.

### Responses

| Status | Body                                                | Meaning                         |
|--------|-----------------------------------------------------|---------------------------------|
| 200    | `{"success": true}`                                 | Graph accepted the message      |
| 400    | `{"success": false, "error": "Missing data"}`        | No attachment and no message    |
| 500    | `{"success": false, "error": "Authentication failed"}` | Graph token request failed   |
| 500    | `{"success": false, "error": "Email delivery failed"}`  | Graph rejected the sendMail  |

### Client behaviour on failure

Every form gates its success screen on **both** the HTTP status and the
`success` flag. A failed send must never look like it worked.

- **Contact form** restores the button and tells the visitor to call 954-678-3934.
- **Employment application** downloads the completed application as a PDF and
  tells the applicant to email it to jobapplications@polarisfp.com.
- **New hire onboarding** downloads the completed packet and does the same.

The two PDF forms hand the user their document precisely so a failed submission
does not destroy the work they just typed in.

### Testing the endpoint

```bash
# Should return 400 Missing data
curl -X POST https://www.polarisfp.com/api/send-newhire-email \
  -H "Content-Type: application/json" -d '{}'

# Sends a real contact-form email
curl -X POST https://www.polarisfp.com/api/send-newhire-email \
  -H "Content-Type: application/json" \
  -d '{"formType":"contact","fromName":"Test","fromEmail":"you@polarisfp.com","subject":"Test","message":"Test"}'
```

## Hosting & Deployment

### Azure Static Web Apps
- **SKU:** Free
- **Region:** East US 2
- **Default URL:** purple-mud-05a08090f.1.azurestaticapps.net

### How to Deploy Updates

Deployment is automatic. Pushing to `master` triggers the GitHub Action in
`.github/workflows/azure-static-web-apps.yml`, which deploys the site and the
API together. A run takes about a minute.

```bash
git push origin master
gh run watch $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
```

The API is built and deployed from `/api` on every run, so changes to the Azure
Function ship with the same push. Verify a deploy by requesting a page with a
cache-busting query string, since the CDN caches aggressively:

```bash
curl -s "https://www.polarisfp.com/employment.html?cb=$RANDOM" | grep -o jspdf
```

### Manual deploy (fallback only)

Only needed if the GitHub Action is unavailable. Requires Azure CLI and SWA CLI:

```bash
# 1. Copy files to a clean path (avoid OneDrive spaces issue)
rm -rf /c/temp/polaris-deploy/*
cp -r "C:/Users/DiogenesDilone/OneDrive - Polaris Fire Protection/Documents/claude_projects/Website/"* /c/temp/polaris-deploy/
rm -rf /c/temp/polaris-deploy/.claude

# 2. Set PATH for Node.js and npm
export PATH="/c/Program Files/nodejs:/c/Users/DiogenesDilone/AppData/Roaming/npm:$PATH"

# 3. Get deployment token
DEPLOY_TOKEN=$(az staticwebapp secrets list --name polaris-fire-protection --resource-group polaris-website-rg --query "properties.apiKey" -o tsv)

# 4. Deploy
swa deploy /c/temp/polaris-deploy --deployment-token "$DEPLOY_TOKEN" --env production
```

### Prerequisites Installed
- **Azure CLI:** 2.83.0
- **Node.js:** v24.14.1 (installed via winget)
- **npm:** 11.11.0
- **SWA CLI:** 2.0.8 (@azure/static-web-apps-cli)

---

## Custom Domain

Done. Both hostnames serve the site over HTTPS with an Azure-provisioned
certificate:

- `https://www.polarisfp.com`
- `https://polarisfp.com`

The Azure default URL `purple-mud-05a08090f.1.azurestaticapps.net` still
resolves and is useful for testing a deploy before DNS or CDN caching catches
up.

To add another hostname later:

```bash
az staticwebapp hostname set --name polaris-fire-protection --resource-group polaris-website-rg --hostname <hostname>
```

Then add a CNAME at the registrar pointing to the Azure default URL. Azure
auto-provisions the certificate.

---

## New Hire Portal Workflow

1. HR sends new hire the direct link: `https://[your-domain]/newhire.html`
2. New hire opens link on office iPad connected to WiFi
3. Fills out all 5 steps (Application, Employee Info, Confidential, Work Rules, Fall Protection)
4. Clicks "Generate PDF & Submit"
5. The completed packet is emailed to jobapplications@polarisfp.com, with a copy to the new hire
6. HR prints the PDF from the email and files it
7. New hire fills out W-4 and I-9 separately (linked fillable PDFs from IRS/USCIS)

If the email fails, the new hire sees an error and the PDF downloads to the iPad
instead. It then has to be emailed to jobapplications@polarisfp.com by hand.

### W-4 & I-9 Links
- **W-4:** https://www.irs.gov/pub/irs-prior/fw4--2025.pdf (fillable)
- **I-9:** https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf (fillable)

---

## Company Information

- **Company:** Polaris Fire Protection
- **HQ:** 4009 SW 7th Street, Plantation, FL 33317
- **Main Phone:** 954-678-3934
- **HR Email:** JobApps@polarisfp.com
- **General Email:** info@polarisfp.com
- **Hours:** Mon to Fri, 7am to 4pm
- **Emergency:** 24/7 Support
- **Service Area:** Eastern United States

### Office Locations
As listed on contact.html. All four share the phone number 954-678-3934.

| Office                        | Address                                       | Contact                            |
|-------------------------------|-----------------------------------------------|------------------------------------|
| Polaris HQ, Ft Lauderdale, FL | 4009 SW 7th Street, Plantation, FL 33317      | Alex Romero, aromero@polarisfp.com |
| West Palm, FL                 | 1510 Latham Road, Unit 7, West Palm Beach, FL 33409 |                              |
| Tampa, FL                     | 12467 62nd St, Unit 104, Largo, FL 33773      |                                    |
| Mid Atlantic                  | Baltimore, Maryland                           |                                    |

The Jacksonville corporate office previously documented here is no longer listed
on the site.

---

## Images Source

All images were downloaded from the existing polarisfp.com website. The logo (gallery-1.jpg, copied to logo.png) is the official Polaris Fire Protection logo. Service images and project gallery photos are from the current site's CDN (builderservices.io / Google Cloud Storage).

---

## Third Party Dependencies

| Library    | Version | CDN URL                                                        | Used On          |
|------------|---------|----------------------------------------------------------------|------------------|
| DM Sans    | -       | Google Fonts                                                   | All pages        |
| jsPDF      | 2.5.2   | cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js       | employment, newhire |

---

## Notes

- The old website (polarisfp.com) was built on "mywebsitebuilder.com" with an expired SSL certificate
- The new site is pure static HTML/CSS/JS with no build step or framework
- The newhire.html page should ideally be hosted on the internal network for maximum security, but can remain on the public URL since it is not linked or indexed
- jsPDF generates PDFs entirely in the browser; the Azure Function only relays them
- Mail runs on Graph app-only client credentials, so there is no user OAuth grant to expire
- EmailJS was removed on 2026-09-09 after both its templates were deleted from the account, which had been silently dropping every contact message and job application
