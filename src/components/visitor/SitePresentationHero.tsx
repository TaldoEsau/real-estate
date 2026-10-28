import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Sparkles,
  ShieldCheck,
  CalendarCheck2,
  Compass,
  ArrowRight,
  MapPin,
  BedDouble,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Building2,
  KeyRound,
  Award,
  MessageCircle,
} from "lucide-react"
import { Property } from "../../types"
import { useTenant } from "../../context/TenantContext"
import { BackgroundMedia } from "@/components/ui/bg-media"
import { TextAnimate } from "@/components/ui/text-animate"
import { GradientHeading } from "@/components/ui/gradient-heading"
import { Typewriter } from "@/components/ui/typewriter"
import { HaloButton } from "@/components/ui/halo-button"
import {
  TextureCardStyled,
  TextureCardHeader,
  TextureCardContent,
  TextureCardFooter,
  TextureSeparator,
} from "@/components/ui/texture-card"
import { ShiftCard } from "@/components/ui/shift-card"
import { RollingNumber } from "@/components/ui/rolling-number"

interface SitePresentationHeroProps {
  properties: Property[]
  onSelectProperty: (property: Property) => void
  onQuickFilterTransaction: (type: "all" | "for_sale" | "for_rent") => void
  onScrollToSearch: () => void
}

export const SitePresentationHero: React.FC<SitePresentationHeroProps> = ({
  properties,
  onSelectProperty,
  onQuickFilterTransaction,
  onScrollToSearch,
}) => {
  const { tenant, settings } = useTenant()

  const activeProperties = properties.filter(
    (p) => p.status !== "archived" && p.status !== "draft"
  )
  const showcaseProperties = activeProperties.slice(0, 4)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (showcaseProperties.length <= 1) return
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % showcaseProperties.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [showcaseProperties.length])

  const currentFeatured =
    showcaseProperties[activeSlide] || showcaseProperties[0] || null

  const uniqueCitiesCount = new Set(
    activeProperties.map((p) => p.location?.city).filter(Boolean)
  ).size

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <section style={{ marginBottom: "36px" }}>
      {/* 1. Hero Principal com BackgroundMedia + TextureCardStyled + HaloButton (Cult UI) */}
      <BackgroundMedia
        src={
          settings.aboutBannerUrl ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
        }
        alt={tenant.name}
        style={{ padding: "clamp(28px, 4vw, 52px)" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: "36px",
            alignItems: "center",
          }}
        >
          {/* Coluna Esquerda: Apresentação Institucional & Proposta de Valor */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Badge de Assinatura */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                alignSelf: "flex-start",
                padding: "7px 16px",
                borderRadius: "999px",
                background: "rgba(197, 168, 128, 0.14)",
                border: "1px solid rgba(197, 168, 128, 0.38)",
                color: "var(--gold-light)",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              <Sparkles size={14} color="var(--gold-primary)" />
              <span>{tenant.name || "Consultoria Imobiliária Prime"}</span>
            </motion.div>

            {/* Headline Principal Animada com Cult UI TextAnimate + Typewriter */}
            <div>
              <h1
                style={{
                  fontSize: "clamp(2rem, 3.6vw, 3.15rem)",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  lineHeight: 1.15,
                  letterSpacing: "0.02em",
                  marginBottom: "10px",
                }}
              >
                <TextAnimate
                  text="Excelência e Exclusividade em"
                  type="calmInUp"
                />{" "}
                <br />
                <Typewriter
                  words={[
                    "Coberturas Duplex",
                    "Casas em Condomínio",
                    "Imóveis de Alto Padrão",
                    "Ativos Corporativos",
                  ]}
                  interval={3200}
                />
              </h1>

              <GradientHeading
                variant="gold"
                size="xs"
                weight="semi"
                className="block"
              >
                {settings.aboutTitle ||
                  "Curadoria Arquitetônica, Venda, Locação e Agendamento Online"}
              </GradientHeading>
            </div>

            {/* Texto de Apresentação da Imobiliária */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              style={{
                color: "rgba(243, 244, 246, 0.82)",
                fontSize: "0.98rem",
                lineHeight: 1.65,
                maxWidth: "600px",
              }}
            >
              {settings.aboutText ||
                "Conectamos clientes exigentes às propriedades residenciais e comerciais mais desejadas do mercado. Pesquise com precisão, conheça cada detalhe técnico e agende sua visita presencial com corretores credenciados em segundos."}
            </motion.p>

            {/* Botões de Ação com HaloButton (Cult UI) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "14px",
                marginTop: "4px",
              }}
            >
              <HaloButton
                variant="gold"
                size="lg"
                onClick={onScrollToSearch}
              >
                <Compass size={18} />
                <span>Pesquisar Imóveis Agora</span>
                <ArrowRight size={16} />
              </HaloButton>

              {tenant.whatsapp && (
                <HaloButton
                  variant="glass"
                  size="lg"
                  haloIntensity="subtle"
                  onClick={() =>
                    window.open(
                      `https://wa.me/55${tenant.whatsapp?.replace(/\D/g, "")}`,
                      "_blank"
                    )
                  }
                >
                  <MessageCircle size={18} color="#25D366" />
                  <span>Atendimento Personalizado</span>
                </HaloButton>
              )}
            </motion.div>

            {/* Indicadores Rápidos Animados (Cult UI RollingNumber) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(90px, 1fr))",
                gap: "16px",
                marginTop: "12px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(197, 168, 128, 0.2)",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "var(--gold-light)",
                    lineHeight: 1.1,
                  }}
                >
                  <RollingNumber
                    value={Math.max(activeProperties.length, 12)}
                    suffix="+"
                  />
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  Imóveis Selecionados
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "var(--gold-light)",
                    lineHeight: 1.1,
                  }}
                >
                  <RollingNumber
                    value={Math.max(uniqueCitiesCount, 4)}
                    suffix=" Regiões"
                  />
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  Localizações Nobre
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "var(--gold-light)",
                    lineHeight: 1.1,
                  }}
                >
                  <RollingNumber value={100} suffix="%" />
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  Documentação Validada
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Card Tátil de Destaque em Tempo Real (Cult UI TextureCardStyled) */}
          {currentFeatured && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TextureCardStyled>
                <TextureCardHeader
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 22px 14px 22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "999px",
                        background: "#10B981",
                        boxShadow: "0 0 10px #10B981",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "var(--gold-light)",
                      }}
                    >
                      Destaque da Curadoria •{" "}
                      {currentFeatured.code || "EXCLUSIVO"}
                    </span>
                  </div>

                  {/* Controles do Mini-Carrossel */}
                  {showcaseProperties.length > 1 && (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSlide(
                            (prev) =>
                              (prev - 1 + showcaseProperties.length) %
                              showcaseProperties.length
                          )
                        }
                        aria-label="Imóvel anterior"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          border: "1px solid rgba(197, 168, 128, 0.3)",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#FFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSlide(
                            (prev) => (prev + 1) % showcaseProperties.length
                          )
                        }
                        aria-label="Próximo imóvel"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          border: "1px solid rgba(197, 168, 128, 0.3)",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#FFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  )}
                </TextureCardHeader>

                <TextureSeparator />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFeatured.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32 }}
                  >
                    <TextureCardContent style={{ padding: "18px 22px" }}>
                      {/* Imagem do Imóvel em Destaque */}
                      <div
                        onClick={() => onSelectProperty(currentFeatured)}
                        style={{
                          position: "relative",
                          height: "210px",
                          borderRadius: "14px",
                          overflow: "hidden",
                          cursor: "pointer",
                          marginBottom: "16px",
                          border: "1px solid rgba(197, 168, 128, 0.22)",
                        }}
                      >
                        <img
                          src={currentFeatured.featuredImage}
                          alt={currentFeatured.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s ease",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to top, rgba(6, 10, 18, 0.9) 0%, transparent 55%)",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "12px",
                            left: "14px",
                            right: "14px",
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            gap: "8px",
                          }}
                        >
                          <div>
                            <span
                              className="badge badge-gold"
                              style={{ marginBottom: "6px" }}
                            >
                              {currentFeatured.listingType === "for_rent"
                                ? "Locação"
                                : currentFeatured.listingType === "both"
                                ? "Venda ou Locação"
                                : "Venda Exclusiva"}
                            </span>
                            <h3
                              style={{
                                fontSize: "1.1rem",
                                color: "#FFF",
                                fontWeight: 700,
                                lineHeight: 1.25,
                              }}
                            >
                              {currentFeatured.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Localização & Especificações */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "var(--text-muted)",
                          fontSize: "0.82rem",
                          marginBottom: "14px",
                        }}
                      >
                        <MapPin size={14} color="var(--gold-primary)" />
                        <span>
                          {currentFeatured.location.neighborhood
                            ? `${currentFeatured.location.neighborhood}, `
                            : ""}
                          {currentFeatured.location.city} -{" "}
                          {currentFeatured.location.state}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "12px",
                          background: "rgba(6, 10, 18, 0.55)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.8rem",
                            color: "#E5E7EB",
                          }}
                        >
                          <BedDouble size={15} color="var(--gold-primary)" />
                          <span>{currentFeatured.specs.bedrooms} Quartos</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.8rem",
                            color: "#E5E7EB",
                          }}
                        >
                          <Maximize2 size={14} color="var(--gold-primary)" />
                          <span>
                            {currentFeatured.specs.areaSqM ||
                              Math.round(
                                currentFeatured.specs.areaSqFt / 10.764
                              )}{" "}
                            m²
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.8rem",
                            color: "#34D399",
                          }}
                        >
                          <CalendarCheck2 size={14} />
                          <span>Visita Hoje</span>
                        </div>
                      </div>
                    </TextureCardContent>

                    <TextureSeparator />

                    <TextureCardFooter style={{ padding: "14px 22px" }}>
                      <div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "var(--text-muted)",
                          }}
                        >
                          Valor de Investimento
                        </div>
                        <div
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: "var(--gold-light)",
                            fontFamily: "var(--font-serif)",
                          }}
                        >
                          {formatPrice(currentFeatured.price)}
                        </div>
                      </div>

                      <HaloButton
                        variant="gold"
                        size="sm"
                        onClick={() => onSelectProperty(currentFeatured)}
                      >
                        <span>Ver Detalhes</span>
                        <ArrowRight size={14} />
                      </HaloButton>
                    </TextureCardFooter>
                  </motion.div>
                </AnimatePresence>
              </TextureCardStyled>
            </motion.div>
          )}
        </div>
      </BackgroundMedia>

      {/* 2. Três Cards Interativos de Apresentação dos Serviços (Cult UI ShiftCard) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginTop: "24px",
        }}
      >
        <ShiftCard
          onClick={() => {
            onQuickFilterTransaction("for_sale")
            onScrollToSearch()
          }}
          topContent={
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(197, 168, 128, 0.15)",
                  border: "1px solid rgba(197, 168, 128, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Building2 size={20} color="var(--gold-primary)" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--gold-light)",
                    fontWeight: 700,
                  }}
                >
                  Patrimônio & Aquisição
                </div>
                <h3
                  style={{
                    fontSize: "1.05rem",
                    color: "#FFF",
                    fontWeight: 700,
                  }}
                >
                  Compra e Venda Exclusiva
                </h3>
              </div>
            </div>
          }
          topAnimateContent={
            <span className="badge badge-gold">Filtrar Venda</span>
          }
          middleContent={
            <p
              style={{
                fontSize: "0.86rem",
                color: "var(--text-muted)",
                lineHeight: 1.55,
              }}
            >
              Assessoria jurídica e comercial completa na aquisição de casas em
              condomínio, coberturas e apartamentos com alto potencial de
              valorização.
            </p>
          }
          bottomContent={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                color: "var(--gold-light)",
                fontWeight: 600,
              }}
            >
              <span>Ver imóveis à venda na pesquisa</span>
              <ArrowRight size={15} />
            </div>
          }
        />

        <ShiftCard
          onClick={() => {
            onQuickFilterTransaction("for_rent")
            onScrollToSearch()
          }}
          topContent={
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(197, 168, 128, 0.15)",
                  border: "1px solid rgba(197, 168, 128, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <KeyRound size={20} color="var(--gold-primary)" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--gold-light)",
                    fontWeight: 700,
                  }}
                >
                  Mobilidade & Conforto
                </div>
                <h3
                  style={{
                    fontSize: "1.05rem",
                    color: "#FFF",
                    fontWeight: 700,
                  }}
                >
                  Locação Prime & Corporativa
                </h3>
              </div>
            </div>
          }
          topAnimateContent={
            <span className="badge badge-gold">Filtrar Locação</span>
          }
          middleContent={
            <p
              style={{
                fontSize: "0.86rem",
                color: "var(--text-muted)",
                lineHeight: 1.55,
              }}
            >
              Imóveis prontos para morar ou instalar sua empresa, com contratos
              ágeis, laudos de vistoria transparentes e suporte dedicado.
            </p>
          }
          bottomContent={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                color: "var(--gold-light)",
                fontWeight: 600,
              }}
            >
              <span>Explorar opções para alugar</span>
              <ArrowRight size={15} />
            </div>
          }
        />

        <ShiftCard
          onClick={onScrollToSearch}
          topContent={
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(197, 168, 128, 0.15)",
                  border: "1px solid rgba(197, 168, 128, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={20} color="var(--gold-primary)" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--gold-light)",
                    fontWeight: 700,
                  }}
                >
                  Experiência Digital
                </div>
                <h3
                  style={{
                    fontSize: "1.05rem",
                    color: "#FFF",
                    fontWeight: 700,
                  }}
                >
                  Agendamento Imediato
                </h3>
              </div>
            </div>
          }
          topAnimateContent={
            <span className="badge badge-status-confirmed">100% Online</span>
          }
          middleContent={
            <p
              style={{
                fontSize: "0.86rem",
                color: "var(--text-muted)",
                lineHeight: 1.55,
              }}
            >
              Escolha o dia e horário disponíveis diretamente na página do
              imóvel e receba confirmação com um corretor especialista.
            </p>
          }
          bottomContent={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                color: "var(--gold-light)",
                fontWeight: 600,
              }}
            >
              <span>Iniciar busca personalizada</span>
              <Award size={15} />
            </div>
          }
        />
      </div>
    </section>
  )
}

export default SitePresentationHero

