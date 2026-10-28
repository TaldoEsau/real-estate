import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize, X } from 'lucide-react';

interface PhotoGalleryProps {
  images: string[];
  title: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const allImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
  ];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      {/* Main Image Display */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '55%',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-gold)',
        backgroundColor: '#070B14',
        marginBottom: '14px',
        boxShadow: 'var(--shadow-elevated)'
      }}>
        <img
          src={allImages[currentIndex]}
          alt={`${title} - foto ${currentIndex + 1}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Foto anterior"
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '42px',
                height: '42px',
                borderRadius: '999px',
                background: 'rgba(6, 10, 18, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={handleNext}
              aria-label="Próxima foto"
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '42px',
                height: '42px',
                borderRadius: '999px',
                background: 'rgba(6, 10, 18, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'rgba(6, 10, 18, 0.8)',
          backdropFilter: 'blur(6px)',
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '0.75rem',
          color: 'var(--gold-light)',
          fontWeight: 600,
          border: '1px solid rgba(197, 168, 128, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{currentIndex + 1} / {allImages.length}</span>
          <button
            onClick={() => setIsLightboxOpen(true)}
            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex' }}
            title="Visualizar em Tela Cheia"
          >
            <Maximize size={14} />
          </button>
        </div>
      </div>

      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '90px',
                height: '60px',
                flexShrink: 0,
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: idx === currentIndex ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                opacity: idx === currentIndex ? 1 : 0.65,
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s ease'
              }}
            >
              <img
                src={img}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsLightboxOpen(false)}
          style={{ background: 'rgba(0, 0, 0, 0.95)' }}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              background: 'none',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer'
            }}
          >
            <X size={32} />
          </button>
          <img
            src={allImages[currentIndex]}
            alt=""
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-sm)'
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
