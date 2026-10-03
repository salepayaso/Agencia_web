// Datos legales de la empresa. Los usan la Política de Privacidad y los
// Términos. Se completan una sola vez acá cuando la SpA esté constituida.
// Mientras falte alguno, las páginas legales lo muestran marcado como pendiente.
export const EMPRESA = {
    marca: 'Interfaz 360',
    razonSocial: '', // ej: 'Interfaz 360 SpA'
    rut: '', // ej: '77.123.456-7'
    domicilio: '', // ej: 'Av. Ejemplo 123, Santiago, Región Metropolitana'
    correoDatos: 'contacto@interfaz360.cl',
};

// Fecha visible en las páginas legales. Cambiarla cada vez que se modifiquen.
export const LEGAL_ACTUALIZADO = '2 de octubre de 2026';

export const pendiente = (valor, etiqueta) => valor || `[${etiqueta} por completar]`;
