// Logo de Interfaz 360, versión "Sello": INTERFAZ en texto y el 360 dentro
// de un bloque naranja (el mismo bloque es el ícono del sitio). Al ser texto
// carga al instante y se ve nítido en cualquier tamaño. El tamaño lo da className.
const Wordmark = ({ className = 'text-xl' }) => (
    <span
        className={`inline-flex items-center font-brand font-extrabold uppercase leading-none whitespace-nowrap ${className}`}
        style={{ fontStretch: '96%', letterSpacing: '0.01em' }}
    >
        Interfaz
        <span
            className="font-black text-white"
            style={{
                background: '#e8471c',
                marginLeft: '0.16em',
                padding: '0.13em 0.16em 0.09em',
                lineHeight: 0.74,
                letterSpacing: 0,
            }}
        >
            360
        </span>
    </span>
);

export default Wordmark;
