import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, TenantSettings, PropertyCategory } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface TenantContextType {
  tenant: Tenant;
  settings: TenantSettings;
  categories: PropertyCategory[];
  isLoading: boolean;
  updateSettings: (newSettings: Partial<TenantSettings>) => Promise<void>;
}

const DEFAULT_TENANT: Tenant = {
  id: 't1111111-1111-1111-1111-111111111111',
  slug: 'aura-imoveis',
  name: 'Aura Real Estate Advisory',
  legalName: 'Aura Negócios Imobiliários Ltda',
  documentNumber: '12.345.678/0001-90',
  email: 'contato@auraimoveis.com.br',
  phone: '+55 (11) 3456-7890',
  whatsapp: '+55 (11) 98765-4321',
  address: {
    street: 'Avenida Brigadeiro Faria Lima',
    number: '3477',
    neighborhood: 'Itaim Bibi',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '04538-133'
  },
  planTier: 'pro',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const DEFAULT_SETTINGS: TenantSettings = {
  id: 's1111111-1111-1111-1111-111111111111',
  tenantId: 't1111111-1111-1111-1111-111111111111',
  logoUrl: '',
  primaryColor: '#D4AF37', // Gold luxo
  secondaryColor: '#0A0F1D',
  accentColor: '#F39C12',
  aboutTitle: 'Excelência em Curadoria e Intermediação Imobiliária',
  aboutText: 'Conectamos clientes exclusivos às propriedades residenciais e corporativas mais desejadas com discrição, tecnologia e atendimento consultivo personalizado.',
  aboutBannerUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  socialLinks: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com',
    whatsapp: '5511987654321'
  },
  metaTitle: 'Aura Real Estate | Plataforma Imobiliária',
  metaDescription: 'Encontre imóveis de alto padrão para venda e locação com agendamento imediato.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const DEFAULT_CATEGORIES: PropertyCategory[] = [
  { id: 'c1', tenantId: DEFAULT_TENANT.id, name: 'Apartamentos', slug: 'apartamento', icon: 'building', displayOrder: 1 },
  { id: 'c2', tenantId: DEFAULT_TENANT.id, name: 'Casas em Condomínio', slug: 'casa-em-condominio', icon: 'home', displayOrder: 2 },
  { id: 'c3', tenantId: DEFAULT_TENANT.id, name: 'Coberturas Duplex', slug: 'cobertura-duplex', icon: 'layers', displayOrder: 3 },
  { id: 'c4', tenantId: DEFAULT_TENANT.id, name: 'Salas Comerciais', slug: 'sala-comercial', icon: 'briefcase', displayOrder: 4 }
];

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant>(() => {
    const cached = localStorage.getItem('moliaria_active_tenant');
    return cached ? JSON.parse(cached) : DEFAULT_TENANT;
  });

  const [settings, setSettings] = useState<TenantSettings>(() => {
    const cached = localStorage.getItem('moliaria_tenant_settings');
    return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
  });

  const [categories, setCategories] = useState<PropertyCategory[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  // Aplica cores do tenant dinamicamente no root CSS
  useEffect(() => {
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--tenant-primary', settings.primaryColor);
    }
    if (settings.secondaryColor) {
      document.documentElement.style.setProperty('--tenant-secondary', settings.secondaryColor);
    }
    if (settings.accentColor) {
      document.documentElement.style.setProperty('--tenant-accent', settings.accentColor);
    }
  }, [settings]);

  // Carrega configurações remotas do Supabase se disponível
  useEffect(() => {
    const loadTenantData = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        setIsLoading(true);
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (tenantData) {
          const loadedTenant: Tenant = {
            id: tenantData.id,
            slug: tenantData.slug,
            customDomain: tenantData.custom_domain,
            name: tenantData.name,
            legalName: tenantData.legal_name,
            documentNumber: tenantData.document_number,
            email: tenantData.email,
            phone: tenantData.phone,
            whatsapp: tenantData.whatsapp,
            address: tenantData.address || {},
            planTier: tenantData.plan_tier,
            isActive: tenantData.is_active,
            createdAt: tenantData.created_at,
            updatedAt: tenantData.updated_at
          };
          setTenant(loadedTenant);
          localStorage.setItem('moliaria_active_tenant', JSON.stringify(loadedTenant));

          const { data: settingsData } = await supabase
            .from('tenant_settings')
            .select('*')
            .eq('tenant_id', loadedTenant.id)
            .single();

          if (settingsData) {
            const loadedSettings: TenantSettings = {
              id: settingsData.id,
              tenantId: settingsData.tenant_id,
              logoUrl: settingsData.logo_url,
              logoDarkUrl: settingsData.logo_dark_url,
              faviconUrl: settingsData.favicon_url,
              primaryColor: settingsData.primary_color || DEFAULT_SETTINGS.primaryColor,
              secondaryColor: settingsData.secondary_color || DEFAULT_SETTINGS.secondaryColor,
              accentColor: settingsData.accent_color || DEFAULT_SETTINGS.accentColor,
              aboutTitle: settingsData.about_title,
              aboutText: settingsData.about_text,
              aboutBannerUrl: settingsData.about_banner_url,
              socialLinks: settingsData.social_links || DEFAULT_SETTINGS.socialLinks,
              metaTitle: settingsData.meta_title,
              metaDescription: settingsData.meta_description,
              createdAt: settingsData.created_at,
              updatedAt: settingsData.updated_at
            };
            setSettings(loadedSettings);
            localStorage.setItem('moliaria_tenant_settings', JSON.stringify(loadedSettings));
          }
        }
      } catch (err) {
        console.warn('Usando dados de tenant locais:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTenantData();
  }, []);

  const updateSettings = async (newSettings: Partial<TenantSettings>) => {
    const updated = { ...settings, ...newSettings, updatedAt: new Date().toISOString() };
    setSettings(updated);
    localStorage.setItem('moliaria_tenant_settings', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('tenant_settings')
          .update({
            primary_color: updated.primaryColor,
            secondary_color: updated.secondaryColor,
            accent_color: updated.accentColor,
            about_title: updated.aboutTitle,
            about_text: updated.aboutText,
            logo_url: updated.logoUrl,
            updated_at: updated.updatedAt
          })
          .eq('tenant_id', tenant.id);
      } catch (e) {
        console.warn('Erro ao sincronizar configurações do tenant:', e);
      }
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, settings, categories, isLoading, updateSettings }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant deve ser utilizado dentro de um TenantProvider');
  }
  return context;
};
