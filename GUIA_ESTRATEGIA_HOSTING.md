# Guía de Estrategia de Hosting y Negocios (cPanelHost)

Esta guía documenta cómo gestionar clientes, correos y alojamientos web utilizando **cPanelHost** como socio tecnológico.

## 1. La Pregunta Técnica Clave: Web vs. Correo
> "¿Para que el cliente tenga correo necesariamente tiene que tener el código de la pagina web en el hosting?"

**NO.** Son servicios independientes aunque se vendan juntos.

*   **Hosting Web**: Donde viven los archivos de la página (`.html`, `.js`, React).
*   **Hosting Correo**: Donde llegan los emails (`MX Records`).

### Escenario A: El Modelo "Híbrido Moderno" (Recomendado)
Usas lo mejor de cada mundo.
*   **Web**: Se aloja en **Vercel / Netlify** (Gratis, Rápido, CI/CD automático desde GitHub).
*   **Correo**: Se aloja en **cPanelHost** (Pago, confiable para emails corporativos).
*   **Configuración**: En el dominio comprada, apuntas los registros `MX` a cPanel y los registros `A/CNAME` a Vercel.

### Escenario B: El Modelo "Tradicional" (Todo en Uno)
Todo vive en cPanelHost.
*   **Web**: Subes la carpeta `dist` (build de React) al "Administrador de Archivos" del cPanel.
*   **Correo**: Funciona nativo en cPanel.
*   **Ventaja**: Un solo lugar para todo.
*   **Desventaja**: Subir cambios es manual (o requiere configurar FTP/Git complejo), no es tan rápido como Vercel.

---

## 2. Estrategias de Negocio: ¿Cómo cobrar?

### Opción 1: Modelo "Webmaster" (Revendedor / Ingreso Recurrente)
Tú eres la cara visible. El cliente no sabe que existe "cPanelHost", solo te conoce a ti.

*   **Flujo**:
    1.  Tú compras el plan en cPanelHost (~$37.990 CLP/año).
    2.  Tú configuras todo (Web + Correos).
    3.  Le cobras al cliente una **mensualidad** (ej: $25.000 CLP/mes) por "Mantenimiento, Hosting y Soporte".
    4.  **Tu Ganancia**: $300.000+ al año por cliente, restando el costo del hosting.
*   **Pros**: Generas sueldo pasivo mensual. Control total.
*   **Contras**: Si el correo falla, te llaman a TI. Tú debes dar soporte (y escalarlo a cPanelHost si es técnico).

### Opción 2: Modelo "Referido" (Pago Único)
Entregas el proyecto "llave en mano" y te desligas.

*   **Flujo**:
    1.  Haces que el cliente compre el hosting con su tarjeta (o s lo compras tú y te reembolsa).
    2.  Configuras todo una vez.
    3.  Entregas las claves al cliente.
    4.  Te vas.
*   **Pros**: Cero responsabilidad futura. Dinero rápido.
*   **Contras**: Pierdes el ingreso mensual recurrente. El cliente podría romper algo.

---

## 3. Guía Paso a Paso: Empezando con un Cliente Nuevo (Modelo Webmaster)

Supongamos que eliges el **Modelo Webmaster** (Recomendado para crecer) y el **Escenario Híbrido** (Mejor tecnología).

1.  **Compra del Dominio**: Compra `empresa-cliente.cl` en NIC Chile (o pídele al cliente que lo compre a tu nombre administrativo).
2.  **Compra del Hosting**: Ve a cPanelHost y contrata el plan anual Básico para `empresa-cliente.cl`.
3.  **Configuración DNS**:
    *   En cPanelHost, busca los servidores de correo (MX).
    *   En NIC Chile (o Cloudflare), apunta los DNS.
4.  **Creación de Correos**:
    *   Entra al cPanel -> "Cuentas de Correo Electrónico".
    *   Crea `contacto@empresa-cliente.cl`, `ventas@...`.
    *   Entrega al cliente: Usuario, Contraseña y Link de Webmail (o guía para Outlook).
5.  **Publicación Web**:
    *   Sube el código a tu GitHub (Privado).
    *   Conecta Vercel a ese repo.
6.  **Facturación**:
    *   Programa tu cobro mensual al cliente.

## 4. Preguntas Frecuentes

**¿Debo crear cuentas de correo para mi o para el cliente?**
Crea las que el cliente necesite (`nombre@empresa.cl`). Tú quédate con el acceso administrativo al cPanel ("root" de esa cuenta) por si hay que resetear claves.

**¿Si dejo de trabajar con el cliente?**
Si están en el Modelo Webmaster, simplemente dejas de renovar el servicio o le "transfieres" la cuenta de cPanelHost para que él empiece a pagar directo.

---

## 5. Escalando: ¿Un Hosting por Cliente o Uno Para Todos?
> "Si tengo otro cliente, ¿tengo que comprar otro hosting?"

Al principio, **SÍ**. Esa es la estrategia más segura.

### Estrategia A: Un Plan por Cliente (Recomendada para empezar, 1-10 clientes)
Compras un "Plan Emprendedor" separado para cada cliente.
*   **Ventaja**: Seguridad. Si un cliente se infecta con virus, no afecta a los otros. Si un cliente no paga, solo se cae su sitio, no el de los demás.
*   **Gestión**: Entras al cPanel de cada uno por separado.

### Estrategia B: Hosting "Reseller" (Recomendada para +10 clientes)
Compras un "Plan Mayorista" (Reseller) que es como un disco duro gigante que tú particionas.
*   **Ventaja**: Más barato por unidad. Pagas ~300.000 anuales por un plan grande y metes ahí 20 clientes.
*   **Desventaja**: Si se cae el servidor, se caen TODOS tus clientes. Requiere más conocimientos técnicos (WHM).

**Conclusión**: Empieza con la **Estrategia A**. Compra un hosting individual para cada cliente nuevo. Cobra esa costo dentro de tu tarifa de inicio.
