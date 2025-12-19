/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { QAItem, QACategory } from '@/lib/types'
import { QAItemCard } from './QAItemCard'
import { 
    LayoutGrid, 
    List, 
    AlertCircle, 
    Clock, 
    CheckCircle2, 
    Globe, 
    Image as ImageIcon, 
    X,
    Filter
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Importe o componente da Sheet
import { QAItemDetailSheet } from './QAItemDetailSheet'

interface TeamTabContentProps {
  teamId: string
  categories: QACategory[]
  items: QAItem[]
  projectId: string
}

export default function TeamTabContent({ teamId, categories, items, projectId }: TeamTabContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<string | 'all'>('all') // Novo Estado
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  // --- Filtros ---
  const categoriesForTeam = useMemo(() => {
    return (categories || []).filter((c) => (c.team_id || 'unassigned') === teamId)
  }, [categories, teamId])

  const itemsForTeam = useMemo(() => {
    const categoryIdsForTeam = new Set((categoriesForTeam || []).map(c => c.id))
    return (items || []).filter((i) => {
      if (i.team_id) return i.team_id === teamId
      return categoryIdsForTeam.has(i.category_id)
    })
  }, [items, teamId, categoriesForTeam])

  // Lógica de Filtragem Atualizada (Categoria AND Status)
  const filteredItems = useMemo(() => {
    return itemsForTeam.filter((i) => {
        const matchCategory = selectedCategory === 'all' || i.category_id === selectedCategory
        const matchStatus = selectedStatus === 'all' || i.status === selectedStatus
        return matchCategory && matchStatus
    })
  }, [itemsForTeam, selectedCategory, selectedStatus])

  // --- Helpers ---
  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'aberto': return <AlertCircle className="h-4 w-4 text-red-500" />
        case 'em_correcao': return <Clock className="h-4 w-4 text-yellow-500" />
        case 'em_homologacao': return <Clock className="h-4 w-4 text-blue-500" />
        case 'finalizado': return <CheckCircle2 className="h-4 w-4 text-green-500" />
        default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'alta': return 'bg-[#7900E5]/10 text-[#7900E5] border-[#7900E5]/30 font-semibold'
        case 'media': return 'bg-[#ffcc00]/10 text-[#ffcc00] border-[#ffcc00]/30 font-semibold'
        case 'baixa': return 'bg-[#7900E5]/10 text-[#7900E5] border-[#7900E5]/30 font-semibold'
        default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatUrl = (url: string) => {
    try {
        const urlObj = new URL(url)
        return urlObj.pathname !== '/' ? urlObj.pathname : urlObj.hostname
    } catch { return 'Link' }
  }

  const getEvidenceUrl = (item: any) => {
      if (item.qa_evidences && item.qa_evidences.length > 0) {
          return item.qa_evidences[0].file_url;
      }
      return null;
  }

  return (
    <div>
      {/* --- Header de Controles --- */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-center">
        
        {/* Filtro de Categorias (Horizontal Scroll) */}
        <div className="scrollbar-hide flex max-w-full flex-1 items-center gap-2 overflow-x-auto pb-2 xl:pb-0">
            <button 
                onClick={() => setSelectedCategory('all')} 
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                    selectedCategory === 'all' 
                        ? 'border-[#7900E5] bg-[#7900E5] text-white' 
                        : 'border-border bg-card hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5'
                }`}
            >
                Todos
            </button>
            {categoriesForTeam.map((cat) => (
            <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)} 
                className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                    selectedCategory === cat.id 
                        ? 'border-[#7900E5] bg-[#7900E5] text-white' 
                        : 'border-border bg-card hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5'
                }`}
            >
                {cat.title}
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                    selectedCategory === cat.id 
                        ? 'bg-background/20 dark:bg-background/30' 
                        : 'bg-muted-foreground/10 text-muted-foreground'
                }`}>
                    {(itemsForTeam.filter(i => i.category_id === cat.id) || []).length}
                </span>
            </button>
            ))}
        </div>

        {/* Lado Direito: Filtro de Status + View Toggle */}
        <div className="flex w-full items-center gap-2 xl:w-auto">
            
            {/* Filtro de Status */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 w-[180px] text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Filter className="h-3.5 w-3.5" />
                        <SelectValue placeholder="Filtrar Status" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="em_correcao">Em Correção</SelectItem>
                    <SelectItem value="em_homologacao">Homologação</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                </SelectContent>
            </Select>

            <div className="mx-1 hidden h-6 w-px bg-border xl:block" />

            {/* Toggle de Visualização */}
            <div className="ml-auto flex items-center rounded-lg border bg-card p-1 xl:ml-0">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewMode('grid')} 
                    className={`h-7 px-2 text-xs ${
                        viewMode === 'grid' 
                            ? 'bg-[#7900E5] text-white shadow-sm hover:bg-[#7900E5]/90' 
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <LayoutGrid className="mr-1 h-4 w-4" /> Grade
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewMode('list')} 
                    className={`h-7 px-2 text-xs ${
                        viewMode === 'list' 
                            ? 'bg-[#7900E5] text-white shadow-sm hover:bg-[#7900E5]/90' 
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <List className="mr-1 h-4 w-4" /> Lista
                </Button>
            </div>
        </div>
      </div>

      {/* --- Conteúdo --- */}
      {filteredItems && filteredItems.length > 0 ? (
        <>
            {/* GRID VIEW */}
            {viewMode === 'grid' && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredItems.map((item) => {
                        const itemCategory = categories.find(c => c.id === item.category_id)
                        const evidenceUrl = getEvidenceUrl(item)
                        return (
                            <div key={item.id} onClick={() => setSelectedItemId(item.id)}>
                                <QAItemCard 
                                    item={item} 
                                    projectId={projectId} 
                                    category={itemCategory} 
                                    evidenceUrl={evidenceUrl} 
                                    onPreview={setPreviewImage} 
                                    disableNavigation={true} 
                                />
                            </div>
                        )
                    })}
                </div>
            )}

            {/* LIST VIEW (TABELA ATUALIZADA) */}
            {viewMode === 'list' && (
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50 font-medium text-muted-foreground">
                                <tr>
                                    <th className="w-[150px] px-4 py-3 text-xs font-semibold uppercase tracking-wider">Categoria</th>
                                    <th className="w-[140px] px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                                    <th className="w-[100px] px-4 py-3 text-xs font-semibold uppercase tracking-wider">Prioridade</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Título / Descrição</th>
                                    <th className="w-[120px] px-4 py-3 text-xs font-semibold uppercase tracking-wider">Evidência</th> 
                                    <th className="w-[120px] px-4 py-3 text-xs font-semibold uppercase tracking-wider">URL</th>
                                    <th className="w-20 px-4 py-3 text-xs font-semibold uppercase tracking-wider">Resp.</th>
                                    <th className="w-[100px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredItems.map((item) => {
                                    const itemCategory = categories.find(c => c.id === item.category_id)
                                    const evidenceUrl = getEvidenceUrl(item)
                                    
                                    return (
                                        <tr 
                                            key={item.id} 
                                            className="group cursor-pointer transition-colors hover:bg-[#7900E5]/5"
                                            onClick={() => setSelectedItemId(item.id)}
                                        >
                                            {/* Coluna 1: Categoria */}
                                            <td className="px-4 py-3 align-top">
                                                <div className="mt-1">
                                                    {itemCategory ? (
                                                        <Badge variant="secondary" className="text-[10px] font-normal bg-muted/50 text-muted-foreground border border-border whitespace-nowrap">
                                                            {itemCategory.title}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Coluna 2: Status */}
                                            <td className="px-4 py-3 align-top">
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    {getStatusIcon(item.status)}
                                                    <span className="text-xs font-medium uppercase text-muted-foreground whitespace-nowrap">
                                                        {item.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            
                                            {/* Coluna 3: Prioridade */}
                                            <td className="px-4 py-3 align-top">
                                                <div className="mt-1">
                                                    <Badge variant="outline" className={`text-[10px] uppercase ${getPriorityColor(item.priority)}`}>
                                                        {item.priority}
                                                    </Badge>
                                                </div>
                                            </td>

                                            {/* Coluna 4: Título */}
                                            <td className="px-4 py-3 align-top">
                                                <div className="block py-1">
                                                    <span className="font-montserrat mb-1 block font-semibold text-foreground transition-colors group-hover:text-[#7900E5]">
                                                        {item.title}
                                                    </span>
                                                    <p className="line-clamp-1 max-w-[300px] text-xs text-muted-foreground">
                                                        {item.description || "Sem descrição"}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Coluna 5: Evidência (Estilo Tag) */}
                                            <td className="px-4 py-3 align-top">
                                                <div className="mt-1">
                                                    {evidenceUrl ? (
                                                        <Badge 
                                                            variant="outline" 
                                                            className="cursor-pointer gap-1 py-0.5 pl-1.5 pr-2 font-normal text-muted-foreground transition-colors hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5 hover:text-[#7900E5]"
                                                            onClick={(e) => {
                                                                e.stopPropagation() 
                                                                setPreviewImage(evidenceUrl)
                                                            }}
                                                        >
                                                            <ImageIcon className="h-3 w-3" />
                                                            Ver Print
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground opacity-50">-</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Coluna 6: URL */}
                                            <td className="px-4 py-3 align-top">
                                                <div className="mt-1">
                                                    {item.page_url && (
                                                        <a 
                                                            href={item.page_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border transition-all
                                                                text-accent bg-accent/10 border-accent/30
                                                                hover:bg-accent/20 hover:border-accent/40 hover:text-accent hover:underline
                                                                dark:bg-accent/20 dark:border-accent/40 dark:text-accent
                                                                dark:hover:bg-accent/30 dark:hover:border-accent/50"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Globe className="h-3 w-3" />
                                                            <span className="truncate max-w-20">{formatUrl(item.page_url)}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Coluna 7: Responsável */}
                                            <td className="px-4 py-3 align-top">
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Avatar className="h-6 w-6 border">
                                                        <AvatarFallback className="bg-[#7900E5]/10 text-[10px] text-[#7900E5]">
                                                            {item.assigned_to ? 'U' : '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            </td>

                                            {/* Coluna 8: Data */}
                                            <td className="px-4 py-3 align-top text-right text-xs text-muted-foreground whitespace-nowrap pt-3">
                                                {format(new Date(item.created_at), "dd/MM/yy", { locale: ptBR })}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/10 text-muted-foreground">
            <p className="text-sm">Nenhum item encontrado.</p>
            {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
                <button 
                    onClick={() => { setSelectedCategory('all'); setSelectedStatus('all') }} 
                    className="text-sm text-[#7900E5] underline hover:text-[#ff28c6]"
                >
                    Limpar filtros
                </button>
            )}
        </div>
      )}

      {/* --- SHEET --- */}
      <QAItemDetailSheet 
        projectId={projectId}
        itemId={selectedItemId}
        open={!!selectedItemId}
        onOpenChange={(open) => {
            if (!open) setSelectedItemId(null)
        }}
      />

      {/* --- MODAL LIGHTBOX --- */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-none w-screen h-screen p-0 border-none bg-black/95 flex flex-col items-center justify-center focus:outline-none z-100 rounded-none [&>button[data-slot='dialog-close']]:text-white [&>button[data-slot='dialog-close']]:bg-white/10 [&>button[data-slot='dialog-close']]:hover:bg-white/20 [&>button[data-slot='dialog-close']]:border-white/20 [&>button[data-slot='dialog-close']]:rounded-full [&>button[data-slot='dialog-close']]:opacity-100">
            <DialogTitle className="sr-only">Visualização da Evidência</DialogTitle>
            
            <div className="relative w-full h-full flex items-center justify-center">
                {previewImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                        src={previewImage} 
                        alt="Evidência do Bug" 
                        className="w-full h-full object-contain pointer-events-none select-none"
                    />
                )}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}