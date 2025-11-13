// TypeScript types for database tables
// This provides type safety when working with Supabase

export type OrganizationType = 'lab' | 'clinic' | 'hospital'
export type UserRole = 'admin' | 'lab_manager' | 'technician'
export type InquiryStatus = 'draft' | 'sent' | 'partial' | 'completed' | 'expired'
export type EmailStatus = 'pending' | 'sent' | 'delivered' | 'failed'
export type NotificationType = 'quote_received' | 'all_quotes_received' | 'inquiry_deadline' | 'follow_up_sent'

export interface UserProfile {
  id: string
  organization_name: string
  organization_type: OrganizationType | null
  location: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  email: string
  contact_person: string | null
  phone: string | null
  website: string | null
  is_verified: boolean
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Inquiry {
  id: string
  user_id: string
  product_category_id: string | null
  product_description: string
  quantity: number
  urgency_level: number
  status: InquiryStatus
  notes: string | null
  attachment_url: string | null
  created_at: string
  updated_at: string
  deadline: string | null
}

export interface InquirySupplier {
  id: string
  inquiry_id: string
  supplier_id: string
  email_sent_at: string | null
  email_status: EmailStatus
  last_followed_up_at: string | null
  response_received: boolean
  created_at: string
}

export interface Quote {
  id: string
  inquiry_id: string
  supplier_id: string
  product_name: string
  unit_price: number | null
  total_price: number
  currency: string
  lead_time_days: number | null
  validity_period: string | null
  notes: string | null
  pdf_url: string | null
  manually_entered: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  inquiry_id: string | null
  is_read: boolean
  created_at: string
}

// Extended types with relations (for queries with joins)
export interface InquiryWithDetails extends Inquiry {
  product_category?: ProductCategory
  inquiry_suppliers?: (InquirySupplier & { supplier: Supplier })[]
  quotes?: (Quote & { supplier: Supplier })[]
}

export interface QuoteWithRelations extends Quote {
  supplier: Supplier
  inquiry: Inquiry
}

