'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Download, FolderOpen, ToggleRight, Puzzle, CheckCircle2, AlertTriangle, Maximize2, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

// Definição dos passos
const steps = [
    {
        title: "Baixar e Descompactar",
        description: "Faça o download do arquivo .zip da extensão e extraia o conteúdo em uma pasta segura no seu computador.",
        icon: Download,
        content: (
            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm text-foreground">1. Clique no botão abaixo para baixar a versão mais recente.</p>
                                    <Button className="w-fit gap-2" asChild>
                                        <Link href="/extension/qahub-extension.zip" target="_blank" prefetch={false}>
                                            <Download className="h-4 w-4" />
                                            Baixar Extensão (.zip)
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm text-foreground">
                                        2. Localize o arquivo baixado, clique com o botão direito e selecione <strong>&quot;Extrair Tudo&quot;</strong> (ou Unzip).
                                    </p>
                                    <div className="flex items-center gap-2 rounded-lg border border-amarelo/30 bg-amarelo/10 p-2.5 text-xs text-amarelo">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span><strong>Importante:</strong> Não exclua a pasta extraída após a instalação.</span>
                                    </div>
                                </div>
            </div>
        )
    },
    {
        title: "Acessar Gerenciador de Extensões",
        description: "Abra o painel de controle de extensões do Google Chrome.",
        icon: Puzzle,
        content: (
            <div className="space-y-2">
                <p className="text-sm text-foreground">
                    Copie e cole este endereço na barra do navegador ou acesse pelo menu (3 pontinhos &gt; Extensões &gt; Gerenciar Extensões):
                </p>
                <code className="block w-full select-all rounded-lg border border-[#7900E5]/30 bg-slate-950 p-3 font-mono text-sm text-slate-50 shadow-inner">
                    chrome://extensions
                </code>
            </div>
        )
    },
    {
        title: "Ativar Modo do Desenvolvedor",
        description: "Habilite a opção que permite instalar extensões fora da loja oficial.",
        icon: ToggleRight,
        content: (
            <div className="space-y-2">
                <p className="text-sm text-foreground">
                    No canto superior direito da tela de extensões, ative a chave <strong>&quot;Modo do desenvolvedor&quot;</strong>.
                </p>
            </div>
        )
    },
    {
        title: "Carregar sem Compactação",
        description: "Importe a pasta que você descompactou no Passo 1.",
        icon: FolderOpen,
        content: (
            <div className="space-y-2">
                <p className="text-sm text-foreground">
                    1. Clique no botão <strong>&quot;Carregar sem compactação&quot;</strong> (Load unpacked) que apareceu no canto superior esquerdo.
                </p>
                <p className="text-sm text-foreground">
                    2. Na janela que abrir, selecione a <strong>pasta que você extraiu</strong> (não o arquivo .zip) e clique em &quot;Selecionar Pasta&quot;.
                </p>
            </div>
        )
    },
    {
        title: "Fixar e Usar",
        description: "A extensão está pronta! Fixe-a para acesso rápido.",
        icon: CheckCircle2,
        content: (
            <div className="space-y-2">
                <p className="text-sm text-foreground">
                    Clique no ícone de &quot;Quebra-cabeça&quot; na barra do Chrome e clique no &quot;Alfinete&quot; ao lado do <strong>QAHub</strong> para fixá-lo.
                </p>
                <div className="mt-4 flex items-center gap-3 border border-border bg-foreground/5 p-4 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-6 w-6 shrink-0" />
                    <span><strong>Pronto!</strong> Agora acesse qualquer site do seu projeto e abra a extensão.</span>
                </div>
            </div>
        )
    }
]

export default function TutorialPage() {
    // Estado para controlar qual imagem está aberta no modal
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)

    // Navegação entre imagens
    const currentIndex = selectedImageIndex ?? 0
    const canGoPrevious = currentIndex > 0
    const canGoNext = currentIndex < steps.length - 1

    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1
            setSelectedImageIndex(newIndex)
            setSelectedImage(`/print-0${newIndex + 1}.png`)
            setZoom(1)
            setRotation(0)
        }
    }, [currentIndex])

    const goToNext = useCallback(() => {
        if (currentIndex < steps.length - 1) {
            const newIndex = currentIndex + 1
            setSelectedImageIndex(newIndex)
            setSelectedImage(`/print-0${newIndex + 1}.png`)
            setZoom(1)
            setRotation(0)
        }
    }, [currentIndex])

    // Atalhos de teclado
    useEffect(() => {
        if (!selectedImage) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedImage(null)
                setSelectedImageIndex(null)
                setZoom(1)
                setRotation(0)
            } else if (e.key === 'ArrowLeft' && canGoPrevious) {
                goToPrevious()
            } else if (e.key === 'ArrowRight' && canGoNext) {
                goToNext()
            } else if (e.key === '+' || e.key === '=') {
                e.preventDefault()
                setZoom(prev => Math.min(prev + 0.25, 3))
            } else if (e.key === '-') {
                e.preventDefault()
                setZoom(prev => Math.max(prev - 0.25, 0.5))
            } else if (e.key === '0') {
                setZoom(1)
                setRotation(0)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedImage, canGoPrevious, canGoNext, goToPrevious, goToNext])

    const handleImageClick = (imageSrc: string, index: number) => {
        setSelectedImage(imageSrc)
        setSelectedImageIndex(index)
        setZoom(1)
        setRotation(0)
    }

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-20">
            <div className="space-y-4 text-center">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-rosa uppercase dark:text-amarelo">
                    Tutorial de instalação
                </p>
                <h1 className="font-mona text-5xl lg:text-6xl">Extensão QA Hub</h1>
                <p className="mx-auto max-w-2xl text-sm text-foreground/65">
                    Siga este guia para instalar a captura de bugs no Chrome e acelerar o fluxo de QA.
                </p>
                <div className="flex justify-center">
                    <Button size="lg" asChild>
                        <Link href="/extension/qahub-extension.zip" target="_blank" prefetch={false}>
                            <Download className="h-5 w-5" />
                            Baixar extensão
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Steps Container */}
            <div className="grid gap-6">
                {steps.map((step, index) => {
                    const imageSrc = `/print-0${index + 1}.png`
                    
                    return (
                        <Card key={index} className="overflow-hidden border-l-4 border-l-roxo">
                            <CardHeader className="border-b bg-linear-to-r from-muted/30 to-transparent pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-roxo font-mona text-2xl text-white">
                                        {index + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2 font-montserrat text-xl font-bold">
                                            {step.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            {step.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid items-center gap-6 p-6 md:grid-cols-2">
                                
                                {/* Lado Esquerdo: Instruções de Texto */}
                                <div className="flex flex-col justify-center">
                                    {step.content}
                                </div>

                                {/* Lado Direito: Imagem com Click para Zoom */}
                                <div 
                                    className="group relative aspect-video w-full cursor-zoom-in overflow-hidden border border-border bg-foreground/5"
                                    onClick={() => handleImageClick(imageSrc, index)}
                                >
                                    <Image 
                                        src={imageSrc}
                                        alt={`Passo ${index + 1}: ${step.title}`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    
                                    {/* Overlay de Zoom no Hover */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/5 opacity-0 transition-opacity group-hover:opacity-100">
                                        <div className="rounded-full bg-[#7900E5]/20 p-3 text-foreground backdrop-blur-sm">
                                            <Maximize2 className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Footer / Ajuda */}
            <Alert className="border-border bg-foreground/5">
                <AlertTitle className="flex items-center gap-2 font-semibold">
                    Precisa de ajuda?
                </AlertTitle>
                <AlertDescription className="mt-2 text-sm text-foreground/60">
                    Se tiver dificuldades ou receber erros de &quot;Manifest file missing&quot;, verifique se você extraiu a pasta corretamente (não selecione o arquivo .zip direto). Entre em contato com time de Dev :D - By Ale Dev
                </AlertDescription>
            </Alert>

            {/* MODAL DE VISUALIZAÇÃO (LIGHTBOX) */}
            <Dialog open={!!selectedImage} onOpenChange={() => {
                setSelectedImage(null)
                setSelectedImageIndex(null)
                setZoom(1)
                setRotation(0)
            }}>
                <DialogContent className="z-50 flex h-[95vh] max-w-[95vw] flex-col border-none bg-black/98 p-0 focus:outline-none">
                    <DialogTitle className="sr-only">Visualização da Etapa</DialogTitle>
                    
                    {/* Header com informações e controles */}
                    <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between bg-linear-to-b from-black/80 via-black/60 to-transparent p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            {selectedImageIndex !== null && (
                                <>
                                    <Badge variant="secondary" className="bg-[#7900E5]/20 text-[#7900E5] border-[#7900E5]/30 font-montserrat font-semibold">
                                        Passo {selectedImageIndex + 1} de {steps.length}
                                    </Badge>
                                    <span className="font-montserrat text-sm font-semibold text-foreground">
                                        {steps[selectedImageIndex].title}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Controles de Zoom e Rotação */}
                            <div className="flex items-center gap-1 rounded-lg bg-foreground/10 p-1 backdrop-blur-sm">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-foreground hover:bg-white/20"
                                    onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                                    disabled={zoom <= 0.5}
                                    title="Diminuir zoom (ou -)"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="min-w-12 text-center text-xs font-medium text-foreground">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-foreground hover:bg-white/20"
                                    onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                                    disabled={zoom >= 3}
                                    title="Aumentar zoom (ou +)"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-foreground hover:bg-white/20"
                                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                                    title="Rotacionar"
                                >
                                    <RotateCw className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full bg-foreground/10 text-foreground backdrop-blur-sm transition-colors hover:bg-white/20"
                                onClick={() => {
                                    setSelectedImage(null)
                                    setSelectedImageIndex(null)
                                    setZoom(1)
                                    setRotation(0)
                                }}
                                title="Fechar (ESC)"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Área da Imagem */}
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                        {/* Botão Anterior */}
                        {canGoPrevious && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 z-50 h-12 w-12 rounded-full bg-foreground/10 text-foreground backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"
                                onClick={goToPrevious}
                                title="Anterior (←)"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        )}

                        {/* Imagem */}
                        {selectedImage && (
                            <div 
                                className="relative h-full w-full p-8 transition-transform duration-300"
                                style={{
                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                    cursor: zoom > 1 ? 'grab' : 'default'
                                }}
                            >
                                <Image 
                                    src={selectedImage} 
                                    alt={selectedImageIndex !== null ? `Passo ${selectedImageIndex + 1}: ${steps[selectedImageIndex].title}` : 'Visualização ampliada'} 
                                    fill
                                    className="object-contain select-none"
                                    quality={100}
                                    priority
                                />
                            </div>
                        )}

                        {/* Botão Próximo */}
                        {canGoNext && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 z-50 h-12 w-12 rounded-full bg-foreground/10 text-foreground backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"
                                onClick={goToNext}
                                title="Próximo (→)"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        )}
                    </div>

                    {/* Footer com dicas */}
                    <div className="absolute bottom-0 left-0 right-0 z-50 bg-linear-to-t from-black/80 via-black/60 to-transparent p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-6 text-xs text-foreground/70">
                            <span className="flex items-center gap-1.5">
                                <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono">ESC</kbd>
                                Fechar
                            </span>
                            <span className="flex items-center gap-1.5">
                                <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono">←</kbd>
                                <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono">→</kbd>
                                Navegar
                            </span>
                            <span className="flex items-center gap-1.5">
                                <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono">+</kbd>
                                <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono">-</kbd>
                                Zoom
                            </span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}