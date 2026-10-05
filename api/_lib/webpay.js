// Cliente REST de Webpay Plus (Transbank). Mismo enfoque que DriveStock:
// la API son tres llamados HTTP con dos cabeceras, así que no usamos el SDK.
// Documentación: https://www.transbankdevelopers.cl/documentacion/webpay-plus
//
// Variables de entorno (Vercel):
//   TBK_AMBIENTE        integracion | produccion
//   TBK_COMMERCE_CODE   código de comercio (solo producción)
//   TBK_API_KEY         Tbk-Api-Key-Secret (solo producción)
//
// En integración se usan las credenciales públicas de prueba de Transbank:
// se puede probar todo sin contrato. Esas transacciones no cobran nada.

const CREDENCIALES_PRUEBA = {
    commerceCode: '597055555532',
    apiKey: '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
};

const HOSTS = {
    integracion: 'https://webpay3gint.transbank.cl',
    produccion: 'https://webpay3g.transbank.cl',
};

const RUTA = '/rswebpaytransaction/api/webpay/v1.2/transactions';

function config() {
    const produccion = process.env.TBK_AMBIENTE === 'produccion';
    const commerceCode = process.env.TBK_COMMERCE_CODE || '';
    const apiKey = process.env.TBK_API_KEY || '';

    if (produccion && (!commerceCode || !apiKey)) {
        throw new Error('Faltan TBK_COMMERCE_CODE / TBK_API_KEY en producción.');
    }
    // El sitio en línea nunca cobra contra el comercio de prueba: ese "pago"
    // se vería aprobado pero no abona nada.
    if (!produccion && process.env.VERCEL_ENV === 'production') {
        throw new Error('Webpay en integración dentro de producción: falta TBK_AMBIENTE=produccion.');
    }

    return {
        host: produccion ? HOSTS.produccion : HOSTS.integracion,
        commerceCode: commerceCode || CREDENCIALES_PRUEBA.commerceCode,
        apiKey: apiKey || CREDENCIALES_PRUEBA.apiKey,
    };
}

async function llamar(metodo, ruta, cuerpo) {
    const { host, commerceCode, apiKey } = config();
    const res = await fetch(host + ruta, {
        method: metodo,
        headers: {
            'Tbk-Api-Key-Id': commerceCode,
            'Tbk-Api-Key-Secret': apiKey,
            'Content-Type': 'application/json',
        },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    const texto = await res.text();
    if (!res.ok) {
        // El detalle queda en el log de Vercel, no se devuelve al navegador.
        console.error('[webpay] %s %s → %s %s', metodo, ruta, res.status, texto);
        throw new Error(`Transbank respondió ${res.status}`);
    }
    return texto ? JSON.parse(texto) : {};
}

/** Crea la transacción. Devuelve { token, url }: el navegador hace POST a url con token_ws. */
export function crearTransaccion({ buyOrder, sessionId, amount, returnUrl }) {
    return llamar('POST', RUTA, {
        buy_order: buyOrder,
        session_id: sessionId,
        amount,
        return_url: returnUrl,
    });
}

/** Confirma la transacción. Sin este commit el cobro no se cursa y Transbank lo reversa. */
export function confirmarTransaccion(token) {
    return llamar('PUT', `${RUTA}/${encodeURIComponent(token)}`);
}

/** Transbank exige las dos condiciones; mirar solo una deja pasar pagos no cursados. */
export const estaAprobada = (pago) => pago?.response_code === 0 && pago?.status === 'AUTHORIZED';
