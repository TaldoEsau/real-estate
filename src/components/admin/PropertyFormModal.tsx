import React, { useState } from 'react';
import {
  X, Building, DollarSign, MapPin, Bed, Bath, Maximize2,
  Image, Check, Upload, Trash2, Star, Loader2, Compass
} from 'lucide-react';
import { Property, PropertyType } from '../../types';
import { StorageService } from '../../services/storageService';
import { uploadPropertyImage } from '../../services/imageUploadService';
import { generateUUID } from '../../utils/formatters';

interface PropertyFormModalProps {
  propertyToEdit?: Property | null;
  onClose: () => void;
  onSaved: () => void;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  propertyToEdit,
  onClose,
  onSaved
}) => {
  const agents = StorageService.getAgents();

  const [formData, setFormData] = useState({
    title: propertyToEdit?.title || '',
    price: propertyToEdit?.price || 2850000,
    propertyType: propertyToEdit?.propertyType || ('villa' as PropertyType),
    listingType: propertyToEdit?.listingType || 'for_sale',
    address: propertyToEdit?.location.address || '9410 Loma Vista Drive',
    city: propertyToEdit?.location.city || 'Beverly Hills',
    state: propertyToEdit?.location.state || 'CA',
    zipCode: propertyToEdit?.location.zipCode || '90210',
    bedrooms: propertyToEdit?.specs.bedrooms || 4,
    bathrooms: propertyToEdit?.specs.bathrooms || 4.5,
    areaSqFt: propertyToEdit?.specs.areaSqFt || 5200,
    amenities: propertyToEdit?.amenities.join(', ') || 'Private Infinity Pool, Wine Cellar, Smart Home Automation, Private Cinema',
    description: propertyToEdit?.description || '',
    assignedAgentId: propertyToEdit?.assignedAgentId || agents[0]?.id || ''
  });

  // Images list (featuredImage + gallery)
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    if (propertyToEdit) {
      const list = [propertyToEdit.featuredImage, ...(propertyToEdit.gallery || [])];
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

  // Handle file uploads
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
      setFeaturedImageIndex(0); // set newest uploaded as featured
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Error uploading image. Please try again.');
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
      alert('A property listing requires at least one image.');
      return;
    }
    setGalleryImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (featuredImageIndex === indexToRemove) {
      setFeaturedImageIndex(0);
    } else if (featuredImageIndex > indexToRemove) {
      setFeaturedImageIndex(featuredImageIndex - 1);
    }
  };

  // Google Maps preview URL
  const googlePreviewAddress = `${formData.address}, ${formData.city}, ${formData.state}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(googlePreviewAddress)}&t=m&z=14&ie=UTF8&iwloc=&output=embed`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (galleryImages.length === 0) {
      alert('Please upload or provide at least one property image.');
      return;
    }

    const featuredImg = galleryImages[featuredImageIndex] || galleryImages[0];
    const otherImages = galleryImages.filter((_, idx) => idx !== featuredImageIndex);

    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(Boolean);

    const property: Property = {
      id: propertyToEdit?.id || generateUUID(),
      title: formData.title,
      slug,
      description: formData.description,
      price: Number(formData.price),
      propertyType: formData.propertyType as PropertyType,
      listingType: 'for_sale',
      status: propertyToEdit?.status || 'active',
      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        lat: propertyToEdit?.location.lat || 34.0522,
        lng: propertyToEdit?.location.lng || -118.2437
      },
      specs: {
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        areaSqFt: Number(formData.areaSqFt),
        yearBuilt: 2024,
        garageSpaces: 2
      },
      amenities: amenitiesArray,
      featuredImage: featuredImg,
      gallery: otherImages.length > 0 ? otherImages : [featuredImg],
      assignedAgentId: formData.assignedAgentId,
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
        style={{ maxWidth: '780px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={20} color="var(--gold-primary)" />
            <h3 style={{ fontSize: '1.25rem', color: '#FFF' }}>
              {propertyToEdit ? 'Edit Property Listing' : 'Create New Luxury Listing'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '74vh', overflowY: 'auto' }}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. The Bel-Air Skyline Villa"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Price & Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Price (USD) *</label>
                <input
                  type="number"
                  required
                  min={10000}
                  className="form-input"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Property Type</label>
                <select
                  className="form-select"
                  value={formData.propertyType}
                  onChange={e => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                >
                  <option value="villa">Villa & Estate</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="house">Single Family Residence</option>
                  <option value="apartment">Luxury Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>
            </div>

            {/* IMAGE UPLOAD SECTION */}
            <div style={{
              background: 'rgba(11, 19, 35, 0.7)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-sm)',
              padding: '18px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Image size={14} color="var(--gold-primary)" />
                  Property Image Gallery & Uploads ({galleryImages.length})
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Click ⭐ on any photo to set as cover
                </span>
              </div>

              {/* Upload Drop Zone / Button */}
              <div style={{
                border: '2px dashed var(--border-gold)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(15, 25, 45, 0.5)',
                marginBottom: '14px',
                position: 'relative'
              }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                  disabled={isUploading}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  {isUploading ? (
                    <>
                      <Loader2 size={26} color="var(--gold-primary)" className="animate-spin" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--gold-light)' }}>Uploading images...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={26} color="var(--gold-primary)" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFF' }}>
                        Click or Drag & Drop Photos to Upload
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Supports JPG, PNG, WEBP. Saves directly with cloud or local persistence.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Uploaded Photos Grid Preview */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '10px',
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '4px'
              }}>
                {galleryImages.map((imgUrl, idx) => {
                  const isFeatured = idx === featuredImageIndex;
                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        height: '75px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: isFeatured ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)'
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Featured Star Badge / Button */}
                      <button
                        type="button"
                        onClick={() => setFeaturedImageIndex(idx)}
                        title={isFeatured ? 'Current Cover Image' : 'Set as Cover Image'}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          background: isFeatured ? 'var(--gold-primary)' : 'rgba(0,0,0,0.6)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          color: isFeatured ? '#0B1323' : '#FFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '0.65rem',
                          fontWeight: 700
                        }}
                      >
                        <Star size={10} fill={isFeatured ? '#0B1323' : 'none'} />
                        {isFeatured && 'COVER'}
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Remove image"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(239, 68, 68, 0.85)',
                          border: 'none',
                          borderRadius: '999px',
                          width: '20px',
                          height: '20px',
                          color: '#FFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Optional URL addition */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="url"
                  className="form-input"
                  style={{ height: '36px', fontSize: '0.75rem' }}
                  placeholder="Or paste an image URL directly..."
                  value={manualImageUrl}
                  onChange={e => setManualImageUrl(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddManualUrl}
                  className="btn btn-outline btn-sm"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* GOOGLE MAPS LOCATION SECTION */}
            <div style={{
              background: 'rgba(11, 19, 35, 0.7)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-sm)',
              padding: '18px',
              marginBottom: '20px'
            }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <MapPin size={14} color="var(--gold-primary)" />
                Google Maps Location & Address
              </label>

              {/* Address & City Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Street Address *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 10842 Bellagio Road"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>City / Neighborhood *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Bel-Air"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>State</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="CA"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              {/* Live Google Maps Embedded Preview */}
              <div style={{
                position: 'relative',
                height: '180px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid var(--border-gold)'
              }}>
                <iframe
                  title="Google Maps Location Preview"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={googleMapsEmbedUrl}
                />
              </div>
            </div>

            {/* Specs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  value={formData.bedrooms}
                  onChange={e => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  className="form-input"
                  value={formData.bathrooms}
                  onChange={e => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Area (Sq Ft)</label>
                <input
                  type="number"
                  min={100}
                  className="form-input"
                  value={formData.areaSqFt}
                  onChange={e => setFormData({ ...formData, areaSqFt: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="form-group">
              <label className="form-label">Features & Amenities (Comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Infinity Pool, Wine Cellar, Smart Home"
                value={formData.amenities}
                onChange={e => setFormData({ ...formData, amenities: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Listing Description</label>
              <textarea
                rows={3}
                className="form-input"
                placeholder="Describe architectural style, natural light, views..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-gold">
              <Check size={16} />
              <span>{propertyToEdit ? 'Save Changes' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
