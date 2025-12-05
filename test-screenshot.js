// Script para testar a API de screenshot
const fetch = require('node-fetch');

async function testScreenshot() {
    try {
        console.log('🚀 Testando captura de screenshot...');
        
        const response = await fetch('http://localhost:3000/api/screenshot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: 'https://example.com',
                width: 1280,
                height: 800,
                fullPage: false
            })
        });

        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Erro:', error);
            return;
        }

        const blob = await response.blob();
        console.log(`✅ Screenshot capturado: ${blob.size} bytes`);
        
        // Salva em arquivo para inspeção
        const fs = require('fs');
        const buffer = await blob.arrayBuffer();
        fs.writeFileSync('/tmp/screenshot-test.png', Buffer.from(buffer));
        console.log('💾 Imagem salva em /tmp/screenshot-test.png');

    } catch (error) {
        console.error('❌ Erro ao testar:', error);
    }
}

testScreenshot();
