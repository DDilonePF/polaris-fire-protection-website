# Polaris Fire Protection Website Documentation

## Overview

Static website for Polaris Fire Protection, hosted on Azure Static Web Apps.

- **Live URL:** https://purple-mud-05a08090f.1.azurestaticapps.net
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
  projects.html         Project gallery (15 photos with lightbox)
  contact.html          Contact form + office locations
  employment.html       Job postings + online application (English/Spanish toggle)
  newhire.html          New hire onboarding portal (5-step wizard, generates PDF)
  css/
    styles.css          Main stylesheet (DM Sans font, charcoal/red/blue color scheme)
  js/
    main.js             Navigation, scroll effects, reveal animations, contact form EmailJS
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
    gallery-2 to 16.jpg Project photos
```

---

## Design Details

### Fonts
- **DM Sans** (Google Fonts) weights: 400, 500, 600, 700, 800

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
- Contact form (sends via EmailJS)
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
- Contact form (EmailJS to info@polarisfp.com)
- All 5 office locations:
  - Polaris HQ, Plantation, FL (Alex Romero, aromero@polarisfp.com, 954-678-3934)
  - West Palm Beach, FL
  - Tampa Bay / Largo, FL
  - Corporate Office, Jacksonville, FL (Jim Smith, jsmith@polarisfp.com, 954-678-3934)
  - Maryland Office, Finksburg, MD

### Employment (employment.html)
- 6 job postings with color-coded badges (Field/Engineering/Admin)
- Online application form with English/Spanish language toggle
- Form sections: Position Info, Personal Info, Education, Employment History (2 employers), Certifications, Resume, Additional Notes
- Sends formatted email via EmailJS to JobApps@polarisfp.com
- Spanish translation built into the page (no separate page needed)

### New Hire Portal (newhire.html)
- NOT linked from public navigation (accessed via direct URL only)
- Has `noindex, nofollow` meta tag
- 5-step wizard with progress pills:
  1. Employee Information (personal, SSN, direct deposit, emergency contact, garnishments)
  2. Confidential Information (voluntary EEO demographics, disability, veteran status)
  3. Work Rules (all 30 rules displayed, must acknowledge)
  4. Fall Protection Training Checklist (9 items)
  5. W-4 & I-9 (links to official fillable PDFs from IRS and USCIS)
- On submit, generates a multi-page PDF using jsPDF library
- PDF contains 5 pages matching the original paper forms with Polaris header
- PDF filename: NewHire_LastName_FirstName_YYYY-MM-DD.pdf

---

## EmailJS Configuration

### Account
- **Provider:** EmailJS (emailjs.com)
- **Connected Email:** ddilone@polarisfp.com (Office 365)
- **Public Key:** xCGCvNwDZSxDDY2CL
- **Service ID:** service_zxp2mjk

### Templates

| Template              | Template ID        | Sends To               | Purpose                |
|-----------------------|-------------------|------------------------|------------------------|
| Contact Form          | template_2sjv97i  | info@polarisfp.com     | Contact page inquiries |
| Job Application       | template_ouo0do3  | JobApps@polarisfp.com  | Employment applications|

### Contact Form Variables
- `{{from_name}}` - Sender's full name
- `{{from_email}}` - Sender's email
- `{{phone}}` - Phone number
- `{{subject}}` - Message subject
- `{{message}}` - Message body

### Job Application Template Variables
- `{{applicant_name}}` - Full name
- `{{applicant_email}}` - Email (also used as Reply To)
- `{{applicant_phone}}` - Phone
- `{{applicant_date}}` - Submission date
- `{{position}}` - Position applied for
- `{{application_text}}` - Full application text

### Job Application Template Format
- Content Type: HTML
- Formatted with Polaris header, red section dividers, table layout
- Printable directly from email (Ctrl+P)
- Reply To set to applicant's email

---

## Hosting & Deployment

### Azure Static Web Apps
- **SKU:** Free
- **Region:** East US 2
- **Default URL:** purple-mud-05a08090f.1.azurestaticapps.net

### How to Deploy Updates

From a terminal with Azure CLI and SWA CLI installed:

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

## Custom Domain Setup (Not Yet Done)

When ready to connect polarisfp.com:

1. Run:
```bash
az staticwebapp hostname set --name polaris-fire-protection --resource-group polaris-website-rg --hostname www.polarisfp.com
```

2. Go to your domain registrar (wherever polarisfp.com is registered)

3. Add DNS records:
   - **CNAME** record: `www` pointing to `purple-mud-05a08090f.1.azurestaticapps.net`
   - For root domain (@), you may need an ALIAS/ANAME record or Azure will provide instructions

4. Azure will auto-provision a free SSL certificate

---

## New Hire Portal Workflow

1. HR sends new hire the direct link: `https://[your-domain]/newhire.html`
2. New hire opens link on office iPad connected to WiFi
3. Fills out all 5 steps (Employee Info, Confidential, Work Rules, Fall Protection, W-4/I-9)
4. Clicks "Generate PDF & Submit"
5. PDF auto-downloads/opens on the iPad
6. HR prints the PDF and files it
7. New hire fills out W-4 and I-9 separately (linked fillable PDFs from IRS/USCIS)

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
| Office          | Address                                    | Contact                                      |
|-----------------|--------------------------------------------|----------------------------------------------|
| HQ (Plantation) | 4009 SW 7th Street, Plantation, FL 33317  | Alex Romero, aromero@polarisfp.com           |
| West Palm Beach | 1510 Latham Road, Unit, WPB, FL 33409     |                                              |
| Tampa Bay       | 12467 62nd St, Unit #104, Largo, FL 33773 |                                              |
| Jacksonville    | Jacksonville, FL (Corporate Office)        | Jim Smith, jsmith@polarisfp.com, 954-678-3934|
| Maryland        | 1991 Brookshire Court, Finksburg, MD 21048|                                              |

---

## Images Source

All images were downloaded from the existing polarisfp.com website. The logo (gallery-1.jpg, copied to logo.png) is the official Polaris Fire Protection logo. Service images and project gallery photos are from the current site's CDN (builderservices.io / Google Cloud Storage).

---

## Third Party Dependencies

| Library    | Version | CDN URL                                                        | Used On          |
|------------|---------|----------------------------------------------------------------|------------------|
| DM Sans    | -       | Google Fonts                                                   | All pages        |
| EmailJS    | v4      | cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js     | index, contact, employment |
| jsPDF      | 2.5.2   | cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js       | newhire          |

---

## Notes

- The old website (polarisfp.com) was built on "mywebsitebuilder.com" with an expired SSL certificate
- The new site is pure static HTML/CSS/JS with no build step or framework
- The newhire.html page should ideally be hosted on the internal network for maximum security, but can remain on the public URL since it is not linked or indexed
- EmailJS free tier allows 200 emails per month
- jsPDF generates PDFs entirely in the browser with no server needed
