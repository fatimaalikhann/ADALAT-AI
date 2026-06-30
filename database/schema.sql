-- =============================================================
-- AdalatAI — Database Schema
-- Two completely separate databases:
--   1. cases_db   → encrypted personal case data
--   2. analytics_db → anonymized counts only (no names, no CNIC)
-- =============================================================


-- =============================================================
-- DATABASE 1: cases_db
-- Stores citizen case data. All PII fields are encrypted at
-- the application layer before INSERT. No CNIC ever stored.
-- =============================================================

\connect cases_db;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE cases (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Encrypted at application layer (AES-256 via cryptography lib)
    -- Stored as bytea; never plain text in the DB
    citizen_name_enc    BYTEA,          -- encrypted full name (optional)
    contact_enc         BYTEA,          -- encrypted phone/email (optional)

    -- Case content (also encrypted)
    problem_text_enc    BYTEA   NOT NULL,   -- original problem statement
    language            VARCHAR(10) NOT NULL DEFAULT 'ur',  -- 'ur' or 'en'

    -- Pipeline stage results (stored as encrypted JSON blobs)
    classification_enc  BYTEA,          -- Agent 1 output
    rights_summary_enc  BYTEA,          -- Agent 2 output
    document_path       TEXT,           -- path to generated PDF (Agent 3)
    lawyer_needed       BOOLEAN,        -- Agent 4 decision
    lawyer_reason_enc   BYTEA,          -- Agent 4 reasoning (encrypted)
    deadlines_enc       BYTEA,          -- Agent 5 deadline list (encrypted)

    -- Case status tracking
    status  VARCHAR(30) NOT NULL DEFAULT 'received'
                CHECK (status IN ('received','classifying','rights_explained',
                                  'document_drafted','assessed','deadlines_set','complete','error')),

    -- Province helps with jurisdiction-aware answers (not PII)
    province    VARCHAR(50),

    -- Soft delete
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_cases_status     ON cases(status);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_cases_province   ON cases(province);

-- Audit log: who touched what, when
CREATE TABLE case_audit_log (
    id          BIGSERIAL   PRIMARY KEY,
    case_id     UUID        NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    event       VARCHAR(60) NOT NULL,   -- e.g. 'agent_classifier_complete'
    agent_name  VARCHAR(60),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    meta        JSONB                   -- non-PII event metadata only
);

CREATE INDEX idx_audit_case_id ON case_audit_log(case_id);

-- Deadlines table (separate rows for calendar/reminder use)
CREATE TABLE deadlines (
    id          BIGSERIAL   PRIMARY KEY,
    case_id     UUID        NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    deadline_date   DATE    NOT NULL,
    description_enc BYTEA   NOT NULL,   -- encrypted description
    notified    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deadlines_case_id      ON deadlines(case_id);
CREATE INDEX idx_deadlines_date         ON deadlines(deadline_date);


-- =============================================================
-- DATABASE 2: analytics_db
-- Anonymized aggregate data only.
-- NO names, NO contact info, NO case text.
-- Safe for NGO/policy reporting.
-- =============================================================

\connect analytics_db;

CREATE TABLE daily_case_counts (
    id              BIGSERIAL   PRIMARY KEY,
    date            DATE        NOT NULL,
    province        VARCHAR(50),
    language        VARCHAR(10),        -- 'ur' or 'en'
    legal_category  VARCHAR(100),       -- e.g. 'family_law', 'labor', 'property'
    cases_received  INTEGER     NOT NULL DEFAULT 0,
    lawyer_referrals INTEGER    NOT NULL DEFAULT 0,
    documents_drafted INTEGER   NOT NULL DEFAULT 0,
    UNIQUE (date, province, language, legal_category)
);

CREATE INDEX idx_daily_date     ON daily_case_counts(date);
CREATE INDEX idx_daily_province ON daily_case_counts(province);
CREATE INDEX idx_daily_category ON daily_case_counts(legal_category);

-- Monthly rollups for NGO dashboards
CREATE TABLE monthly_summary (
    id              BIGSERIAL   PRIMARY KEY,
    year            SMALLINT    NOT NULL,
    month           SMALLINT    NOT NULL CHECK (month BETWEEN 1 AND 12),
    province        VARCHAR(50),
    legal_category  VARCHAR(100),
    total_cases     INTEGER     NOT NULL DEFAULT 0,
    lawyer_referrals INTEGER    NOT NULL DEFAULT 0,
    documents_drafted INTEGER   NOT NULL DEFAULT 0,
    UNIQUE (year, month, province, legal_category)
);

CREATE INDEX idx_monthly_year_month ON monthly_summary(year, month);

-- Legal category taxonomy (shared reference)
CREATE TABLE legal_categories (
    code        VARCHAR(100) PRIMARY KEY,
    name_en     VARCHAR(200) NOT NULL,
    name_ur     VARCHAR(200) NOT NULL,
    description_en TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO legal_categories (code, name_en, name_ur) VALUES
    ('family_law',      'Family Law',               'خاندانی قانون'),
    ('labor',           'Labor & Employment',        'مزدور اور ملازمت'),
    ('property',        'Property & Land',           'جائیداد اور زمین'),
    ('criminal',        'Criminal Law',              'فوجداری قانون'),
    ('consumer',        'Consumer Rights',           'صارف کے حقوق'),
    ('tenant',          'Tenant & Rental',           'کرایہ دار اور کرایہ'),
    ('inheritance',     'Inheritance & Wills',       'وراثت اور وصیت'),
    ('domestic_violence','Domestic Violence',        'گھریلو تشدد'),
    ('child_custody',   'Child Custody',             'بچوں کی تحویل'),
    ('debt',            'Debt & Loans',              'قرض اور ادھار'),
    ('police',          'Police & FIR',              'پولیس اور ایف آئی آر'),
    ('other',           'Other / Unclear',           'دیگر / غیر واضح');
