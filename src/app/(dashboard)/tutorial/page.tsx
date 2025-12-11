'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog' // Import do Dialog
import { Download, FolderOpen, ToggleRight, Puzzle, CheckCircle2, AlertTriangle, Maximize2, X } from 'lucide-react'

// Definição dos passos
const steps = [
    {
        title: "Baixar e Descompactar",
        description: "Faça o download do arquivo .zip da extensão e extraia o conteúdo em uma pasta segura no seu computador.",
        icon: Download,
        content: (
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-slate-600">1. Clique no botão abaixo para baixar a versão mais recente.</p>
                    <Button className="w-fit gap-2" asChild>
                        <Link href="/extension/qahub-extension.zip" target="_blank" prefetch={false}>
                            <Download className="h-4 w-4" />
                            Baixar Extensão (.zip)
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-slate-600">
                        2. Localize o arquivo baixado, clique com o botão direito e selecione <strong>&quot;Extrair Tudo&quot;</strong> (ou Unzip).
                    </p>
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" />
                        Importante: Não exclua a pasta extraída após a instalação.
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
                <p className="text-sm text-slate-600">
                    Copie e cole este endereço na barra do navegador ou acesse pelo menu (3 pontinhos &gt; Extensões &gt; Gerenciar Extensões):
                </p>
                <code className="block w-full bg-slate-950 text-slate-50 p-3 rounded-md font-mono text-sm select-all">
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
                <p className="text-sm text-slate-600">
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
                <p className="text-sm text-slate-600">
                    1. Clique no botão <strong>&quot;Carregar sem compactação&quot;</strong> (Load unpacked) que apareceu no canto superior esquerdo.
                </p>
                <p className="text-sm text-slate-600">
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
                <p className="text-sm text-slate-600">
                    Clique no ícone de &quot;Quebra-cabeça&quot; na barra do Chrome e clique no &quot;Alfinete&quot; ao lado do <strong>QAHub</strong> para fixá-lo.
                </p>
                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg text-green-800 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Pronto! Agora acesse qualquer site do seu projeto e abra a extensão.
                </div>
            </div>
        )
    }
]

export default function TutorialPage() {
    // Estado para controlar qual imagem está aberta no modal
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Instalação da Extensão QA LayerUP</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Siga este guia rápido para instalar nossa ferramenta de captura de bugs no seu Google Chrome e turbinar seu fluxo de QA.
                </p>
                <div className="flex justify-center gap-4">
                    <Button size="lg" className="gap-2 shadow-lg" asChild>
                        <Link href="/extension/qahub-extension.zip" target="_blank" prefetch={false}>
                            <Download className="h-5 w-5" />
                            Baixar Extensão Agora
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Steps Container */}
            <div className="grid gap-6">
                {steps.map((step, index) => {
                    const imageSrc = `/print-0${index + 1}.png`
                    
                    return (
                        <Card key={index} className="overflow-hidden border-l-4 border-l-primary shadow-sm">
                            <CardHeader className="bg-slate-50/50 pb-4 border-b">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                                        {index + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {step.title}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {step.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6 p-6 items-center">
                                
                                {/* Lado Esquerdo: Instruções de Texto */}
                                <div className="flex flex-col justify-center">
                                    {step.content}
                                </div>

                                {/* Lado Direito: Imagem com Click para Zoom */}
                                <div 
                                    className="relative aspect-video w-full overflow-hidden rounded-lg border shadow-sm bg-slate-100 group cursor-zoom-in"
                                    onClick={() => setSelectedImage(imageSrc)}
                                >
                                    <Image 
                                        src={imageSrc}
                                        alt={`Passo ${index + 1}: ${step.title}`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    
                                    {/* Overlay de Zoom no Hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white">
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
            <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800 font-semibold flex items-center gap-2">
                    Precisa de ajuda?
                </AlertTitle>
                <AlertDescription className="text-blue-700 mt-1">
                    Se tiver dificuldades ou receber erros de &quot;Manifest file missing&quot;, verifique se você extraiu a pasta corretamente (não selecione o arquivo .zip direto). Entre em contato com time de Dev :D - By Ale Dev
                </AlertDescription>
            </Alert>

            {/* MODAL DE VISUALIZAÇÃO (LIGHTBOX) */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-[90vw] h-[85vh] p-0 border-none bg-black/95 flex flex-col items-center justify-center focus:outline-none z-100">
                    <DialogTitle className="sr-only">Visualização da Etapa</DialogTitle>
                    
                    <div className="relative w-full h-full flex items-center justify-center">
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-110 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {selectedImage && (
                            <div className="relative w-full h-full p-4">
                                <Image 
                                    src={selectedImage} 
                                    alt="Visualização ampliada" 
                                    fill
                                    className="object-contain"
                                    quality={100}
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}