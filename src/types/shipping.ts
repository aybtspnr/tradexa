export interface Profile {
  id: string;
  email?: string | null;
  role?: string | null;
  plan_type?: string | null;
  company_name?: string | null;
  cnpj?: string | null;
  phone?: string | null;
  status?: string | null;
  partner_type?: string | null;
  coverage_type?: string | null;
  modals?: string[] | null;
  regions?: string[] | null;
  language?: string | null;
  notifications_enabled?: boolean | null;
  updated_at?: string | null;
}

export interface Shipment {
  id: string;
  quote_id?: string | null;
  proposal_id?: string | null;
  status?: string | null;
  current_location?: string | null;
  estimated_delivery?: string | null;
  notes?: string | null;
  updated_at?: string | null;
}

export interface Quote {
  id: string;
  client_id?: string | null;
  type: string;
  modal: string;
  shipment_type: string;
  origin: string;
  destination: string;
  weight: number;
  volume: number;
  cargo_type: string;
  status?: string | null;
  created_at?: string | null;
}

export interface Proposal {
  id: string;
  quote_id?: string | null;
  partner_id?: string | null;
  base_price: number;
  final_price: number;
  transit_time: string;
  validity: string;
  status?: string | null;
  created_at?: string | null;
}