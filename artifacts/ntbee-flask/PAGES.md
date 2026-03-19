# NTBEE Page Documentation

**Application:** No-Touch Benefits Eligibility Engine (NTBEE) — GovBenefits  
**Framework:** Flask (Python) with Jinja2 templates, Bootstrap 5, SQLite  
**Base URL prefix:** `/ntbee`  
**Blueprint name:** `ntbee`

---

## Table of Contents

1. [Landing Page — `/ntbee/`](#1-landing-page--ntbee)
2. [Eligibility Checker — `/ntbee/checker`](#2-eligibility-checker--ntbeechecker)
3. [Results — `/ntbee/results/<id>`](#3-results--ntbeeresultsid)
4. [Admin Dashboard — `/ntbee/admin`](#4-admin-dashboard--ntbeeadmin)
5. [Login — `/ntbee/login`](#5-login--ntbeelogin)
6. [Signup — `/ntbee/signup`](#6-signup--ntbeesignup)
7. [User Dashboard — `/ntbee/dashboard`](#7-user-dashboard--ntbeedashboard)
8. [About — `/ntbee/about`](#8-about--ntbeeabout)
9. [Privacy Policy — `/ntbee/privacy`](#9-privacy-policy--ntbeeprivacy)
10. [Contact — `/ntbee/contact`](#10-contact--ntbeecontact)
11. [Shared Layout (Base Template)](#11-shared-layout-base-template)

---

## 1. Landing Page — `/ntbee/`

**Template:** `templates/index.html`  
**View function:** `ntbee.index`  
**Auth required:** No  
**Page title:** "Find Your Benefits | Benefits Eligibility Engine"

### Purpose

The public-facing home page. Introduces GovBenefits, explains the eligibility checker, lists the 10 programs checked, and promotes privacy. Serves as the primary entry point directing users to the checker.

### Layout Sections

- **Hero section** (`hero-section`)
  - Left column (7/12): tagline badge, headline, subheadline, two CTA buttons, trust note
  - Right column (5/12): `hero-programs-card` — a grid of 10 program badges (icon + name)

- **How It Works** (white background)
  - Section heading: "How It Works"
  - Three numbered cards (1, 2, 3):
    1. "Answer 2 quick steps" — describe household size, income, family composition
    2. "Get instant results" — 10 programs checked using 2024 income guidelines
    3. "Apply with guidance" — step-by-step instructions, document checklists, phone numbers
  - CTA button: "Get Started — Free" → `/ntbee/checker`

- **10 Programs, Checked Automatically** (`programs-overview-section`)
  - Section heading + subheading
  - 10 program overview cards (icon, name, one-line description), displayed in a responsive grid (2 cols on sm, 3 on lg, 4 on xl):
    - SNAP, Medicaid / CHIP, LIHEAP, WIC, Child Care Subsidy, Section 8 Housing, SSI, Free School Meals, TANF, Lifeline Internet

- **Privacy Callout** (white background)
  - Centered card with lock icon, heading "Your privacy is our priority", description, and link to `/ntbee/privacy`

### Interactive Elements

| Element | Type | Target |
|---|---|---|
| "Check My Benefits →" | Primary button (link) | `/ntbee/checker` |
| "Learn More" | Outline button (link) | `/ntbee/about` |
| "Get Started — Free" | Primary button (link) | `/ntbee/checker` |
| "Read our Privacy Policy" | Outline button (link) | `/ntbee/privacy` |

### Bilingual Support

All visible text strings carry `data-en` and `data-es` attributes. The JavaScript `toggleLang()` function in `app.js` switches between English and Spanish by swapping these attribute values.

---

## 2. Eligibility Checker — `/ntbee/checker`

**Template:** `templates/checker.html`  
**View function:** `ntbee.checker`  
**Methods:** GET, POST  
**Auth required:** No (optional account for saving results)  
**Page title:** "Benefits Eligibility Checker | Benefits Eligibility Engine"  
**Form class:** `CheckerForm` (`forms.py`)

### Purpose

A two-step multi-part form that collects anonymous household and income data. On submit, runs the eligibility engine against 10 federal programs and redirects to the Results page. No name, SSN, or contact info is collected.

### Layout Sections

- **Page hero** (`page-hero-sm`)
  - Heading: "Benefits Eligibility Checker"
  - Subheading: "Your answers are private and never shared. No name or SSN required."

- **Form container** (centered, col-lg-8 / col-xl-7)
  - **Progress bar** — Shows "Step 1 of 2: Household Basics" / "Step 2 of 2: Household Details". JavaScript advances it between steps.
  - **Error banner** — Displayed on server-side validation failure: "Please correct the errors below."
  - **Step 1 card** (`#step1Section`, `gov-card`) — Heading: "Step 1: Household Basics"
  - **Step 2 card** (`#step2Section`, `gov-card`, initially hidden) — Heading: "Step 2: Household Details"

### Step 1: Household Basics — Form Fields

| Field name | Label | Type | Validations | Helper text |
|---|---|---|---|---|
| `household_size` | "How many people are in your household?" | Integer | Required; min 1, max 20 | "Include yourself and everyone you live with and share expenses." |
| `monthly_income` | "Total monthly gross household income ($)" | Float | Required; min 0 | "Before taxes. Include all wages, Social Security, benefits, child support, etc. Enter 0 if no income." Rendered with `$` prefix input group. |
| `zip_code` | "ZIP code" | Text (numeric) | Required; exactly 5 digits; digits only (custom validator) | "Used to identify your state. Not stored." Max-width 180 px. |
| `dependents` | "Total number of children / dependents in household" | Integer | Optional; min 0, max 20 | "Enter 0 if none. Children under 18 or other dependents." Max-width 120 px. |

**Step 1 navigation button:** "Next: Household Details →" (calls `nextStep()` in JS; does not submit the form).

### Step 2: Household Details — Form Fields

| Field name | Label | Type | Validations | Helper text |
|---|---|---|---|---|
| `children_under5` | "Children under age 5" | Integer | Optional; min 0, max 20 | "Needed for WIC eligibility." |
| `school_age_children` | "School-age children (ages 5–17)" | Integer | Optional; min 0, max 20 | "Needed for free school meals." |
| `elderly_disabled` | "Household members age 65 or older" | Integer | Optional; min 0, max 20 | "Affects LIHEAP priority and SSI eligibility. Enter 0 if none." Max-width 120 px. |
| `pregnant` | "Household includes a pregnant, recently postpartum, or breastfeeding member" | Checkbox | Optional | Affects WIC eligibility. |
| `has_disability` | "Household includes a member with a qualifying disability" | Checkbox | Optional | Affects SSI and Lifeline eligibility. |
| `monthly_housing` | "Monthly rent or mortgage ($)" | Float | Optional; min 0 | "Enter 0 if not applicable." Rendered with `$` prefix input group. |
| `monthly_childcare` | "Monthly child care cost ($)" | Float | Optional; min 0 | "Enter 0 if you don't pay for child care." Rendered with `$` prefix input group. |
| `save_results` | "Save my results to my account" | Checkbox | Optional; only shown to authenticated users | Visible only if `current_user.is_authenticated`. Links the check record to the user account. |

**Step 2 navigation buttons:**
- "← Back" — calls `prevStep()` in JS, returns to Step 1 view
- "Check My Eligibility ✓" — `type="submit"`, triggers form POST

**Trust note** (below submit): "Your answers are not shared or sold. No personal identifiers collected."

### Form Submission Behaviour

1. `CheckerForm` is validated server-side via `form.validate_on_submit()`.
2. On success: an `EligibilityCheck` record is written to the database (linked to user account only if `save_results` is checked and user is authenticated).
3. Redirects to `ntbee.results` with the new record's `check_id`.
4. On failure: the template re-renders with inline field errors; JavaScript detects which step has errors and advances to it automatically.

### CSRF Protection

The form includes `{{ form.hidden_tag() }}` which renders a hidden CSRF token (Flask-WTF).

---

## 3. Results — `/ntbee/results/<id>`

**Template:** `templates/results.html`  
**View function:** `ntbee.results`  
**Methods:** GET  
**URL parameter:** `check_id` (integer) — the database ID of the `EligibilityCheck` record  
**Auth required:** No  
**Page title:** "Your Benefits Results | Benefits Eligibility Engine"

### Purpose

Displays the eligibility results for a specific check. Re-runs the eligibility engine against the stored check data and shows matched benefit program cards with estimated values, how-to-apply guidance, document checklists, and official apply links. Also handles the zero-match case gracefully.

### Data Passed to Template

| Variable | Type | Description |
|---|---|---|
| `check` | `EligibilityCheck` model | The stored check record (used for metadata, not displayed directly) |
| `programs` | `list[dict]` | List of matched program result dicts from `check_eligibility()` |
| `total` | `float` | Sum of `estimated_monthly` across all matched programs |

### Layout Sections

- **Results Hero** (`page-hero-sm`)
  - **With matches:** Green hero variant (`page-hero-sm--green`). Shows badge "✓ You may qualify for N program(s)", heading "Great news — here are your results", subheading directing user to click "How to Apply".
  - **No matches:** Standard hero. Heading "No matches found", text explaining income or household size may be above thresholds.

- **Results body** (when programs exist)
  - **Toolbar** — "🖨 Print Summary" button (`window.print()`)
  - **Total bar** (`total-bar`) — "Total estimated monthly value: $X,XXX/month"
  - **Program cards grid** (`results-grid`, `role="list"`) — One `result-card` per matched program

- **No results box** (when no programs matched)
  - Sad face icon, explanatory text with link to benefits.gov
  - "Try Again with Different Numbers" button → `/ntbee/checker`

### Program Card Structure (per matched program)

Each card (`result-card`, `role="listitem"`) contains:

1. **Card header** (`result-card-header`)
   - Program icon (emoji)
   - Program short name (e.g., "SNAP") and full name (e.g., "Supplemental Nutrition Assistance Program")
   - "Likely Eligible" badge (green)

2. **Card body** (`result-card-body`)
   - Value bar: estimated monthly benefit string (e.g., "~$816/month in food benefits")
   - Description paragraph
   - Agency and income threshold: "Agency: USDA / State DHS • Income threshold: ≤ 130% FPL"

3. **Guidance accordion** (`guidance-details`, HTML `<details>`/`<summary>`)
   - Summary label: "📋 How to Apply — Documents & Steps"
   - **Left column** — "Documents to gather": bulleted list of required documents
   - **Right column** — "Step-by-step": numbered ordered list of application steps
   - **Help row** — Phone number (tel link) and external help URL

4. **Card footer** (`result-card-footer`)
   - "Apply Now →" button — links to the program's official government apply URL (opens in new tab)
   - "Opens official government website" label

### Programs and Their Estimated Monthly Values

| Program | Short name | Estimated monthly | Income threshold |
|---|---|---|---|
| Supplemental Nutrition Assistance Program | SNAP | $204 × household size (max $1,756) | ≤ 130% FPL |
| Medicaid / CHIP | Medicaid | $500 | ≤ 138% FPL (adults) / 200% (children) |
| Low Income Home Energy Assistance Program | LIHEAP | $125 | ≤ 150% FPL |
| WIC | WIC | $120 | ≤ 185% FPL; requires pregnant/postpartum member or child under 5 |
| Child Care Assistance Program (CCDF) | CCAP | Up to $650 | ≤ 250% FPL; requires children under 5 or school-age children |
| Section 8 Housing Choice Voucher | Section 8 | $900 | ≤ 150% FPL |
| Supplemental Security Income | SSI | $943 | ≤ 100% FPL; requires disability or member 65+ |
| National School Lunch & Breakfast Program | School Meals | $90 × school-age children | ≤ 130% FPL (free) or ≤ 185% FPL (reduced); requires school-age children |
| Temporary Assistance for Needy Families | TANF | $500 | ≤ 50% FPL; requires dependent children |
| Lifeline Internet/Phone Benefit | Lifeline | $30 | ≤ 135% FPL or auto-qualify via SNAP/Medicaid/SSI |

### Bottom Action Bar (with matches)

| Element | Type | Target / Behaviour |
|---|---|---|
| "Update My Answers" | Outline button | `/ntbee/checker` |
| "Start Over" | Outline secondary button | `/ntbee/` |
| "💾 Create account to save results" | Outline success button (unauthenticated only) | `/ntbee/signup` |

### Disclaimer Box

Shown when programs are matched. Text: "⚠ Important: These are estimates — Results are based on federal income guidelines only. Actual eligibility is determined by your state agency..."

---

## 4. Admin Dashboard — `/ntbee/admin`

**Template:** `templates/admin.html`  
**View function:** `ntbee.admin`  
**Methods:** GET  
**Auth required:** Yes (`@login_required`); additionally `current_user.is_admin` must be `True` (403 if not)  
**Page title:** "Admin Dashboard | Benefits Eligibility Engine"

### Purpose

A restricted internal dashboard for administrators. Provides aggregate statistics, a bar chart of program popularity, a data export action, and a paginated table of all eligibility check submissions across all users.

### Data Passed to Template

| Variable | Type | Description |
|---|---|---|
| `checks` | `list[EligibilityCheck]` | All check records, ordered by `created_at` descending |
| `program_counts` | JSON string (`dict`) | Map of program name → number of checks that matched it |
| `total_users` | `int` | Count of all registered users |
| `total_checks` | `int` | Count of all eligibility check records |
| `avg_value` | `int` | Rounded average `total_estimated_monthly` across all checks |

### Layout Sections

- **Page hero** (`page-hero-sm page-hero-sm--dark`)
  - Heading: "Admin Dashboard"
  - Subheading: "N eligibility check(s) on record."

- **Stats row** (3 cards, responsive)

  | Card | Value displayed | Label |
  |---|---|---|
  | Registered Users | `total_users` | "Registered Users" |
  | Total Checks | `total_checks` | "Total Checks" |
  | Avg. Monthly Value | `$avg_value` | "Avg. Est. Monthly Value" |

- **Chart + Actions row** (2 columns)
  - **Left (col-lg-8):** "Programs by Frequency" card — Chart.js bar chart rendered on `<canvas id="programChart">`. Shows program names on x-axis, check counts on y-axis. Powered by `program_counts` JSON passed to the template. Displays "No data yet." when there are no checks.
  - **Right (col-lg-4):** "Actions" card
    - "⬇ Export CSV" button → `GET /ntbee/admin/export.csv`
    - "+ New Check" button → `/ntbee/checker`

- **Recent Submissions table** (`gov-card`)
  - Header row with "Export CSV" button
  - Responsive HTML table (`table-hover admin-table`):

  | Column | Source field | Notes |
  |---|---|---|
  | ID | `c.id` | Linked to `/ntbee/results/<id>` |
  | Date | `c.created_at` | Formatted `YYYY-MM-DD HH:MM` |
  | ZIP | `c.zip_code` | |
  | HH | `c.household_size` | Household size |
  | Income | `c.monthly_income` | Formatted `$X,XXX/mo` |
  | Deps | `c.dependents` | Number of dependents |
  | Programs | `c.programs_list()` | Rendered as individual `prog-tag` badges |
  | Est. Monthly | `c.total_estimated_monthly` | Formatted `$X,XXX/mo`, bold green |

  - Empty state: "No submissions yet. Run the first check."

### Interactive Elements

| Element | Type | Behaviour |
|---|---|---|
| Row ID links | Anchor | Links to `/ntbee/results/<id>` |
| "⬇ Export CSV" | Button (link) | Downloads `export.csv` via `GET /ntbee/admin/export.csv` |
| "+ New Check" | Button (link) | Navigates to `/ntbee/checker` |
| Program chart | Chart.js canvas | Bar chart, rendered client-side from `program_counts` JSON |

### Related Route: Export CSV — `/ntbee/admin/export.csv`

**View function:** `ntbee.export_csv`  
**Auth required:** Yes + admin  
Returns a CSV file download of all `EligibilityCheck` records via `export_csv_response()` helper (`utils.py`).

---

## 5. Login — `/ntbee/login`

**Template:** `templates/login.html`  
**View function:** `ntbee.login`  
**Methods:** GET, POST  
**Auth required:** No (redirects to `/ntbee/` if already authenticated)  
**Page title:** "Log In | Benefits Eligibility Engine"  
**Form class:** `LoginForm` (`forms.py`)

### Purpose

Allows existing users to authenticate. On success, sets a persistent session cookie (remember=True) and redirects to the `next` URL parameter or the landing page.

### Layout Sections

- **Page hero** (`page-hero-sm`)
  - Heading: "Log In"
  - Subheading: "Access your saved eligibility results."

- **Centered form card** (`gov-card`, col-lg-5)
  - Card header: "Log in to your account"
  - Login form

- **Below-card links**
  - "Don't have an account? Sign up — it's free" → `/ntbee/signup`
  - "Or check eligibility without an account →" → `/ntbee/checker`

### Form Fields

| Field name | Label | Type | Validations | Notes |
|---|---|---|---|---|
| `email` | "Email address" | Text (email) | Required; valid email format | `autocomplete="email"`, placeholder "you@example.com" |
| `password` | "Password" | Password | Required | `autocomplete="current-password"` |

### Form Behaviour

- Submit button: "Log In" (full-width, primary)
- On credential mismatch: flash message "Invalid email or password." (danger category)
- On success: `login_user(user, remember=True)` then redirect to `next` query param or `/ntbee/`

---

## 6. Signup — `/ntbee/signup`

**Template:** `templates/signup.html`  
**View function:** `ntbee.signup`  
**Methods:** GET, POST  
**Auth required:** No (redirects to `/ntbee/` if already authenticated)  
**Page title:** "Sign Up | Benefits Eligibility Engine"  
**Form class:** `SignupForm` (`forms.py`)

### Purpose

Allows new users to create an optional account so they can save and revisit their eligibility results. No personal identifiers beyond email are collected. Passwords are stored as bcrypt hashes.

### Layout Sections

- **Page hero** (`page-hero-sm`)
  - Heading: "Create an Account"
  - Subheading: "Save your eligibility results and access them later."

- **Centered form card** (`gov-card`, col-lg-5)
  - Card header: "Create your free account"
  - Signup form

- **Below-card text**
  - "By signing up you agree to our Privacy Policy. We never share your data."
  - "Already have an account? Log in" → `/ntbee/login`

### Form Fields

| Field name | Label | Type | Validations | Notes |
|---|---|---|---|---|
| `email` | "Email address" | Text (email) | Required; valid email format | `autocomplete="email"`, placeholder "you@example.com" |
| `password` | "Password" | Password | Required; min 8 characters | `autocomplete="new-password"`. Helper text: "At least 8 characters." |
| `confirm` | "Confirm password" | Password | Required; must match `password` | `autocomplete="new-password"`. Error: "Passwords must match." |

### Form Behaviour

- Submit button: "Create Account" (full-width, success/green)
- If email already exists: flash message "An account with that email already exists." (warning)
- On success: user created, `login_user(user)` called, flash "Welcome! Your account has been created." (success), redirect to `/ntbee/`

---

## 7. User Dashboard — `/ntbee/dashboard`

**Template:** `templates/dashboard.html`  
**View function:** `ntbee.dashboard`  
**Methods:** GET  
**Auth required:** Yes (`@login_required` — redirects to login if unauthenticated)  
**Page title:** "My Results | Benefits Eligibility Engine"

### Purpose

Shows the authenticated user a history of their saved eligibility checks. Each row links back to the detailed results page for that check. Provides a shortcut to run a new check.

### Data Passed to Template

| Variable | Type | Description |
|---|---|---|
| `checks` | `list[EligibilityCheck]` | All checks for `current_user`, ordered by `created_at` descending |

### Layout Sections

- **Page hero** (`page-hero-sm`)
  - Heading: "My Saved Results"
  - Subheading: "N saved eligibility check(s)."

- **Results table** (when checks exist)
  - `gov-card` wrapping a responsive `table-hover admin-table`:

  | Column | Source | Notes |
  |---|---|---|
  | Date | `c.created_at` | Formatted `Mon DD, YYYY` |
  | ZIP | `c.zip_code` | |
  | Household | `c.household_size` | "N person(s)" |
  | Income | `c.monthly_income` | Formatted `$X,XXX/mo` |
  | Programs Matched | `c.programs_list()` | Rendered as `prog-tag` badges; "None" if empty |
  | Est. Monthly | `c.total_estimated_monthly` | Formatted `$X,XXX/mo`, bold green |
  | View | — | "View" button → `/ntbee/results/<id>` |

- **Empty state** (no checks): "You haven't saved any eligibility checks yet." + "Check Your Eligibility Now" button

- **Bottom action** — "+ New Eligibility Check" outline button → `/ntbee/checker`

### Interactive Elements

| Element | Type | Target |
|---|---|---|
| "View" buttons | Outline primary button | `/ntbee/results/<check_id>` |
| "+ New Eligibility Check" | Outline primary button | `/ntbee/checker` |
| "Check Your Eligibility Now" | Primary button (empty state) | `/ntbee/checker` |

---

## 8. About — `/ntbee/about`

**Template:** `templates/about.html`  
**View function:** `ntbee.about`  
**Methods:** GET  
**Auth required:** No  
**Page title:** "About | Benefits Eligibility Engine"

### Purpose

Informational page describing the tool's purpose, the 10 programs it checks, the methodology used for eligibility calculations, and the legal disclaimer separating GovBenefits from government agencies.

### Layout Sections

- **Page hero** (`page-hero-sm`)
  - Heading: "About GovBenefits"
  - Subheading: "A free tool to help you find the benefits you deserve."

- **Content** (centered, col-lg-8) — four `gov-card` sections:

  1. **"What is GovBenefits?"** — Two paragraphs explaining the tool's purpose and motivation: navigating the U.S. benefits system is confusing; GovBenefits closes the knowledge gap.

  2. **"Programs We Check (10 Total)"** — 2-column responsive grid listing all 10 programs with icon, name, and one-line description:
     - SNAP, Medicaid / CHIP, LIHEAP, WIC, Child Care (CCDF), Section 8 Housing, SSI, Free School Meals, TANF, Lifeline Internet

  3. **"How We Calculate Eligibility"** — Two paragraphs explaining the 2024 Federal Poverty Level (FPL) guidelines methodology and noting that these are estimates only; actual eligibility is determined by state agencies.

  4. **"Disclaimer"** — States that GovBenefits is not affiliated with any government agency, does not make official eligibility determinations, and directs users to Benefits.gov for official information.

### Interactive Elements

| Element | Type | Target |
|---|---|---|
| Benefits.gov link | External anchor | `https://www.benefits.gov` (opens in new tab) |

---

## 9. Privacy Policy — `/ntbee/privacy`

**Template:** `templates/privacy.html`  
**View function:** `ntbee.privacy`  
**Methods:** GET  
**Auth required:** No  
**Page title:** "Privacy Policy | Benefits Eligibility Engine"

### Purpose

Legal/informational page outlining what data the app collects, how it is used, cookie policy, data retention, and user rights.

### Layout Sections

- **Page hero** (`page-hero-sm`)
  - Heading: "Privacy Policy"
  - Subheading: "Last updated: January 1, 2024"

- **Content** (centered, col-lg-8) — single `gov-card` with `prose` body containing these heading sections:

  | Section heading | Summary |
  |---|---|
  | Our Commitment to Your Privacy | No name, SSN, address, DOB, or contact info collected. |
  | What We Collect | Household size, monthly income amount, ZIP code, household composition counts, monthly expense amounts (housing, child care), timestamp. Does NOT collect name, address, SSN, phone, or contact info. |
  | Accounts (Optional) | Optional account stores only email and bcrypt-hashed password. |
  | How We Use This Data | Eligibility calculation; accuracy improvement; aggregate analytics. Not sold or shared for marketing. |
  | Cookies & Sessions | One session cookie for login state and CSRF protection. No third-party tracking or advertising cookies. |
  | Data Retention | Anonymous records: retained up to 90 days then deleted. Account data: retained until account is deleted. |
  | Your Rights | Users may request deletion at any time. Anonymous data auto-deleted within 90 days. |
  | Contact | Links to `/ntbee/contact` for privacy questions. |

### Interactive Elements

| Element | Type | Target |
|---|---|---|
| "Contact us" | Anchor | `/ntbee/contact` |

---

## 10. Contact — `/ntbee/contact`

**Template:** `templates/contact.html`  
**View function:** `ntbee.contact`  
**Methods:** GET  
**Auth required:** No  
**Page title:** "Contact | Benefits Eligibility Engine"

### Purpose

Provides benefit program phone numbers for users with questions about specific programs, links to official external resources, and a report-an-issue section for the tool itself. Includes an FAQ accordion.

### Layout Sections

- **Page hero** (`page-hero-sm`)
  - Heading: "Contact Us"
  - Subheading: "Questions, feedback, or issues — we're here to help."

- **Two-column layout** (col-lg-5 each)

  **Left card — "Get in Touch"**
  - Introductory paragraph noting this is a demonstration tool and directing users to government agencies for eligibility questions.
  - **"For Benefits Questions"** — list of program hotlines:

    | Program | Phone number |
    |---|---|
    | SNAP | 1-800-221-5689 |
    | Medicaid | 1-800-318-2596 |
    | LIHEAP | 1-866-674-6327 |
    | WIC | 1-800-942-3678 |
    | SSI / Social Security | 1-800-772-1213 |
    | Lifeline | 1-800-234-9473 |

  - **"External Resources"** — three external links:
    - Benefits.gov — Official benefits search
    - USA.gov — Government benefits hub
    - 211.org — Local social services

  **Right card — "Report an Issue"**
  - Brief description of the report process
  - Info alert: directs users to the repository's issue tracker or Replit contact
  - **"Frequently Asked Questions"** — Bootstrap accordion (`#faqAccordion`), three collapsible items:

    | Question | Answer summary |
    |---|---|
    | "Why does it say I don't qualify?" | Tool uses federal guidelines only; state thresholds may differ; ensure monthly (not annual) income is entered. |
    | "Is my data private?" | Yes. No name, SSN, or contact info collected. See Privacy Policy. |
    | "Are these results official?" | No. Estimates only. Contact state agency for official determination. |

### Interactive Elements

| Element | Type | Target / Behaviour |
|---|---|---|
| Program phone links | `tel:` anchor | Opens phone dialer |
| Benefits.gov | External anchor | `https://www.benefits.gov` (new tab) |
| USA.gov | External anchor | `https://www.usa.gov/benefits` (new tab) |
| 211.org | External anchor | `https://www.211.org` (new tab) |
| FAQ accordion items | Bootstrap collapse | Expands/collapses answer text |

---

## 11. Shared Layout (Base Template)

**Template:** `templates/base.html`  
**Extends:** (none — this is the root layout)

### Purpose

Provides the global HTML shell, navigation bar, flash message display area, and footer shared by all pages.

### Navigation Bar (`site-header`, sticky)

**Brand:** "★ GovBenefits" → `/ntbee/`  
**Nav links (always visible):** Home, About, Contact  
**Nav links (unauthenticated):** Log In, Sign Up  
**Nav links (authenticated):** My Results, Log Out; also Admin (if `current_user.is_admin`)  
**Always visible:** "Check My Benefits" (green CTA button), "ES" language toggle button

### Flash Message Area

Dismissable Bootstrap alerts rendered between the nav and `<main>`. Categories map to Bootstrap alert colors: `success` → green, `danger` → red, `warning` → yellow, `info` → blue.

### Footer (`site-footer`)

Three columns:
- **Brand column:** "★ GovBenefits" + description tagline
- **Programs column:** List of all 10 program names
- **Resources column:** Links to About, Privacy Policy, Contact, Benefits.gov

Footer note: "Estimates only. Actual eligibility determined by your state agency..."  
Copyright: "© 2024 GovBenefits • Not affiliated with any government agency"

### JavaScript and CSS

- **Bootstrap 5.3.3** (CDN) — layout, components, accordion, collapse
- **Chart.js 4.4.3** (CDN, admin page only) — bar chart
- **`static/style.css`** — custom govBenefits styles (hero sections, cards, program tags, etc.)
- **`static/app.js`** — multi-step checker form logic (`nextStep()`, `prevStep()`, `goToStep()`), language toggle (`toggleLang()`)

### Error Pages

| Route | Template | HTTP status |
|---|---|---|
| Any invalid URL | `templates/404.html` | 404 |
| Forbidden (non-admin accessing admin) | `templates/403.html` | 403 |

---

*This document was generated from source inspection of `app.py`, `forms.py`, `eligibility.py`, `models.py`, and all Jinja2 templates in `templates/`. It covers only the NTBEE Flask application; the Benefit Finder chatbot and API server are excluded.*
