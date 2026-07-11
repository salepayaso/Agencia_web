import net from 'node:net';

// Valida y normaliza el nombre: acepta "midominio" o "midominio.cl",
// devuelve solo el nombre sin extensión, o null si es inválido.
export function normalizeDomain(raw) {
    const name = String(raw || '').toLowerCase().trim().replace(/\.cl$/, '');
    if (name.length < 2 || name.length > 63) return null;
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name)) return null;
    return name;
}

// Consulta el servidor WHOIS oficial de NIC Chile (puerto 43).
export function queryWhoisCl(domain) {
    return new Promise((resolve, reject) => {
        // family: 4 evita intentos IPv6 fallidos (el servidor publica AAAA
        // pero la conexión IPv6 no siempre está disponible).
        const socket = net.createConnection({ host: 'whois.nic.cl', port: 43, family: 4 });
        let data = '';

        socket.setTimeout(8000);
        socket.on('connect', () => socket.write(`${domain}\r\n`));
        socket.on('data', (chunk) => { data += chunk.toString('utf8'); });
        socket.on('end', () => resolve(data));
        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('WHOIS timeout'));
        });
        socket.on('error', reject);
    });
}

// NIC.cl a veces rechaza conexiones muy seguidas: un reintento corto lo cubre.
export async function queryWhoisClWithRetry(domain, retries = 3, delayMs = 600) {
    try {
        return await queryWhoisCl(domain);
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise((r) => setTimeout(r, delayMs));
        return queryWhoisClWithRetry(domain, retries - 1, delayMs * 2);
    }
}

// NIC.cl responde "no entries found" cuando el dominio no está registrado.
export function parseWhoisResponse(domain, raw) {
    const available = /no entries found/i.test(raw);
    let expiration = null;

    if (!available) {
        const match = raw.match(/Expiration date:\s*([^\r\n]+)/i);
        if (match) expiration = match[1].trim();
    }

    return { domain, available, expiration };
}
