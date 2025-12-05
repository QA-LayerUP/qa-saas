declare module 'dom-to-image' {
    export function toPng(
        node: HTMLElement,
        options?: {
            cacheBust?: boolean
            pixelRatio?: number
            width?: number
            height?: number
            quality?: number
            [key: string]: any
        }
    ): Promise<string>

    export function toJpeg(
        node: HTMLElement,
        options?: {
            quality?: number
            [key: string]: any
        }
    ): Promise<string>

    export function toBlob(node: HTMLElement, options?: any): Promise<Blob>

    export function toSvg(node: HTMLElement, options?: any): Promise<string>
}
