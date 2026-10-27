import React, { useState } from 'react';
import { Plus, Edit2, Archive, ArchiveRestore, Building, ExternalLink, Hash, Eye, Image as ImageIcon } from 'lucide-react';
import { Property } from '../../types';
import { StorageService } from '../../services/storageService';
import { formatCurrency, formatAreaM2 } from '../../utils/formatters';
import { PropertyFormModal } from './PropertyFormModal';

interface PropertyInventoryTableProps {
  properties: Property[];
  onRefresh: () => void;
  onPreviewProperty: (property: Property) => void;
}

export const PropertyInventoryTable: React.FC<PropertyInventoryTableProps> = ({
  properties,
  onRefresh,
  onPreviewProperty
}) => {
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');

  const filtered = properties.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleToggleArchive = (property: Property) => {
    if (property.status === 'archived') {
      StorageService.restoreProperty(property.id);
    } else {
      StorageService.archiveProperty(property.id);
    }
    onRefresh();
  };

  const typeLabels: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Casa',
    villa: 'Condomínio',
    penthouse: 'Cobertura',
    townhouse: 'Townhouse',
    commercial: 'Comercial'
  };

  return (
    <div>
      {/* Table Actions Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterStatus('all')}
            className={`btn btn-sm ${filterStatus === 'all' ? 'btn-gold' : 'btn-outline'}`}
          >
            Todos os Imóveis ({properties.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`btn btn-sm ${filterStatus === 'active' ? 'btn-gold' : 'btn-outline'}`}
          >
            Ativos no Catálogo ({properties.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('archived')}
            className={`btn btn-sm ${filterStatus === 'archived' ? 'btn-gold' : 'btn-outline'}`}
          >
            Arquivados ({properties.filter(p => p.status === 'archived').length})
          </button>
        </div>

        {/* Add Property Button */}
        <button
          onClick={() => {
            setEditingProperty(null);
            setIsModalOpen(true);
          }}
          className="btn btn-gold"
          style={{ fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>Cadastrar Novo Imóvel</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
          <thead>
            <tr style={{
              background: 'rgba(11, 19, 35, 0.9)',
              borderBottom: '1px solid var(--border-gold)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              color: 'var(--text-gold)',
              letterSpacing: '0.05em'
            }}>
              <th style={{ padding: '16px 20px' }}>Imóvel & Cód</th>
              <th style={{ padding: '16px 14px' }}>Tipo / Negócio</th>
              <th style={{ padding: '16px 14px' }}>Valores</th>
              <th style={{ padding: '16px 14px' }}>Especificações</th>
              <th style={{ padding: '16px 14px' }}>Status</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(property => {
              const galleryTotal = 1 + (property.gallery?.length || 0);
              const areaM2 = property.specs.areaSqM || Math.round(property.specs.areaSqFt / 10.764);

              return (
                <tr
                  key={property.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Property & Thumbnail */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={property.featuredImage}
                          alt=""
                          style={{
                            width: '64px',
                            height: '48px',
                            borderRadius: 'var(--radius-sm)',
                            objectFit: 'cover'
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#FFF',
                          fontSize: '0.65rem',
                          padding: '1px 4px',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <ImageIcon size={9} /> {galleryTotal}
                        </span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            background: 'rgba(197, 168, 128, 0.15)',
                            color: 'var(--gold-light)',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}>
                            {property.code || 'REF'}
                          </span>
                          <span style={{ fontWeight: 600, color: '#FFF', fontSize: '0.9rem' }}>
                            {property.title}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                          {property.location.neighborhood ? `${property.location.neighborhood}, ` : ''}
                          {property.location.city} - {property.location.state}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type / Listing */}
                  <td style={{ padding: '16px 14px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span className="badge badge-gold" style={{ width: 'fit-content' }}>
                        {typeLabels[property.propertyType] || property.propertyType}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--gold-light)' }}>
                        {property.listingType === 'both' ? 'Venda & Aluguel' : property.listingType === 'for_rent' ? 'Locação' : 'Venda'}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td style={{ padding: '16px 14px', fontSize: '0.85rem' }}>
                    {property.price > 0 && (
                      <div style={{ fontWeight: 700, color: '#FFF' }}>
                        {formatCurrency(property.price)}
                      </div>
                    )}
                    {property.rentalPrice && property.rentalPrice > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                        {formatCurrency(property.rentalPrice)}/mês
                      </div>
                    )}
                  </td>

                  {/* Specs */}
                  <td style={{ padding: '16px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div>{property.specs.bedrooms} qts {property.specs.suites ? `(${property.specs.suites} suítes)` : ''}</div>
                    <div>{formatAreaM2(areaM2)} • {property.specs.garageSpaces || 0} vagas</div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px 14px' }}>
                    <span className={`badge ${property.status === 'active' ? 'badge-status-confirmed' : 'badge-status-cancelled'}`}>
                      {property.status === 'active' ? 'Ativo' : property.status === 'draft' ? 'Rascunho' : property.status === 'sold' ? 'Vendido' : property.status === 'rented' ? 'Alugado' : 'Arquivado'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => onPreviewProperty(property)}
                        className="btn btn-ghost btn-sm"
                        title="Ver Página do Imóvel no Site"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProperty(property);
                          setIsModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        title="Editar Imóvel"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleArchive(property)}
                        className={`btn btn-sm ${property.status === 'archived' ? 'btn-outline' : 'btn-danger'}`}
                        title={property.status === 'archived' ? 'Restaurar ao Catálogo' : 'Arquivar Imóvel'}
                      >
                        {property.status === 'archived' ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <PropertyFormModal
          propertyToEdit={editingProperty}
          onClose={() => setIsModalOpen(false)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
};
