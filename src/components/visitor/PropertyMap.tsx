import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Layers, Car } from 'lucide-react';
import { PropertyLocation } from '../../types';

interface PropertyMapProps {
  location: PropertyLocation;
  propertyTitle: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ location, propertyTitle }) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zipCode || ''}`;
  
  // Google Maps embed URL
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=15&ie=UTF8&iwloc=&output=embed`;
  
  // Direct Google Maps link for directions
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

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
            background: 'var(--gold-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(197, 168, 128, 0.3)'
          }}>
            <MapPin size={18} color="#0B1323" strokeWidth={2.4} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#FFF', margin: 0 }}>
              Google Maps Location
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Interactive real-time mapping & navigation
            </span>
          </div>
        </div>

        {/* View Switcher & External Directions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem' }}
            title="Toggle Satellite / Street View"
          >
            <Layers size={13} color="var(--gold-primary)" />
            <span>{mapType === 'roadmap' ? 'Satellite View' : 'Map View'}</span>
          </button>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold btn-sm"
            style={{ textDecoration: 'none', fontSize: '0.75rem' }}
          >
            <Car size={13} />
            <span>Get Directions</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Address Bar */}
      <div style={{
        background: 'rgba(11, 19, 35, 0.8)',
        border: '1px solid var(--border-gold)',
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
          <div style={{ fontSize: '0.7rem', color: 'var(--gold-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            Confirmed Address
          </div>
          <div style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 600 }}>
            {location.address}, {location.city}, {location.state} {location.zipCode}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <Navigation size={13} color="var(--gold-primary)" />
          <span>GPS: {location.lat.toFixed(4)}° N, {Math.abs(location.lng).toFixed(4)}° W</span>
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
          <span>Private Jet Center / Airport: ~20 mins</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={14} color="var(--gold-primary)" />
          <span>Premier Fine Dining: ~5 mins</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={14} color="var(--gold-primary)" />
          <span>Private Security Patrol Area</span>
        </div>
      </div>
    </div>
  );
};
