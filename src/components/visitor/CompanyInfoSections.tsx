"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import {
  ShieldCheck,
  Award,
  Users,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Building2,
  Scale,
  Compass,
  Handshake,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import { useTenant } from "../../context/TenantContext"
import { StorageService } from "../../services/storageService"
import { LeadService } from "../../services/leadService"
import { formatPhoneNumber } from "../../utils/formatters"
import { RollingNumber } from "@/components/ui/rolling-number"
import { OrganicButton } from "@/components/ui/organic-button"
import { PublicTab } from "./VideoPresentationHero"
import videoCasaAsset from "../../public/video-casa.mp4"

interface EmpresaViewProps {
  totalProperties: number
  onNavigateTab: (tab: PublicTab) => void
}

export const EmpresaView: React.FC<EmpresaViewProps> = ({
  totalProperties,
  onNavigateTab,
}) => {
  const { tenant, settings } = useTenant()
  const agents = StorageService.getAgents().filter((a) => a.isActive !== false)

  const differentials = [
    {
      icon: Scale,
      title: "Segurança & Assessoria Jurídica",
      desc: "Análise completa de certidões, matrícula, histórico fiscal e elaboração de contratos blindados para compra, venda e locação.",
    },
    {
      icon: Compass,
      title: "Curadoria de Alto Padrão",
      desc: "Seleção criteriosa de casas em condomínio, coberturas e imóveis comerciais nas localizações mais valorizadas.",
    },
    {
      icon: Handshake,
      title: "Atendimento Consultivo & Discreto",
      desc: "Acompanhamento individualizado desde a primeira visita presencial até a entrega das chaves e registro em cartório.",
    },
    {
      icon: Clock,
      title: "Agendamento Online em Tempo Real",
      desc: "Escolha o dia e horário disponíveis diretamente na página do imóvel com confirmação imediata pelo corretor responsável.",
    },
  ]

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Cabeçalho Editorial + Banner com Vídeo */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DCD8CC] bg-[#F3F1EB] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#3E4D32]">
          <Sparkles size={14} className="text-[#4A593D]" />
          <span>Quem Somos • {tenant.documentNumber || "CRECI 30699-J"}</span>
        </div>

        <h1 className="font-serif text-4xl leading-[1.08] font-medium tracking-[-0.03em] text-[#1F1F1C] sm:text-5xl">
          Tradição, ética e excelência em negócios imobiliários
        </h1>

        <p className="mt-4 text-base leading-relaxed text-[#5F5E58] sm:text-lg">
          {settings.aboutText ||
            "Nossa imobiliária nasceu com o propósito de transformar a experiência de comprar, vender e alugar imóveis, unindo atendimento humano, transparência jurídica e tecnologia moderna."}
        </p>
      </div>

      {/* Vídeo Institucional em Moldura Editorial */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[28px] border border-[#E2DFD5] bg-[#1F1F1C] shadow-[0_20px_50px_rgba(31,31,28,0.1)]"
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <video
            src={videoCasaAsset || "/video-casa.mp4"}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-75"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(24, 24, 21, 0.85) 0%, rgba(24, 24, 21, 0.55) 60%, rgba(24, 24, 21, 0.35) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 p-8 sm:p-12 lg:p-16">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-[#98A67C] px-3.5 py-1 text-xs font-bold tracking-wider text-[#1F1F1C] uppercase">
              Nossa Sede & Curadoria
            </span>
            <h2
              className="font-serif mt-4 text-3xl leading-tight font-normal text-white sm:text-4xl"
              style={{ color: "#FFFFFF" }}
            >
              {tenant.name}: compromisso real com o seu patrimônio
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base"
              style={{ color: "#F3F1EB" }}
            >
              Trabalhamos com avaliação mercadológica criteriosa, fotografia profissional e acompanhamento jurídico em todas as etapas.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <OrganicButton
                href="#venda"
                label="Ver Imóveis à Venda"
                variantColor="secondary"
                size="md"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigateTab("venda")
                }}
              />
              <OrganicButton
                href="#contato"
                label="Falar com a Diretoria"
                variantColor="primary"
                size="md"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigateTab("contato")
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Indicadores Editoriais em Grande Escala */}
      <div className="grid grid-cols-2 gap-6 border-y border-[#E4E1D7] py-10 lg:grid-cols-4">
        {[
          {
            value: 15,
            prefix: "+",
            suffix: " anos",
            label: "Experiência consolidada no mercado imobiliário",
          },
          {
            value: Math.max(totalProperties, 12),
            prefix: "",
            suffix: "+",
            label: "Propriedades selecionadas no portfólio",
          },
          {
            value: 98,
            prefix: "",
            suffix: "%",
            label: "Índice de satisfação de proprietários e compradores",
          },
          {
            value: 100,
            prefix: "",
            suffix: "%",
            label: "Segurança documental e laudos verificados",
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
          >
            <div className="font-serif text-3xl font-medium tracking-tight text-[#1F1F1C] sm:text-4xl">
              {stat.prefix}
              <RollingNumber value={stat.value} />
              {stat.suffix}
            </div>
            <div className="mt-2 text-xs leading-relaxed text-[#5F5E58] sm:text-sm">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Missão, Visão e Valores (Paleta Editorial Sálvia, Creme e Carvão) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            badge: "Nossa Missão",
            title: "Conectar pessoas ao imóvel ideal com segurança máxima",
            text: "Proporcionar soluções imobiliárias completas em compra, venda, locação e temporada, garantindo tranquilidade jurídica e valorização patrimonial para cada cliente.",
            surface: "bg-[#F3F1EB] text-[#1F1F1C] border-[#E4E1D7]",
            muted: "text-[#5F5E58]",
          },
          {
            badge: "Nossa Visão",
            title: "Ser referência em credibilidade e inovação no setor",
            text: "Liderar o mercado regional de imóveis residenciais e comerciais por meio de uma curadoria rigorosa, transparência nas negociações e agendamento digital ágil.",
            surface: "bg-[#E8ECE0] text-[#1F1F1C] border-[#D5DEC6]",
            muted: "text-[#444F39]",
          },
          {
            badge: "Nossos Valores",
            title: "Ética, transparência, agilidade e respeito ao patrimônio",
            text: "Atuamos com verdade em cada avaliação mercadológica, sigilo nas tratativas financeiras e dedicação integral do primeiro contato ao pós-venda.",
            surface: "bg-[#2B2B27] text-[#FBFBF9] border-[#22221E]",
            muted: "text-[#C7C5BC]",
          },
        ].map((card, i) => (
          <motion.div
            key={card.badge}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 * i }}
            className={`rounded-[24px] border p-7 ${card.surface}`}
          >
            <div className="mb-3 inline-block rounded-full border border-current/20 px-3 py-1 text-[11px] font-bold tracking-wider uppercase opacity-80">
              {card.badge}
            </div>
            <h3
              className="font-serif mb-3 text-2xl leading-snug font-medium"
              style={{ color: "inherit" }}
            >
              {card.title}
            </h3>
            <p className={`text-sm leading-relaxed ${card.muted}`}>{card.text}</p>
          </motion.div>
        ))}
      </div>

      {/* 4. Tabela Editorial Comparativa (Inspirada em "How we measure up..." da imagem) */}
      <div className="rounded-[28px] border border-[#E4E1D7] bg-white p-7 sm:p-11">
        <div className="mb-8 max-w-xl">
          <h2 className="font-serif text-3xl leading-tight font-medium tracking-[-0.025em] text-[#1F1F1C] sm:text-4xl">
            Por que negociar com a {tenant.name}
          </h2>
          <p className="mt-2 text-sm text-[#5F5E58]">
            Compare nossa estrutura consultiva com o modelo tradicional de intermediação.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E4E1D7]">
                <th className="py-4 pr-4 font-semibold text-[#5F5E58]">Serviço / Garantia</th>
                <th className="rounded-t-2xl bg-[#F3F1EB] px-6 py-4 font-serif text-lg font-medium text-[#1F1F1C]">
                  {tenant.name}
                </th>
                <th className="px-6 py-4 font-semibold text-[#5F5E58]">
                  Mercado Tradicional
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DF]">
              {[
                {
                  feature: "Auditoria Jurídica de Certidões",
                  ours: "100% inclusa antes da proposta",
                  traditional: "Apenas após sinal de negócio",
                },
                {
                  feature: "Agendamento de Visitas",
                  ours: "Online em tempo real na página",
                  traditional: "Espera de retorno telefônico",
                },
                {
                  feature: "Localização do Imóvel",
                  ours: "Geolocalização revisada no mapa",
                  traditional: "Apenas bairro aproximado",
                },
                {
                  feature: "Vistoria de Locação & Temporada",
                  ours: "Laudo fotográfico digital detalhado",
                  traditional: "Checklist simples em papel",
                },
              ].map((row) => (
                <tr key={row.feature}>
                  <td className="py-4 pr-4 font-medium text-[#1F1F1C]">{row.feature}</td>
                  <td className="bg-[#F3F1EB] px-6 py-4 font-semibold text-[#3E4D32]">
                    {row.ours}
                  </td>
                  <td className="px-6 py-4 text-[#78766F]">{row.traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Diferenciais da Imobiliária */}
      <div>
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-medium tracking-[-0.025em] text-[#1F1F1C] sm:text-4xl">
            Diferenciais do nosso atendimento
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {differentials.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex gap-4 rounded-[22px] border border-[#E4E1D7] bg-white p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8ECE0] text-[#3E4D32]">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#1F1F1C]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5F5E58]">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 6. Equipe de Corretores Credenciados */}
      <div>
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-medium tracking-[-0.025em] text-[#1F1F1C] sm:text-4xl">
            Nossos consultores imobiliários
          </h2>
          <p className="mt-2 text-sm text-[#5F5E58]">
            Profissionais credenciados prontos para atender você de forma personalizada.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex flex-col justify-between rounded-[24px] border border-[#E4E1D7] bg-white p-6 transition-shadow hover:shadow-[0_12px_30px_rgba(31,31,28,0.07)]"
            >
              <div>
                <div className="flex items-center gap-4">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="h-16 w-16 rounded-full border border-[#E4E1D7] object-cover"
                  />
                  <div>
                    <h3 className="font-serif text-xl font-medium text-[#1F1F1C]">
                      {agent.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#4A593D]">{agent.role}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#5F5E58]">
                      <CheckCircle2 size={12} className="text-[#2E6F40]" />
                      Consultor Credenciado
                    </span>
                  </div>
                </div>

                {agent.bio && (
                  <p className="mt-4 text-xs leading-relaxed text-[#5F5E58]">
                    {agent.bio}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2 border-t border-[#EAE7DF] pt-4 text-xs text-[#5F5E58]">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-[#4A593D]" />
                  <span>{agent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-[#4A593D]" />
                  <span className="truncate">{agent.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const ContatoView: React.FC = () => {
  const { tenant, settings } = useTenant()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("Quero Comprar um Imóvel")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return

    setSubmitting(true)
    try {
      await LeadService.submitGeneralContact({
        tenantId: tenant.id,
        name: name.trim(),
        email: email.trim() || "nao-informado@cliente.com",
        phone: phone.trim(),
        message: `[Assunto: ${subject}] ${message.trim()}`,
      })
      setSubmitted(true)
      setName("")
      setEmail("")
      setPhone("")
      setMessage("")
    } finally {
      setSubmitting(false)
    }
  }

  const fullAddress = `${tenant.address.street}, ${tenant.address.number}, ${tenant.address.neighborhood}, ${tenant.address.city} - ${tenant.address.state}`

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${tenant.address.street}, ${tenant.address.number}, ${tenant.address.city}, ${tenant.address.state}, Brasil`
  )}&t=m&z=15&output=embed&iwloc=near`

  return (
    <div className="space-y-12 pb-12">
      {/* Cabeçalho da Aba Contato */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DCD8CC] bg-[#F3F1EB] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#3E4D32]">
          <Phone size={13} className="text-[#4A593D]" />
          <span>Central de Atendimento & Consultoria</span>
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] text-[#1F1F1C] sm:text-5xl">
          Fale com a {tenant.name}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#5F5E58]">
          Deseja agendar uma visita, anunciar seu imóvel conosco ou solicitar uma avaliação patrimonial? Nossa equipe está pronta para atender você.
        </p>
      </div>

      {/* Grid Principal: Canais Diretos + Formulário */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Coluna Esquerda: Cartões de Contato e Endereço */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-[24px] border border-[#E4E1D7] bg-[#F3F1EB] p-6">
            <h3 className="font-serif mb-4 text-2xl font-medium text-[#1F1F1C]">
              Canais diretos
            </h3>

            <div className="space-y-3.5">
              <a
                href={`tel:${tenant.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-4 rounded-2xl border border-[#E4E1D7] bg-white p-4 text-[#1F1F1C] no-underline transition-transform hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#22221E] text-[#FBFBF9]">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-wider text-[#5F5E58] uppercase">
                    Telefone Fixo / PABX
                  </div>
                  <div className="text-base font-bold text-[#1F1F1C]">
                    {tenant.phone}
                  </div>
                </div>
              </a>

              {tenant.whatsapp && (
                <a
                  href={`https://wa.me/55${tenant.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-[#CFD8C0] bg-[#E8ECE0] p-4 text-[#1F1F1C] no-underline transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4A593D] text-[#FBFBF9]">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider text-[#3E4D32] uppercase">
                      Atendimento Imediato WhatsApp
                    </div>
                    <div className="text-base font-bold text-[#1F1F1C]">
                      {tenant.whatsapp}
                    </div>
                  </div>
                </a>
              )}

              <a
                href={`mailto:${tenant.email}`}
                className="flex items-center gap-4 rounded-2xl border border-[#E4E1D7] bg-white p-4 text-[#1F1F1C] no-underline transition-transform hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3F1EB] text-[#1F1F1C]">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold tracking-wider text-[#5F5E58] uppercase">
                    E-mail Corporativo
                  </div>
                  <div className="truncate text-sm font-semibold text-[#1F1F1C]">
                    {tenant.email}
                  </div>
                </div>
              </a>
            </div>

            {/* Endereço Físico e Horário */}
            <div className="mt-6 space-y-3 border-t border-[#DFDCD2] pt-5 text-xs text-[#5F5E58]">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#4A593D]" />
                <div>
                  <strong className="block text-[#1F1F1C]">Endereço da Sede:</strong>
                  <span>{fullAddress}</span>
                  <span className="block text-[11px] text-[#85837B]">
                    CEP: {tenant.address.zipCode}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-[#4A593D]" />
                <div>
                  <strong className="block text-[#1F1F1C]">Horário de Atendimento:</strong>
                  <span>
                    Segunda a Sexta das 08h30 às 18h30 • Sábados das 09h às 13h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Formulário de Contato / Anuncie seu Imóvel */}
        <div className="rounded-[24px] border border-[#E4E1D7] bg-white p-7 sm:p-9 lg:col-span-7">
          <h3 className="font-serif text-2xl font-medium text-[#1F1F1C]">
            Envie uma mensagem para nossa equipe
          </h3>
          <p className="mt-1 mb-6 text-xs text-[#5F5E58]">
            Preencha os dados abaixo e um corretor especialista entrará em contato rapidamente.
          </p>

          {submitted ? (
            <div className="rounded-2xl border border-[#C8E6C9] bg-[#E8F5E9] p-6 text-center">
              <CheckCircle2 size={36} className="mx-auto mb-3 text-[#2E6F40]" />
              <h4 className="font-serif text-xl font-medium text-[#1F1F1C]">
                Mensagem recebida com sucesso!
              </h4>
              <p className="mt-1 text-sm text-[#3E4D32]">
                Nossa equipe comercial já recebeu sua solicitação e retornará o contato em breve.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn btn-gold btn-sm mt-4"
              >
                Enviar Nova Mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ex: Carlos Eduardo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Assunto</label>
                  <select
                    className="form-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="Quero Comprar um Imóvel">
                      Quero Comprar um Imóvel
                    </option>
                    <option value="Quero Alugar um Imóvel">
                      Quero Alugar um Imóvel
                    </option>
                    <option value="Interesse em Temporada">
                      Interesse em Temporada
                    </option>
                    <option value="Quero Anunciar / Vender Meu Imóvel">
                      Quero Anunciar / Vender Meu Imóvel
                    </option>
                    <option value="Avaliação Patrimonial / Jurídico">
                      Avaliação Patrimonial / Jurídico
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mensagem / Detalhes</label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  placeholder="Conte-nos o que você procura ou informe os dados do imóvel que deseja anunciar..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-gold w-full justify-center py-3"
              >
                <Send size={16} />
                <span>
                  {submitting
                    ? "Enviando Solicitação..."
                    : "Enviar Mensagem para a Imobiliária"}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Mapa da Sede da Imobiliária */}
      <div className="overflow-hidden rounded-[24px] border border-[#E4E1D7] bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1F1F1C]">
            <MapPin size={16} className="text-[#4A593D]" />
            <span>Localização da Nossa Sede — {fullAddress}</span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              fullAddress
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4A593D] hover:underline"
          >
            <span>Abrir no Google Maps</span>
            <ExternalLink size={12} />
          </a>
        </div>
        <div className="h-72 w-full overflow-hidden rounded-xl border border-[#E4E1D7]">
          <iframe
            title="Mapa da Sede da Imobiliária"
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  )
}
