import React, { useState } from 'react';
import { Plus, Edit2, Archive, ArchiveRestore, Building, ExternalLink } from 'lucide-react';
import { Property } from '../../types';
import { StorageService } from '../../services/storageService';
import { formatCurrency } from '../../utils/formatters';
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
            All Listings ({properties.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`btn btn-sm ${filterStatus === 'active' ? 'btn-gold' : 'btn-outline'}`}
          >
            Active ({properties.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('archived')}
            className={`btn btn-sm ${filterStatus === 'archived' ? 'btn-gold' : 'btn-outline'}`}
          >
            Archived ({properties.filter(p => p.status === 'archived').length})
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
          <span>Add New Property Listing</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{
              background: 'rgba(11, 19, 35, 0.9)',
              borderBottom: '1px solid var(--border-gold)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              color: 'var(--text-gold)',
              letterSpacing: '0.05em'
            }}>
              <th style={{ padding: '16px 20px' }}>Property</th>
              <th style={{ padding: '16px 14px' }}>Type</th>
              <th style={{ padding: '16px 14px' }}>Price</th>
              <th style={{ padding: '16px 14px' }}>Specs</th>
              <th style={{ padding: '16px 14px' }}>Status</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(property => (
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
                    <img
                      src={property.featuredImage}
                      alt=""
                      style={{
                        width: '60px',
                        height: '45px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: '#FFF', fontSize: '0.9rem' }}>
                        {property.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {property.location.address}, {property.location.city}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td style={{ padding: '16px 14px', fontSize: '0.8rem', color: 'var(--gold-light)' }}>
                  <span className="badge badge-gold">{property.propertyType}</span>
                </td>

                {/* Price */}
                <td style={{ padding: '16px 14px', fontWeight: 700, color: '#FFF', fontSize: '0.9rem' }}>
                  {formatCurrency(property.price)}
                </td>

                {/* Specs */}
                <td style={{ padding: '16px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {property.specs.bedrooms}b | {property.specs.bathrooms}ba | {property.specs.areaSqFt} sqft
                </td>

                {/* Status */}
                <td style={{ padding: '16px 14px' }}>
                  <span className={`badge ${property.status === 'active' ? 'badge-status-confirmed' : 'badge-status-cancelled'}`}>
                    {property.status}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      onClick={() => onPreviewProperty(property)}
                      className="btn btn-ghost btn-sm"
                      title="Preview Public Page"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProperty(property);
                        setIsModalOpen(true);
                      }}
                      className="btn btn-outline btn-sm"
                      title="Edit Listing"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(property)}
                      className={`btn btn-sm ${property.status === 'archived' ? 'btn-outline' : 'btn-danger'}`}
                      title={property.status === 'archived' ? 'Restore to Catalog' : 'Archive Listing'}
                    >
                      {property.status === 'archived' ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
