import { Lead, LeadType, LeadStatus } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_LEADS_KEY = 'moliaria_leads_v1';

export class LeadService {
  private static getStoredLeads(): Lead[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_LEADS_KEY);
      if (data) return JSON.parse(data);

      const seedLeads: Lead[] = [
        {
          id: 'lead-seed-1',
          tenantId: 't1111111-1111-1111-1111-111111111111',
          propertyId: 'p2222222-2222-2222-2222-222222222222',
          propertyTitle: 'Cobertura Duplex com Terraço Panorâmico',
          propertyCode: 'CB2088',
          leadType: 'property_inquiry',
          name: 'Renato Faria Guimarães',
          email: 'renato.guimaraes@investimentos.com.br',
          phone: '(11) 98122-4530',
          message: 'Gostaria de saber se o valor do condomínio inclui as 3 vagas demarcadas e se aceitam proposta à vista.',
          status: 'new',
          createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
        },
        {
          id: 'lead-seed-2',
          tenantId: 't1111111-1111-1111-1111-111111111111',
          propertyId: 'p1111111-1111-1111-1111-111111111111',
          propertyTitle: 'The Skyline Villa & Spa Privativo',
          propertyCode: 'CS1042',
          leadType: 'property_inquiry',
          name: 'Dra. Beatriz Albuquerque',
          email: 'beatriz.albuquerque@medicina.usp.br',
          phone: '(11) 99455-8812',
          message: 'Tenho interesse em locação por temporada ou compra. O imóvel já possui gerador instalado?',
          status: 'contacted',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
        },
        {
          id: 'lead-seed-3',
          tenantId: 't1111111-1111-1111-1111-111111111111',
          propertyId: 'p3333333-3333-3333-3333-333333333333',
          propertyTitle: 'Casa Minimalista Contemporânea',
          propertyCode: 'CS3050',
          leadType: 'report_error',
          name: 'Carlos Eduardo Santos',
          email: 'carlos.santos@gmail.com',
          phone: '(11) 97110-3344',
          message: 'O valor do IPTU informado parece com erro de digitação, no anúncio do portal constava outro valor.',
          details: { problemType: 'valor_incorreto' },
          status: 'new',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
        }
      ];

      localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(seedLeads));
      return seedLeads;
    } catch (e) {
      console.warn('Erro ao ler leads do localStorage:', e);
      return [];
    }
  }

  private static setStoredLeads(leads: Lead[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(leads));
    } catch (e) {
      console.warn('Erro ao salvar leads no localStorage:', e);
    }
  }

  /**
   * Captura lead de interesse específico em um imóvel
   */
  public static async submitPropertyInquiry(data: {
    tenantId?: string;
    propertyId: string;
    propertyTitle: string;
    propertyCode?: string;
    name: string;
    email: string;
    phone: string;
    message?: string;
  }): Promise<{ success: boolean; lead: Lead }> {
    const newLead: Lead = {
      id: crypto.randomUUID ? crypto.randomUUID() : `lead_${Date.now()}`,
      tenantId: data.tenantId || 't1111111-1111-1111-1111-111111111111',
      propertyId: data.propertyId,
      propertyTitle: data.propertyTitle,
      propertyCode: data.propertyCode,
      leadType: 'property_inquiry',
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('leads').insert({
          id: newLead.id,
          tenant_id: newLead.tenantId,
          property_id: newLead.propertyId,
          lead_type: newLead.leadType,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          message: newLead.message,
          status: newLead.status
        });
        if (error) console.warn('Supabase lead insert fallback:', error);
      } catch (err) {
        console.warn('Falha na conexão Supabase ao salvar lead:', err);
      }
    }

    const currentLeads = this.getStoredLeads();
    this.setStoredLeads([newLead, ...currentLeads]);

    return { success: true, lead: newLead };
  }

  /**
   * Formulário de contato institucional geral
   */
  public static async submitGeneralContact(data: {
    tenantId?: string;
    name: string;
    email: string;
    phone: string;
    message: string;
  }): Promise<{ success: boolean; lead: Lead }> {
    const newLead: Lead = {
      id: crypto.randomUUID ? crypto.randomUUID() : `lead_${Date.now()}`,
      tenantId: data.tenantId || 't1111111-1111-1111-1111-111111111111',
      leadType: 'general_contact',
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('leads').insert({
          id: newLead.id,
          tenant_id: newLead.tenantId,
          lead_type: newLead.leadType,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          message: newLead.message,
          status: newLead.status
        });
        if (error) console.warn('Supabase lead insert fallback:', error);
      } catch (err) {
        console.warn('Falha na conexão Supabase ao salvar lead:', err);
      }
    }

    const currentLeads = this.getStoredLeads();
    this.setStoredLeads([newLead, ...currentLeads]);

    return { success: true, lead: newLead };
  }

  /**
   * Funcionalidade de reportar erro no anúncio (do projeto base)
   */
  public static async submitErrorReport(data: {
    tenantId?: string;
    propertyId: string;
    propertyTitle: string;
    propertyCode?: string;
    name: string;
    email: string;
    phone: string;
    problemType: string;
    description: string;
  }): Promise<{ success: boolean; lead: Lead }> {
    const newLead: Lead = {
      id: crypto.randomUUID ? crypto.randomUUID() : `lead_${Date.now()}`,
      tenantId: data.tenantId || 't1111111-1111-1111-1111-111111111111',
      propertyId: data.propertyId,
      propertyTitle: data.propertyTitle,
      propertyCode: data.propertyCode,
      leadType: 'report_error',
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.description,
      details: { problemType: data.problemType },
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('leads').insert({
          id: newLead.id,
          tenant_id: newLead.tenantId,
          property_id: newLead.propertyId,
          lead_type: newLead.leadType,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          message: newLead.message,
          details: newLead.details,
          status: newLead.status
        });
        if (error) console.warn('Supabase lead insert fallback:', error);
      } catch (err) {
        console.warn('Falha na conexão Supabase ao reportar erro:', err);
      }
    }

    const currentLeads = this.getStoredLeads();
    this.setStoredLeads([newLead, ...currentLeads]);

    return { success: true, lead: newLead };
  }

  /**
   * Retorna todos os leads (com filtro opcional por tenant)
   */
  public static async getLeads(tenantId?: string): Promise<Lead[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (tenantId) {
          query = query.eq('tenant_id', tenantId);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            tenantId: item.tenant_id,
            propertyId: item.property_id,
            leadType: item.lead_type as LeadType,
            name: item.name,
            email: item.email,
            phone: item.phone,
            message: item.message,
            details: item.details,
            status: item.status as LeadStatus,
            assignedAgentId: item.assigned_agent_id,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          }));
        }
      } catch (e) {
        console.warn('Erro ao consultar leads no Supabase, usando local:', e);
      }
    }

    const local = this.getStoredLeads();
    return tenantId ? local.filter(l => l.tenantId === tenantId) : local;
  }

  /**
   * Atualiza o status do lead no funil (new, contacted, scheduled, won, lost)
   */
  public static async updateLeadStatus(leadId: string, status: LeadStatus): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('leads').update({
          status,
          updated_at: new Date().toISOString()
        }).eq('id', leadId);
      } catch (e) {
        console.warn('Erro ao atualizar lead no Supabase:', e);
      }
    }

    const current = this.getStoredLeads();
    const updated = current.map(l => l.id === leadId ? { ...l, status, updatedAt: new Date().toISOString() } : l);
    this.setStoredLeads(updated);
    return true;
  }
}
