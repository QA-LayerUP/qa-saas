/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    let browser = null;
    let page = null;

    try {
        const body = await req.json();
        const { 
            url, 
            width = 1280, 
            height = 800, 
            fullPage = false 
        } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Garantir protocolo HTTP/HTTPS se não houver
        let targetUrl = url;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = `https://${targetUrl}`;
        }

        // Validar e normalizar parâmetros numéricos
        const normalizedWidth = Math.max(800, Math.min(Number(width) || 1280, 4000));
        const normalizedHeight = Math.max(600, Math.min(Number(height) || 800, 4000));

        console.log(`[SCREENSHOT] ===========================================`);
        console.log(`[SCREENSHOT] Iniciando captura`);
        console.log(`[SCREENSHOT] URL: ${targetUrl}`);
        console.log(`[SCREENSHOT] Viewport: ${normalizedWidth}x${normalizedHeight}`);
        console.log(`[SCREENSHOT] FullPage: ${fullPage}`);

        let executablePath: string;

        if (process.env.NODE_ENV === "development") {
            // Em dev, usa o puppeteer local
            const localPuppeteer = await import("puppeteer");
            executablePath = localPuppeteer.executablePath();
            console.log(`[SCREENSHOT] Modo: DESENVOLVIMENTO`);
        } else {
            // Em prod (Vercel)
            executablePath = await chromium.executablePath();
            console.log(`[SCREENSHOT] Modo: PRODUÇÃO`);
        }

        console.log(`[SCREENSHOT] Executable: ${executablePath}`);

        browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--single-process=false",
                "--disable-extensions",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-default-apps",
                "--disable-popup-blocking",
                "--disable-prompt-on-repost",
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
                "--disable-backgrounding-occluded-windows",
            ],
            executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
            timeout: 30000,
        });

        console.log(`[SCREENSHOT] Browser iniciado`);

        page = await browser.newPage();

        // Define user agent para parecer um browser real
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Define o viewport
        await page.setViewport({
            width: normalizedWidth,
            height: normalizedHeight,
        });

        console.log(`[SCREENSHOT] Viewport configurado: ${normalizedWidth}x${normalizedHeight}`);

        // Habilita a interception de requisições
        await page.setRequestInterception(true);

        let requestsIntercepted = 0;
        let requestsContinued = 0;

        page.on('request', (request) => {
            requestsIntercepted++;
            request.continue().catch(() => {});
            requestsContinued++;
        });

        console.log(`[SCREENSHOT] Navegando para ${targetUrl}...`);

        let navigationSuccess = false;
        let lastError: any = null;

        // Tenta diferentes estratégias de wait
        const waitStrategies = [
            { waitUntil: "domcontentloaded" as const, timeout: 20000, name: "domcontentloaded" },
            { waitUntil: "networkidle2" as const, timeout: 20000, name: "networkidle2" },
            { waitUntil: "networkidle0" as const, timeout: 15000, name: "networkidle0" },
        ];

        for (const strategy of waitStrategies) {
            try {
                console.log(`[SCREENSHOT] Tentando: ${strategy.name}...`);
                await page.goto(targetUrl, {
                    waitUntil: strategy.waitUntil,
                    timeout: strategy.timeout,
                });
                navigationSuccess = true;
                console.log(`[SCREENSHOT] ✅ Navegação bem-sucedida com: ${strategy.name}`);
                break;
            } catch (error) {
                lastError = error;
                console.warn(`[SCREENSHOT] ⚠️  ${strategy.name} falhou:`, (error as Error).message);
            }
        }

        if (!navigationSuccess) {
            console.warn(`[SCREENSHOT] ⚠️  Todas as estratégias de navegação falharam, continuando mesmo assim...`);
            console.warn(`[SCREENSHOT] Último erro:`, lastError?.message);
        }

        console.log(`[SCREENSHOT] Requisições interceptadas: ${requestsIntercepted}, Continuadas: ${requestsContinued}`);

        // Aguarda conteúdo dinâmico
        console.log(`[SCREENSHOT] Aguardando 2 segundos para renderização...`);
        await page.waitForTimeout(2000);

        // Remove scroll
        try {
            await page.evaluate(() => {
                window.scrollTo(0, 0);
            });
            console.log(`[SCREENSHOT] Scroll resetado`);
        } catch (e) {
            console.warn(`[SCREENSHOT] Erro ao resetar scroll:`, (e as Error).message);
        }

        let screenshotBuffer: Buffer;

        try {
            console.log(`[SCREENSHOT] Iniciando screenshot...`);

            if (fullPage) {
                screenshotBuffer = await page.screenshot({
                    type: "jpeg",
                    quality: 90,
                    fullPage: true,
                }) as Buffer;
            } else {
                screenshotBuffer = await page.screenshot({
                    type: "png",
                    encoding: "binary",
                    fullPage: false,
                }) as Buffer;
            }

            console.log(`[SCREENSHOT] ✅ Screenshot capturado: ${screenshotBuffer.length} bytes`);

            if (!screenshotBuffer || screenshotBuffer.length === 0) {
                console.error(`[SCREENSHOT] ❌ Buffer vazio!`);
                throw new Error("Screenshot buffer está vazio");
            }

            if (screenshotBuffer.length < 1000) {
                console.warn(`[SCREENSHOT] ⚠️  Screenshot muito pequeno (${screenshotBuffer.length} bytes), pode estar em branco`);
            }

        } catch (captureError) {
            console.error(`[SCREENSHOT] ❌ Erro ao capturar screenshot:`, (captureError as Error).message);
            throw captureError;
        }

        // Fecha o browser
        await browser.close();
        console.log(`[SCREENSHOT] Browser fechado com sucesso`);
        console.log(`[SCREENSHOT] ===========================================`);

        return new NextResponse(screenshotBuffer as any, {
            status: 200,
            headers: {
                "Content-Type": fullPage ? "image/jpeg" : "image/png",
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Length": screenshotBuffer.length.toString(),
            },
        });

    } catch (error: any) {
        console.error(`[SCREENSHOT] ❌ ERRO NA CAPTURA:`, error);
        console.error(`[SCREENSHOT] Stack:`, error?.stack);
        
        // Fecha o browser de forma segura
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error(`[SCREENSHOT] ❌ Erro ao fechar browser:`, (closeError as Error).message);
            }
        }

        console.log(`[SCREENSHOT] ===========================================`);

        return NextResponse.json(
            { 
                error: "Falha ao capturar imagem", 
                details: error?.message || "Erro desconhecido"
            },
            { status: 500 }
        );
    }
}