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
        case 'alta': return 'bg-red-100 text-red-800 border-red-200'
        case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'baixa': return 'bg-green-100 text-green-800 border-green-200'
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
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between mb-6">
        
        {/* Filtro de Categorias (Horizontal Scroll) */}
        <div className="flex gap-2 items-center overflow-x-auto pb-2 xl:pb-0 scrollbar-hide max-w-full flex-1">
            <button onClick={() => setSelectedCategory('all')} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${selectedCategory === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-input'}`}>
            Todos
            </button>
            {categoriesForTeam.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors border flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-input'}`}>
                {cat.title}
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${selectedCategory === cat.id ? 'bg-primary-foreground/20' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                {(itemsForTeam.filter(i => i.category_id === cat.id) || []).length}
                </span>
            </button>
            ))}
        </div>

        {/* Lado Direito: Filtro de Status + View Toggle */}
        <div className="flex items-center gap-2 w-full xl:w-auto">
            
            {/* NOVO: Filtro de Status */}
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

            <div className="w-px h-6 bg-border mx-1 hidden xl:block" />

            {/* Toggle de Visualização */}
            <div className="flex items-center bg-muted/50 p-1 rounded-lg border ml-auto xl:ml-0">
                <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={`h-7 px-2 ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    <LayoutGrid className="h-4 w-4 mr-1" /> <span className="text-xs">Grade</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={`h-7 px-2 ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    <List className="h-4 w-4 mr-1" /> <span className="text-xs">Lista</span>
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
                <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                                <tr>
                                    {/* MUDANÇA: Categoria primeiro */}
                                    <th className="px-4 py-3 w-[150px]">Categoria</th>
                                    <th className="px-4 py-3 w-[140px]">Status</th>
                                    <th className="px-4 py-3 w-[100px]">Prioridade</th>
                                    <th className="px-4 py-3">Título / Descrição</th>
                                    {/* MUDANÇA: Evidência aqui */}
                                    <th className="px-4 py-3 w-[120px]">Evidência</th> 
                                    <th className="px-4 py-3 w-[120px]">URL</th>
                                    <th className="px-4 py-3 w-20">Resp.</th>
                                    <th className="px-4 py-3 w-[100px] text-right">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredItems.map((item) => {
                                    const itemCategory = categories.find(c => c.id === item.category_id)
                                    const evidenceUrl = getEvidenceUrl(item)
                                    
                                    return (
                                        <tr 
                                            key={item.id} 
                                            className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => setSelectedItemId(item.id)}
                                        >
                                            {/* Coluna 1: Categoria */}
                                            <td className="px-4 py-3 align-top">
                                                <div className="mt-1">
                                                    {itemCategory ? (
                                                        <Badge variant="secondary" className="text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
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
                                                    <span className="font-semibold text-foreground hover:text-blue-600 transition-colors block mb-1">
                                                        {item.title}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
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
                                                            className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors gap-1 pl-1.5 pr-2 py-0.5 font-normal text-slate-500"
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
                                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
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
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Avatar className="h-6 w-6 border">
                                                        <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">
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
        <div className="flex flex-col items-center justify-center h-40 rounded-lg border border-dashed bg-muted/10 text-muted-foreground gap-2">
            <p>Nenhum item encontrado.</p>
            {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
                <button 
                    onClick={() => { setSelectedCategory('all'); setSelectedStatus('all') }} 
                    className="text-sm underline hover:text-foreground"
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
        <DialogContent className="max-w-none w-screen h-screen p-0 border-none bg-black/95 flex flex-col items-center justify-center focus:outline-none z-100 rounded-none">
            <DialogTitle className="sr-only">Visualização da Evidência</DialogTitle>
            
            <div className="relative w-full h-full flex items-center justify-center">
                <button 
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-6 right-6 z-110 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                >
                    <X className="h-8 w-8" />
                </button>

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