import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export function IframeBlockedWarning() {
    return (
        <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Não foi possível carregar o site</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
                <p>
                    O site não pôde ser carregado dentro do navegador do QA devido a restrições
                    de segurança do servidor (X-Frame-Options ou CSP).
                </p>
                <div className="mt-4">
                    <p className="font-semibold mb-2">Alternativas:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                            Solicitar ao time de Dev que libere <code className="bg-muted px-1 py-0.5 rounded">frame-ancestors</code> para
                            o domínio do SaaS
                        </li>
                        <li>
                            Usar captura manual de tela e enviar o arquivo diretamente
                        </li>
                        <li>
                            Criar uma tarefa simples com descrição detalhada
                        </li>
                    </ul>
                </div>
            </AlertDescription>
        </Alert>
    )
}
