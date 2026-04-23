// ─────────────────────────────────────────────────────────────
//  Vera PM — Database Types
//  Auto-sync these with: npx supabase gen types typescript
// ─────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization
        Insert: Omit<Organization, 'id' | 'created_at'>
        Update: Partial<Omit<Organization, 'id'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Profile>
      }
      properties: {
        Row: Property
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Property, 'id' | 'org_id'>>
      }
      units: {
        Row: Unit
        Insert: Omit<Unit, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Unit, 'id' | 'property_id'>>
      }
      tenants: {
        Row: Tenant
        Insert: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Tenant, 'id' | 'org_id'>>
      }
      leases: {
        Row: Lease
        Insert: Omit<Lease, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lease, 'id'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'>
        Update: Partial<Omit<Payment, 'id'>>
      }
      maintenance_tickets: {
        Row: MaintenanceTicket
        Insert: Omit<MaintenanceTicket, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MaintenanceTicket, 'id' | 'org_id'>>
      }
      ticket_notes: {
        Row: TicketNote
        Insert: Omit<TicketNote, 'id' | 'created_at'>
        Update: Partial<TicketNote>
      }
      vendors: {
        Row: Vendor
        Insert: Omit<Vendor, 'id' | 'created_at'>
        Update: Partial<Omit<Vendor, 'id' | 'org_id'>>
      }
      accounts: {
        Row: Account
        Insert: Omit<Account, 'id' | 'created_at'>
        Update: Partial<Omit<Account, 'id' | 'org_id'>>
      }
      journal_entries: {
        Row: JournalEntry
        Insert: Omit<JournalEntry, 'id' | 'created_at'>
        Update: Partial<Omit<JournalEntry, 'id' | 'org_id'>>
      }
      journal_lines: {
        Row: JournalLine
        Insert: Omit<JournalLine, 'id'>
        Update: Partial<JournalLine>
      }
      bank_transactions: {
        Row: BankTransaction
        Insert: Omit<BankTransaction, 'id' | 'created_at'>
        Update: Partial<Omit<BankTransaction, 'id'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      property_type: 'residential' | 'commercial' | 'mixed_use' | 'single_family'
      unit_status: 'vacant' | 'occupied' | 'maintenance' | 'unavailable'
      lease_status: 'active' | 'expired' | 'terminated' | 'pending'
      lease_type: 'fixed' | 'month_to_month'
      payment_method: 'ach' | 'card' | 'check' | 'cash' | 'zelle' | 'other'
      payment_type: 'rent' | 'late_fee' | 'deposit' | 'pet_fee' | 'other'
      ticket_status: 'open' | 'in_progress' | 'scheduled' | 'pending_parts' | 'completed' | 'closed'
      ticket_priority: 'urgent' | 'high' | 'medium' | 'low'
      ticket_category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'landscaping' | 'other'
      account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
      normal_balance: 'debit' | 'credit'
      user_role: 'owner' | 'manager' | 'maintenance' | 'tenant'
    }
  }
}

// ─── Entity Types ─────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
}

export interface Profile {
  id: string                    // matches auth.users.id
  org_id: string
  full_name: string
  email: string
  role: Database['public']['Enums']['user_role']
  avatar_url: string | null
  phone: string | null
  created_at: string
}

export interface Property {
  id: string
  org_id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  type: Database['public']['Enums']['property_type']
  total_units: number
  year_built: number | null
  purchase_price: number | null
  purchase_date: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface Unit {
  id: string
  property_id: string
  unit_number: string
  bedrooms: number | null
  bathrooms: number | null
  sq_ft: number | null
  rent_amount: number
  deposit_amount: number
  floor: number | null
  status: Database['public']['Enums']['unit_status']
  amenities: string[]
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  org_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  employer: string | null
  id_type: string | null
  id_number: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  pets: string | null
  notes: string | null
  portal_user_id: string | null   // links to auth.users if tenant has portal access
  created_at: string
  updated_at: string
}

export interface Lease {
  id: string
  tenant_id: string
  unit_id: string
  org_id: string
  start_date: string
  end_date: string | null
  type: Database['public']['Enums']['lease_type']
  status: Database['public']['Enums']['lease_status']
  rent_amount: number
  deposit_amount: number
  late_fee_percent: number        // default 5
  late_fee_grace_days: number     // default 5
  move_in_date: string | null
  move_out_date: string | null
  notes: string | null
  document_url: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  org_id: string
  lease_id: string
  tenant_id: string
  unit_id: string
  property_id: string
  amount: number
  method: Database['public']['Enums']['payment_method']
  type: Database['public']['Enums']['payment_type']
  period_month: number            // 1-12
  period_year: number
  payment_date: string
  reference: string | null
  notes: string | null
  stripe_payment_intent_id: string | null
  created_at: string
}

export interface MaintenanceTicket {
  id: string
  org_id: string
  property_id: string
  unit_id: string
  tenant_id: string | null
  title: string
  description: string
  category: Database['public']['Enums']['ticket_category']
  priority: Database['public']['Enums']['ticket_priority']
  status: Database['public']['Enums']['ticket_status']
  assigned_vendor_id: string | null
  reported_by: string
  estimated_cost: number | null
  actual_cost: number | null
  due_date: string | null
  completed_date: string | null
  has_photos: boolean
  created_at: string
  updated_at: string
}

export interface TicketNote {
  id: string
  ticket_id: string
  author_name: string
  content: string
  created_at: string
}

export interface Vendor {
  id: string
  org_id: string
  company_name: string
  contact_name: string
  phone: string
  email: string | null
  specialty: Database['public']['Enums']['ticket_category'] | 'general'
  license_number: string | null
  hourly_rate: number | null
  rating: number | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface Account {
  id: string
  org_id: string
  account_number: string
  name: string
  type: Database['public']['Enums']['account_type']
  normal_balance: Database['public']['Enums']['normal_balance']
  description: string | null
  is_active: boolean
  created_at: string
}

export interface JournalEntry {
  id: string
  org_id: string
  property_id: string | null
  entry_date: string
  reference: string
  memo: string
  is_posted: boolean
  is_void: boolean
  basis: 'accrual' | 'cash'
  created_by: string
  created_at: string
}

export interface JournalLine {
  id: string
  journal_entry_id: string
  account_id: string
  description: string
  debit: number
  credit: number
  sort_order: number
}

export interface BankTransaction {
  id: string
  org_id: string
  account_id: string              // links to GL account (checking)
  transaction_date: string
  description: string
  amount: number                  // positive = deposit, negative = withdrawal
  is_cleared: boolean
  journal_entry_id: string | null // linked GL entry if reconciled
  created_at: string
}

// ─── Joined / Computed Types ──────────────────────────────────

export interface LeaseWithDetails extends Lease {
  tenant: Tenant
  unit: Unit & { property: Property }
}

export interface TicketWithDetails extends MaintenanceTicket {
  property: Property
  unit: Unit
  tenant: Tenant | null
  vendor: Vendor | null
  notes: TicketNote[]
}

export interface PaymentWithDetails extends Payment {
  tenant: Tenant
  unit: Unit
  property: Property
}
