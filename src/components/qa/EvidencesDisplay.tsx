/* eslint-disable @next/next/no-img-element */
"use client"

import { FileText, ExternalLink } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface EvidenceImage {
    id: string
    file_url: string
    file_type: string
}

interface EvidencesDisplayProps {
    evidences: EvidenceImage[] | null
}

export function EvidencesDisplay({ evidences }: EvidencesDisplayProps) {
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const handleImageError = (evidenceId: string) => {
        setFailedImages(prev => new Set([...prev, evidenceId]))
        console.error('Erro ao carregar imagem:', evidenceId)
    }

    return (
        <>
            {evidences && evidences.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {evidences.map((evidence) => {
                        const isImage =
                            evidence.file_type.startsWith("image/") ||
                            /\.(png|jpe?g|webp|gif)$/i.test(evidence.file_url)

                        return (
                        <div
                            key={evidence.id}
                            className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-accent/40 hover:shadow-md hover:shadow-accent/10"
                        >
                            {isImage ? (
                                <button
                                    type="button"
                                    onClick={() => setPreviewImage(evidence.file_url)}
                                    className="block h-full w-full cursor-zoom-in"
                                >
                                    {failedImages.has(evidence.id) ? (
                                        <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                                            Imagem indisponível
                                        </div>
                                    ) : (
                                        <img
                                            src={evidence.file_url}
                                            alt="Evidence"
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            onError={() => handleImageError(evidence.id)}
                                        />
                                    )}
                                </button>
                            ) : (
                                <a
                                    href={evidence.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-full items-center justify-center transition-colors hover:bg-accent/10"
                                >
                                    <FileText className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-accent" />
                                </a>
                            )}
                        </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Nenhuma evidência anexada.</p>
            )}

            {/* Preview em tela cheia da evidência */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="z-50 flex h-[85vh] max-w-[90vw] flex-col items-center justify-center border-none bg-black/95 p-0 focus:outline-none [&>button[data-slot='dialog-close']]:text-white [&>button[data-slot='dialog-close']]:bg-white/10 [&>button[data-slot='dialog-close']]:hover:bg-white/20 [&>button[data-slot='dialog-close']]:border-white/20 [&>button[data-slot='dialog-close']]:rounded-full [&>button[data-slot='dialog-close']]:opacity-100" showCloseButton>
                    <DialogTitle className="sr-only">Visualização da Evidência</DialogTitle>
                    
                    <div className="flex h-full w-full items-center justify-center">
                        {previewImage && (
                            <div className="relative h-full w-full p-4">
                                <img
                                    src={previewImage}
                                    alt="Visualização da evidência"
                                    className="h-full w-full object-contain"
                                />
                                <a
                                    href={previewImage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-6 right-6 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Abrir em nova aba
                                </a>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
