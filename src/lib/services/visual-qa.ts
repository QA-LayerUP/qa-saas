import { createClient } from '@/lib/supabase/client'

/**
 * Upload an annotated screenshot to Supabase Storage
 * @param imageBlob - The image blob to upload
 * @param projectId - The project ID for organizing files
 * @returns The public URL of the uploaded image
 */
export async function uploadScreenshot(
    imageBlob: Blob,
    projectId: string
): Promise<string> {
    const supabase = createClient()

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${projectId}/${timestamp}-screenshot.png`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('evidences')
        .upload(filename, imageBlob, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false
        })

    if (error) {
        console.error('Error uploading screenshot:', error)
        throw new Error('Failed to upload screenshot')
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('evidences')
        .getPublicUrl(data.path)

    return publicUrl
}

/**
 * Create a QA item with visual evidence
 * @param params - Parameters for creating the QA item
 * @returns The created QA item ID
 */
export async function createVisualQAItem(params: {
    categoryId: string
    title: string
    description?: string
    priority: 'alta' | 'media' | 'baixa'
    imageUrl: string
    pageUrl: string
    scrollPosition: number
    viewportSize: { width: number; height: number }
    userId: string
}): Promise<string> {
    const supabase = createClient()

    // Create the QA item
    const { data: qaItem, error: itemError } = await supabase
        .from('qa_items')
        .insert({
            category_id: params.categoryId,
            title: params.title,
            description: params.description || null,
            priority: params.priority,
            status: 'aberto',
            created_by: params.userId,
            page_url: params.pageUrl,
            scroll_position: params.scrollPosition,
            viewport_size: params.viewportSize
        })
        .select()
        .single()

    if (itemError) {
        console.error('Error creating QA item:', itemError)
        throw new Error('Failed to create QA item')
    }

    // Create the evidence record
    const { error: evidenceError } = await supabase
        .from('qa_evidences')
        .insert({
            qa_item_id: qaItem.id,
            file_url: params.imageUrl,
            file_type: 'image/png'
        })

    if (evidenceError) {
        console.error('Error creating evidence:', evidenceError)
        throw new Error('Failed to create evidence record')
    }

    return qaItem.id
}

/**
 * Convert a canvas to a blob
 * @param canvas - The canvas element
 * @returns Promise resolving to a blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob)
            } else {
                reject(new Error('Failed to convert canvas to blob'))
            }
        }, 'image/png')
    })
}
