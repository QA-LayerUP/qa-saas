'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAnnotationCanvasProps {
    imageUrl: string
}

type Tool = 'select' | 'brush' | 'circle' | 'rectangle' | 'arrow' | 'eraser'

export function useAnnotationCanvas({ imageUrl }: UseAnnotationCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

    const [currentTool, setCurrentTool] = useState<Tool>('brush')
    const [color, setColor] = useState('#ef4444')
    const [strokeWidth, setStrokeWidth] = useState(3)

    const [history, setHistory] = useState<ImageData[]>([])
    const [redoStack, setRedoStack] = useState<ImageData[]>([])

    // container size vindo do componente (para calcular scale)
    const containerSizeRef = useRef<{ width: number, height: number } | null>(null)
    const setContainerSize = useCallback((size: { width: number, height: number }) => {
        containerSizeRef.current = size
    }, [])

    // Helper: salva estado para undo
    const saveState = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = ctxRef.current
        if (!canvas || !ctx) return
        try {
            const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
            setHistory(h => [...h, snap])
            setRedoStack([])
        } catch (e) {
            console.warn('saveState failed', e)
        }
    }, [])

    // Ref para guardar a imagem original para o "Clear"
    const originalImageRef = useRef<HTMLImageElement | null>(null)

    // Carrega imagem e desenha com scale adequado
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !imageUrl) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctxRef.current = ctx

        // 1. RESET CRÍTICO: Limpa estado anterior antes de carregar a nova imagem
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHistory([])
        setRedoStack([])
        originalImageRef.current = null

        const img = new Image()

        // 2. CORREÇÃO CORS: Só aplica crossOrigin para URLs remotas, não para Base64
        if (!imageUrl.startsWith('data:')) {
            img.crossOrigin = 'anonymous'
        }

        img.onload = () => {
            originalImageRef.current = img // Guarda referência para o Clear

            // Tamanho natural da imagem
            const naturalW = img.naturalWidth || img.width
            const naturalH = img.naturalHeight || img.height

            // Validação de segurança
            if (naturalW === 0 || naturalH === 0) return

            // Área disponível (container)
            const container = containerSizeRef.current
            const availW = container?.width ? Math.max(200, container.width - 64) : Math.min(naturalW, 1200)
            const availH = container?.height ? Math.max(200, container.height - 160) : Math.min(naturalH, 800)

            // Calcula scale para caber na área disponível
            const scale = Math.min(1, Math.min(availW / naturalW, availH / naturalH))

            // Device pixel ratio para manter nitidez
            const DPR = window.devicePixelRatio || 1
            const targetW = Math.round(naturalW * scale)
            const targetH = Math.round(naturalH * scale)

            // Configura tamanho real do canvas (pixels)
            canvas.width = Math.round(targetW * DPR)
            canvas.height = Math.round(targetH * DPR)

            // Configura tamanho CSS (visualização)
            canvas.style.width = `${targetW}px`
            canvas.style.height = `${targetH}px`

            // Escala o contexto de desenho
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

            // Garante limpeza após redimensionar
            ctx.clearRect(0, 0, targetW, targetH)

            // Desenha a imagem
            ctx.drawImage(img, 0, 0, targetW, targetH)

            // Salva o estado inicial (Base) no histórico
            try {
                // Precisamos pegar os dados brutos do canvas real (com DPR aplicado ou não, dependendo da estratégia de undo)
                // Aqui pegamos o buffer inteiro do canvas
                const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
                setHistory([snap])
                setRedoStack([])
            } catch (e) {
                console.warn('initial getImageData failed', e)
            }
        }

        img.onerror = (e) => {
            console.error('Image load error', e)
        }

        // 3. Define o src por último para garantir o disparo do onload
        img.src = imageUrl

    }, [imageUrl]) // Removemos 'saveState' para evitar dependências circulares desnecessárias no load

    // Export (retorna Blob)
    const exportImage = useCallback((): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const canvas = canvasRef.current
            if (!canvas) return reject(new Error('Canvas not initialized'))
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Failed to export blob'))
                resolve(blob)
            }, 'image/png')
        })
    }, [])

    const undo = useCallback(() => {
        if (history.length <= 1) return
        setRedoStack(rs => [...rs, history[history.length - 1]])
        const newHist = history.slice(0, -1)
        setHistory(newHist)
        const previous = newHist[newHist.length - 1]
        if (previous && ctxRef.current) {
            ctxRef.current.putImageData(previous, 0, 0)
        }
    }, [history])

    const redo = useCallback(() => {
        if (redoStack.length === 0) return
        const next = redoStack[redoStack.length - 1]
        setRedoStack(rs => rs.slice(0, -1))
        setHistory(h => [...h, next])
        if (ctxRef.current) ctxRef.current.putImageData(next, 0, 0)
    }, [redoStack])

    const clear = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = ctxRef.current
        if (!canvas || !ctx) return

        // Limpa tudo
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Restaura a imagem original se existir
        if (originalImageRef.current) {
            // Precisamos recalcular o tamanho de desenho pois o canvas.width/height está com DPR
            // O contexto já está com transform aplicado, então desenhamos no tamanho lógico
            const dpr = window.devicePixelRatio || 1
            const logicalW = canvas.width / dpr
            const logicalH = canvas.height / dpr

            ctx.drawImage(originalImageRef.current, 0, 0, logicalW, logicalH)
        }

        saveState()
    }, [saveState])

    const addText = useCallback(() => {
        const ctx = ctxRef.current
        const canvas = canvasRef.current
        if (!ctx || !canvas) return
        ctx.font = `${24 + strokeWidth}px sans-serif`
        ctx.fillStyle = color
        ctx.fillText('Texto', 30, 60)
        saveState()
    }, [color, strokeWidth, saveState])

    return {
        canvasRef,
        currentTool,
        setCurrentTool,
        color,
        setColor,
        strokeWidth,
        setStrokeWidth,
        undo,
        redo,
        clear,
        addText,
        exportImage,
        canUndo: history.length > 1,
        canRedo: redoStack.length > 0,
        setContainerSize
    }
}