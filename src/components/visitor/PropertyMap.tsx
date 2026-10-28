import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Layers, Car, CheckCircle2 } from 'lucide-react';
import { PropertyLocation } from '../../types';

interface PropertyMapProps {
  location: PropertyLocation;
  propertyTitle: string;
}

export function resolveGoogleMapsQuery(location: PropertyLocation): string {
  if (location.useExactCoords && typeof location.lat === 'number' && typeof location.lng === 'number') {
    return `${location.lat},${location.lng}`;
  }
  if (location.mapQuery && location.mapQuery.trim()) {
    return location.mapQuery.trim();
  }
  const streetPart = [location.address, location.number].filter(Boolean).join(', ');
  const neighborhoodPart = location.neighborhood ? ` - ${location.neighborhood}` : '';
  const cityStatePart = [location.city, location.state].filter(Boolean).join(' - ');
  const zipPart = location.zipCode ? `, ${location.zipCode}` : '';
  return `${streetPart}${neighborhoodPart}, ${cityStatePart}${zipPart}`;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ location, propertyTitle }) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  const displayAddress = [
    [location.address, location.number].filter(Boolean).join(', '),
    location.neighborhood,
    `${location.city} - ${location.state}`,
    location.zipCode
  ].filter(Boolean).join(' • ');

  const resolvedQuery = resolveGoogleMapsQuery(location);

  // Google Maps embed URL
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(resolvedQuery)}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=16&ie=UTF8&iwloc=&output=embed`;

  // Direct Google Maps link for directions
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(resolvedQuery)}`;

  return (
    <div className="glass-panel" style={{ padding: '24px', overflow: 'hidden' }}>
      {/* Header with Title and Google Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: '#22221E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MapPin size={18} color="#FBFBF9" strokeWidth={2.2} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Localização no Google Maps</span>
              {location.isLocationConfirmed && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-sans)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: '#E8ECE0',
                  border: '1px solid #CFD8C0',
                  color: '#2E6F40',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={11} /> Verificada
                </span>
              )}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Mapa interativo em tempo real e navegação por GPS
            </span>
          </div>
        </div>

        {/* View Switcher & External Directions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem' }}
            title="Alternar entre Mapa e Satélite"
          >
            <Layers size={13} color="var(--gold-primary)" />
            <span>{mapType === 'roadmap' ? 'Visão Satélite' : 'Visão Mapa'}</span>
          </button>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold btn-sm"
            style={{ textDecoration: 'none', fontSize: '0.75rem' }}
          >
            <Car size={13} />
            <span>Traçar Rota</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Address Bar */}
      <div style={{
        background: '#F3F1EB',
        border: '1px solid #E4E1D7',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#4A593D', textTransform: 'uppercase', fontWeight: 700 }}>
            Endereço do Imóvel
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
            {displayAddress}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <Navigation size={13} color="var(--gold-primary)" />
          <span>
            GPS: {Number(location.lat || 0).toFixed(5)}°, {Number(location.lng || 0).toFixed(5)}°
          </span>
        </div>
      </div>

      {/* Google Maps Interactive Embed Frame */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '340px',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: '1px solid var(--border-gold)',
        boxShadow: 'var(--shadow-elevated)'
      }}>
        <iframe
          title={`Google Map - ${propertyTitle}`}
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
        />
      </div>

      {/* Nearby Highlights / Area Context */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginTop: '16px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={14} color="var(--gold-primary)" />
          <span>Localização revisada pela imobiliária</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={14} color="var(--gold-primary)" />
          <span>Acesso facilitado e rota integrada ao Google Maps</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={14} color="var(--gold-primary)" />
          <span>Visitas presenciais com acompanhamento</span>
        </div>
      </div>
    </div>
  );
};
