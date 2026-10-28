"use client"

import React, { useState, useRef } from "react"
import { motion } from "motion/react"
import {
  ShieldCheck,
  Building2,
  KeyRound,
  Palmtree,
  Award,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  Plus,
} from "lucide-react"
import { useTenant } from "../../context/TenantContext"
import { TextAnimate } from "@/components/ui/text-animate"
import { Typewriter } from "@/components/ui/typewriter"
import { RollingNumber } from "@/components/ui/rolling-number"
import { OrganicButton } from "@/components/ui/organic-button"
import videoCasaAsset from "../../public/video-casa.mp4"

export type PublicTab =
  | "home"
  | "empresa"
  | "venda"
  | "locacao"
  | "temporada"
  | "contato"

interface VideoPresentationHeroProps {
  totalProperties: number
  totalCities: number
  onNavigateTab: (tab: PublicTab) => void
  onScrollToCatalog: () => void
}

export const VideoPresentationHero: React.FC<VideoPresentationHeroProps> = ({
  totalProperties,
  totalCities,
  onNavigateTab,
  onScrollToCatalog,
}) => {
  const { tenant, settings } = useTenant()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const agencyHighlights = [
    {
      id: "venda" as PublicTab,
      icon: Building2,
      tag: "Patrimônio & Aquisição",
      title: "Imóveis à Venda",
      description:
        "Casas em condomínio, coberturas e residências de alto padrão com assessoria jurídica integral.",
      cta: "Ver Imóveis à Venda",
      surfaceClass: "bg-[#F3F1EB] text-[#1F1F1C] border-[#E4E1D7]",
      mutedClass: "text-[#5F5E58]",
      badgeClass: "bg-[#22221E] text-[#FBFBF9]",
    },
    {
      id: "locacao" as PublicTab,
      icon: KeyRound,
      tag: "Mobilidade & Conforto",
      title: "Locação Anual & Corporativa",
      description:
        "Contratos digitais sem burocracia, laudo de vistoria detalhado e gestão dedicada ao locatário.",
      cta: "Explorar Locações",
      surfaceClass: "bg-[#E8ECE0] text-[#1F1F1C] border-[#D5DEC6]",
      mutedClass: "text-[#444F39]",
      badgeClass: "bg-[#22221E] text-[#FBFBF9]",
    },
    {
      id: "temporada" as PublicTab,
      icon: Palmtree,
      tag: "Lazer & Exclusividade",
      title: "Temporada Alto Padrão",
      description:
        "Propriedades mobiliadas e equipadas para férias, eventos familiares ou estadias executivas.",
      cta: "Ver Temporada",
      surfaceClass: "bg-[#E6EEF2] text-[#1F1F1C] border-[#CEDCE4]",
      mutedClass: "text-[#42525C]",
      badgeClass: "bg-[#22221E] text-[#FBFBF9]",
    },
    {
      id: "empresa" as PublicTab,
      icon: Award,
      tag: "Tradição & Credibilidade",
      title: "Sobre a Imobiliária",
      description:
        "Conheça nossa história, equipe de corretores credenciados no CRECI e compromisso com seu patrimônio.",
      cta: "Conhecer a Empresa",
      surfaceClass: "bg-[#2B2B27] text-[#FBFBF9] border-[#22221E]",
      mutedClass: "text-[#C7C5BC]",
      badgeClass: "bg-[#FBFBF9] text-[#1F1F1C]",
    },
  ]

  return (
    <section className="mb-14">
      {/* 1. CABEÇALHO EDITORIAL CENTRALIZADO ACIMA DO VÍDEO (Estilo Editorial da Imagem) */}
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DCD8CC] bg-[#F3F1EB] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#3E4D32]"
        >
          <ShieldCheck size={14} className="text-[#4A593D]" />
          <span>{tenant.name} • CRECI 30699-J</span>
        </motion.div>

        <h1 className="font-serif text-4xl leading-[1.08] font-medium tracking-[-0.03em] text-[#1F1F1C] sm:text-5xl lg:text-[3.65rem]">
          A curadoria imobiliária que valoriza o seu patrimônio
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#5F5E58] sm:text-lg"
        >
          {settings.aboutText ||
            "Conectamos famílias e investidores aos endereços mais desejados com avaliação técnica precisa, segurança jurídica e agendamento imediato."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <OrganicButton
            href="#pesquisa-imoveis"
            label="Pesquisar Imóveis"
            variantColor="primary"
            size="md"
            onClick={(e) => {
              e.preventDefault()
              onScrollToCatalog()
            }}
          />
          <OrganicButton
            href="#empresa"
            label="Conhecer a Imobiliária"
            variantColor="secondary"
            size="md"
            onClick={(e) => {
              e.preventDefault()
              onNavigateTab("empresa")
            }}
          />
        </motion.div>
      </div>

      {/* 2. CONTAINER DO VÍDEO DE FUNDO COM INFORMAÇÕES ANIMADAS NA FRENTE */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#E2DFD5] bg-[#1F1F1C] shadow-[0_20px_50px_rgba(31,31,28,0.1)]">
        <div className=" pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            src={"/video-casa-2.mp4"}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="h-full w-full scale-105 object-cover opacity-80 transition-transform duration-1000"
          />
          {/* Gradiente editorial suave para leitura nítida das informações sobre o vídeo */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(24, 24, 21, 0.82) 0%, rgba(24, 24, 21, 0.52) 55%, rgba(24, 24, 21, 0.35) 100%)",
            }}
          />
        </div>

        {/* Conteúdo Animado na Frente do Vídeo */}
        <div className="relative z-10 flex min-h-[420px] flex-col justify-between p-7 sm:min-h-[480px] sm:p-11 lg:p-14">
          {/* Topo sobre o vídeo: Selo + Controles de Vídeo */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3.5 py-1.5 text-xs font-medium text-[#FBFBF9] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#98A67C]" />
              <span>Tour Institucional em Vídeo</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#22221E]/80 text-[#FBFBF9] backdrop-blur-md transition-colors hover:bg-[#22221E]"
                title={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#22221E]/80 text-[#FBFBF9] backdrop-blur-md transition-colors hover:bg-[#22221E]"
                title={isMuted ? "Ativar som do vídeo" : "Silenciar vídeo"}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>
          </div>

          {/* Base sobre o vídeo: Headline Animada + Typewriter + Selos */}
          <div className="mt-12 max-w-2xl">
            <h2
              className="font-serif text-2xl leading-tight font-normal text-white sm:text-4xl"
              style={{ color: "#FFFFFF" }}
            >
              <TextAnimate
                text="Arquitetura autoral, condomínios fechados e atendimento consultivo"
                type="calmInUp"
                className="text-white"
                segmentClassName="text-white"
              />
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-white sm:text-base">
              <span style={{ color: "#FBFBF9" }}>Especialistas em</span>
              <span
                className="rounded-md border border-white/25 bg-black/45 px-3 py-1 font-semibold text-white backdrop-blur-md"
                style={{ color: "#FFFFFF" }}
              >
                <Typewriter
                  words={[
                    "Casas de Alto Padrão em Condomínio",
                    "Coberturas Duplex & Vista Panorâmica",
                    "Locação Residencial e Corporativa",
                    "Imóveis de Temporada & Lazer Completo",
                  ]}
                  interval={2800}
                  className="text-white"
                />
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-xs font-medium text-[#E5E2D9]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#98A67C]" />
                Visitas presenciais agendadas online
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-[#98A67C]" />
                Localização exata verificada via mapa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FAIXA EDITORIAL DE MÉTRICAS (Idêntica à seção "$0 fees | Up to 2.25% | $1 million" da imagem) */}
      <div className="mt-10 grid grid-cols-1 gap-8 border-b border-[#E4E1D7] pb-10 sm:grid-cols-3">
        <div>
          <div className="font-serif text-3xl font-medium tracking-tight text-[#1F1F1C] sm:text-4xl">
            +<RollingNumber value={15} /> anos
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#5F5E58]">
            De atuação sólida no mercado imobiliário com avaliação patrimonial precisa e atendimento transparente.
          </p>
        </div>

        <div>
          <div className="font-serif text-3xl font-medium tracking-tight text-[#1F1F1C] sm:text-4xl">
            <RollingNumber value={Math.max(totalProperties, 12)} />+ imóveis
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#5F5E58]">
            Disponíveis no portfólio selecionado em {Math.max(totalCities, 4)} regiões nobres para compra, locação ou temporada.
          </p>
        </div>

        <div>
          <div className="font-serif text-3xl font-medium tracking-tight text-[#1F1F1C] sm:text-4xl">
            <RollingNumber value={100} />% auditado
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#5F5E58]">
            Todas as certidões, matrículas e contratos passam por auditoria jurídica completa antes da assinatura.
          </p>
        </div>
      </div>

      {/* 4. SEÇÃO EDITORIAL DE PILARES (Inspirada em "Every feature you need..." da imagem de referência) */}
      <div className="mt-12">
        <div className="mb-7 max-w-xl">
          <h2 className="font-serif text-3xl leading-[1.12] font-medium tracking-[-0.025em] text-[#1F1F1C] sm:text-4xl">
            Tudo o que você precisa em uma consultoria imobiliária completa
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {agencyHighlights.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 * idx }}
                onClick={() => onNavigateTab(item.id)}
                className={`group flex min-h-[240px] cursor-pointer flex-col justify-between rounded-[22px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(31,31,28,0.08)] ${item.surfaceClass}`}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-75">
                      {item.tag}
                    </span>
                    <IconComponent size={18} className="opacity-80" />
                  </div>

                  <h3
                    className="font-serif text-2xl leading-snug font-medium"
                    style={{ color: "inherit" }}
                  >
                    {item.title}
                  </h3>

                  <p className={`mt-2.5 text-xs leading-relaxed ${item.mutedClass}`}>
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold">{item.cta}</span>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110 ${item.badgeClass}`}
                  >
                    <Plus size={14} />
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
