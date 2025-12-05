/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Loader2,
    Download
} from 'lucide-react'

interface AnnotationEditorProps {
    imageBlob: Blob
    open: boolean
    onClose: () => void
    onSave: (imageBlob: Blob) => Promise<void>
}

export function AnnotationEditor({ imageBlob, open, onClose, onSave }: AnnotationEditorProps) {
    const [saving, setSaving] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageDataUrl, setImageDataUrl] = useState<string>('')
    const imgRef = useRef<HTMLImageElement | null>(null)

    // Carrega a imagem quando o modal abre
    useEffect(() => {
        if (!open || !imageBlob) {
            return
        }

        const reader = new FileReader()
        
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            setImageDataUrl(dataUrl)
            setImageLoaded(true)
            console.log('✅ Imagem carregada e pronta para exibir')
        }

        reader.onerror = (e) => {
            console.error('❌ Erro ao ler blob:', e)
        }

        reader.readAsDataURL(imageBlob)
    }, [open, imageBlob])

    const handleSave = async () => {
        if (!imageBlob) {
            alert('Imagem não carregada')
            console.error('❌ imageBlob é null')
            return
        }

        setSaving(true)
        try {
            console.log('💾 Salvando imagem original...')
            console.log('Blob size:', imageBlob.size)

            await onSave(imageBlob)
            console.log('✅ Imagem salva com sucesso')
            onClose()
        } catch (error) {
            console.error('❌ Erro ao salvar:', error)
            alert('Erro ao salvar anotação.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Visualizar Screenshot</DialogTitle>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={saving || !imageLoaded}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Salvar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Imagem */}
                <div className="flex-1 overflow-auto bg-neutral-900 flex items-center justify-center p-8">
                    {imageLoaded && imageDataUrl ? (
                        <div className="relative">
                            <img
                                ref={imgRef}
                                src={imageDataUrl}
                                alt="Screenshot capturado"
                                className="max-w-full max-h-full border border-neutral-700 rounded shadow-lg"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                                onLoad={() => console.log('🖼️ Imagem renderizada na tela')}
                                onError={() => console.error('❌ Erro ao renderizar imagem')}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p>Carregando imagem...</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
