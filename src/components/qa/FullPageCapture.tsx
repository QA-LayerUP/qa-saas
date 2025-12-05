'use client'

import { useState, useRef, useEffect } from 'react'
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

        } catch (err: any) {
            console.error('❌ Erro na captura:', err)
            const message = err.message || 'Erro desconhecido ao capturar página'
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

        } catch (err: any) {
            console.error('❌ Erro na captura:', err)
            const message = err.message || 'Erro desconhecido ao capturar página'
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
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">URL:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded max-w-md truncate">
                            {siteUrl}
                        </code>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyUrl}
                            className="w-8 h-8 p-0"
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
                    <Button onClick={handleCapture} disabled={capturing}>
                        {capturing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Capturando...
                            </>
                        ) : (
                            <>
                                <Camera className="mr-2 h-4 w-4" />
                                📸 Screenshot da URL
                            </>
                        )}
                    </Button>

                    <Button onClick={handleCaptureLocalUI} disabled={capturing} variant="outline">
                        {capturing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Capturando...
                            </>
                        ) : (
                            <>
                                <Camera className="mr-2 h-4 w-4" />
                                📸 Screenshot Local
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 overflow-auto bg-background p-8">
                <div
                    ref={pageContentRef}
                    className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8"
                >
                    {/* Iframe que mostra o site */}
                    <div className="border rounded-md overflow-hidden mb-6">
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
                        <p>Clique em "Capturar Página" para tirar um print</p>
                        <p className="text-xs mt-2">A captura será feita da página inteira visível</p>
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
