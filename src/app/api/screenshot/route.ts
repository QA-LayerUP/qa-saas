/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

// Importações dinâmicas são essenciais aqui para evitar carregar binários pesados onde não deve
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

// Aumenta o timeout de execução (se estiver no plano Pro do Vercel, ajuda)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { url, width, height, x = 0, y = 0, deviceScaleFactor = 1 } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        let executablePath: string;

        if (process.env.NODE_ENV === "development") {
            // CAMINHO LOCAL: Ajuste conforme seu SO. 
            // No Mac geralmente é: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
            // No Windows: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
            // No Linux: /usr/bin/google-chrome

            // Dica: Instale 'puppeteer' como devDependency e use o caminho dele:
            const localPuppeteer = await import("puppeteer");
            executablePath = localPuppeteer.executablePath();
        } else {
            // PRODUÇÃO (Vercel)
            // É necessário configurar fontes para renderizar texto corretamente
            await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
            executablePath = await chromium.executablePath();
        }

        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: {
                width: width || 1280,
                height: height || 800,
                deviceScaleFactor: deviceScaleFactor || 1,
            },
            executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        // Tenta carregar a página
        await page.goto(url, {
            waitUntil: "domcontentloaded", // Mais rápido que networkidle2, evita timeout em sites pesados
            timeout: 30000, // Aumentado para 30s
        });

        // Espera um pouco mais para garantir que estilos/imagens carreguem (opcional, mas ajuda)
        // await new Promise(r => setTimeout(r, 2000));

        // Tira o print com clip para pegar exatamente o viewport do usuário
        const screenshot = await page.screenshot({
            type: "png",
            clip: {
                x: x,
                y: y,
                width: width || 1280,
                height: height || 800
            }
        });

        await browser.close();

        return new NextResponse(screenshot as any, {
            status: 200,
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });

    } catch (error: any) {
        console.error("SCREENSHOT ERROR:", error);
        return NextResponse.json(
            { error: "Falha ao capturar imagem", details: error.message },
            { status: 500 }
        );
    }
}