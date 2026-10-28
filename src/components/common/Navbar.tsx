"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import {
  Home,
  Menu,
  X,
  MessageCircle,
  ArrowLeft,
  Mail,
  Phone,
  Star,
  Share2,
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
  { id: "home", label: "INÍCIO" },
  { id: "empresa", label: "EMPRESA" },
  { id: "venda", label: "VENDA" },
  { id: "locacao", label: "LOCAÇÃO" },
  { id: "temporada", label: "TEMPORADA" },
  { id: "contato", label: "CONTATO" },
]

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeTab,
  onSelectTab,
  onNavigate,
  onOpenFavorites,
}) => {
  const { tenant, settings } = useTenant()
  const { favoritesCount } = useFavorites()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const brandWords = (tenant.name || "Aura Consultoria Imobiliária").split(" ")
  const brandSub = brandWords[0]?.toUpperCase() || "AURA"

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
        background: "rgba(251, 251, 249, 0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #E4E1D7",
        boxShadow: "0 4px 20px rgba(31, 31, 28, 0.04)",
      }}
    >
      {/* 1ª FAIXA SUPERIOR: E-mail à esquerda | Logo Editorial + CRECI ao centro | Bloco de Telefone Charcoal à direita */}
      <div
        style={{
          borderBottom: "1px solid #EAE7DF",
          background: "#FBFBF9",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "78px",
            gap: "16px",
          }}
        >
          {/* Esquerda: E-mail de Contato */}
          <div className="top-email-col" style={{ flex: 1 }}>
            <a
              href={`mailto:${tenant.email || "contato@auraimoveis.com.br"}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#5F5E58",
                fontSize: "0.84rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
            >
              <Mail size={15} color="#4A593D" />
              <span>{tenant.email || "contato@auraimoveis.com.br"}</span>
            </a>
          </div>

          {/* Centro: Emblema IMOBILIÁRIA + Nome + CRECI (Tipografia Editorial) */}
          <div
            onClick={() => handleTabClick("home")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              cursor: "pointer",
              userSelect: "none",
              padding: "8px 0",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                border: "1.5px solid #22221E",
                background: "#F3F1EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Home size={23} color="#22221E" strokeWidth={2} />
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.55rem",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "#1F1F1C",
                  lineHeight: 1,
                }}
              >
                Imobiliária {brandSub.charAt(0) + brandSub.slice(1).toLowerCase()}
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "#5F5E58",
                  marginTop: "3px",
                  textTransform: "uppercase",
                }}
              >
                CRECI 30699-J • Consultoria Exclusiva
              </div>
            </div>
          </div>

          {/* Direita: Bloco de Telefone Destacado com Ícone Flutuante */}
          <div
            className="top-phone-col"
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <a
              href={`https://wa.me/55${(tenant.whatsapp || tenant.phone).replace(
                /\D/g,
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                background: "#22221E",
                borderRadius: "999px",
                padding: "10px 22px 10px 30px",
                color: "#FBFBF9",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(34, 34, 30, 0.14)",
                marginLeft: "18px",
              }}
              title="Atendimento por Telefone e WhatsApp"
            >
              {/* Ícone Destacado na Borda Esquerda */}
              <span
                style={{
                  position: "absolute",
                  left: "-12px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "999px",
                  background: "#98A67C",
                  color: "#1F1F1C",
                  border: "2px solid #FBFBF9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(31, 31, 28, 0.15)",
                }}
              >
                <Phone size={15} strokeWidth={2.4} />
              </span>

              <span
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  color: "#FBFBF9",
                }}
              >
                {tenant.phone || "(11) 3456-7890"}
              </span>
            </a>
          </div>

          {/* Botão Menu Mobile */}
          <div className="mobile-menu-toggle" style={{ display: "none" }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost"
              style={{ padding: "8px" }}
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 2ª FAIXA INFERIOR: Barra de Abas (INÍCIO | EMPRESA | VENDA | LOCAÇÃO | TEMPORADA | CONTATO) + Favoritos & Redes */}
      <div
        className="desktop-tabs-bar"
        style={{
          background: "#FFFFFF",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "48px",
          }}
        >
          {/* Abas de Navegação */}
          <nav
            aria-label="Navegação Principal"
            style={{
              display: "flex",
              alignItems: "stretch",
              height: "48px",
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
                    padding: "0 22px",
                    height: "48px",
                    border: "none",
                    background: "transparent",
                    color: isActive ? "#FBFBF9" : "#5F5E58",
                    fontSize: "0.76rem",
                    fontWeight: isActive ? 700 : 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavbarTabBlock"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "#22221E",
                        zIndex: -1,
                      }}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Ações à Direita (Ícones Sociais + Favoritos ★ + Voltar se Admin) */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <a
              href={settings.socialLinks?.instagram || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              title="Redes Sociais da Imobiliária"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "6px",
                background: "#22221E",
                color: "#FBFBF9",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              <Share2 size={14} />
            </a>

            <button
              type="button"
              onClick={onOpenFavorites}
              title="Imóveis Favoritos Salvos"
              style={{
                position: "relative",
                width: "34px",
                height: "34px",
                borderRadius: "6px",
                background: favoritesCount > 0 ? "#98A67C" : "#22221E",
                border: "none",
                color: favoritesCount > 0 ? "#1F1F1C" : "#FBFBF9",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Star
                size={15}
                fill={favoritesCount > 0 ? "#1F1F1C" : "currentColor"}
              />
              {favoritesCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "#22221E",
                    color: "#FBFBF9",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    width: "16px",
                    height: "16px",
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {favoritesCount}
                </span>
              )}
            </button>

            {currentView === "admin" && (
              <button
                type="button"
                onClick={() => onNavigate("catalog")}
                className="btn btn-gold btn-sm"
                style={{ fontSize: "0.75rem", marginLeft: "6px" }}
              >
                <ArrowLeft size={14} />
                <span>Voltar ao Site</span>
              </button>
            )}
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
                style={{ justifyContent: "flex-start" }}
              >
                <span>{tab.label}</span>
              </button>
            )
          })}

          <div
            style={{
              display: "flex",
              gap: "8px",
              paddingTop: "8px",
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
              style={{ flex: 1 }}
            >
              <Star size={16} color="#4A593D" />
              <span>Favoritos ({favoritesCount})</span>
            </button>

            {tenant.whatsapp && (
              <a
                href={`https://wa.me/55${tenant.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ flex: 1, color: "#1E5631", textDecoration: "none" }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .top-email-col, .top-phone-col, .desktop-tabs-bar {
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
