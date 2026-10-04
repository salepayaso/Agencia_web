// Datos legales de la empresa. Los usan la Política de Privacidad y los
// Términos. Si alguno queda vacío, las páginas lo muestran marcado como pendiente.
// El domicilio se publica solo como ciudad, a pedido de la empresa: la dirección
// legal completa no se expone en el sitio.
export const EMPRESA = {
    marca: 'Interfaz 360',
    razonSocial: 'Interfaz 360 SpA',
    rut: '78.527.166-1',
    constituida: '4 de octubre de 2026',
    domicilio: 'Santiago, Chile',
    correoDatos: 'contacto@interfaz360.cl',
};

// Fecha visible en las páginas legales. Cambiarla cada vez que se modifiquen.
export const LEGAL_ACTUALIZADO = '4 de octubre de 2026';

export const pendiente = (valor, etiqueta) => valor || `[${etiqueta} por completar]`;
