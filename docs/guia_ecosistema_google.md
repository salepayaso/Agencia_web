# Guía Profesional: Ecosistema de Datos Google para Clientes

Esta guía está diseñada para que expliques a tus clientes de **Interfaz 360** por qué implementamos estas herramientas y cuál es el valor de cada una, usando una analogía simple de "Construcción".

## 1. El Flujo de Trabajo (La Analogía de la Casa)

Cuando entregamos un sitio web, no solo entregamos "la casa", sino que instalamos un sistema de seguridad y monitoreo inteligente.

### 🏛️ Google Tag Manager (GTM) - "El Conserje / La Caja de Conexiones"
*   **Qué es:** Es una herramienta que instalamos **una sola vez** en el código del sitio.
*   **Para el cliente:** "Es el cerebro que nos permite conectar futuras herramientas de marketing (Facebook, Google Ads, LinkedIn) sin tener que volver a pagar horas de programación para abrir el código de la web. Ahorra tiempo y dinero a futuro."
*   **Función Clave:** Administra todas las etiquetas desde un panel externo.

### 📊 Google Analytics 4 (GA4) - "Las Cámaras de Seguridad"
*   **Qué es:** La herramienta de medición de tráfico.
*   **Para el cliente:** "Son las cámaras que nos dicen **qué pasa dentro de la casa**. ¿Cuánta gente entró? ¿Se quedaron en la sala (Home) o fueron a la cocina (Contacto)? ¿Desde qué ciudad vienen? ¿Usan celular o computador?"
*   **Función Clave:** Mide la comportamiento del usuario **dentro** del sitio.

### 🔍 Google Search Console (GSC) - "El Informe Médico / El Inspector"
*   **Qué es:** La herramienta de comunicación directa con Google.
*   **Para el cliente:** "Es el reporte de salud de la web ante los ojos de Google. Nos avisa si hay errores, si la web es lenta en celulares, y **por qué términos nos busca la gente** antes de entrar (SEO). Es vital para aparecer en las búsquedas."
*   **Función Clave:** Mide la visibilidad y salud técnica **antes** de que entren al sitio.

---

## 2. Diccionario Técnico de Google Tag Manager
Para que te manejes como un experto cuando veas la interfaz:

| Concepto | Nombre en GTM | Explicación Simple | Ejemplo |
| :--- | :--- | :--- | :--- |
| **Etiqueta** | **Tag** | **QUIÉN** envía la información. Es el "código" de la herramienta externa. | "Etiqueta de Google Analytics 4" |
| **Activador** | **Trigger** | **CUÁNDO** se debe activar esa etiqueta. | "Cuando alguien visita la página 'Gracias por su compra'" |
| **Variable** | **Variable** | **QUÉ** información específica transportar. | "El valor de la compra (ej: $50.000)" |
| **Contenedor** | **Container** | Es la "caja" que agrupa todo lo anterior de un sitio web específico. | "Contenedor www.cliente.cl" |
| **Publicar** | **Submit** | **CRÍTICO.** Nada funciona hasta que apretas este botón. Es como "Guardar cambios". | "Versión 2: Agregamos Pixel de Facebook" |

---

## 3. Flujo de Implementación Estándar (Tu receta)

1.  **Crear GTM:** Creas la cuenta y el contenedor. Obtienes el código `GTM-XXXX`.
2.  **Instalar en Web:** Pegas el código en el `<head>` y `<body>`. (Única vez que tocas código).
3.  **Configurar GA4:** Creas la propiedad en Analytics, copias el `G-XXXX` y haces una **Etiqueta** en GTM.
4.  **Verificar Search Console:** Usas el contenedor de GTM para verificar la propiedad automáticamente.
5.  **Publicar:** Haces clic en "Enviar" en GTM para que todo salga en vivo.

Con este stack, tu cliente tiene una web **Profesional, Medible y Escalable**.
