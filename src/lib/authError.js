// Supabase responde en inglés: lo traducimos a algo que el cliente entienda.
export const authError = (error) => {
    const msg = (error?.message || '').toLowerCase();
    if (msg.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
    if (msg.includes('email not confirmed')) return 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.';
    if (msg.includes('rate limit') || msg.includes('too many')) return 'Demasiados intentos. Espera unos minutos y vuelve a intentar.';
    if (msg.includes('should be at least') || msg.includes('password should')) return 'La contraseña debe tener al menos 8 caracteres.';
    if (msg.includes('same') && msg.includes('password')) return 'La nueva contraseña debe ser distinta a la anterior.';
    if (msg.includes('expired') || msg.includes('invalid')) return 'El enlace expiró o no es válido. Pide uno nuevo.';
    if (msg.includes('fetch') || msg.includes('network')) return 'No pudimos conectarnos. Revisa tu conexión.';
    return 'Algo salió mal. Intenta de nuevo o escríbenos a soporte.';
};
