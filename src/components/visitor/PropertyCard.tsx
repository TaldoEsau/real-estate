"use client"

import React, { useState, useMemo } from "react"
import { motion } from "motion/react"
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Car,
  Eye,
  ArrowUpRight,
  Star,
} from "lucide-react"
import { Property } from "../../types"
import { formatCurrency, formatAreaM2 } from "../../utils/formatters"
import { useFavorites } from "../../context/FavoritesContext"
import {
  CutoutCard,
  CutoutCardAction,
  CutoutCardContent,
  CutoutCardFooter,
  CutoutCardImage,
  CutoutCardInsetLabel,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCardPin,
  cutoutCardSurfaceClassName,
  CutoutCorner,
  useCutoutContentStaggerVariants,
} from "@/components/ui/cutout-card"
import { IntroDisclosure, type Step } from "@/components/ui/intro-disclosure"

interface PropertyCardProps {
  property: Property
  onSelect: (property: Property) => void
  onBookViewing?: (property: Property) => void
}

const typeLabels: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  villa: "Casa em Condomínio",
  penthouse: "Cobertura",
  townhouse: "Casa de Vila",
  commercial: "Comercial",
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
}) => {
  const stagger = useCutoutContentStaggerVariants()
  const [previewOpen, setPreviewOpen] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(property.id)

  const areaDisplay = property.specs.areaSqM
    ? formatAreaM2(property.specs.areaSqM)
    : formatAreaM2(Math.round(property.specs.areaSqFt / 10.764))

  const pinLabel =
    property.listingType === "for_rent"
      ? "Locação"
      : property.listingType === "both"
      ? "Venda & Aluguel"
      : "Venda"

  const insetLabelText = `${
    typeLabels[property.propertyType] || property.propertyType
  }${property.code ? ` • ${property.code}` : ""}`

  const mainPriceText =
    property.listingType === "for_rent" && property.rentalPrice
      ? `${formatCurrency(property.rentalPrice)}/mês`
      : formatCurrency(property.price)

  // Passos do IntroDisclosure para o preview completo do imóvel sem sair da tela inicial
  const previewSteps: Step[] = useMemo(() => {
    const gallery =
      property.gallery && property.gallery.length > 0
        ? property.gallery
        : [property.featuredImage]

    const img1 = property.featuredImage || gallery[0]
    const img2 = gallery[1] || img1
    const img3 = gallery[2] || img1
    const img4 = gallery[3] || img2

    const locationFull = [
      property.location.address,
      property.location.neighborhood,
      `${property.location.city} - ${property.location.state}`,
    ]
      .filter(Boolean)
      .join(", ")

    const feesInfo = [
      property.condoFee ? `Condomínio: ${formatCurrency(property.condoFee)}` : null,
      property.iptuFee ? `IPTU: ${formatCurrency(property.iptuFee)}` : null,
    ]
      .filter(Boolean)
      .join(" • ")

    return [
      {
        title: "1. Visão Geral & Valor",
        short_description: `${pinLabel} — ${mainPriceText}`,
        full_description: `${property.description}${
          feesInfo ? ` (${feesInfo})` : ""
        }`,
        media: {
          type: "image",
          src: img1,
          alt: property.title,
        },
        action: {
          label: "Abrir Página Completa do Imóvel",
          onClick: () => {
            setPreviewOpen(false)
            onSelect(property)
          },
        },
      },
      {
        title: "2. Planta & Especificações",
        short_description: `${property.specs.bedrooms} quartos • ${areaDisplay} • ${
          property.specs.garageSpaces || 0
        } vagas`,
        full_description: `Configuração completa: ${
          property.specs.bedrooms
        } dormitórios (${property.specs.suites || 0} suítes), ${
          property.specs.bathrooms
        } banheiros, ${
          property.specs.garageSpaces || 0
        } vagas de garagem e área útil de ${areaDisplay}.`,
        media: {
          type: "image",
          src: img2,
          alt: `${property.title} - Ambientes`,
        },
        action: {
          label: "Ver Ficha Técnica Completa",
          onClick: () => {
            setPreviewOpen(false)
            onSelect(property)
          },
        },
      },
      {
        title: "3. Lazer & Localização",
        short_description: `${
          property.location.neighborhood || property.location.city
        } (${property.amenities.length} comodidades)`,
        full_description: `Localizado em ${locationFull}. Diferenciais inclusos: ${
          property.amenities.length > 0
            ? property.amenities.join(", ")
            : "Acabamento de alto padrão e segurança 24h"
        }.`,
        media: {
          type: "image",
          src: img3,
          alt: `${property.title} - Lazer e Condomínio`,
        },
      },
      {
        title: "4. Agendamento de Visita",
        short_description: "Agende sua visita presencial online",
        full_description:
          "Gostou deste imóvel? Acesse a página completa para escolher o dia e horário disponíveis na agenda do corretor credenciado.",
        media: {
          type: "image",
          src: img4,
          alt: `${property.title} - Visita`,
        },
        action: {
          label: "Agendar Visita Presencial Agora",
          onClick: () => {
            setPreviewOpen(false)
            onSelect(property)
          },
        },
      },
    ]
  }, [property, pinLabel, mainPriceText, areaDisplay, onSelect])

  return (
    <>
      <div className="flex h-full w-full items-stretch justify-center">
        <div className="relative flex h-full w-full flex-col">
          <CutoutCard
            className={cutoutCardSurfaceClassName}
            onClick={() => onSelect(property)}
          >
            <CutoutCardMedia className="h-72 shrink-0">
              <CutoutCardImage
                alt={property.title}
                sizes="(max-width: 768px) 100vw, 448px"
                src={property.featuredImage}
              />
              <CutoutCardOverlay />

              {/* Botão Favoritar Imóvel (Topo Esquerdo) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(property.id)
                }}
                title={favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
                className="absolute top-3 left-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-[#22221E]/75 text-white backdrop-blur-md transition-transform hover:scale-105"
              >
                <Star
                  size={16}
                  className={favorited ? "text-[#D4E0B8]" : "text-white"}
                  fill={favorited ? "#D4E0B8" : "none"}
                />
              </button>

              {/* Inset Label Inferior Esquerdo com CutoutCorner (Cult UI) */}
              <CutoutCardInsetLabel className="bg-card bottom-0 left-0 z-10 rounded-tr-[20px] px-5 py-3">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                  {insetLabelText}
                </span>
                <CutoutCorner className="text-card pointer-events-none absolute -right-[31px] -bottom-px rotate-90" />
                <CutoutCorner className="text-card pointer-events-none absolute -top-[31px] -left-px rotate-90" />
              </CutoutCardInsetLabel>

              {/* Pin Superior Direito com CutoutCorner (Cult UI) */}
              <CutoutCardPin className="bg-primary text-primary-foreground shadow-foreground/10 ring-border/30 top-0 right-0 z-10 rounded-bl-[16px] px-4 py-2 text-sm font-semibold shadow-md ring-1">
                {pinLabel}
                <CutoutCorner
                  className="text-primary pointer-events-none absolute top-0 -left-[23px] -rotate-90"
                  size={24}
                />
                <CutoutCorner
                  className="text-primary pointer-events-none absolute right-0 -bottom-[23px] -rotate-90"
                  size={24}
                />
              </CutoutCardPin>

              {/* Botão Flutuante no Hover posicionado na área da foto para não cobrir o Preview */}
              <CutoutCardAction className="right-4 bottom-3 z-20">
                <button
                  className="bg-primary text-primary-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-lg transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(property)
                  }}
                >
                  <span>Ver Imóvel</span>
                  <ArrowUpRight size={14} />
                </button>
              </CutoutCardAction>
            </CutoutCardMedia>

            <CutoutCardContent className="flex flex-1 flex-col justify-between">
              <motion.div
                animate="show"
                className="flex flex-1 flex-col justify-between"
                initial="hidden"
                variants={stagger.container}
              >
                <div>
                  {/* Localização */}
                  <motion.div
                    variants={stagger.item}
                    className="mb-1.5 flex items-center gap-1.5 truncate text-xs font-semibold text-[#4A593D]"
                  >
                    <MapPin size={13} className="shrink-0" />
                    <span className="truncate">
                      {property.location.neighborhood
                        ? `${property.location.neighborhood}, `
                        : ""}
                      {property.location.city} - {property.location.state}
                    </span>
                  </motion.div>

                  {/* Título da Casa / Imóvel com altura padronizada (2 linhas) */}
                  <motion.h2
                    className="text-card-foreground font-serif mb-2 line-clamp-2 min-h-[3.3rem] text-[1.35rem] leading-snug font-medium tracking-[-0.02em] text-balance"
                    variants={stagger.item}
                  >
                    {property.title}
                  </motion.h2>

                  {/* Descrição Curta com altura padronizada (2 linhas) */}
                  <motion.p
                    className="text-muted-foreground mb-4 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-pretty"
                    variants={stagger.item}
                  >
                    {property.description ||
                      "Propriedade selecionada com acabamento de alto padrão e agendamento imediato."}
                  </motion.p>
                </div>

                <div className="mt-auto">
                  {/* Especificações Rápidas */}
                  <motion.div
                    variants={stagger.item}
                    className="text-muted-foreground border-border/80 mb-4 grid grid-cols-4 gap-2 border-t pt-3 text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <Bed size={14} className="shrink-0 text-[#4A593D]" />
                      <span className="truncate">{property.specs.bedrooms} Qts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath size={14} className="shrink-0 text-[#4A593D]" />
                      <span className="truncate">{property.specs.bathrooms} Ban</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Car size={14} className="shrink-0 text-[#4A593D]" />
                      <span className="truncate">{property.specs.garageSpaces || 0} Vag</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize2 size={14} className="shrink-0 text-[#4A593D]" />
                      <span className="truncate">{areaDisplay}</span>
                    </div>
                  </motion.div>

                  {/* Rodapé com Preço e Botão de Preview (sem sobreposição) */}
                  <motion.div variants={stagger.item}>
                    <CutoutCardFooter className="border-border/80 border-t pt-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                          Valor do Imóvel
                        </span>
                        <span className="text-card-foreground font-serif text-xl font-medium tracking-tight">
                          {mainPriceText}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewOpen(true)
                        }}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D8D4C8] bg-[#F3F1EB] px-4 py-2 text-xs font-semibold text-[#1F1F1C] transition-colors hover:border-[#22221E] hover:bg-[#22221E] hover:text-[#FBFBF9]"
                      >
                        <Eye size={14} />
                        <span>Prévia</span>
                      </button>
                    </CutoutCardFooter>
                  </motion.div>
                </div>
              </motion.div>
            </CutoutCardContent>
          </CutoutCard>
        </div>
      </div>

      {/* Cult UI IntroDisclosure — Preview interativo da casa sem sair da página inicial */}
      <IntroDisclosure
        open={previewOpen}
        setOpen={setPreviewOpen}
        steps={previewSteps}
        featureId={`property-preview-${property.id}`}
        title={`${property.title} — ${mainPriceText}`}
        showProgressBar={true}
      />
    </>
  )
}
