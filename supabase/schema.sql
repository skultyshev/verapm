-- ═══════════════════════════════════════════════════════════
--  VERA PM — SUPABASE DATABASE SCHEMA
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────

CREATE TYPE property_type    AS ENUM ('residential','commercial','mixed_use','single_family');
CREATE TYPE unit_status      AS ENUM ('vacant','occupied','maintenance','unavailable');
CREATE TYPE lease_status     AS ENUM ('active','expired','terminated','pending');
CREATE TYPE lease_type       AS ENUM ('fixed','month_to_month');
CREATE TYPE payment_method   AS ENUM ('ach','card','check','cash','zelle','other');
CREATE TYPE payment_type     AS ENUM ('rent','late_fee','deposit','pet_fee','other');
CREATE TYPE ticket_status    AS ENUM ('open','in_progress','scheduled','pending_parts','completed','closed');
CREATE TYPE ticket_priority  AS ENUM ('urgent','high','medium','low');
CREATE TYPE ticket_category  AS ENUM ('plumbing','electrical','hvac','appliance','structural','pest','landscaping','other');
CREATE TYPE account_type     AS ENUM ('asset','liability','equity','revenue','expense');
CREATE TYPE normal_balance   AS ENUM ('debit','credit');
CREATE TYPE user_role        AS ENUM ('owner','manager','maintenance','tenant');

-- ─── ORGANIZATIONS (SaaS multi-tenancy) ──────────────────────

CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROFILES ────────────────────────────────────────────────

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'manager',
  avatar_url  TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROPERTIES ──────────────────────────────────────────────

CREATE TABLE properties (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  address        TEXT NOT NULL,
  city           TEXT NOT NULL,
  state          TEXT NOT NULL DEFAULT 'FL',
  zip            TEXT,
  type           property_type NOT NULL DEFAULT 'residential',
  total_units    INT NOT NULL DEFAULT 1,
  year_built     INT,
  purchase_price NUMERIC(14,2),
  purchase_date  DATE,
  description    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── UNITS ───────────────────────────────────────────────────

CREATE TABLE units (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id    UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_number    TEXT NOT NULL,
  bedrooms       NUMERIC(3,1),
  bathrooms      NUMERIC(3,1),
  sq_ft          INT,
  rent_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  floor          INT,
  status         unit_status NOT NULL DEFAULT 'vacant',
  amenities      TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, unit_number)
);

-- ─── TENANTS ─────────────────────────────────────────────────

CREATE TABLE tenants (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name                      TEXT NOT NULL,
  last_name                       TEXT NOT NULL,
  email                           TEXT NOT NULL,
  phone                           TEXT,
  date_of_birth                   DATE,
  employer                        TEXT,
  id_type                         TEXT,
  id_number                       TEXT,
  emergency_contact_name          TEXT,
  emergency_contact_phone         TEXT,
  emergency_contact_relationship  TEXT,
  pets                            TEXT,
  notes                           TEXT,
  portal_user_id                  UUID REFERENCES auth.users(id),
  created_at                      TIMESTAMPTZ DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LEASES ──────────────────────────────────────────────────

CREATE TABLE leases (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id               UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  start_date            DATE NOT NULL,
  end_date              DATE,
  type                  lease_type NOT NULL DEFAULT 'fixed',
  status                lease_status NOT NULL DEFAULT 'active',
  rent_amount           NUMERIC(10,2) NOT NULL,
  deposit_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  late_fee_percent      NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  late_fee_grace_days   INT NOT NULL DEFAULT 5,
  move_in_date          DATE,
  move_out_date         DATE,
  notes                 TEXT,
  document_url          TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PAYMENTS ────────────────────────────────────────────────

CREATE TABLE payments (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lease_id                 UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id                UUID NOT NULL REFERENCES tenants(id),
  unit_id                  UUID NOT NULL REFERENCES units(id),
  property_id              UUID NOT NULL REFERENCES properties(id),
  amount                   NUMERIC(10,2) NOT NULL,
  method                   payment_method NOT NULL DEFAULT 'ach',
  type                     payment_type NOT NULL DEFAULT 'rent',
  period_month             INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year              INT NOT NULL,
  payment_date             DATE NOT NULL,
  reference                TEXT,
  notes                    TEXT,
  stripe_payment_intent_id TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ─── VENDORS ─────────────────────────────────────────────────

CREATE TABLE vendors (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name   TEXT NOT NULL,
  contact_name   TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  specialty      TEXT NOT NULL DEFAULT 'general',
  license_number TEXT,
  hourly_rate    NUMERIC(8,2),
  rating         INT CHECK (rating BETWEEN 1 AND 5),
  notes          TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MAINTENANCE TICKETS ─────────────────────────────────────

CREATE TABLE maintenance_tickets (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id         UUID NOT NULL REFERENCES properties(id),
  unit_id             UUID NOT NULL REFERENCES units(id),
  tenant_id           UUID REFERENCES tenants(id),
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  category            ticket_category NOT NULL DEFAULT 'other',
  priority            ticket_priority NOT NULL DEFAULT 'medium',
  status              ticket_status NOT NULL DEFAULT 'open',
  assigned_vendor_id  UUID REFERENCES vendors(id),
  reported_by         TEXT NOT NULL DEFAULT 'tenant',
  estimated_cost      NUMERIC(10,2),
  actual_cost         NUMERIC(10,2),
  due_date            DATE,
  completed_date      DATE,
  has_photos          BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id   UUID NOT NULL REFERENCES maintenance_tickets(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CHART OF ACCOUNTS ───────────────────────────────────────

CREATE TABLE accounts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  name           TEXT NOT NULL,
  type           account_type NOT NULL,
  normal_balance normal_balance NOT NULL,
  description    TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, account_number)
);

-- ─── JOURNAL ENTRIES ─────────────────────────────────────────

CREATE TABLE journal_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id),
  entry_date  DATE NOT NULL,
  reference   TEXT NOT NULL,
  memo        TEXT NOT NULL,
  is_posted   BOOLEAN NOT NULL DEFAULT FALSE,
  is_void     BOOLEAN NOT NULL DEFAULT FALSE,
  basis       TEXT NOT NULL DEFAULT 'accrual' CHECK (basis IN ('accrual','cash')),
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journal_lines (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id       UUID NOT NULL REFERENCES accounts(id),
  description      TEXT NOT NULL DEFAULT '',
  debit            NUMERIC(14,2) NOT NULL DEFAULT 0,
  credit           NUMERIC(14,2) NOT NULL DEFAULT 0,
  sort_order       INT NOT NULL DEFAULT 0,
  CONSTRAINT debit_or_credit CHECK (
    (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0) OR (debit = 0 AND credit = 0)
  )
);

-- ─── BANK TRANSACTIONS ───────────────────────────────────────

CREATE TABLE bank_transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id        UUID NOT NULL REFERENCES accounts(id),
  transaction_date  DATE NOT NULL,
  description       TEXT NOT NULL,
  amount            NUMERIC(14,2) NOT NULL,
  is_cleared        BOOLEAN NOT NULL DEFAULT FALSE,
  journal_entry_id  UUID REFERENCES journal_entries(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
--  INDEXES (performance for common queries)
-- ═══════════════════════════════════════════════════════════

CREATE INDEX idx_properties_org     ON properties(org_id);
CREATE INDEX idx_units_property     ON units(property_id);
CREATE INDEX idx_tenants_org        ON tenants(org_id);
CREATE INDEX idx_leases_tenant      ON leases(tenant_id);
CREATE INDEX idx_leases_unit        ON leases(unit_id);
CREATE INDEX idx_leases_org         ON leases(org_id);
CREATE INDEX idx_leases_status      ON leases(status);
CREATE INDEX idx_payments_org       ON payments(org_id);
CREATE INDEX idx_payments_period    ON payments(period_year, period_month);
CREATE INDEX idx_payments_tenant    ON payments(tenant_id);
CREATE INDEX idx_tickets_org        ON maintenance_tickets(org_id);
CREATE INDEX idx_tickets_status     ON maintenance_tickets(status);
CREATE INDEX idx_tickets_priority   ON maintenance_tickets(priority);
CREATE INDEX idx_je_org             ON journal_entries(org_id);
CREATE INDEX idx_je_date            ON journal_entries(entry_date);
CREATE INDEX idx_jl_entry           ON journal_lines(journal_entry_id);
CREATE INDEX idx_jl_account         ON journal_lines(account_id);
CREATE INDEX idx_bank_org           ON bank_transactions(org_id);

-- ═══════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (data isolation per organization)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties           ENABLE ROW LEVEL SECURITY;
ALTER TABLE units                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases               ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors              ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions    ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's org_id
CREATE OR REPLACE FUNCTION current_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Organizations: owner only
CREATE POLICY "org_owner" ON organizations
  FOR ALL USING (owner_id = auth.uid());

-- Profiles: same org
CREATE POLICY "profile_same_org" ON profiles
  FOR ALL USING (org_id = current_org_id());

-- Properties: same org
CREATE POLICY "props_same_org" ON properties
  FOR ALL USING (org_id = current_org_id());

-- Units: via property org
CREATE POLICY "units_same_org" ON units
  FOR ALL USING (
    property_id IN (SELECT id FROM properties WHERE org_id = current_org_id())
  );

-- Tenants: same org
CREATE POLICY "tenants_same_org" ON tenants
  FOR ALL USING (org_id = current_org_id());

-- Tenant portal: tenant can see their own record
CREATE POLICY "tenant_self" ON tenants
  FOR SELECT USING (portal_user_id = auth.uid());

-- Leases: same org
CREATE POLICY "leases_same_org" ON leases
  FOR ALL USING (org_id = current_org_id());

-- Payments: same org
CREATE POLICY "payments_same_org" ON payments
  FOR ALL USING (org_id = current_org_id());

-- Vendors: same org
CREATE POLICY "vendors_same_org" ON vendors
  FOR ALL USING (org_id = current_org_id());

-- Maintenance tickets: same org
CREATE POLICY "tickets_same_org" ON maintenance_tickets
  FOR ALL USING (org_id = current_org_id());

-- Ticket notes: via ticket org
CREATE POLICY "ticket_notes_same_org" ON ticket_notes
  FOR ALL USING (
    ticket_id IN (SELECT id FROM maintenance_tickets WHERE org_id = current_org_id())
  );

-- Accounts: same org
CREATE POLICY "accounts_same_org" ON accounts
  FOR ALL USING (org_id = current_org_id());

-- Journal entries: same org
CREATE POLICY "je_same_org" ON journal_entries
  FOR ALL USING (org_id = current_org_id());

-- Journal lines: via journal entry org
CREATE POLICY "jl_same_org" ON journal_lines
  FOR ALL USING (
    journal_entry_id IN (SELECT id FROM journal_entries WHERE org_id = current_org_id())
  );

-- Bank transactions: same org
CREATE POLICY "bank_same_org" ON bank_transactions
  FOR ALL USING (org_id = current_org_id());

-- ═══════════════════════════════════════════════════════════
--  AUTO-UPDATE updated_at TRIGGER
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_leases_updated_at
  BEFORE UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON maintenance_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════
--  AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  new_slug   TEXT;
BEGIN
  -- Generate unique slug from email prefix
  new_slug := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email,'@',1),'[^a-z0-9]','-','g'))
              || '-' || SUBSTRING(NEW.id::TEXT, 1, 6);

  -- Create organization for this user
  INSERT INTO organizations (name, slug, owner_id)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Portfolio'), new_slug, NEW.id)
  RETURNING id INTO new_org_id;

  -- Create profile
  INSERT INTO profiles (id, org_id, full_name, email, role)
  VALUES (
    NEW.id,
    new_org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email,'@',1)),
    NEW.email,
    'owner'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
