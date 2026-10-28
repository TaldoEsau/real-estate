import React, { useState } from 'react';
import {
  MapPin,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Navigation,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Link2,
  RotateCcw,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { PropertyLocation } from '../../types';
import { resolveGoogleMapsQuery } from '../visitor/PropertyMap';

interface LocationMapPickerProps {
  location: PropertyLocation;
  onChange: (updated: Partial<PropertyLocation>) => void;
}

/**
 * Extrai coordenadas (lat, lng) caso o usuário cole uma URL completa do Google Maps
 * Ex: https://www.google.com/maps/place/.../@-23.561414,-46.6558819,17z/...
 * ou https://maps.google.com/?q=-23.561414,-46.6558819
 */
function extractCoordsFromGoogleMapsInput(input: string): { lat: number; lng: number } | null {
  const trimmed = input.trim();

  // 1. Padrão !3dLAT!4dLNG (pino real do lugar no Google Maps)
  const pinMatch = trimmed.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (pinMatch) {
    return { lat: parseFloat(pinMatch[1]), lng: parseFloat(pinMatch[2]) };
  }

  // 2. Padrão @LAT,LNG na URL do Google Maps
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }

  // 3. Padrão direto "LAT, LNG"
  const directMatch = trimmed.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (directMatch) {
    return { lat: parseFloat(directMatch[1]), lng: parseFloat(directMatch[2]) };
  }

  return null;
}

export const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  location,
  onChange
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [showCorrectionPanel, setShowCorrectionPanel] = useState(
    Boolean(location.useExactCoords || location.mapQuery)
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeMessage, setGeocodeMessage] = useState<string | null>(null);
  const [nudgeStep, setNudgeStep] = useState<number>(0.0004); // ~45m por clique
  const [customLinkOrQuery, setCustomLinkOrQuery] = useState(location.mapQuery || '');

  const currentQuery = resolveGoogleMapsQuery(location);
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(currentQuery)}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=17&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentQuery)}`;

  // Geocodifica o endereço digitado usando Nominatim (OpenStreetMap) para obter lat/lng reais
  const handleGeocodeFromAddress = async () => {
    const queryParts = [
      [location.address, location.number].filter(Boolean).join(', '),
      location.neighborhood,
      location.city,
      location.state,
      location.zipCode,
      'Brasil'
    ].filter(Boolean).join(', ');

    if (!location.address && !location.city) {
      setGeocodeMessage('Preencha pelo menos a Rua e a Cidade acima para buscar no mapa.');
      return;
    }

    setIsGeocoding(true);
    setGeocodeMessage(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(queryParts)}`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'pt-BR' }
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        onChange({
          lat: foundLat,
          lng: foundLng,
          useExactCoords: false,
          mapQuery: '',
          isLocationConfirmed: true
        });
        setGeocodeMessage('✓ Coordenadas sincronizadas com sucesso pelo endereço!');
      } else {
        onChange({
          useExactCoords: false,
          mapQuery: ''
        });
        setGeocodeMessage('Mapa atualizado pelo endereço. Caso o pino não esteja exato, use a opção "Corrigir Posição no Mapa" abaixo.');
      }
    } catch {
      setGeocodeMessage('Mapa atualizado com o endereço digitado.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Move o pino em uma direção (Norte, Sul, Leste, Oeste) e ativa o modo de coordenadas exatas
  const handleNudgePin = (dLat: number, dLng: number) => {
    const nextLat = Number(((location.lat || -23.55052) + dLat).toFixed(6));
    const nextLng = Number(((location.lng || -46.633308) + dLng).toFixed(6));
    onChange({
      lat: nextLat,
      lng: nextLng,
      useExactCoords: true,
      isLocationConfirmed: true
    });
  };

  // Usa o GPS do navegador da pessoa
  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      setGeocodeMessage('Geolocalização não suportada neste navegador.');
      return;
    }
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeocoding(false);
        onChange({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          useExactCoords: true,
          isLocationConfirmed: true
        });
        setGeocodeMessage('✓ Posição ajustada para o seu GPS atual!');
      },
      () => {
        setIsGeocoding(false);
        setGeocodeMessage('Não foi possível obter o GPS atual. Verifique as permissões do navegador.');
      },
      { enableHighAccuracy: true }
    );
  };

  // Aplica link do Google Maps, coordenada colada ou busca específica
  const handleApplyCustomInput = () => {
    if (!customLinkOrQuery.trim()) {
      onChange({ mapQuery: '', useExactCoords: false });
      return;
    }
    const extracted = extractCoordsFromGoogleMapsInput(customLinkOrQuery);
    if (extracted) {
      onChange({
        lat: extracted.lat,
        lng: extracted.lng,
        useExactCoords: true,
        mapQuery: '',
        isLocationConfirmed: true
      });
      setGeocodeMessage(`✓ Coordenadas extraídas do link/texto (${extracted.lat.toFixed(5)}, ${extracted.lng.toFixed(5)})!`);
    } else {
      onChange({
        mapQuery: customLinkOrQuery.trim(),
        useExactCoords: false,
        isLocationConfirmed: true
      });
      setGeocodeMessage('✓ Busca personalizada aplicada ao mapa do anúncio!');
    }
  };

  return (
    <div style={{
      marginTop: '8px',
      borderRadius: 'var(--radius-md)',
      border: location.isLocationConfirmed
        ? '1px solid rgba(16, 185, 129, 0.45)'
        : '1px solid var(--border-gold)',
      background: 'rgba(6, 10, 18, 0.72)',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Cabeçalho do Verificador de Mapa */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: location.isLocationConfirmed
              ? 'rgba(16, 185, 129, 0.18)'
              : 'rgba(197, 168, 128, 0.15)',
            border: location.isLocationConfirmed
              ? '1px solid rgba(16, 185, 129, 0.4)'
              : '1px solid rgba(197, 168, 128, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin size={18} color={location.isLocationConfirmed ? '#34D399' : 'var(--gold-primary)'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#FFF', margin: 0, fontWeight: 700 }}>
                Confirmação da Geolocalização no Google Maps
              </h4>
              {location.isLocationConfirmed ? (
                <span className="badge badge-status-confirmed" style={{ fontSize: '0.68rem' }}>
                  <CheckCircle2 size={11} /> Localização Confirmada
                </span>
              ) : (
                <span className="badge badge-status-pending" style={{ fontSize: '0.68rem' }}>
                  <AlertTriangle size={11} /> Verifique o pino no mapa abaixo
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Este é o mapa exato que aparecerá para o cliente no anúncio final. Caso esteja deslocado, corrija abaixo.
            </p>
          </div>
        </div>

        {/* Botões Rápidos de Visualização */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleGeocodeFromAddress}
            disabled={isGeocoding}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem' }}
            title="Sincronizar coordenadas a partir do endereço digitado"
          >
            {isGeocoding ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            <span>Atualizar pelo Endereço</span>
          </button>

          <button
            type="button"
            onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            <Layers size={13} color="var(--gold-primary)" />
            <span>{mapType === 'roadmap' ? 'Satélite' : 'Mapa Rua'}</span>
          </button>

          <a
            href={externalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', textDecoration: 'none' }}
            title="Abrir em nova aba no Google Maps"
          >
            <ExternalLink size={13} />
            <span>Abrir Maps</span>
          </a>
        </div>
      </div>

      {geocodeMessage && (
        <div style={{
          fontSize: '0.78rem',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(197, 168, 128, 0.12)',
          border: '1px solid rgba(197, 168, 128, 0.3)',
          color: 'var(--gold-light)'
        }}>
          {geocodeMessage}
        </div>
      )}

      {/* Iframe de Preview do Google Maps (Exatamente como o usuário final verá) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '260px',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid var(--border-gold)',
        background: '#070B14'
      }}>
        <iframe
          title="Preview de Confirmação Google Maps"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
        />

        {/* Badge indicando modo atual de busca do mapa */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(6, 10, 18, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(197, 168, 128, 0.35)',
          borderRadius: '6px',
          padding: '5px 10px',
          fontSize: '0.72rem',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Navigation size={12} color="var(--gold-primary)" />
          <span>
            {location.useExactCoords
              ? `Pino GPS Exato: ${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)}`
              : location.mapQuery
              ? `Busca ajustada: "${location.mapQuery}"`
              : `Endereço: ${currentQuery}`}
          </span>
        </div>
      </div>

      {/* Barra de Ação: Confirmar ou Abrir Correção */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <button
          type="button"
          onClick={() => onChange({ isLocationConfirmed: !location.isLocationConfirmed })}
          className={`btn btn-sm ${location.isLocationConfirmed ? 'btn-gold' : 'btn-outline'}`}
          style={{ fontSize: '0.78rem' }}
        >
          <CheckCircle2 size={14} />
          <span>
            {location.isLocationConfirmed
              ? 'Localização Confirmada para o Anúncio'
              : 'Confirmar que o Mapa Está Correto'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowCorrectionPanel(!showCorrectionPanel)}
          className="btn btn-outline btn-sm"
          style={{
            fontSize: '0.78rem',
            borderColor: showCorrectionPanel ? 'var(--gold-primary)' : undefined,
            color: showCorrectionPanel ? 'var(--gold-light)' : undefined
          }}
        >
          <Crosshair size={14} color="var(--gold-primary)" />
          <span>
            {showCorrectionPanel
              ? 'Ocultar Ferramentas de Correção'
              : 'Localização errada no mapa? Clique para corrigir'}
          </span>
        </button>
      </div>

      {/* Painel de Correção Manual caso o Google Maps erre o endereço */}
      {showCorrectionPanel && (
        <div style={{
          padding: '16px',
          borderRadius: '10px',
          background: 'rgba(11, 19, 35, 0.9)',
          border: '1px dashed rgba(197, 168, 128, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-light)' }}>
              Corrigir Posição no Google Maps (sem alterar o endereço escrito no anúncio)
            </span>
            {(location.useExactCoords || location.mapQuery) && (
              <button
                type="button"
                onClick={() => {
                  setCustomLinkOrQuery('');
                  onChange({ useExactCoords: false, mapQuery: '' });
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
              >
                <RotateCcw size={12} /> Voltar ao endereço padrão
              </button>
            )}
          </div>

          {/* Opção 1: Colar Link do Google Maps ou Ponto de Referência Exato */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Link2 size={13} color="var(--gold-primary)" />
              Opção 1: Cole o Link do Google Maps, Coordenada ou Nome do Condomínio/Local
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: '1 1 260px' }}
                placeholder="Cole um link do Google Maps, ex: -23.5614, -46.6558 ou Condomínio Fazenda Boa Vista..."
                value={customLinkOrQuery}
                onChange={(e) => setCustomLinkOrQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={handleApplyCustomInput}
                className="btn btn-gold btn-sm"
                style={{ whiteSpace: 'nowrap', padding: '0 16px' }}
              >
                Aplicar no Mapa
              </button>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              Dica: Você pode abrir o Google Maps, copiar o link ou as coordenadas da casa exata e colar acima.
            </span>
          </div>

          {/* Opção 2: Ajuste Fino de Coordenadas (Pino GPS + Botões Direcionais) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            alignItems: 'end',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {/* Latitude e Longitude Manuais */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="form-label">Latitude (GPS)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-input"
                  value={location.lat}
                  onChange={(e) =>
                    onChange({
                      lat: parseFloat(e.target.value) || 0,
                      useExactCoords: true,
                      isLocationConfirmed: true
                    })
                  }
                />
              </div>
              <div>
                <label className="form-label">Longitude (GPS)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-input"
                  value={location.lng}
                  onChange={(e) =>
                    onChange({
                      lng: parseFloat(e.target.value) || 0,
                      useExactCoords: true,
                      isLocationConfirmed: true
                    })
                  }
                />
              </div>
            </div>

            {/* Controle Direcional para Mover o Pino no Mapa */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px'
              }}>
                <span className="form-label" style={{ margin: 0 }}>Mover Pino no Mapa:</span>
                <select
                  value={nudgeStep}
                  onChange={(e) => setNudgeStep( parseFloat(e.target.value) )}
                  style={{
                    background: 'rgba(6, 10, 18, 0.85)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '4px',
                    color: 'var(--gold-light)',
                    fontSize: '0.7rem',
                    padding: '2px 6px'
                  }}
                >
                  <option value={0.00015}>Passo Curto (~15m)</option>
                  <option value={0.0004}>Passo Médio (~45m)</option>
                  <option value={0.0015}>Passo Longo (~160m)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleNudgePin(nudgeStep, 0)}
                  className="btn btn-outline btn-sm"
                  title="Mover pino para o Norte"
                >
                  <ArrowUp size={13} /> Norte
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgePin(-nudgeStep, 0)}
                  className="btn btn-outline btn-sm"
                  title="Mover pino para o Sul"
                >
                  <ArrowDown size={13} /> Sul
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgePin(0, -nudgeStep)}
                  className="btn btn-outline btn-sm"
                  title="Mover pino para o Oeste"
                >
                  <ArrowLeft size={13} /> Oeste
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgePin(0, nudgeStep)}
                  className="btn btn-outline btn-sm"
                  title="Mover pino para o Leste"
                >
                  <ArrowRight size={13} /> Leste
                </button>
                <button
                  type="button"
                  onClick={handleUseCurrentGps}
                  className="btn btn-outline btn-sm"
                  title="Usar minha localização atual via GPS"
                >
                  <Crosshair size={13} color="var(--gold-primary)" /> Meu GPS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

