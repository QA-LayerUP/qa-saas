// Script de teste para verificar acesso ao bucket Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBucket() {
    try {
        console.log('🔍 Testando acesso ao bucket "evidences"...');
        
        // Lista arquivos no bucket
        const { data, error } = await supabase.storage
            .from('evidences')
            .list('', { limit: 5 });

        if (error) {
            console.error('❌ Erro ao listar bucket:', error);
            return;
        }

        console.log('✅ Acesso ao bucket OK');
        console.log('📁 Arquivos encontrados:', data?.length);

        if (data && data.length > 0) {
            console.log('📄 Primeiros arquivos:');
            data.slice(0, 3).forEach((file) => {
                console.log(`  - ${file.name}`);
            });
        }

    } catch (error) {
        console.error('❌ Erro ao testar bucket:', error);
    }
}

testBucket();
