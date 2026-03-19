# No-Touch Benefits Eligibility Engine
### A Policy Automation Proposal for Government Innovation Offices, Civic Tech Nonprofits, and Venture Philanthropy Funds

---

> **"The United States loses $1 trillion in unclaimed benefits every year — not because the programs don't exist, but because the paperwork does."**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem](#2-the-problem)
3. [The Solution](#3-the-solution)
4. [Technical Specifications](#4-technical-specifications)
5. [Implementation Roadmap](#5-implementation-roadmap)
6. [Legal & Privacy Framework](#6-legal--privacy-framework)
7. [Cost-Benefit Analysis](#7-cost-benefit-analysis)
8. [Case Study Simulation](#8-case-study-simulation)
9. [Risk Assessment](#9-risk-assessment)
10. [Appendix](#10-appendix)

---

## 1. Executive Summary

### The Problem in One Sentence
Tens of millions of Americans qualify for life-changing federal and state benefits — food assistance, tax credits, healthcare, housing subsidies — and never receive them, not because they are ineligible, but because the administrative process to claim those benefits is prohibitively complex, time-consuming, and fragmented across dozens of siloed agencies.

### The Scale of Failure
- **$80–175 billion** in EITC goes unclaimed annually (IRS estimates)
- **21 million** eligible Americans are not enrolled in SNAP
- **7.6 million** eligible children lack Medicaid coverage despite qualifying
- **$100+ billion** in total unclaimed benefits each year across major federal programs
- The average successful benefit application requires **8–14 hours** of effort across multiple visits, documents, and agencies

### The Solution: No-Touch Benefits Eligibility Engine (NTBEE)
NTBEE is a consent-based, privacy-preserving data clearinghouse and automated rules engine that:

1. **Aggregates** anonymized, permissioned data across agencies (IRS, SSA, USDA, HHS, state DMVs, Unemployment Insurance systems) into a secure Data Trust
2. **Continuously evaluates** each enrolled individual against 40+ benefit program eligibility rules using a real-time rules engine
3. **Notifies** eligible individuals via SMS, email, or mail — with a single-click enrollment or a "passive auto-enroll" path where legally permissible
4. **Auto-renews** benefits when re-evaluation confirms continued eligibility, eliminating annual paperwork churn

### Impact Projections (5-Year)

| Metric | Projected Outcome |
|--------|-------------------|
| New benefit enrollments facilitated | 4–6 million individuals |
| Estimated economic value delivered | $18–32 billion |
| Reduction in agency processing costs | 35–55% for participating programs |
| Average time burden reduced (per applicant) | From 12 hrs → under 15 minutes |
| ROI on system development investment | 40:1 |

### Funding Ask
**Phase 1 (Pilot — 18 months):** $4.2M  
**Phase 2 (State-wide scale):** $11.8M  
**Phase 3 (Federal multi-program deployment):** $28M  

Total 5-year investment: **~$44M** against a projected **$18–32 billion** in economic benefit delivered.

---

## 2. The Problem

### 2.1 The Administrative Burden Crisis

America's social safety net is not broken because it lacks funding. It is broken because claiming benefits has become a full-time job that low-income Americans — who often work multiple jobs, lack reliable transportation, and have no access to professional help — simply cannot complete.

The Urban Institute calls this the **"administrative burden"**: the learning costs, compliance costs, and psychological costs embedded in program participation. These burdens are not accidents. Many were deliberately designed as gatekeeping mechanisms. But in aggregate, they function as a regressive tax on poverty.

#### By the Numbers

| Program | Eligible Non-Participants | Estimated Unclaimed Value/Year |
|---------|--------------------------|-------------------------------|
| EITC | ~20% of eligible filers | $80–175B (IRS) |
| SNAP | 21M eligible, not enrolled | ~$38B |
| Medicaid/CHIP | 7.6M eligible children | ~$12B |
| LIHEAP (heating assistance) | 75% of eligible households | ~$6B |
| WIC | 53% of eligible not enrolled | ~$4B |
| Section 8 / Housing Choice Vouchers | 70%+ on waitlist or unaware | ~$22B |
| Child Tax Credit (refundable) | ~4M eligible non-filers | ~$9B |

**Total estimated unclaimed benefits per year: $80–175B+**

### 2.2 The Time Tax

The term "time tax" was popularized by Aneesh Chopra and researchers at Georgetown's McCourt School of Public Policy to describe the cumulative burden of government-imposed administrative tasks on benefit recipients. Unlike a financial tax, the time tax disproportionately falls on those least able to bear it.

#### What the Time Tax Looks Like in Practice

A family trying to enroll in SNAP, Medicaid, and LIHEAP simultaneously in a typical state must:

1. Gather 15–25 documents (birth certificates, pay stubs, lease agreements, utility bills, Social Security cards, tax returns)
2. Complete 3 separate applications — often with redundant questions — across 3 different agencies with different operating hours
3. Attend in-person interviews (often during working hours, requiring unpaid time off)
4. Navigate websites that are not mobile-friendly, despite 60%+ of low-income users relying on smartphones as their only internet access
5. Wait 30–90 days for determinations, sometimes reapplying multiple times due to paperwork errors
6. Repeat the entire process every 6–12 months for renewal

**Estimated total time burden: 8–14 hours per application cycle, per program, per year.**

For a single parent working two jobs, this is functionally impossible.

### 2.3 Real-World Consequences

**Case: The "Benefits Cliff"**  
An Ohio family earns $32,000/year and qualifies for SNAP, Medicaid, EITC, and CHIP for their two children. A job promotion to $38,000 causes them to lose SNAP and CHIP, but the new income threshold for marketplace insurance isn't met until $41,000. They spend 3 months uninsured and food insecure — not because the law failed them, but because no one connected the dots between the four systems that govern their life.

**Case: Post-Disaster Enrollment Collapse**  
After Hurricane Harvey, FEMA found that fewer than 30% of eligible Texas households applied for disaster assistance. The application required proof of residency — documentation that had just been destroyed by the flood.

**Case: Senior Non-Participation**  
Medicare's Extra Help program (which covers prescription drug costs for low-income seniors) has a 36% non-participation rate among eligible seniors. The Social Security Administration has all the income data needed to auto-enroll every one of them. It simply doesn't use it.

### 2.4 Why This Persists

- **Agency silos**: IRS, SSA, USDA, HHS, state agencies, and local agencies operate on incompatible IT systems with no interoperability layer
- **Political incentives**: Lower benefit enrollment numbers can appear to reduce program costs, even when they reflect unmet need
- **Vendor lock-in**: Legacy benefit management systems cost hundreds of millions to replace, creating inertia
- **Privacy misinterpretation**: Legitimate privacy protections are often overcited as barriers to data sharing that could actually be done legally with proper consent
- **Means-testing complexity**: Eligibility rules are extraordinarily complex — SNAP alone has 60+ eligibility variables — making manual administration at scale nearly impossible to execute equitably

---

## 3. The Solution

### 3.1 Overview: The No-Touch Benefits Eligibility Engine (NTBEE)

NTBEE is a consent-based, modular platform composed of four interlocking systems:

```
┌─────────────────────────────────────────────────────────────────┐
│                    NTBEE ARCHITECTURE                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Data Trust  │───▶│ Rules Engine │───▶│ Notification &   │  │
│  │ Clearinghouse│    │              │    │ Enrollment Hub   │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│         │                   │                      │            │
│         ▼                   ▼                      ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ Consent &    │    │ Auto-Renewal │    │  Case Worker     │  │
│  │ Privacy Layer│    │ Engine       │    │  Dashboard       │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 The Data Trust / Clearinghouse Model

The Data Trust is the foundational infrastructure: a privacy-preserving data hub that aggregates permissioned data from participating agencies without creating a centralized surveillance database.

#### Key Design Principles

- **No data retention beyond necessity**: Raw personal data is evaluated and discarded. Only eligibility determinations and pseudonymized records are stored.
- **Federated architecture**: Data never leaves agency systems; the rules engine queries APIs and receives tokenized responses.
- **Granular consent**: Individuals authorize specific data types for specific programs — not blanket access.
- **Differential privacy**: Aggregate reporting uses differential privacy techniques to prevent re-identification.

#### Participating Data Sources (Phase 1–3)

| Data Source | Data Available | Legal Authority |
|-------------|---------------|-----------------|
| IRS (through consent) | AGI, filing status, dependents, tax credits | IRC §6103(l) exceptions |
| Social Security Administration | Disability status, SSI/SSDI income, age | Social Security Act §1137 |
| USDA/FNS | Existing SNAP participation | SNAP data sharing provisions |
| State Unemployment Insurance | Recent job loss, benefit amount | State UI statutes |
| State DMV | Residency, address verification | State-level agreements |
| HHS/CMS | Medicaid/CHIP enrollment | ACA §1413 data matching |
| VA | Veteran status, disability rating | 38 USC §5701 exceptions |
| Public Housing Authorities | Current housing assistance | HUD data sharing MOUs |

### 3.3 The Rules Engine

The Rules Engine is the analytical core: a declarative eligibility evaluation system that applies benefit program rules to individual data profiles and produces a ranked list of programs for which an individual is likely eligible.

#### Architecture

- **Language**: Python with a declarative rule definition format (YAML-based rule files)
- **Evaluation model**: Each program has a defined rule set with `required_conditions`, `income_thresholds`, `categorical_eligibility` pathways, and `disqualifying_factors`
- **Confidence scoring**: Rules produce a confidence score (0–100) reflecting data completeness and rule certainty
- **Audit trail**: Every determination generates an immutable audit log with data sources used, rules applied, and outcome

#### Sample Rule Structure (SNAP — Simplified)

```yaml
program: SNAP
program_id: snap_federal
governing_law: 7 USC 2014
evaluator_version: 2025.1

gross_income_test:
  threshold_pct_fpg: 130
  applies_to: [household_size, gross_monthly_income]

net_income_test:
  threshold_pct_fpg: 100
  deductions: [earned_income_deduction, dependent_care, shelter_deduction, medical_deduction]

categorical_eligibility:
  triggers:
    - program: TANF
    - program: SSI
  effect: waives_income_test

asset_test:
  liquid_asset_limit: 2750
  elderly_disabled_limit: 4250
  exempt_assets: [primary_vehicle_one, primary_residence, retirement_accounts]

disqualifying_factors:
  - able_bodied_adult_without_dependents_not_working_20hrs
  - undocumented_immigration_status
  - voluntary_quit_without_good_cause_within_60_days

confidence_score_requirements:
  minimum_to_notify: 70
  minimum_to_auto_enroll: 90
```

### 3.4 Passive Enrollment vs. Opt-In Checking

NTBEE supports three modes of engagement, configurable per program and per jurisdiction:

| Mode | Description | Best For |
|------|-------------|---------|
| **Passive Auto-Enroll** | Eligible individual is enrolled automatically; they receive a notification and can opt out within 30 days | Programs where legal authority exists (SSA → Medicare Extra Help) |
| **Active Notification** | Individual receives a personalized notification: "You appear to qualify for [X]. Click here to complete a 3-question verification." | Most programs — highest legal safety, moderate conversion |
| **Case Worker Assisted** | System alerts a caseworker at a nonprofit partner; caseworker contacts the individual | Hard-to-reach populations, individuals without smartphones |

#### Conversion Rate Projections by Mode

```
Passive Auto-Enroll:    85–95% retention (opt-out rate <10%)
Active Notification:    35–55% conversion (industry benchmark: Benefits Data Trust achieves ~42%)
Case Worker Assisted:   60–75% conversion (high-touch, higher cost)
```

### 3.5 Auto-Renewal Mechanisms

Benefits churn — losing coverage at renewal due to paperwork failures rather than ineligibility — is one of the most damaging and costly elements of the current system. A 2023 study found that 70%+ of Medicaid coverage losses during the COVID unwinding were due to administrative failures, not genuine ineligibility.

#### NTBEE Auto-Renewal Flow

```
120 days before renewal deadline:
  → Rules engine re-evaluates eligibility using current data
  → If still eligible with confidence ≥ 90%:
      → Generate renewal packet pre-filled with verified data
      → Send notification: "Your [SNAP] benefits renew automatically on [DATE]. 
         No action needed. Reply STOP to opt out or REVIEW to view your file."
  → If eligibility uncertain (confidence 70–89%):
      → Send targeted request for only the specific missing data point
      → "We need one piece of information to renew your SNAP benefits: 
         your current employer. Please reply with employer name or call [number]."
  → If ineligible:
      → Notify with clear explanation and alternative program suggestions
      → Initiate appeal information packet
```

### 3.6 Privacy & Consent Framework

Privacy is not a constraint on NTBEE — it is a design feature. The system is built on the premise that **individuals own their data** and authorize specific, limited uses.

#### Consent Architecture

1. **Initial Enrollment Consent**: Plain-language, multilingual consent form (digital or paper) specifying exactly which agencies will be queried and for which programs
2. **Granular Revocation**: Users can revoke consent for specific data sources or programs at any time through a web portal, SMS command, or phone call
3. **Data Minimization**: The system requests only the minimum data fields required for each rule evaluation
4. **Purpose Limitation**: Data shared for SNAP eligibility cannot be used for immigration enforcement, law enforcement, or any purpose not stated in the consent
5. **Transparency Log**: Each individual can view a complete log of every data query made on their behalf, the result, and the data source used

---

## 4. Technical Specifications

### 4.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Backend API** | Python 3.11 + Flask / FastAPI | Widely supported in government tech; large ecosystem |
| **Rules Engine** | Python + PyYAML + custom rule evaluator | Readable, auditable, policy-team-maintainable |
| **Database** | PostgreSQL 15 + Redis (cache) | Reliability, ACID compliance, government-approved |
| **Data Trust Layer** | Apache Kafka (event streaming) + dbt | Real-time data pipeline with transformation audit trail |
| **Privacy Layer** | Google DP Library + Presidio (Microsoft) | Differential privacy + PII detection/redaction |
| **Notification** | Twilio (SMS/Voice) + SendGrid (email) + USPS API (mail) | Multi-channel reach for non-smartphone users |
| **Identity** | Login.gov integration | FedRAMP-authorized, existing federal SSO |
| **Infrastructure** | AWS GovCloud (FedRAMP High) | FISMA compliance, ATO eligibility |
| **Frontend** | React + TypeScript | Accessible, mobile-first citizen portal |
| **IaC** | Terraform + AWS CDK | Reproducible, auditable infrastructure |
| **Monitoring** | Datadog + OpenTelemetry | Real-time anomaly detection, audit logging |

### 4.2 Database Schema

```sql
-- Core identity record (pseudonymized)
CREATE TABLE individuals (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash       VARCHAR(64) UNIQUE NOT NULL,  -- SHA-256 of PII, not PII itself
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    consent_version  VARCHAR(20) NOT NULL,
    notification_pref JSONB,  -- {channel: 'sms', contact: '+1...', language: 'es'}
    data_sources_authorized TEXT[] DEFAULT '{}'
);

-- Eligibility determination records
CREATE TABLE eligibility_determinations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    individual_id    UUID REFERENCES individuals(id),
    program_id       VARCHAR(100) NOT NULL,  -- e.g., 'snap_federal', 'eitc_federal'
    determination    VARCHAR(20) NOT NULL CHECK (determination IN ('eligible','ineligible','uncertain')),
    confidence_score SMALLINT CHECK (confidence_score BETWEEN 0 AND 100),
    data_sources_used TEXT[],
    rules_version    VARCHAR(20) NOT NULL,
    evaluated_at     TIMESTAMPTZ DEFAULT NOW(),
    expires_at       TIMESTAMPTZ,
    audit_log        JSONB  -- full evaluation trace for compliance
);

-- Enrollment tracking
CREATE TABLE enrollments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    individual_id    UUID REFERENCES individuals(id),
    program_id       VARCHAR(100) NOT NULL,
    mode             VARCHAR(20) CHECK (mode IN ('auto_enrolled','opted_in','case_worker')),
    status           VARCHAR(20) DEFAULT 'active',
    enrolled_at      TIMESTAMPTZ DEFAULT NOW(),
    last_renewed_at  TIMESTAMPTZ,
    next_renewal_at  TIMESTAMPTZ,
    agency_case_id   VARCHAR(200)  -- external ID in the agency's system
);

-- Consent log (immutable)
CREATE TABLE consent_events (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    individual_id    UUID REFERENCES individuals(id),
    event_type       VARCHAR(30) CHECK (event_type IN ('granted','revoked','modified')),
    data_source      VARCHAR(100),
    program_scope    TEXT[],
    ip_address       INET,
    user_agent       TEXT,
    recorded_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Notification log
CREATE TABLE notifications (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    individual_id    UUID REFERENCES individuals(id),
    channel          VARCHAR(20),
    program_id       VARCHAR(100),
    notification_type VARCHAR(30),
    sent_at          TIMESTAMPTZ,
    delivered_at     TIMESTAMPTZ,
    response         VARCHAR(20),  -- 'enrolled', 'opted_out', 'no_response'
    responded_at     TIMESTAMPTZ
);

-- Program rule registry
CREATE TABLE program_rules (
    program_id       VARCHAR(100) PRIMARY KEY,
    program_name     VARCHAR(200) NOT NULL,
    governing_law    VARCHAR(200),
    rule_yaml        TEXT NOT NULL,  -- serialized YAML rule definition
    version          VARCHAR(20) NOT NULL,
    effective_date   DATE,
    published_by     VARCHAR(100),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 Core API Specification

```
BASE URL: https://api.ntbee.gov/v1
AUTH: OAuth 2.0 + Login.gov PKCE flow
RATE LIMIT: 100 req/min per client_id
FORMAT: JSON:API

───────────────────────────────────────────────────────────

POST   /consent
       Body: { individual_token, data_sources[], programs[], consent_version }
       Returns: { consent_id, granted_at, revocation_url }

GET    /eligibility/{individual_token}
       Query: ?programs[]=snap&programs[]=eitc&as_of=2025-03-15
       Returns: [
         {
           program_id: "snap_federal",
           determination: "eligible",
           confidence: 94,
           estimated_monthly_value: 412,
           enrollment_url: "https://...",
           auto_enroll_eligible: true
         },
         ...
       ]

POST   /enroll
       Body: { individual_token, program_id, mode: "opt_in" | "auto" }
       Returns: { enrollment_id, agency_case_id, effective_date }

POST   /renew
       Body: { individual_token, program_id }
       Returns: { renewed: true, next_renewal_at: "2025-09-01" }

DELETE /consent/{individual_token}
       Query: ?data_source=irs&program=snap
       Returns: 204 No Content

GET    /audit/{individual_token}
       Returns: { queries: [...], determinations: [...], notifications: [...] }

GET    /programs
       Returns: [{ program_id, name, avg_monthly_value, auto_enroll_available, ... }]

POST   /notify
       Body: { individual_token, channel, program_id, template_id }
       Returns: { notification_id, sent_at }
```

### 4.4 Rules Engine Pseudocode

```python
# rules_engine/evaluator.py

class EligibilityEvaluator:
    def __init__(self, rule_registry: RuleRegistry, data_trust: DataTrustClient):
        self.registry = rule_registry
        self.data = data_trust

    def evaluate(self, individual_token: str, program_id: str) -> Determination:
        # Load program rule definition
        rule = self.registry.get_rule(program_id)
        
        # Identify required data fields from rule definition
        required_fields = rule.get_required_fields()
        
        # Query Data Trust for only the required fields (data minimization)
        profile = self.data.fetch_fields(
            token=individual_token,
            fields=required_fields,
            purpose=program_id
        )
        
        # Track which data sources were actually used
        sources_used = profile.sources
        
        # Evaluate categorical eligibility (fastest path — check first)
        for categorical_trigger in rule.categorical_eligibility.triggers:
            if self._is_enrolled(individual_token, categorical_trigger.program):
                return Determination(
                    program_id=program_id,
                    result="eligible",
                    confidence=98,
                    pathway="categorical",
                    sources=sources_used
                )
        
        # Check disqualifying factors first (fail fast)
        for factor in rule.disqualifying_factors:
            if self._evaluate_condition(factor, profile):
                return Determination(
                    program_id=program_id,
                    result="ineligible",
                    confidence=95,
                    disqualifying_factor=factor.id,
                    sources=sources_used
                )
        
        # Evaluate income tests
        income_result = self._evaluate_income(rule, profile)
        if not income_result.passes:
            return Determination(
                program_id=program_id,
                result="ineligible" if income_result.confidence > 85 else "uncertain",
                confidence=income_result.confidence,
                sources=sources_used
            )
        
        # Evaluate asset test if applicable
        if rule.asset_test and not self._evaluate_assets(rule, profile):
            return Determination(
                program_id=program_id,
                result="ineligible",
                confidence=88,
                sources=sources_used
            )
        
        # All tests passed — determine confidence based on data completeness
        confidence = self._calculate_confidence(profile, required_fields)
        
        return Determination(
            program_id=program_id,
            result="eligible" if confidence >= 70 else "uncertain",
            confidence=confidence,
            estimated_value=self._estimate_benefit_value(rule, profile),
            auto_enroll_eligible=(confidence >= 90),
            sources=sources_used
        )
    
    def _evaluate_income(self, rule, profile) -> IncomeResult:
        household_size = profile.get("household_size")
        gross_income = profile.get("gross_monthly_income")
        fpg = FederalPovertyGuidelines.get(household_size, year=2025)
        threshold = fpg * (rule.gross_income_test.threshold_pct_fpg / 100)
        
        if gross_income is None:
            return IncomeResult(passes=None, confidence=40)  # Insufficient data
        
        if gross_income <= threshold:
            return IncomeResult(passes=True, confidence=92)
        else:
            return IncomeResult(passes=False, confidence=90)
    
    def _calculate_confidence(self, profile, required_fields) -> int:
        available = [f for f in required_fields if profile.get(f) is not None]
        data_completeness = len(available) / len(required_fields)
        source_quality = profile.average_source_freshness_score()
        return int((data_completeness * 0.7 + source_quality * 0.3) * 100)
```

### 4.5 Notification Flow (Twilio Integration)

```python
# notifications/sender.py
from twilio.rest import Client
import sendgrid

class NotificationService:
    def send_eligibility_alert(self, individual: Individual, determinations: list[Determination]):
        programs_summary = self._build_summary(determinations)
        
        message = self._render_template(
            template="eligibility_alert",
            language=individual.preferred_language,
            variables={
                "programs": programs_summary,
                "total_monthly_value": sum(d.estimated_value for d in determinations),
                "enrollment_link": self._generate_short_link(individual.token),
                "opt_out_link": self._generate_opt_out_link(individual.token)
            }
        )
        
        if individual.notification_pref["channel"] == "sms":
            self._send_sms(individual.notification_pref["contact"], message.sms_body)
        elif individual.notification_pref["channel"] == "email":
            self._send_email(individual.notification_pref["contact"], message)
        else:
            self._queue_mail(individual.mailing_address, message.letter_body)
    
    def _send_sms(self, phone: str, body: str):
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=body,
            from_=TWILIO_FROM_NUMBER,
            to=phone
        )
    
    def _render_template(self, template: str, language: str, variables: dict) -> Message:
        # Loads from localized template library (English, Spanish, Vietnamese,
        # Simplified Chinese, Arabic, Haitian Creole — initial 6 languages)
        return TemplateLibrary.render(template, language, variables)
```

---

## 5. Implementation Roadmap

### Phase 0: Foundation (Months 1–3)

**Goal**: Establish legal, technical, and partner foundations before writing a line of production code.

| Activity | Owner | Timeline |
|----------|-------|----------|
| Legal opinion on data sharing authority for Phase 1 programs | Outside counsel + DOJ liaison | Month 1 |
| Signed MOU with Ohio ODJFS (SNAP) and IRS (EITC pilot) | Government partnerships lead | Month 2 |
| Login.gov integration agreement | Identity team | Month 2 |
| FedRAMP Moderate ATO initiation for AWS GovCloud | Security team | Month 1–3 |
| Community advisory board formation (5–7 members from affected communities) | Community engagement lead | Month 2 |
| Hire core engineering team (4 engineers, 1 data scientist, 1 policy analyst) | Recruiting | Month 1–2 |

### Phase 1: Pilot — Single Program, Single Jurisdiction (Months 3–9)

**Scope**: SNAP + EITC eligibility checking for a single Ohio county (Franklin County — Columbus). Opt-in notification mode only. No auto-enrollment.

**Target**: 50,000 households evaluated; 15,000 new enrollments facilitated.

| Sprint | Deliverable |
|--------|-------------|
| Months 3–4 | Data Trust infrastructure (dev/staging). Consent portal MVP. Login.gov integration. |
| Months 4–5 | SNAP rules engine (Ohio variant). IRS EITC rule module. Audit logging. |
| Months 5–6 | Twilio SMS notification pipeline. English/Spanish templates. A/B test framework. |
| Months 6–7 | Franklin County agency API integration. Data validation pipeline. |
| Months 7–8 | Soft launch: 5,000 household pilot. Measure conversion rates. Tune confidence thresholds. |
| Months 8–9 | Full county launch: 50,000 households. Publish outcomes report. Begin Phase 2 planning. |

**Success Metrics — Phase 1**
- ≥ 40% of notified households complete enrollment
- < 0.1% false positive rate (ineligible individuals erroneously notified)
- Zero data breaches or unauthorized disclosures
- ≥ 85% user satisfaction score (post-enrollment survey)
- Cost per new enrollment: < $280

### Phase 2: State-Wide Expansion (Months 9–18)

**Scope**: Ohio state-wide. Add Medicaid, CHIP, LIHEAP, WIC. Introduce auto-renewal for SNAP and Medicaid. Add case worker dashboard.

**Target**: 400,000 households evaluated; 90,000 new enrollments; 60,000 auto-renewals processed.

| Activity | Timeline |
|----------|----------|
| Ohio-wide agency data agreements (6 agencies) | Month 9–11 |
| Medicaid/CHIP rules module (CMS API integration) | Month 10–12 |
| LIHEAP and WIC modules | Month 12–14 |
| Auto-renewal engine deployment (SNAP pilot) | Month 13–15 |
| Case worker dashboard (nonprofit partner portal) | Month 12–14 |
| Add Vietnamese, Somali, Arabic notification languages | Month 14–16 |
| State-wide media and community outreach campaign | Month 15–18 |

### Phase 3: Federal Multi-State Expansion (Months 18–36)

**Scope**: Expand to 5 states (Ohio, Texas, California, Georgia, New York). Add SSI, Housing Choice Vouchers, Medicare Savings Programs, Child Tax Credit, education Pell Grant pre-screening. Introduce passive auto-enrollment for legally permissible programs.

**Target**: 5M+ households evaluated; 1.5M new enrollments or renewals annually.

---

## 6. Legal & Privacy Framework

### 6.1 Federal Legal Authorities

#### Internal Revenue Code § 6103 — Taxpayer Confidentiality
**Challenge**: IRS return information is among the most strictly protected data in federal law.  
**Solution**: IRC § 6103(l) provides explicit exceptions for administration of federal and state benefit programs. The IRS's Income and Benefits Access program already operates under this authority. NTBEE would apply for inclusion in existing data-sharing agreements rather than creating new legal authority.

#### HIPAA — Health Insurance Portability and Accountability Act
**Challenge**: Medicaid eligibility data contains protected health information (PHI).  
**Solution**: HIPAA's "Treatment, Payment, and Health Care Operations" (TPO) exception and the public health authority exception (§ 164.512(b)) provide legal pathways. NTBEE operates as a Business Associate under signed BAAs with health agencies. Data is used exclusively for benefit enrollment — a payment/operations function — not clinical decisions.

#### The Privacy Act of 1974
**Challenge**: Prohibits agencies from disclosing records without written consent.  
**Solution**: NTBEE's consent framework explicitly satisfies Privacy Act § 552a(b)(1) (written consent). All data access is logged in a System of Records Notice (SORN) published in the Federal Register. This is precisely how existing programs like Medicare's auto-enrollment for LIS already operate.

#### FERPA — Family Educational Rights and Privacy Act
**Challenge**: Student enrollment and financial aid data (relevant to Pell Grant eligibility) is protected.  
**Solution**: FERPA allows disclosure with student consent, and for "legitimate educational interest" purposes. For students, NTBEE requests explicit, granular consent before querying any FERPA-protected records.

### 6.2 State-Level Legal Landscape

| State | Key Barriers | Pathway |
|-------|-------------|---------|
| Ohio | State Privacy Act requires agency-by-agency MOUs | Execute individual MOUs; Ohio HB already provides framework |
| California | CCPA and additional health privacy rules | Consent-first architecture satisfies CCPA; opt-out honored within 24h |
| Texas | No statewide data sharing framework; patchwork of agency rules | Pilot via single agency (HHSC); build from there |
| New York | Strong data minimization requirements | NY's data sharing framework aligns well; minimal modification needed |

### 6.3 Proposed Federal Legislative Fixes (Long-Term)

For maximum impact, three federal legislative changes would dramatically simplify the legal framework:

1. **Amend IRC § 6103** to explicitly authorize NTBEE-class programs with consent-based access to specified return data fields (AGI, filing status, dependents only)
2. **Create a Benefits Coordination Act** establishing a standard, interoperable consent framework that preempts conflicting state laws for federal benefit programs
3. **Modernize the Privacy Act** to explicitly authorize consent-based, purpose-limited data sharing across agencies for benefit delivery — currently a gap in the 1974 law

### 6.4 Consent Form Architecture

The consent form is the linchpin of the legal framework. It must be:

- **Available in 20+ languages** (all languages spoken by ≥ 1,000 people in the target jurisdiction)
- **Written at a 6th-grade reading level** (Flesch-Kincaid target)
- **Completed on any channel**: web, SMS reply, phone call, paper
- **Revocable at any time** via the same channels
- **Specific**: Names each agency and program, not "any federal agency"
- **Time-limited**: Default 24-month authorization with annual renewal reminder

---

## 7. Cost-Benefit Analysis

### 7.1 Development and Operating Costs

| Cost Category | Year 1 | Year 2 | Year 3 | Years 4–5 | Total 5-Year |
|--------------|--------|--------|--------|-----------|-------------|
| Engineering (8 FTE) | $1.8M | $2.1M | $2.4M | $5.2M | $11.5M |
| Infrastructure (AWS GovCloud) | $0.4M | $0.7M | $1.2M | $3.6M | $5.9M |
| Legal & Compliance | $0.6M | $0.3M | $0.3M | $0.6M | $1.8M |
| Government partnerships/MOUs | $0.3M | $0.2M | $0.2M | $0.4M | $1.1M |
| Outreach & notifications | $0.2M | $0.6M | $1.4M | $4.8M | $7.0M |
| Security & ATO | $0.5M | $0.2M | $0.2M | $0.4M | $1.3M |
| Community engagement | $0.2M | $0.3M | $0.4M | $0.8M | $1.7M |
| **Total** | **$4.0M** | **$4.4M** | **$6.1M** | **$15.8M** | **$30.3M** |

### 7.2 Benefits Delivered (Economic Value)

| Year | New Enrollments | Renewals Saved | Avg Annual Value/Person | Total Economic Value |
|------|----------------|---------------|------------------------|---------------------|
| Year 1 | 15,000 | 0 | $4,200 | $63M |
| Year 2 | 90,000 | 12,000 | $4,600 | $469M |
| Year 3 | 400,000 | 80,000 | $4,800 | $2.3B |
| Year 4 | 800,000 | 300,000 | $5,000 | $5.5B |
| Year 5 | 1,200,000 | 600,000 | $5,200 | $9.4B |
| **Total** | **2.5M** | **992,000** | | **~$17.7B** |

*Note: "Enrollments" = net new program participants who would not have enrolled absent NTBEE. "Value" = estimated annual benefit value (SNAP allotment, EITC refund, healthcare cost offset, etc.)*

### 7.3 Agency Administrative Savings

Current cost to process one SNAP application (including staff time, postage, in-person interviews): **$147–$320 per application** (USDA data).

NTBEE automates 80% of the eligibility determination work.

| Program | Applications/Year Automated | Savings/Application | Annual Savings |
|---------|---------------------------|--------------------|--------------------|
| SNAP | 600,000 | $180 | $108M |
| Medicaid | 400,000 | $210 | $84M |
| EITC (IRS processing) | 1,200,000 | $45 | $54M |
| LIHEAP | 200,000 | $95 | $19M |
| **Total** | | | **~$265M/year** |

### 7.4 Summary ROI

| | 5-Year Figure |
|--|--|
| Total investment (system + operations) | $30.3M |
| Benefits delivered to individuals | $17.7B |
| Agency administrative savings | $1.1B |
| **Total public value generated** | **~$18.8B** |
| **Return on Investment** | **~620:1** |

---

## 8. Case Study Simulation

### Maria Chen, Columbus, Ohio — A Day in the No-Touch System

**Background**:  
Maria is a 34-year-old single mother of two (ages 4 and 7). She worked as a hotel housekeeper for six years. On November 12, 2024, she was laid off when the hotel cut 40% of its staff. Her annual income was $29,400. She has a smartphone but limited English proficiency (primary language: Spanish). She has never applied for government benefits despite having qualified for SNAP for the past three years.

---

#### Day 1 — Job Loss Event Detected

```
09:14 AM  Ohio Unemployment Insurance system records Maria's layoff.
          Employer submits separation notice; Maria's UI claim is approved 
          at $340/week.

10:02 AM  NTBEE's event stream consumer detects the UI claim creation event
          (via Ohio ODJFS API — Maria provided consent when filing her claim,
          per new "bundled consent" language added to Ohio UI application in 
          Phase 2 rollout).

10:02 AM  Eligibility evaluation triggered for Maria's household token.
```

#### Day 1 — Eligibility Evaluation (Automated, 340ms)

```
NTBEE Rules Engine evaluates Maria's household profile:

Data sources queried:
  ✓ Ohio UI system      → gross_monthly_income: $0 (job loss) / UI: $1,360/mo
  ✓ IRS (prior year)   → AGI: $29,400, filing_status: head_of_household, 
                          dependents: 2
  ✓ SSA               → No SSI/SSDI. No disability flag.
  ✓ Ohio DMV          → Address confirmed: Franklin County.
  ✓ HHS/CMS           → No current Medicaid enrollment. Children not enrolled 
                          in CHIP.

Determinations:
  ✓ SNAP              — ELIGIBLE (confidence: 94) | Est. value: $768/mo
  ✓ Medicaid (Maria)  — ELIGIBLE (confidence: 91) | Covers medical costs
  ✓ CHIP (children)   — ELIGIBLE (confidence: 96) | Covers children's healthcare
  ✓ EITC (2024 tax)   — ELIGIBLE (confidence: 88) | Est. refund: $3,995
  ✓ WIC (child age 4) — ELIGIBLE (confidence: 89) | Est. value: $50/mo 
                          + nutrition support
  ✗ LIHEAP            — UNCERTAIN (confidence: 62) | Missing utility account data
  ✗ Section 8         — INELIGIBLE | Franklin County waitlist closed (noted 
                          for notification of open waitlist jurisdictions)

Total estimated monthly value: $818/month
```

#### Day 1, 10:45 AM — SMS Notification (Spanish)

```
SMS FROM: BeneficiosGov (short code 74968)

Hola María, detectamos que podría calificar para ayuda del gobierno 
después de perder su trabajo. Basado en su información:

✅ SNAP (cupones de comida): ~$768/mes
✅ Medicaid (seguro médico)
✅ CHIP (seguro para sus hijos)
✅ Crédito Tributario EITC: ~$3,995 al presentar impuestos
✅ WIC (nutrición para niños): ~$50/mes

Valor total estimado: $818/mes + $3,995 en reembolso de impuestos

Responda SÍ para inscribirse con un clic, o visite:
bit.ly/beneficios-oh para revisar primero.

Para cancelar: ALTO | Ayuda: AYUDA
```

#### Day 1, 11:03 AM — Maria Responds "SÍ"

```
11:03 AM  Maria replies "SÍ" via SMS.

11:03 AM  NTBEE sends Maria to Login.gov identity verification 
          (SMS link to mobile-optimized flow).

11:14 AM  Maria completes Login.gov verification in 11 minutes 
          (takes photo of Ohio driver's license).

11:14 AM  NTBEE initiates enrollment:

  SNAP: 
    → Pre-populated Ohio SNAP application submitted to ODJFS API
    → Application ID: OH-SNAP-2024-847291
    → ODJFS returns: "Approved pending verification. EBT card mailed."
  
  Medicaid:
    → CMS FastTrack enrollment initiated
    → Coverage effective: December 1, 2024
  
  CHIP (children):
    → Both children enrolled
    → Coverage effective: December 1, 2024
  
  WIC:
    → Referral sent to Franklin County WIC clinic with Maria's pre-screened
      eligibility; appointment scheduled automatically for November 19

  EITC:
    → Notification saved for tax season: "File by Feb 15 for fastest refund.
      Free filing at IRS.gov/freefile — we'll remind you."
```

#### November 14 — EBT Card Mailed

```
EBT card mailed to Maria's address (verified via DMV).
No in-person visit required.
No paperwork submitted by Maria.
No eligibility interview scheduled.

Time Maria spent: 11 minutes (Login.gov verification only).
Time Maria would have spent under legacy system: 13–17 hours 
  across 3 separate agencies.
```

#### April 14, 2025 — Tax Season Reminder

```
SMS: "María, es temporada de impuestos. Recuerde que califica para 
el Crédito EITC de ~$3,995. Presente gratis en: [link]. 
¿Necesita ayuda? Llame al [volunteer tax assistance number]."
```

#### November 2025 — Auto-Renewal

```
NTBEE re-evaluates: Maria has returned to work at $31,000/year.

SNAP:  Still eligible (income ≤ 130% FPL for household of 3). 
       Auto-renewed. Maria notified. No action needed.

Medicaid: Income above threshold. Maria transitioned to ACA marketplace 
          plan with subsidy. Notification includes marketplace plan 
          comparison. No coverage gap.

Total time Maria spent in Year 1 on benefits administration: 
  < 30 minutes (including tax filing assistance call).
Under legacy system: 20–40 hours across multiple years.
```

---

## 9. Risk Assessment

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data breach of individual records | Low | Critical | Zero-knowledge architecture; no PII stored in NTBEE systems; tokenization; FedRAMP High controls; bug bounty program |
| Rules engine error producing false eligibility | Medium | High | Rule validation suite; human review for confidence < 85; monthly accuracy auditing against agency data |
| Agency API downtime or breaking changes | High | Medium | Graceful degradation; retry queues; cached eligibility windows (30-day validity); agency SLA agreements |
| Scalability under load (e.g., mass layoff event) | Medium | Medium | Auto-scaling on AWS GovCloud; load tested to 10x projected peak; event queue smoothing |
| Stale data producing incorrect determinations | Medium | High | Data freshness scoring built into confidence calculation; source-level TTL enforcement |

### 9.2 Political and Institutional Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Agency opposition to data sharing ("turf protection") | High | High | Start with programs where legal authority is clearest; demonstrate early wins; build agency champions; frame as reducing their administrative burden |
| Legislative changes to benefit programs mid-rollout | Medium | Medium | Rules engine designed for rapid updates; policy monitoring team; modular program architecture |
| Political opposition framing NTBEE as "government surveillance" | Medium | High | Radical transparency in consent framework; civil liberties org advisory board; open-source the rules engine code; publish all SORNs |
| Budget cuts eliminating program funding mid-stream | Medium | Critical | Multi-year funding commitments; diversify across federal, state, and philanthropic sources; demonstrate ROI early |
| Change in administration shifting benefit program priorities | Medium | High | Cross-partisan framing (reduces welfare dependency *and* delivers earned benefits); career civil service champions; embed in agency IT plans |

### 9.3 Privacy and Equity Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| System used for immigration enforcement | Low | Critical | Contractual prohibition; purpose limitation in law; technical enforcement (data used only for benefit enrollment API calls); ACLU partnership and monitoring |
| Algorithmic bias in confidence scoring disadvantaging certain groups | Medium | High | Regular fairness audits (demographic parity analysis); community advisory board review of outcomes data; open-source rule scoring so advocates can inspect |
| Digital divide excluding those without smartphones | High | Medium | Paper mail channel; case worker assisted mode; community organization partner network; library enrollment kiosks |
| Consent exploitation (people consenting without understanding) | Medium | Medium | Plain-language requirement (6th grade); multilingual; in-person consent option; 30-day rescission right; follow-up comprehension check |
| Data becoming target for commercial exploitation | Low | Critical | No commercial partnerships; no data monetization provisions in law; contractual restriction; technical isolation from commercial systems |

### 9.4 Organizational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Key personnel departure (institutional knowledge loss) | Medium | High | Documentation culture; pair programming; knowledge transfer protocols; competitive compensation |
| Scope creep beyond benefit delivery mission | Medium | Medium | Strict charter limitations; board oversight; clear "out of scope" definitions in founding documents |
| Partner nonprofit capacity limitations | High | Low | Invest in partner capacity; provide training and tooling; don't require partners to do the technical heavy lifting |

---

## 10. Appendix

### 10.1 Key Policy Research and References

- **Urban Institute** — "Administrative Burden: Learning, Psychological, and Compliance Costs in Citizen-State Interactions" (Herd & Moynihan, 2018) — foundational text on the time tax
- **Benefits Data Trust (BDT)** — Philadelphia-based nonprofit operating the most successful existing benefits navigation platform; achieved 42% enrollment conversion in controlled studies. [benefitsdatatrust.org](https://benefitsdatatrust.org)
- **Code for America** — "The Benefits Enrollment Field Guide" and "GetCalFresh" case study — demonstrated 94% mobile completion rate for SNAP in California. [codeforamerica.org](https://codeforamerica.org)
- **Georgetown McCourt School** — "The Time Tax" (2021) — quantitative analysis of administrative burden hours
- **IRS Free File and Direct File programs** — Precedent for automated benefit delivery directly from IRS
- **ProPublica** — "Seized" series on SNAP and Social Security administration failures
- **Harvard Kennedy School Government Performance Lab** — Multi-state SNAP churn reduction pilots
- **CMS Medicaid Unwinding Data** (2023–2024) — Documents 70%+ administrative disenrollment rates
- **National Academy for State Health Policy** — "Connecting Eligible Individuals to Benefits" toolkit

### 10.2 Existing Pilot Programs to Build On

| Program | Operator | Scope | Relevance |
|---------|----------|-------|-----------|
| Benefits Data Trust | Nonprofit (BDT) | PA, NJ, MD, others | Direct model predecessor; data-sharing agreements and consent framework |
| GetCalFresh | Code for America | California | Mobile-first SNAP application; 94% completion rate |
| IRS Direct File | IRS | 25 states (2024) | Precedent for IRS data-sharing for automated tax credit delivery |
| CMS Auto-enrollment for LIS | Centers for Medicare & Medicaid | National | Medicare Extra Help auto-enrollment using SSA/IRS data; legal model for NTBEE |
| Ohio Benefits | Ohio ODJFS | Ohio | Integrated benefits portal; natural Phase 1 partner |
| One-e-App | CA nonprofit coalition | California | Multi-program online application; interoperability lessons |
| Propel (Fresh EBT app) | Private | National | Consumer-facing SNAP management; user experience model |

### 10.3 Sample Code Snippets

#### SNAP Income Test (Python)

```python
from dataclasses import dataclass
from typing import Optional

FEDERAL_POVERTY_GUIDELINES_2025 = {
    1: 15060, 2: 20440, 3: 25820, 4: 31200,
    5: 36580, 6: 41960, 7: 47340, 8: 52720
}

@dataclass
class SNAPIncomeEvaluation:
    household_size: int
    gross_monthly_income: float
    net_monthly_income: Optional[float] = None

    @property
    def annual_fpg(self) -> float:
        size = min(self.household_size, 8)
        return FEDERAL_POVERTY_GUIDELINES_2025.get(size, 52720 + (self.household_size - 8) * 5380)

    @property
    def monthly_fpg(self) -> float:
        return self.annual_fpg / 12

    def passes_gross_income_test(self) -> bool:
        """130% FPL for most households"""
        return self.gross_monthly_income <= self.monthly_fpg * 1.30

    def passes_net_income_test(self) -> bool:
        """100% FPL after deductions"""
        if self.net_monthly_income is None:
            return None  # Insufficient data
        return self.net_monthly_income <= self.monthly_fpg

    def evaluate(self) -> dict:
        gross_pass = self.passes_gross_income_test()
        net_pass = self.passes_net_income_test()
        return {
            "gross_test": {"passes": gross_pass, "threshold": self.monthly_fpg * 1.30},
            "net_test": {"passes": net_pass, "threshold": self.monthly_fpg},
            "overall_income_eligible": gross_pass and (net_pass is not False)
        }

# Example
eval = SNAPIncomeEvaluation(household_size=3, gross_monthly_income=2100, net_monthly_income=1700)
print(eval.evaluate())
# {'gross_test': {'passes': True, 'threshold': 2813.5}, 
#  'net_test': {'passes': True, 'threshold': 2151.67}, 
#  'overall_income_eligible': True}
```

#### Twilio SMS Notification with Opt-Out Handling

```python
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client

app = Flask(__name__)

OPT_OUT_KEYWORDS = {"STOP", "CANCEL", "UNSUBSCRIBE", "QUIT", "ALTO", "CANCELAR"}
OPT_IN_KEYWORDS = {"SÍ", "SI", "YES", "START", "COMENZAR"}

@app.route("/sms/webhook", methods=["POST"])
def sms_reply():
    incoming = request.form.get("Body", "").strip().upper()
    sender = request.form.get("From")
    resp = MessagingResponse()
    
    if incoming in OPT_OUT_KEYWORDS:
        db.revoke_consent(phone=sender)
        resp.message(
            "Ha sido removido de nuestras notificaciones. "
            "Para volver a inscribirse: bit.ly/beneficios-oh"
        )
    elif incoming in OPT_IN_KEYWORDS:
        individual = db.get_individual_by_phone(sender)
        if individual:
            enrollment_service.initiate_enrollment(individual)
            resp.message(
                "¡Perfecto! Iniciando su inscripción. "
                "Recibirá una confirmación en los próximos 10 minutos."
            )
    else:
        resp.message(
            "Para inscribirse responda SÍ. Para cancelar: ALTO. "
            "Ayuda: llame al 1-800-XXX-XXXX."
        )
    
    return str(resp)
```

#### Differential Privacy for Aggregate Reporting

```python
from google.differential_privacy import BoundedSum
import numpy as np

def dp_enrollment_count(raw_enrollments: list[int], epsilon: float = 1.0) -> float:
    """
    Produce a differentially private count of new enrollments.
    Epsilon = 1.0 provides strong privacy guarantee.
    Used only for aggregate reporting — never for individual determinations.
    """
    dp_sum = BoundedSum(
        epsilon=epsilon,
        delta=0,
        lower=0,
        upper=1,
        l0_sensitivity=1,
        linf_sensitivity=1
    )
    for enrollment in raw_enrollments:
        dp_sum.add_entry(float(enrollment))
    
    return dp_sum.result()
```

### 10.4 Glossary

| Term | Definition |
|------|------------|
| **Administrative Burden** | The time, effort, and psychological cost of complying with government processes to access services |
| **Auto-Enrollment** | Enrollment in a program without requiring an application, based on existing data |
| **Benefits Cliff** | The sudden loss of benefits when income rises above a threshold, creating a disincentive to earn more |
| **Categorical Eligibility** | Automatic qualification for one program because of enrollment in another |
| **Churn** | Loss of benefit coverage at renewal due to administrative failure rather than ineligibility |
| **Confidence Score** | A numeric measure (0–100) of how certain the system is in an eligibility determination |
| **Data Trust** | A legal and technical structure for sharing data under defined, limited conditions |
| **Differential Privacy** | A mathematical framework for sharing aggregate statistics without revealing individual data |
| **FPL** | Federal Poverty Level — the income benchmark used by most federal benefit programs |
| **MOU** | Memorandum of Understanding — a legal agreement between agencies governing data sharing |
| **Passive Enrollment** | See Auto-Enrollment |
| **Rules Engine** | Software that evaluates whether a set of conditions are met, used here to assess eligibility |
| **Time Tax** | The cumulative hours citizens spend navigating government administrative requirements |
| **Tokenization** | Replacing identifying information with a non-identifying placeholder for privacy protection |

---

*Document Version: 1.0 | Prepared: March 2025 | Status: Draft for Review*  
*Contact: [Program Lead] | Organization: [Submitting Organization]*  
*Classification: Unclassified / Public Distribution Authorized*
