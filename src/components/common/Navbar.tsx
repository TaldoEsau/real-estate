"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import {
  Menu,
  X,
  MessageCircle,
  ArrowLeft,
  Mail,
  Phone,
  Bookmark,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useTenant } from "../../context/TenantContext"
import { useFavorites } from "../../context/FavoritesContext"
import { PublicTab } from "../visitor/VideoPresentationHero"

interface NavbarProps {
  currentView: "catalog" | "detail" | "admin"
  activeTab: PublicTab
  onSelectTab: (tab: PublicTab) => void
  onNavigate: (view: "catalog" | "admin", propertyId?: string) => void
  onOpenFavorites: () => void
}

const NAV_TABS: { id: PublicTab; label: string }[] = [
  { id: "home", label: "Início" },
  { id: "empresa", label: "A Imobiliária" },
  { id: "venda", label: "Comprar" },
  { id: "locacao", label: "Alugar" },
  { id: "temporada", label: "Temporada" },
  { id: "contato", label: "Contato" },
]

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeTab,
  onSelectTab,
  onNavigate,
  onOpenFavorites,
}) => {
  const { tenant } = useTenant()
  const { favoritesCount } = useFavorites()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const brandWords = (tenant.name || "Aura Consultoria Imobiliária").split(" ")
  const primaryBrand = brandWords[0] || "Aura"

  const handleTabClick = (tab: PublicTab) => {
    onSelectTab(tab)
    if (currentView !== "catalog") {
      onNavigate("catalog")
    }
    setMobileMenuOpen(false)
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(251, 251, 249, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #E4E1D7",
      }}
    >
      {/* Fita Editorial Minimalista no Topo (Fundo Charcoal com Credenciais e Contato Direto) */}
      <div
        className="editorial-top-ribbon"
        style={{
          background: "#1F1F1C",
          color: "#D8D5CC",
          fontSize: "0.73rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "34px",
            gap: "16px",
          }}
        >
          {/* Esquerda: Selo CRECI e Curadoria */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#E8ECE0",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              <ShieldCheck size={13} color="#98A67C" />
              CRECI 30699-J • Curadoria Patrimonial & Alto Padrão
            </span>
          </div>

          {/* Direita: Contato Rápido Discreto */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <a
              href={`mailto:${tenant.email || "contato@auraimoveis.com.br"}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#C7C5BC",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
            >
              <Mail size={12} color="#98A67C" />
              <span>{tenant.email || "contato@auraimoveis.com.br"}</span>
            </a>

            <span style={{ opacity: 0.25 }}>|</span>

            <a
              href={`tel:${(tenant.phone || "").replace(/\D/g, "")}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#FFFFFF",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Phone size={12} color="#98A67C" />
              <span>{tenant.phone || "+55 (11) 3456-7890"}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Barra Principal Única: Identidade à Esquerda | Dock Flutuante em Pílula ao Centro | Ações Orgânicas à Direita */}
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "76px",
            gap: "18px",
          }}
        >
          {/* 1. Identidade da Marca (Alinhada à Esquerda, Estilo Editorial Contemporâneo) */}
          <div
            onClick={() => handleTabClick("home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            {/* Monograma Arquitetônico */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                background: "#22221E",
                color: "#FBFBF9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 4px 12px rgba(34, 34, 30, 0.12)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.3rem",
                  fontStyle: "italic",
                  fontWeight: 600,
                  lineHeight: 1,
                  color: "#FBFBF9",
                }}
              >
                {primaryBrand.charAt(0).toUpperCase()}
              </span>
              <span
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "2px",
                  width: "9px",
                  height: "9px",
                  borderRadius: "999px",
                  background: "#98A67C",
                  border: "2px solid #FBFBF9",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.55rem",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    color: "#1F1F1C",
                    lineHeight: 1,
                  }}
                >
                  {primaryBrand}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: "1.1rem",
                    fontWeight: 400,
                    color: "#5F5E58",
                    lineHeight: 1,
                  }}
                >
                  residências
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.64rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#76875B",
                  marginTop: "3px",
                }}
              >
                Consultoria Imobiliária
              </span>
            </div>
          </div>

          {/* 2. Navegação Central em Pílula Flutuante (Floating Capsule Dock) */}
          <nav
            className="desktop-pill-nav"
            aria-label="Navegação Principal"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px",
              background: "#F3F1EB",
              border: "1px solid #E4E1D7",
              borderRadius: "999px",
              boxShadow: "inset 0 1px 2px rgba(31, 31, 28, 0.03)",
            }}
          >
            {NAV_TABS.map((tab) => {
              const isActive =
                currentView === "catalog" && activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  style={{
                    position: "relative",
                    padding: "8px 18px",
                    border: "none",
                    borderRadius: "999px",
                    background: "transparent",
                    color: isActive ? "#FBFBF9" : "#4A4943",
                    fontSize: "0.84rem",
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: "-0.01em",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavbarCapsule"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "999px",
                        background: "#22221E",
                        boxShadow: "0 2px 10px rgba(34, 34, 30, 0.16)",
                        zIndex: -1,
                      }}
                    />
                  )}
                  {isActive && (
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "999px",
                        background: "#98A67C",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* 3. Ações à Direita: Pílula de Favoritos + Botão Orgânico com Recorte Diagonal */}
          <div
            className="desktop-actions-col"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            {/* Botão Salvos / Favoritos em Cápsula */}
            <button
              type="button"
              onClick={onOpenFavorites}
              title="Imóveis Salvos nos Favoritos"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 15px",
                borderRadius: "999px",
                background: favoritesCount > 0 ? "#E8ECE0" : "#F3F1EB",
                border:
                  favoritesCount > 0
                    ? "1px solid #98A67C"
                    : "1px solid #E4E1D7",
                color: "#1F1F1C",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <Bookmark
                size={15}
                color="#4A593D"
                fill={favoritesCount > 0 ? "#4A593D" : "none"}
              />
              <span>Salvos</span>
              <span
                style={{
                  minWidth: "20px",
                  height: "20px",
                  padding: "0 6px",
                  borderRadius: "999px",
                  background: favoritesCount > 0 ? "#22221E" : "#E4E1D7",
                  color: favoritesCount > 0 ? "#FBFBF9" : "#5F5E58",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {favoritesCount}
              </span>
            </button>

            {/* Botão Orgânico Bipartido (Atendimento Consultivo via WhatsApp) */}
            <a
              href={`https://wa.me/55${(
                tenant.whatsapp ||
                tenant.phone ||
                ""
              ).replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Falar com um Consultor no WhatsApp"
              style={{
                display: "inline-flex",
                alignItems: "stretch",
                textDecoration: "none",
                gap: "2px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "#22221E",
                  color: "#FBFBF9",
                  padding: "9px 16px 9px 16px",
                  borderRadius: "999px 6px 6px 999px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                <Sparkles size={13} color="#98A67C" />
                <span>Agendar Visita</span>
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  background: "#98A67C",
                  color: "#1F1F1C",
                  borderRadius: "6px 999px 999px 6px",
                }}
              >
                <ArrowUpRight size={15} strokeWidth={2.2} />
              </span>
            </a>

            {currentView === "admin" && (
              <button
                type="button"
                onClick={() => onNavigate("catalog")}
                className="btn btn-outline btn-sm"
                style={{
                  fontSize: "0.76rem",
                  borderRadius: "999px",
                  padding: "8px 14px",
                }}
              >
                <ArrowLeft size={14} />
                <span>Ver Site</span>
              </button>
            )}
          </div>

          {/* Botão Menu Mobile */}
          <div className="mobile-menu-toggle" style={{ display: "none" }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost"
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                border: "1px solid #E4E1D7",
                background: "#F3F1EB",
              }}
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Responsivo */}
      {mobileMenuOpen && (
        <div
          style={{
            background: "#FBFBF9",
            borderBottom: "1px solid #E4E1D7",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {NAV_TABS.map((tab) => {
            const isActive = currentView === "catalog" && activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`btn ${isActive ? "btn-gold" : "btn-outline"}`}
                style={{ justifyContent: "flex-start", borderRadius: "999px" }}
              >
                <span>{tab.label}</span>
              </button>
            )
          })}

          <div
            style={{
              display: "flex",
              gap: "8px",
              paddingTop: "10px",
              borderTop: "1px solid #E4E1D7",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenFavorites()
              }}
              className="btn btn-outline"
              style={{ flex: 1, borderRadius: "999px" }}
            >
              <Bookmark size={15} color="#4A593D" />
              <span>Salvos ({favoritesCount})</span>
            </button>

            {tenant.whatsapp && (
              <a
                href={`https://wa.me/55${tenant.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
                style={{
                  flex: 1,
                  textDecoration: "none",
                  borderRadius: "999px",
                }}
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1080px) {
          .editorial-top-ribbon,
          .desktop-pill-nav,
          .desktop-actions-col {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  )
}
