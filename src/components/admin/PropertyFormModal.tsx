import React, { useState } from 'react';
import {
  X, Building, DollarSign, MapPin, Bed, Bath, Maximize2,
  Image, Check, Upload, Trash2, Star, Loader2, Compass,
  Hash, Tag, Layers, Car, CheckSquare, Plus
} from 'lucide-react';
import { Property, PropertyType, ListingType, PropertyStatus, PropertyLocation } from '../../types';
import { StorageService } from '../../services/storageService';
import { uploadPropertyImage } from '../../services/imageUploadService';
import { generateUUID } from '../../utils/formatters';
import { LocationMapPicker } from './LocationMapPicker';

interface PropertyFormModalProps {
  propertyToEdit?: Property | null;
  onClose: () => void;
  onSaved: () => void;
}

const COMMON_AMENITIES = [
  'Piscina',
  'Churrasqueira',
  'Varanda Gourmet',
  'Ar Condicionado',
  'Academia',
  'Sauna',
  'Elevador Privativo',
  'Lareira',
  'Portaria 24h',
  'Adega Climatizada',
  'Piscina Aquecida',
  'Energia Solar Fotovoltaica',
  'Pátio / Jardim',
  'Fechadura Biométrica',
  'Armários Planejados'
];

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  propertyToEdit,
  onClose,
  onSaved
}) => {
  const agents = StorageService.getAgents();

  // Estados dos campos do imóvel
  const [formData, setFormData] = useState({
    code: propertyToEdit?.code || `REF${Math.floor(1000 + Math.random() * 9000)}`,
    title: propertyToEdit?.title || '',
    slug: propertyToEdit?.slug || '',
    description: propertyToEdit?.description || '',
    listingType: (propertyToEdit?.listingType || 'for_sale') as ListingType,
    status: (propertyToEdit?.status || 'active') as PropertyStatus,
    price: propertyToEdit?.price || 1500000,
    rentalPrice: propertyToEdit?.rentalPrice || 0,
    condoFee: propertyToEdit?.condoFee || 0,
    iptuFee: propertyToEdit?.iptuFee || 0,
    propertyType: (propertyToEdit?.propertyType || 'apartment') as PropertyType,
    address: propertyToEdit?.location.address || '',
    number: propertyToEdit?.location.number || '',
    neighborhood: propertyToEdit?.location.neighborhood || '',
    city: propertyToEdit?.location.city || 'São Paulo',
    state: propertyToEdit?.location.state || 'SP',
    zipCode: propertyToEdit?.location.zipCode || '',
    lat: propertyToEdit?.location.lat ?? -23.55052,
    lng: propertyToEdit?.location.lng ?? -46.633308,
    mapQuery: propertyToEdit?.location.mapQuery || '',
    useExactCoords: propertyToEdit?.location.useExactCoords || false,
    isLocationConfirmed: propertyToEdit?.location.isLocationConfirmed || false,
    bedrooms: propertyToEdit?.specs.bedrooms || 3,
    suites: propertyToEdit?.specs.suites || 1,
    bathrooms: propertyToEdit?.specs.bathrooms || 2,
    garageSpaces: propertyToEdit?.specs.garageSpaces || 2,
    areaSqM: propertyToEdit?.specs.areaSqM || (propertyToEdit?.specs.areaSqFt ? Math.round(propertyToEdit.specs.areaSqFt / 10.764) : 120),
    yearBuilt: propertyToEdit?.specs.yearBuilt || new Date().getFullYear(),
    assignedAgentId: propertyToEdit?.assignedAgentId || agents[0]?.id || ''
  });

  // Lista de comodidades selecionadas
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    return propertyToEdit?.amenities || [
      'Piscina',
      'Churrasqueira',
      'Varanda Gourmet',
      'Portaria 24h'
    ];
  });
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // Imagens da Galeria
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    if (propertyToEdit) {
      const list = [propertyToEdit.featuredImage, ...(propertyToEdit.gallery || [])].filter(Boolean);
      return Array.from(new Set(list));
    }
    return [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ];
  });

  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'geral' | 'valores' | 'localizacao' | 'fotos' | 'caracteristicas'>('geral');

  // Gerador automático de slug caso o usuário altere o título
  const handleTitleChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: prev.slug === '' || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        ? val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : prev.slug
    }));
  };

  // Upload múltiplo de fotos para o Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadPropertyImage(files[i]);
        newUrls.push(url);
      }
      setGalleryImages(prev => [...newUrls, ...prev]);
      setFeaturedImageIndex(0); // A imagem mais recente vira a capa por padrão
    } catch (err) {
      console.error('Erro ao fazer upload de imagem:', err);
      alert('Falha ao processar a imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualImageUrl.trim()) return;
    setGalleryImages(prev => [manualImageUrl.trim(), ...prev]);
    setManualImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (galleryImages.length <= 1) {
      alert('O anúncio precisa ter no mínimo uma foto principal.');
      return;
    }
    setGalleryImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (featuredImageIndex === indexToRemove) {
      setFeaturedImageIndex(0);
    } else if (featuredImageIndex > indexToRemove) {
      setFeaturedImageIndex(featuredImageIndex - 1);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setSelectedAmenities(prev => [...prev, amenity]);
    }
  };

  const handleAddCustomAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customAmenityInput.trim();
    if (!clean) return;
    if (!selectedAmenities.includes(clean)) {
      setSelectedAmenities(prev => [...prev, clean]);
    }
    setCustomAmenityInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Informe o título do anúncio.');
      return;
    }

    if (galleryImages.length === 0) {
      alert('Faça upload de pelo menos uma foto para o anúncio.');
      return;
    }

    const featuredImg = galleryImages[featuredImageIndex] || galleryImages[0];
    const otherImages = galleryImages.filter((_, idx) => idx !== featuredImageIndex);

    const cleanSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const areaSqM = Number(formData.areaSqM) || 100;
    const areaSqFt = Math.round(areaSqM * 10.764);

    const property: Property = {
      id: propertyToEdit?.id || generateUUID(),
      tenantId: propertyToEdit?.tenantId || 't1111111-1111-1111-1111-111111111111',
      code: formData.code.toUpperCase().trim(),
      title: formData.title.trim(),
      slug: cleanSlug,
      description: formData.description,
      price: Number(formData.price) || 0,
      rentalPrice: Number(formData.rentalPrice) || 0,
      condoFee: Number(formData.condoFee) || 0,
      iptuFee: Number(formData.iptuFee) || 0,
      propertyType: formData.propertyType,
      listingType: formData.listingType,
      status: formData.status,
      location: {
        address: formData.address,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        lat: Number(formData.lat) || -23.55052,
        lng: Number(formData.lng) || -46.633308,
        mapQuery: formData.mapQuery || undefined,
        useExactCoords: Boolean(formData.useExactCoords),
        isLocationConfirmed: Boolean(formData.isLocationConfirmed)
      },
      specs: {
        bedrooms: Number(formData.bedrooms) || 0,
        suites: Number(formData.suites) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        garageSpaces: Number(formData.garageSpaces) || 0,
        areaSqM: areaSqM,
        areaSqFt: areaSqFt,
        yearBuilt: Number(formData.yearBuilt) || 2024
      },
      amenities: selectedAmenities,
      featuredImage: featuredImg,
      gallery: otherImages.length > 0 ? otherImages : [featuredImg],
      assignedAgentId: formData.assignedAgentId || agents[0]?.id || 'a1111111-1111-1111-1111-111111111111',
      createdAt: propertyToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageService.saveProperty(property);
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        style={{ maxWidth: '840px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building size={20} color="var(--gold-primary)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#FFF' }}>
              {propertyToEdit ? `Editar Imóvel [Cód: ${propertyToEdit.code || propertyToEdit.id.slice(0, 6)}]` : 'Cadastrar Novo Imóvel'}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            title="Fechar"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas Internas de Cadastro */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(197, 168, 128, 0.15)',
          background: 'rgba(6, 10, 18, 0.6)',
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`btn btn-sm ${activeTab === 'geral' ? 'btn-gold' : 'btn-ghost'}`}
          >
            Dados Gerais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('valores')}
            className={`btn btn-sm ${activeTab === 'valores' ? 'btn-gold' : 'btn-ghost'}`}
          >
            Valores & Negócio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('localizacao')}
            className={`btn btn-sm ${activeTab === 'localizacao' ? 'btn-gold' : 'btn-ghost'}`}
          >
            Localização
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('caracteristicas')}
            className={`btn btn-sm ${activeTab === 'caracteristicas' ? 'btn-gold' : 'btn-ghost'}`}
          >
            Comodidades ({selectedAmenities.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fotos')}
            className={`btn btn-sm ${activeTab === 'fotos' ? 'btn-gold' : 'btn-ghost'}`}
          >
            Galeria de Fotos ({galleryImages.length})
          </button>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {/* ABA 1: DADOS GERAIS */}
          {activeTab === 'geral' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Hash size={13} color="var(--gold-primary)" /> Código de Referência *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: AP1042"
                  />
                </div>
                <div>
                  <label className="form-label">Tipo de Imóvel *</label>
                  <select
                    className="form-select"
                    value={formData.propertyType}
                    onChange={e => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                  >
                    <option value="apartment">Apartamento</option>
                    <option value="house">Casa</option>
                    <option value="villa">Casa em Condomínio</option>
                    <option value="penthouse">Cobertura Duplex / Triplex</option>
                    <option value="townhouse">Casa de Vila / Sobrado</option>
                    <option value="commercial">Comercial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Título do Anúncio *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Ex: Apartamento Contemporâneo com Vista Panorâmica"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Slug Amigável (URL)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="apartamento-contemporaneo"
                  />
                </div>
                <div>
                  <label className="form-label">Status de Publicação</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                  >
                    <option value="active">Ativo (Publicado no site)</option>
                    <option value="draft">Rascunho (Oculto)</option>
                    <option value="rented">Alugado</option>
                    <option value="sold">Vendido</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="form-label">Quartos</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    value={formData.bedrooms}
                    onChange={e => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Suítes</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    value={formData.suites}
                    onChange={e => setFormData({ ...formData, suites: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Banheiros</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    className="form-input"
                    value={formData.bathrooms}
                    onChange={e => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Vagas Garagem</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    value={formData.garageSpaces}
                    onChange={e => setFormData({ ...formData, garageSpaces: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Área Útil (m²)</label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={formData.areaSqM}
                    onChange={e => setFormData({ ...formData, areaSqM: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Corretor Responsável</label>
                <select
                  className="form-select"
                  value={formData.assignedAgentId}
                  onChange={e => setFormData({ ...formData, assignedAgentId: e.target.value })}
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Descrição Detalhada do Imóvel</label>
                <textarea
                  rows={4}
                  className="form-input"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva os diferenciais, acabamento, vista, lazer e detalhes do condomínio..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* ABA 2: VALORES & NEGÓCIO */}
          {activeTab === 'valores' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="form-label">Tipo de Transação / Comercialização *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, listingType: 'for_sale' })}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: formData.listingType === 'for_sale' ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                      background: formData.listingType === 'for_sale' ? 'rgba(197, 168, 128, 0.15)' : 'rgba(255,255,255,0.02)',
                      color: '#FFF',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Venda
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, listingType: 'for_rent' })}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: formData.listingType === 'for_rent' ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                      background: formData.listingType === 'for_rent' ? 'rgba(197, 168, 128, 0.15)' : 'rgba(255,255,255,0.02)',
                      color: '#FFF',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Locação / Aluguel
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, listingType: 'both' })}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: formData.listingType === 'both' ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                      background: formData.listingType === 'both' ? 'rgba(197, 168, 128, 0.15)' : 'rgba(255,255,255,0.02)',
                      color: '#FFF',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Venda & Aluguel
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    disabled={formData.listingType === 'for_rent'}
                    className="form-input"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="1500000"
                  />
                </div>
                <div>
                  <label className="form-label">Valor de Aluguel / Mês (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    disabled={formData.listingType === 'for_sale'}
                    className="form-input"
                    value={formData.rentalPrice}
                    onChange={e => setFormData({ ...formData, rentalPrice: Number(e.target.value) })}
                    placeholder="8500"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Condomínio Mensal (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    className="form-input"
                    value={formData.condoFee}
                    onChange={e => setFormData({ ...formData, condoFee: Number(e.target.value) })}
                    placeholder="1200"
                  />
                </div>
                <div>
                  <label className="form-label">IPTU (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    className="form-input"
                    value={formData.iptuFee}
                    onChange={e => setFormData({ ...formData, iptuFee: Number(e.target.value) })}
                    placeholder="450"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: LOCALIZAÇÃO */}
          {activeTab === 'localizacao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Logradouro / Rua *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value, isLocationConfirmed: false })}
                    placeholder="Rua Haddock Lobo"
                  />
                </div>
                <div>
                  <label className="form-label">Número</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.number}
                    onChange={e => setFormData({ ...formData, number: e.target.value, isLocationConfirmed: false })}
                    placeholder="1400"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                <div>
                  <label className="form-label">Bairro *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.neighborhood}
                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value, isLocationConfirmed: false })}
                    placeholder="Jardins"
                  />
                </div>
                <div>
                  <label className="form-label">Cidade *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value, isLocationConfirmed: false })}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label className="form-label">Estado (UF) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    className="form-input"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase(), isLocationConfirmed: false })}
                    placeholder="SP"
                  />
                </div>
                <div>
                  <label className="form-label">CEP</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.zipCode}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, zipCode: val, isLocationConfirmed: false }));
                      const cleanCep = val.replace(/\D/g, '');
                      if (cleanCep.length === 8) {
                        try {
                          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                          const data = await res.json();
                          if (!data.erro) {
                            setFormData(prev => ({
                              ...prev,
                              address: data.logradouro || prev.address,
                              neighborhood: data.bairro || prev.neighborhood,
                              city: data.localidade || prev.city,
                              state: data.uf || prev.state,
                              zipCode: val
                            }));
                          }
                        } catch {
                          // Ignora falha silenciosamente caso offline
                        }
                      }
                    }}
                    placeholder="01414-002"
                  />
                </div>
              </div>

              {/* Mapa de Confirmação e Correção do Google Maps */}
              <LocationMapPicker
                location={{
                  address: formData.address,
                  number: formData.number,
                  neighborhood: formData.neighborhood,
                  city: formData.city,
                  state: formData.state,
                  zipCode: formData.zipCode,
                  lat: Number(formData.lat),
                  lng: Number(formData.lng),
                  mapQuery: formData.mapQuery,
                  useExactCoords: formData.useExactCoords,
                  isLocationConfirmed: formData.isLocationConfirmed
                }}
                onChange={(updated: Partial<PropertyLocation>) => {
                  setFormData(prev => ({
                    ...prev,
                    ...(updated.address !== undefined ? { address: updated.address } : {}),
                    ...(updated.number !== undefined ? { number: updated.number } : {}),
                    ...(updated.neighborhood !== undefined ? { neighborhood: updated.neighborhood } : {}),
                    ...(updated.city !== undefined ? { city: updated.city } : {}),
                    ...(updated.state !== undefined ? { state: updated.state } : {}),
                    ...(updated.zipCode !== undefined ? { zipCode: updated.zipCode } : {}),
                    ...(updated.lat !== undefined ? { lat: updated.lat } : {}),
                    ...(updated.lng !== undefined ? { lng: updated.lng } : {}),
                    ...(updated.mapQuery !== undefined ? { mapQuery: updated.mapQuery } : {}),
                    ...(updated.useExactCoords !== undefined ? { useExactCoords: updated.useExactCoords } : {}),
                    ...(updated.isLocationConfirmed !== undefined ? { isLocationConfirmed: updated.isLocationConfirmed } : {})
                  }));
                }}
              />
            </div>
          )}

          {/* ABA 4: COMODIDADES */}
          {activeTab === 'caracteristicas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="form-label">Selecione as comodidades do imóvel e condomínio:</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                  gap: '10px',
                  marginTop: '10px'
                }}>
                  {COMMON_AMENITIES.map(amenity => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <div
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? 'rgba(197, 168, 128, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          color: isSelected ? '#FFF' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: isSelected ? 'none' : '1px solid var(--text-dim)',
                          background: isSelected ? 'var(--gold-gradient)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isSelected && <Check size={12} color="#0B1323" strokeWidth={3} />}
                        </div>
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Adicionar Comodidade Personalizada */}
              <div style={{ marginTop: '10px' }}>
                <label className="form-label">Adicionar outra característica personalizada:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Rooftop Privativo, Carregador para Carro Elétrico..."
                    value={customAmenityInput}
                    onChange={e => setCustomAmenityInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="btn btn-outline"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Plus size={15} /> Adicionar
                  </button>
                </div>
              </div>

              {/* Tags Selecionadas */}
              {selectedAmenities.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                    Itens incluídos no anúncio:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedAmenities.map(item => (
                      <span
                        key={item}
                        style={{
                          background: 'rgba(197, 168, 128, 0.12)',
                          border: '1px solid var(--border-gold)',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          color: '#FFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {item}
                        <X
                          size={12}
                          style={{ cursor: 'pointer', opacity: 0.7 }}
                          onClick={() => toggleAmenity(item)}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA 5: GALERIA DE FOTOS */}
          {activeTab === 'fotos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'rgba(197, 168, 128, 0.08)',
                border: '1px dashed var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '28px',
                textAlign: 'center'
              }}>
                <Upload size={32} color="var(--gold-primary)" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ fontSize: '1rem', color: '#FFF', margin: '0 0 4px 0' }}>
                  Upload de Fotos do Imóvel
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                  Envie fotos em alta resolução (JPG, PNG, WEBP). O upload armazena direto no Supabase Storage.
                </p>

                <label className="btn btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span>{isUploading ? 'Processando fotos...' : 'Selecionar Fotos do Computador'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Link manual alternativo */}
              <div>
                <label className="form-label">Ou adicione URL direta da imagem:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={manualImageUrl}
                    onChange={e => setManualImageUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="btn btn-outline"
                  >
                    Adicionar URL
                  </button>
                </div>
              </div>

              {/* Grid de Fotos com Seleção de Capa */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 600 }}>
                    Fotos Cadastradas ({galleryImages.length})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                    Clique na estrela para definir a Foto de Capa (Principal)
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '14px'
                }}>
                  {galleryImages.map((imgUrl, index) => {
                    const isFeatured = index === featuredImageIndex;
                    return (
                      <div
                        key={index}
                        style={{
                          position: 'relative',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          border: isFeatured ? '2px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.15)',
                          paddingTop: '70%',
                          background: '#070B14'
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt=""
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />

                        {/* Badge de Capa */}
                        {isFeatured && (
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            background: 'var(--gold-gradient)',
                            color: '#0B1323',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '3px'
                          }}>
                            CAPA
                          </div>
                        )}

                        {/* Botão Tornar Capa */}
                        {!isFeatured && (
                          <button
                            type="button"
                            onClick={() => setFeaturedImageIndex(index)}
                            title="Definir como foto de capa"
                            style={{
                              position: 'absolute',
                              top: '6px',
                              left: '6px',
                              background: 'rgba(6, 10, 18, 0.75)',
                              border: 'none',
                              color: '#FFF',
                              borderRadius: '999px',
                              padding: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            <Star size={13} />
                          </button>
                        )}

                        {/* Botão Remover */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          title="Excluir foto"
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(239, 68, 68, 0.85)',
                            border: 'none',
                            color: '#FFF',
                            borderRadius: '999px',
                            padding: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer do Modal com Botões de Ação */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Check size={16} />
              <span>{propertyToEdit ? 'Salvar Alterações' : 'Publicar Imóvel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
