/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Camera, ArrowLeft, Loader2 } from 'lucide-react'
import { AnnotationEditor } from './AnnotationEditor'
import { IframeBlockedWarning } from './IframeBlockedWarning'
import { uploadScreenshot, createVisualQAItem } from '@/lib/services/visual-qa'
import { createClient } from '@/lib/supabase/client'

interface VisualQABrowserProps {
    projectId: string
    siteUrl: string
    categoryId: string
}

export function VisualQABrowser({ projectId, siteUrl, categoryId }: VisualQABrowserProps) {
    const [capturing, setCapturing] = useState(false)
    const [imageBase64, setImageBase64] = useState<string | null>(null)
    const [editorOpen, setEditorOpen] = useState(false)
    const [iframeBlocked, setIframeBlocked] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const iframeRef = useRef<HTMLIFrameElement>(null)

    function handleIframeLoad() {
        setIframeBlocked(false)
    }
    function handleIframeError() {
        setIframeBlocked(true)
    }

    function blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
        })
    }

    // Dentro de VisualQABrowser.tsx

    const handleCapture = async () => {
        setCapturing(true)
        setImageBase64(null)

        try {
            // Obter dimensões reais do iframe
            const iframe = iframeRef.current
            if (!iframe) {
                throw new Error("Iframe não encontrado")
            }

            const iframeWidth = Math.round(iframe.clientWidth) || 1280
            const iframeHeight = Math.round(iframe.clientHeight) || 800

            console.log("Capturando com dimensões:", {
                url: siteUrl,
                width: iframeWidth,
                height: iframeHeight
            })

            const res = await fetch("/api/screenshot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: siteUrl,
                    width: iframeWidth,
                    height: iframeHeight,
                    fullPage: false
                })
            })

            if (!res.ok) {
                let errorMessage = "Erro ao capturar imagem"
                try {
                    const errorData = await res.json()
                    errorMessage = errorData.details || errorMessage
                } catch {
                    errorMessage = `Erro ${res.status}: ${res.statusText}`
                }
                throw new Error(errorMessage)
            }

            const blob = await res.blob()
            console.log("Blob recebido:", {
                size: blob.size,
                type: blob.type
            })

            if (blob.size === 0) {
                throw new Error("Imagem capturada está vazia")
            }

            const base64 = await blobToBase64(blob)
            setImageBase64(base64)
            setEditorOpen(true)

        } catch (err: any) {
            console.error("Erro na captura:", err)
            const message = err.message || "Erro desconhecido ao capturar imagem"
            alert(`Erro: ${message}`)
        } finally {
            setCapturing(false)
        }
    }

    async function handleSaveAnnotation(imageBlob: Blob) {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("User not authenticated")

            const imageUrl = await uploadScreenshot(imageBlob, projectId)

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

            router.push(`/projects/${projectId}/qa`)
            router.refresh()

        } catch (err) {
            console.error(err)
            alert("Erro ao salvar anotação.")
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">URL:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{siteUrl}</code>
                    </div>
                </div>

                <Button onClick={handleCapture} disabled={capturing}>
                    {capturing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Capturando...
                        </>
                    ) : (
                        <>
                            <Camera className="mr-2 h-4 w-4" />
                            📸 Capturar Print
                        </>
                    )}
                </Button>
            </div>

            <div className="flex-1 overflow-hidden p-4 bg-muted/10">
                {iframeBlocked ? (
                    <IframeBlockedWarning />
                ) : (
                    <iframe
                        ref={iframeRef}
                        src={siteUrl}
                        className="w-full h-full border rounded-lg overflow-hidden bg-white shadow-lg"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                )}
            </div>

            {/* {imageBase64 && (
                // <AnnotationEditor
                //     key={Date.now()} // <--- ADICIONE ISSO (ou use key={imageBase64})
                //     imageUrl={imageBase64}
                //     open={editorOpen}
                //     onClose={() => {
                //         setImageBase64(null)
                //         setEditorOpen(false)
                //     }}
                //     onSave={handleSaveAnnotation}
                // />
            )} */}
        </div>
    )
}
