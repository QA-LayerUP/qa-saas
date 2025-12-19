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
            <DialogContent className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden p-0 [&>button[data-slot='dialog-close']]:text-white [&>button[data-slot='dialog-close']]:bg-white/10 [&>button[data-slot='dialog-close']]:hover:bg-white/20 [&>button[data-slot='dialog-close']]:border-white/20 [&>button[data-slot='dialog-close']]:rounded-full [&>button[data-slot='dialog-close']]:opacity-100">
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                        <div className="mb-2 flex items-center gap-2">
                            <div className="h-1 w-6 rounded-full bg-linear-to-r from-[#7900E5] to-[#7900E5]" />
                            <span className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7900E5] dark:text-white">
                                {'// Screenshot Capturado'}
                            </span>
                        </div>
                            <DialogTitle className="font-montserrat text-xl font-bold">Visualizar Screenshot</DialogTitle>
                        </div>

                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={onClose}
                                className="hover:border-border hover:bg-muted"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={handleSave} 
                                disabled={saving || !imageLoaded}
                                className="bg-[#7900E5] font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#ff28c6]"
                            >
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
                <div className="flex flex-1 items-center justify-center overflow-auto bg-neutral-900 p-8">
                    {imageLoaded && imageDataUrl ? (
                        <div className="relative">
                            <img
                                ref={imgRef}
                                src={imageDataUrl}
                                alt="Screenshot capturado"
                                className="max-h-full max-w-full rounded-lg border border-[#7900E5]/20 shadow-lg shadow-[#7900E5]/10"
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
                            <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-[#7900E5]" />
                            <p className="text-sm">Carregando imagem...</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
