/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, X, FileText, Image as ImageIcon, Film } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EvidenceUploadProps {
    itemId: string
}

export function EvidenceUpload({ itemId }: EvidenceUploadProps) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${itemId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('evidences')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('evidences')
                .getPublicUrl(filePath)

            const { error: dbError } = await supabase
                .from('qa_evidences')
                .insert([
                    {
                        qa_item_id: itemId,
                        file_url: publicUrl,
                        file_type: file.type,
                    },
                ])

            if (dbError) {
                throw dbError
            }

            router.refresh()
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : 'Unknown error'
            alert(`Error uploading file: ${message}`)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex items-center gap-4">
            <Input
                type="file"
                id="evidence"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
                accept="image/*,video/*,application/pdf"
            />
            <Label
                htmlFor="evidence"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 text-xs font-medium transition-colors hover:border-[#7900E5]/30 hover:bg-[#7900E5]/5 hover:text-[#7900E5]"
            >
                {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="h-4 w-4" />
                )}
                <span>Adicionar Evidência</span>
            </Label>
        </div>
    )
}
