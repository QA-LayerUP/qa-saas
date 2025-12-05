/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/projects/:id/tasks
 * Accepts multipart/form-data (preferred) or JSON.
 * Fields accepted: category_id, title, description, priority, assigned_role, page_url
 * If `image` file is provided, uploads to storage and creates qa_evidences record.
 */
export async function POST(request: Request, context: { params: any }) {
  try {
    const params = await context.params
    const projectId = params.id

    const contentType = request.headers.get('content-type') || ''
    
    // Variáveis de campos
    let category_id: string | undefined
    let title: string | undefined
    let description: string | undefined
    let priority: string = 'media'
    let assigned_role: string | null = null
    let team_id: string | null = null
    let page_url: string | null = null // <--- NOVA VARIÁVEL
    
    // Variáveis de imagem
    let imageFile: File | null = null
    let imageBase64: string | null = null

    // Lógica de extração (Multipart vs JSON)
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      category_id = (form.get('category_id') as string) || undefined
      title = (form.get('title') as string) || undefined
      description = (form.get('description') as string) || undefined
      priority = (form.get('priority') as string) || priority
      assigned_role = (form.get('assigned_role') as string) || null
      team_id = (form.get('team_id') as string) || null
      
      // Captura a URL do form
      page_url = (form.get('page_url') as string) || null 

      const file = form.get('image') as File | null
      if (file && file.size) imageFile = file
    } else {
      const body = await request.json().catch(() => ({}))
      category_id = body?.category_id
      title = body?.title
      description = body?.description
      priority = body?.priority || priority
      assigned_role = body?.assigned_role || null
      team_id = body?.team_id || null
      
      // Captura a URL do JSON
      page_url = body?.page_url || null 

      // support base64 payload
      imageBase64 = body?.imageBase64 || null
    }

    if (!category_id || !title) {
      return NextResponse.json({ error: 'category_id and title are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }
    const user = authData.user
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Insert QA item
    const insertPayload: any = {
      // project_id e team_id REMOVIDOS conforme ajuste anterior
      category_id, 
      title,
      description: description || null,
      priority,
      status: 'aberto',
      created_by: user.id,
      assigned_role: assigned_role || null,
      page_url: page_url || null, // <--- ADICIONADO AO INSERT
    }

    const { data: itemData, error: itemError } = await supabase
      .from('qa_items')
      .insert([insertPayload])
      .select()
      .single()

    if (itemError) {
      console.error('Error inserting qa_item:', itemError)
      return NextResponse.json({ error: itemError.message || itemError }, { status: 500 })
    }

    // Handle image upload if provided
    try {
      let publicUrl: string | null = null

      if (imageFile) {
        const timestamp = Date.now()
        // Sanitiza o nome do arquivo para evitar caracteres estranhos
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${projectId}/${timestamp}-${safeName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('evidences')
          .upload(filename, imageFile, {
            contentType: imageFile.type || 'image/png',
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('evidences').getPublicUrl(uploadData.path)
        publicUrl = urlData.publicUrl
      } else if (imageBase64) {
        const matches = imageBase64.match(/^data:(image\/[^;]+);base64,(.+)$/)
        if (matches) {
          const mime = matches[1]
          const b64 = matches[2]
          const buffer = Buffer.from(b64, 'base64')
          const timestamp = Date.now()
          const filename = `${projectId}/${timestamp}-screenshot.png`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('evidences')
            .upload(filename, buffer, {
              contentType: mime,
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage.from('evidences').getPublicUrl(uploadData.path)
          publicUrl = urlData.publicUrl
        }
      }

      if (publicUrl) {
        const { data: evidenceData, error: evidenceError } = await supabase
          .from('qa_evidences')
          .insert({
            qa_item_id: itemData.id,
            file_url: publicUrl,
            file_type: 'image'
          })
          .select()
          .single()

        if (evidenceError) console.error('Error inserting evidence:', evidenceError)
      }
    } catch (uploadErr) {
      console.error('Error uploading evidence:', uploadErr)
      // Don't fail the whole request if image upload fails; return item with warning
    }

    return NextResponse.json({ item: itemData })
  } catch (err: any) {
    console.error('Create task error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}