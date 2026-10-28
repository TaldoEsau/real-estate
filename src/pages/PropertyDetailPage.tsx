import React, { useState } from 'react';
import { ArrowLeft, MapPin, Bed, Bath, Maximize2, Calendar, Phone, Mail, CheckCircle2, ShieldCheck, MessageSquare, AlertTriangle } from 'lucide-react';
import { Property, BookingRequest } from '../types';
import { formatCurrency, formatArea } from '../utils/formatters';
import { StorageService } from '../services/storageService';
import { BookingService } from '../services/bookingService';
import { NotificationService } from '../services/notificationService';
import { EmailDispatchService } from '../services/emailDispatchService';
import { PhotoGallery } from '../components/visitor/PhotoGallery';
import { PropertyMap } from '../components/visitor/PropertyMap';
import { SlotPickerCalendar } from '../components/booking/SlotPickerCalendar';
import { BookingForm } from '../components/booking/BookingForm';
import { ConfirmationReceipt } from '../components/booking/ConfirmationReceipt';
import { PropertyInquiryForm } from '../components/visitor/PropertyInquiryForm';
import { ReportErrorModal } from '../components/visitor/ReportErrorModal';

interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  onOpenNotifications?: () => void;
}

const typeLabels: Record<string, string> = {
  apartment: 'Apartamento',
  house: 'Casa',
  villa: 'Casa em Condomínio',
  penthouse: 'Cobertura',
  townhouse: 'Casa de Vila',
  commercial: 'Comercial'
};

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  onBack
}) => {
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
  const [activeActionTab, setActiveActionTab] = useState<'inquiry' | 'viewing'>('inquiry');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleBookingSubmit = async (formData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
  }) => {
    if (!selectedSlot) {
      setBookingError('Por favor, selecione um horário para a visita.');
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
        setBookingError(result.error || 'Não foi possível confirmar a visita. Por favor, escolha outro horário.');
      }
    } catch (err) {
      console.error(err);
      setBookingError('Ocorreu um erro durante o agendamento. Por favor, tente novamente.');
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
          <span>Voltar aos Imóveis</span>
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
            <span className="badge badge-gold">{(typeLabels[property.propertyType] || property.propertyType).toUpperCase()}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold-light)', fontSize: '0.9rem' }}>
              <MapPin size={15} color="var(--gold-primary)" />
              <span>{property.location.address}, {property.location.city}, {property.location.state}</span>
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: 500,
            color: 'var(--text-main)',
            lineHeight: 1.15
          }}>
            {property.title}
          </h1>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Valor do Imóvel
          </div>
          <div style={{
            fontSize: 'clamp(2rem, 3vw, 2.8rem)',
            fontWeight: 500,
            fontFamily: 'var(--font-serif)',
            color: 'var(--text-main)'
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
            textAlign: 'center',
            background: '#F3F1EB'
          }}>
            <div>
              <Bed size={22} color="var(--gold-primary)" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: '1.35rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>{property.specs.bedrooms}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dormitórios</div>
            </div>
            <div>
              <Bath size={22} color="var(--gold-primary)" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: '1.35rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>{property.specs.bathrooms}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Banheiros</div>
            </div>
            <div>
              <Maximize2 size={22} color="var(--gold-primary)" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: '1.35rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>{formatArea(property.specs.areaSqFt)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Área Útil</div>
            </div>
            {property.specs.yearBuilt && (
              <div>
                <Calendar size={22} color="var(--gold-primary)" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '1.35rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>{property.specs.yearBuilt}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ano de Construção</div>
              </div>
            )}
          </div>

          {/* Overview Description */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.45rem', color: 'var(--text-main)', marginBottom: '14px' }}>
              Sobre o Imóvel
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
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginTop: '28px',
              marginBottom: '14px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 700
            }}>
              Comodidades & Diferenciais
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {property.amenities.map(amenity => (
                <span
                  key={amenity}
                  style={{
                    background: '#E8ECE0',
                    border: '1px solid #CFD8C0',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#1F1F1C'
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
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', background: '#F3F1EB' }}>
              <img
                src={agent.avatar}
                alt={agent.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '999px',
                  objectFit: 'cover',
                  border: '2px solid #22221E'
                }}
              />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#4A593D', textTransform: 'uppercase', fontWeight: 700 }}>
                  Corretor Responsável
                </div>
                <h4 style={{ fontSize: '1.3rem', color: 'var(--text-main)', margin: '2px 0 4px 0' }}>{agent.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{agent.role}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 500 }}>
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

        {/* Right Column: Sticky Action Box (Tenho Interesse & Agendamento) */}
        <div style={{
          position: 'sticky',
          top: '100px'
        }}>
          <div className="glass-panel" style={{
            padding: '24px',
            border: '1px solid #DCD8CC',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            {/* Abas Superiores de Ação */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              background: '#F3F1EB',
              padding: '4px',
              borderRadius: '999px',
              marginBottom: '20px'
            }}>
              <button
                type="button"
                onClick={() => setActiveActionTab('inquiry')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeActionTab === 'inquiry' ? '#22221E' : 'transparent',
                  color: activeActionTab === 'inquiry' ? '#FBFBF9' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={15} />
                <span>Tenho Interesse</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveActionTab('viewing')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeActionTab === 'viewing' ? '#22221E' : 'transparent',
                  color: activeActionTab === 'viewing' ? '#FBFBF9' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Calendar size={15} />
                <span>Agendar Visita</span>
              </button>
            </div>

            {/* Conteúdo Aba 1: Tenho Interesse */}
            {activeActionTab === 'inquiry' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                    Fale com o Consultor
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Atendimento imediato para este imóvel com {agent ? agent.name : 'nossa equipe'}
                  </span>
                </div>

                <PropertyInquiryForm property={property} agent={agent} />
              </div>
            )}

            {/* Conteúdo Aba 2: Agendar Visita Presencial */}
            {activeActionTab === 'viewing' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                    Agendar Visita Presencial
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Escolha data e horário para visita com {agent ? agent.name : 'o corretor'}
                  </span>
                </div>

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

                <SlotPickerCalendar
                  propertyId={property.id}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSelectDate={setSelectedDate}
                  onSelectSlot={setSelectedSlot}
                />

                <BookingForm
                  onSubmit={handleBookingSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          </div>

          {/* Botão Discreto: Reportar Erro no Anúncio (Feature do Legado) */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                textDecoration: 'underline',
                textUnderlineOffset: '3px'
              }}
            >
              <AlertTriangle size={13} color="var(--gold-primary)" />
              <span>Reportar erro ou inconsistência neste anúncio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Reporte de Erro */}
      <ReportErrorModal
        property={property}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <ConfirmationReceipt
          booking={confirmedBooking}
          emailStatus={emailStatus}
          onClose={() => {
            setConfirmedBooking(null);
            setEmailStatus(null);
          }}
        />
      )}
    </div>
  );
};
