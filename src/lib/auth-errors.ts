interface AuthError {
  message?: string
  code?: string
}

export function translateAuthError(error: AuthError | null | undefined): string {
  if (!error) return 'Ocorreu um erro ao processar sua solicitação.'

  const message = (error.message as string | undefined)?.toLowerCase() ?? ''

  // Erros de login / credenciais
  if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
    return 'Credenciais inválidas. Verifique seu e-mail e senha.'
  }

  if (message.includes('email not confirmed') || message.includes('email not confirmed')) {
    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.'
  }

  // Erros de cadastro
  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'Este e-mail já está cadastrado. Tente fazer login.'
  }

  if (message.includes('password should be at least') || message.includes('password is too short')) {
    return 'A senha é muito curta. Use pelo menos 6 caracteres.'
  }

  if (message.includes('email rate limit exceeded')) {
    return 'Limite de tentativas atingido. Tente novamente em alguns minutos.'
  }

  // Fallback genérico em português
  return 'Não foi possível completar a ação. Detalhes: ' + (error.message ?? 'erro desconhecido.')
}


