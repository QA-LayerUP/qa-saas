/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useMemo } from 'react'
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
    X
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Importe o componente da Sheet que criamos anteriormente
import { QAItemDetailSheet } from './QAItemDetailSheet'

interface TeamTabContentProps {
  teamId: string
  categories: QACategory[]
  items: QAItem[]
  projectId: string
}

export default function TeamTabContent({ teamId, categories, items, projectId }: TeamTabContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // Estado para controlar qual item está aberto na Sheet Lateral
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

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return itemsForTeam
    return itemsForTeam.filter((i) => i.category_id === selectedCategory)
  }, [itemsForTeam, selectedCategory])

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
      {/* --- Header (Filtros + View Toggle) --- */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex gap-2 items-center overflow-x-auto pb-2 sm:pb-0 scrollbar-hide max-w-full">
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

        <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
            <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={`h-7 px-2 ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <LayoutGrid className="h-4 w-4 mr-1" /> <span className="text-xs">Grade</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={`h-7 px-2 ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <List className="h-4 w-4 mr-1" /> <span className="text-xs">Lista</span>
            </Button>
        </div>
      </div>

      {/* --- Conteúdo Principal --- */}
      {filteredItems && filteredItems.length > 0 ? (
        <>
            {/* GRID VIEW (CARDS) */}
            {viewMode === 'grid' && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredItems.map((item) => {
                        const itemCategory = categories.find(c => c.id === item.category_id)
                        const evidenceUrl = getEvidenceUrl(item)
                        return (
                            // Wrapper com onClick para abrir a Sheet
                            <div key={item.id} onClick={() => setSelectedItemId(item.id)}>
                                <QAItemCard 
                                    item={item} 
                                    projectId={projectId} 
                                    category={itemCategory} 
                                    evidenceUrl={evidenceUrl} 
                                    onPreview={setPreviewImage} 
                                    disableNavigation={true} // Força o card a não usar Link interno
                                />
                            </div>
                        )
                    })}
                </div>
            )}

            {/* LIST VIEW (TABLE) */}
            {viewMode === 'list' && (
                <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3 w-[50px]">Img</th>
                                    <th className="px-4 py-3 w-[140px]">Status</th>
                                    <th className="px-4 py-3 w-[100px]">Prioridade</th>
                                    <th className="px-4 py-3">Título / Descrição</th>
                                    <th className="px-4 py-3 w-[150px]">Categoria</th>
                                    <th className="px-4 py-3 w-[120px]">URL</th>
                                    <th className="px-4 py-3 w-[100px]">Resp.</th>
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
                                            onClick={() => setSelectedItemId(item.id)} // Clique na linha abre a Sheet
                                        >
                                            
                                            {/* Coluna de Evidência (Clickable, stopPropagation) */}
                                            <td className="px-4 py-3 align-middle">
                                                {evidenceUrl ? (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation() // Não abre a sheet
                                                            setPreviewImage(evidenceUrl)
                                                        }}
                                                        className="h-8 w-8 flex items-center justify-center rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200"
                                                        title="Ver Evidência"
                                                    >
                                                        <ImageIcon className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <div className="h-8 w-8 flex items-center justify-center opacity-20">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 align-top">
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    {getStatusIcon(item.status)}
                                                    <span className="text-xs font-medium uppercase text-muted-foreground">
                                                        {item.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            
                                            <td className="px-4 py-3 align-top">
                                                <div className="mt-1">
                                                    <Badge variant="outline" className={`text-[10px] uppercase ${getPriorityColor(item.priority)}`}>
                                                        {item.priority}
                                                    </Badge>
                                                </div>
                                            </td>

                                            {/* Título e Descrição (Sem Link interno) */}
                                            <td className="px-4 py-3 align-top">
                                                <div className="block py-1">
                                                    <span className="font-semibold text-foreground hover:text-blue-600 transition-colors block mb-1">
                                                        {item.title}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[350px]">
                                                        {item.description || "Sem descrição"}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 align-top">
                                                <div className="mt-1">
                                                    {itemCategory && (
                                                        <Badge variant="secondary" className="text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200">
                                                            {itemCategory.title}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 align-top">
                                                <div className="mt-1">
                                                    {item.page_url && (
                                                        <a 
                                                            href={item.page_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-100"
                                                            onClick={(e) => e.stopPropagation()} // Importante
                                                        >
                                                            <Globe className="h-3 w-3" />
                                                            <span className="truncate max-w-20">{formatUrl(item.page_url)}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 align-top">
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[10px] bg-slate-200">
                                                            {/* Tenta pegar a inicial do usuário do item (join pode ser necessário) */}
                                                            {item.assigned_to ? 'U' : '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 align-top text-right text-xs text-muted-foreground whitespace-nowrap pt-4">
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
            {selectedCategory !== 'all' && <button onClick={() => setSelectedCategory('all')} className="text-sm underline hover:text-foreground">Limpar filtros</button>}
        </div>
      )}

      {/* --- SHEET DE DETALHES LATERAL --- */}
      <QAItemDetailSheet 
        projectId={projectId}
        itemId={selectedItemId}
        open={!!selectedItemId}
        onOpenChange={(open) => {
            if (!open) setSelectedItemId(null)
        }}
      />

      {/* --- MODAL FULLSCREEN (LIGHTBOX) --- */}
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