'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Camera, ArrowLeft, Loader2, Copy, Check } from 'lucide-react'
import { AnnotationEditor } from './AnnotationEditor'
import { uploadScreenshot, createVisualQAItem } from '@/lib/services/visual-qa'
import { createClient } from '@/lib/supabase/client'
import html2canvas from 'html2canvas'

interface FullPageCaptureProps {
    projectId: string
    siteUrl: string
    categoryId: string
}

export function FullPageCapture({ projectId, siteUrl, categoryId }: FullPageCaptureProps) {
    const [capturing, setCapturing] = useState(false)
    const [imageBlob, setImageBlob] = useState<Blob | null>(null)
    const [editorOpen, setEditorOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const pageContentRef = useRef<HTMLDivElement>(null)

    const handleCaptureLocalUI = async () => {
        setCapturing(true)
        setImageBlob(null)

        try {
            console.log('📸 Capturando componente local (página + site)...')

            // Captura o componente inteiro que mostra a página
            const element = pageContentRef.current
            if (!element) {
                throw new Error('Elemento da página não encontrado')
            }

            console.log('📏 Dimensões do componente:', {
                width: element.offsetWidth,
                height: element.offsetHeight
            })

            // Usa html2canvas para capturar o componente (inclui o iframe visualizado)
            const canvas = await html2canvas(element, {
                allowTaint: true,
                useCORS: true,
                backgroundColor: '#ffffff',
                scale: window.devicePixelRatio || 2,
                logging: false
            })

            console.log('✅ Canvas gerado com sucesso')

            // Converte canvas para blob
            canvas.toBlob((blob) => {
                if (!blob) {
                    throw new Error('Erro ao gerar blob')
                }

                console.log(`📦 Blob gerado: ${blob.size} bytes`)

                if (blob.size === 0) {
                    throw new Error('Imagem capturada está vazia')
                }

                setImageBlob(blob)
                setEditorOpen(true)
                setCapturing(false)
            }, 'image/png')

        } catch (err) {
            console.error('❌ Erro na captura:', err)
            const message = err instanceof Error ? err.message : 'Erro desconhecido ao capturar página'
            alert(`Erro ao capturar: ${message}`)
            setCapturing(false)
        }
    }

    const handleCapture = async () => {
        setCapturing(true)
        setImageBlob(null)

        try {
            console.log('📸 Capturando screenshot da URL via API...')
            console.log('🔗 URL:', siteUrl)

            // Usa a rota /api/screenshot que captura com Puppeteer
            const res = await fetch('/api/screenshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: siteUrl,
                    width: 1440,
                    height: 900,
                    fullPage: true
                })
            })

            if (!res.ok) {
                let errorMessage = 'Erro ao capturar imagem'
                try {
                    const errorData = await res.json()
                    errorMessage = errorData.error || errorData.details || errorMessage
                } catch {
                    errorMessage = `Erro ${res.status}: ${res.statusText}`
                }
                throw new Error(errorMessage)
            }

            const blob = await res.blob()
            console.log(`📦 Blob recebido: ${blob.size} bytes`)

            if (blob.size === 0) {
                throw new Error('Imagem capturada está vazia')
            }

            setImageBlob(blob)
            setEditorOpen(true)

        } catch (err) {
            console.error('❌ Erro na captura:', err)
            const message = err instanceof Error ? err.message : 'Erro desconhecido ao capturar página'
            alert(`Erro ao capturar: ${message}`)
        } finally {
            setCapturing(false)
        }
    }

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(siteUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    async function handleSaveAnnotation(imageBlob: Blob) {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("User not authenticated")

            console.log('💾 Salvando screenshot... Blob size:', imageBlob.size)

            const imageUrl = await uploadScreenshot(imageBlob, projectId)
            console.log('✅ Screenshot salvo em:', imageUrl)

            await createVisualQAItem({
                categoryId,
                title: "Nova tarefa de QA",
                description: "",
                priority: "media",
                imageUrl,
                pageUrl: siteUrl,
                scrollPosition: 0,
                viewportSize: { width: 1440, height: 1024 },
                userId: user.id
            })

            console.log('✅ QA Item criado com sucesso')
            router.push(`/projects/${projectId}/qa`)
            router.refresh()

        } catch (err) {
            console.error('❌ Erro ao salvar:', err)
            alert(`Erro ao salvar anotação: ${(err as Error).message}`)
        }
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-background px-6 py-4">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.back()}
                        className="hover:text-[#7900E5]"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">URL:</span>
                        <code className="max-w-md truncate rounded bg-muted px-2 py-1 text-sm font-mono">
                            {siteUrl}
                        </code>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyUrl}
                            className="h-8 w-8 p-0 hover:text-[#7900E5]"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button 
                        onClick={handleCapture} 
                        disabled={capturing}
                        className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]"
                    >
                        {capturing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Capturando...
                            </>
                        ) : (
                            <>
                                <Camera className="mr-2 h-4 w-4" />
                                Screenshot URL
                            </>
                        )}
                    </Button>

                    <Button 
                        onClick={handleCaptureLocalUI} 
                        disabled={capturing} 
                        variant="outline"
                        className="hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5 hover:text-[#7900E5]"
                    >
                        {capturing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Capturando...
                            </>
                        ) : (
                            <>
                                <Camera className="mr-2 h-4 w-4" />
                                Screenshot Local
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 overflow-auto bg-background p-8">
                <div
                    ref={pageContentRef}
                    className="mx-auto max-w-4xl rounded-xl bg-card p-8 shadow-lg"
                >
                    {/* Iframe que mostra o site */}
                    <div className="mb-6 overflow-hidden rounded-lg border">
                        <iframe
                            src={siteUrl}
                            className="w-full border-0 bg-white"
                            style={{ minHeight: '600px' }}
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                            title="Site Preview"
                        />
                    </div>

                    {/* Info */}
                    <div className="text-center text-sm text-muted-foreground">
                        <p>Clique em &quot;Screenshot URL&quot; para capturar a página completa</p>
                        <p className="mt-2 text-xs">Ou use &quot;Screenshot Local&quot; para capturar a visualização atual</p>
                    </div>
                </div>
            </div>

            {/* Editor de Anotações */}
            {imageBlob && (
                <AnnotationEditor
                    key={Date.now()}
                    imageBlob={imageBlob}
                    open={editorOpen}
                    onClose={() => {
                        setImageBlob(null)
                        setEditorOpen(false)
                    }}
                    onSave={handleSaveAnnotation}
                />
            )}
        </div>
    )
}
