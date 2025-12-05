/* eslint-disable @next/next/no-img-element */
'use client'

import { FileText } from 'lucide-react'
import { useState } from 'react'

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

    const handleImageError = (evidenceId: string) => {
        setFailedImages(prev => new Set([...prev, evidenceId]))
        console.error('Erro ao carregar imagem:', evidenceId)
    }

    return (
        <>
            {evidences && evidences.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {evidences.map((evidence) => (
                        <div
                            key={evidence.id}
                            className="group relative aspect-video overflow-hidden rounded-md border bg-muted"
                        >
                            {evidence.file_type.startsWith('image/') ? (
                                <a
                                    href={evidence.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full h-full"
                                >
                                    {failedImages.has(evidence.id) ? (
                                        <div className="w-full h-full flex items-center justify-center bg-muted text-xs text-muted-foreground">
                                            Imagem indisponível
                                        </div>
                                    ) : (
                                        <img
                                            src={evidence.file_url}
                                            alt="Evidence"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                            onError={() => handleImageError(evidence.id)}
                                        />
                                    )}
                                </a>
                            ) : (
                                <a
                                    href={evidence.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center h-full hover:bg-muted-foreground/10 transition-colors"
                                >
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Nenhuma evidência anexada.</p>
            )}
        </>
    )
}
