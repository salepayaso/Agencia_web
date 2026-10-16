import { clp } from '../lib/orders';
import { filasTransferencia } from '../data/transferencia';

// Comprobante de un pago en línea, al volver de Webpay o Mercado Pago. Transbank
// pide mostrar estos datos al cliente para validar el comercio: orden de compra,
// monto, fecha, código de autorización, tipo de pago, cuotas y últimos 4 dígitos.
// info = payment_info del pedido o del pago de cotización (api/webpay/retorno.js,
// api/_lib/mercadopago.js).

const TIPO_WEBPAY = {
    VD: 'Débito',
    VP: 'Prepago',
    VN: 'Crédito, sin cuotas',
    VC: 'Crédito en cuotas',
    SI: 'Crédito, 3 cuotas sin interés',
    S2: 'Crédito, 2 cuotas sin interés',
    NC: 'Crédito, cuotas sin interés',
};

const TIPO_MP = {
    credit_card: 'Crédito',
    debit_card: 'Débito',
    prepaid_card: 'Prepago',
    account_money: 'Saldo de Mercado Pago',
};

const MEDIO = { webpay: 'Webpay (Transbank)', mp: 'Mercado Pago' };

const fechaHora = (v) => (v ? new Date(v).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : null);

const tipoPago = (method, info) => (method === 'webpay'
    ? TIPO_WEBPAY[info.payment_type_code] || info.payment_type_code
    : [TIPO_MP[info.card_type] || info.card_type, info.payment_type_code].filter(Boolean).join(' · '));

export const PaymentReceipt = ({ method, buyOrder, detail, amount, paidAt, info = {} }) => {
    const rows = [
        ['Comercio', 'Interfaz 360 SpA'],
        ['N.º de orden', buyOrder],
        ['Detalle', detail],
        ['Monto', amount != null ? clp(amount) : null],
        ['Fecha', fechaHora(info.transaction_date || paidAt)],
        ['Medio de pago', MEDIO[method]],
        ['Tipo de pago', tipoPago(method, info)],
        ['Cuotas', info.installments_number > 0 ? String(info.installments_number) : null],
        ['Tarjeta', info.card_last4 ? `**** ${String(info.card_last4).slice(-4)}` : null],
        ['Código de autorización', info.authorization_code],
    ].filter(([, v]) => v);

    return (
        <div className="receipt" role="group" aria-label="Comprobante de pago">
            <span className="eyebrow">Comprobante de pago</span>
            <dl>
                {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
            <p className="muted">Guárdalo como respaldo (una captura de pantalla sirve).</p>
        </div>
    );
};

/** Datos de la cuenta, para cuando transferenciaLista() es true. */
export const TransferData = ({ amount, reference }) => (
    <div className="receipt" role="group" aria-label="Datos para transferir">
        <span className="eyebrow">Datos para transferir</span>
        <dl>
            {filasTransferencia().map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            {amount != null && <div><dt>Monto</dt><dd>{clp(amount)}</dd></div>}
            {reference && <div><dt>Comentario</dt><dd>{reference}</dd></div>}
        </dl>
        <p className="muted">Avísanos al correo cuando transfieras y confirmamos tu pago apenas llegue.</p>
    </div>
);
