import React, { useState } from 'react';
import { ArrowLeft, MapPin, Bed, Bath, Maximize2, Calendar, Phone, Mail, CheckCircle2, Heart, ShieldCheck } from 'lucide-react';
import { Property, BookingRequest } from '../types';
import { formatCurrency, formatArea } from '../utils/formatters';
import { StorageService } from '../services/storageService';
import { BookingService } from '../services/bookingService';
import { NotificationService } from '../services/notificationService';
import { EmailDispatchService } from '../services/emailDispatchService';
import { useFavorites } from '../context/FavoritesContext';
import { PhotoGallery } from '../components/visitor/PhotoGallery';
import { PropertyMap } from '../components/visitor/PropertyMap';
import { SlotPickerCalendar } from '../components/booking/SlotPickerCalendar';
import { BookingForm } from '../components/booking/BookingForm';
import { ConfirmationReceipt } from '../components/booking/ConfirmationReceipt';

interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  onOpenNotifications: () => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  onBack,
  onOpenNotifications
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  const agent = StorageService.getAgentById(property.assignedAgentId) || StorageService.getAgents()[0];

  // Booking state
  const defaultDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00 - 11:45');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRequest | null>(null);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleBookingSubmit = async (formData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
  }) => {
    if (!selectedSlot) {
      setBookingError('Please choose a 45-minute viewing time slot.');
      return;
    }
    setBookingError(null);
    setIsSubmitting(true);

    try {
      const result = await BookingService.createBooking({
        propertyId: property.id,
        propertyTitle: property.title,
        date: selectedDate,
        timeSlot: selectedSlot,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        notes: formData.notes,
        agentId: property.assignedAgentId
      });

      if (result.success && result.booking) {
        // 1. Dispatch internal notifications simulation (after booking is stored)
        await NotificationService.dispatchBookingNotifications(result.booking);

        // 2. Dispatch real email to client's actual inbox
        const sendResult = await EmailDispatchService.sendBookingConfirmationEmail(result.booking);
        setEmailStatus(sendResult);

        setConfirmedBooking(result.booking);
      } else {
        setBookingError(result.error || 'Failed to confirm viewing. Please try another slot.');
      }
    } catch (err) {
      console.error(err);
      setBookingError('An error occurred during booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '90px' }}>
      {/* Top Navigation Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <button
          onClick={onBack}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>

        <button
          onClick={() => toggleFavorite(property.id)}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Heart
            size={16}
            color={favorited ? '#F87171' : 'currentColor'}
            fill={favorited ? '#F87171' : 'none'}
          />
          <span>{favorited ? 'Saved to Favorites' : 'Save Property'}</span>
        </button>
      </div>

      {/* Title & Price Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-gold">{property.propertyType.toUpperCase()}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold-light)', fontSize: '0.9rem' }}>
              <MapPin size={15} color="var(--gold-primary)" />
              <span>{property.location.address}, {property.location.city}, {property.location.state}</span>
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: 700,
            color: '#FFF',
            lineHeight: 1.2
          }}>
            {property.title}
          </h1>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Offering Price
          </div>
          <div style={{
            fontSize: 'clamp(2rem, 3vw, 2.8rem)',
            fontWeight: 800,
            fontFamily: 'var(--font-serif)',
            color: '#FFF'
          }}>
            {formatCurrency(property.price)}
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '36px',
        alignItems: 'start'
      }}>
        {/* Left Column: Gallery & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Gallery Carousel */}
          <PhotoGallery
            images={[property.featuredImage, ...property.gallery]}
            title={property.title}
          />

          {/* Key Architectural Specs Bar */}
          <div className="glass-panel" style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div>
              <Bed size={22} color="var(--gold-primary)" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>{property.specs.bedrooms}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bedrooms</div>
            </div>
            <div>
              <Bath size={22} color="var(--gold-primary)" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>{property.specs.bathrooms}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bathrooms</div>
            </div>
            <div>
              <Maximize2 size={22} color="var(--gold-primary)" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>{formatArea(property.specs.areaSqFt)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Living Area</div>
            </div>
            {property.specs.yearBuilt && (
              <div>
                <Calendar size={22} color="var(--gold-primary)" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>{property.specs.yearBuilt}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Year Built</div>
              </div>
            )}
          </div>

          {/* Overview Description */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '14px' }}>
              The Residence Overview
            </h3>
            <p style={{
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              fontSize: '0.95rem'
            }}>
              {property.description}
            </p>

            {/* Amenities Tags */}
            <h4 style={{
              fontSize: '0.85rem',
              color: 'var(--gold-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginTop: '28px',
              marginBottom: '14px'
            }}>
              Features & Amenities
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {property.amenities.map(amenity => (
                <span
                  key={amenity}
                  style={{
                    background: 'rgba(197, 168, 128, 0.08)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    color: '#FFF'
                  }}
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Property Location Map */}
          <PropertyMap location={property.location} propertyTitle={property.title} />

          {/* Assigned Agent Card */}
          {agent && (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <img
                src={agent.avatar}
                alt={agent.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '999px',
                  objectFit: 'cover',
                  border: '2px solid var(--gold-primary)'
                }}
              />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Assigned Listing Partner
                </div>
                <h4 style={{ fontSize: '1.2rem', color: '#FFF', margin: '2px 0 4px 0' }}>{agent.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{agent.role}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-gold)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} /> {agent.phone}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={13} /> {agent.email}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: "Book a Viewing" Sticky Card */}
        <div style={{
          position: 'sticky',
          top: '100px'
        }}>
          <div className="glass-panel" style={{
            padding: '28px',
            border: '2px solid var(--border-gold)',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gold-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={18} color="#0B1323" strokeWidth={2.4} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#FFF', margin: 0 }}>
                  Book an In-Person Viewing
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                  Reserve your private slot with {agent ? agent.name : 'the advisor'}
                </span>
              </div>
            </div>

            <p style={{
              fontSize: '0.825rem',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              lineHeight: 1.5
            }}>
              Select your preferred appointment date and time below. Your viewing slot is held in real-time with instant email confirmation.
            </p>

            {bookingError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}>
                {bookingError}
              </div>
            )}

            {/* 1 & 2: Slot Picker */}
            <SlotPickerCalendar
              propertyId={property.id}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSelectDate={setSelectedDate}
              onSelectSlot={setSelectedSlot}
            />

            {/* 3: Booking Form */}
            <BookingForm
              onSubmit={handleBookingSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <ConfirmationReceipt
          booking={confirmedBooking}
          emailStatus={emailStatus}
          onClose={() => {
            setConfirmedBooking(null);
            setEmailStatus(null);
          }}
          onOpenNotifications={onOpenNotifications}
        />
      )}
    </div>
  );
};
