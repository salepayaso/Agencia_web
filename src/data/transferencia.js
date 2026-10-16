// Datos para pagar por transferencia: el único lugar donde viven (sitio y correos).
// Mientras la SpA no tenga cuenta bancaria, banco/tipo/número quedan en null y el
// sitio sigue diciendo "te enviamos los datos por correo". Al abrir la cuenta,
// basta con llenarlos aquí y publicar.

export const TRANSFERENCIA = {
    titular: 'Interfaz 360 SpA',
    rut: '78.527.166-1',
    banco: null,       // p. ej. 'Banco de Chile'
    tipoCuenta: null,  // p. ej. 'Cuenta corriente'
    numero: null,
    correo: 'contacto@interfaz360.cl',
};

export const transferenciaLista = () => Boolean(TRANSFERENCIA.banco && TRANSFERENCIA.tipoCuenta && TRANSFERENCIA.numero);

/** [etiqueta, valor] en el orden en que se copian a la app del banco. */
export const filasTransferencia = () => [
    ['Titular', TRANSFERENCIA.titular],
    ['RUT', TRANSFERENCIA.rut],
    ['Banco', TRANSFERENCIA.banco],
    ['Tipo de cuenta', TRANSFERENCIA.tipoCuenta],
    ['N.º de cuenta', TRANSFERENCIA.numero],
    ['Correo para el aviso', TRANSFERENCIA.correo],
];
