# Receta de Dashboard Pro: Qué métricas importan y cómo mostrarlas

Para un cliente, "menos es más". No pongas métricas técnicas como "Porcentaje de rebote" (que ya no existe en GA4 igual) o "Eventos por sesión". Muestrales **RESPUESTAS**.

Aquí tienes la **Estructura Ganadora** para una agencia web:

## 1. Fila Superior: Los "Titulares" (Tarjetas de Resultados)
Lo primero que ven. Responde: *¿Está creciendo mi negocio?*

*   **Usuarios Totales (Total Users):** Cuántas personas únicas entraron.
*   **Sesiones (Sessions):** Cuántas veces visitaron (una persona puede visitar 3 veces).
*   **Tiempo de interacción medio (Average Engagement Time):** CRUCIAL. Dice si leen tu contenido o se van al segundo.
    *   *Meta:* Arriba de 30 segundos es bueno.

## 2. Sección Izquierda: ¿De dónde vienen? (Gráfico de Barras o Pastel)
Responde: *¿Sirve mi Instagram? ¿Sirve el SEO?*

*   **Dimensión:** `Session source / medium` (Fuente/Medio de la sesión).
*   **Métrica:** `Sessions` o `Users`.
*   **Lo que verás:**
    *   `google / organic`: Gente que te buscó en Google (SEO).
    *   `direct / none`: Gente que escribió tu web directo (o WhatsApp).
    *   `instagram / referral`: Gente que vino desde Instagram.

## 3. Sección Central: ¿Qué miran? (Tabla con barras)
Responde: *¿Qué producto/servicio les interesa más?*

*   **Dimensión:** `Page title` (Título de la página) - *Es mejor que usar URL porque es más legible.*
*   **Métrica:** `Views` (Vistas).
*   **Tip:** Filtra para quitar la página de "Admin" o "Login" si no quieres que se vea.

## 4. Sección Derecha: ¿Dónde están? (Mapa de Burbujas o Geográfico)
Responde: *¿Son clientes locales o extranjeros?*

*   **Dimensión:** `City` (Ciudad).
*   **Métrica:** `Active Users`.
*   **Visual:** Mapa de Chile (Zoom al país). A los clientes les ENCANTA ver el mapa.

## 5. El "Chismoso": Desglose por Tecnología (Gráfico de Anillo)
Responde: *¿Debo invertir en versión móvil?*

*   **Dimensión:** `Device category` (Categoría de dispositivo).
*   **Métrica:** `Users`.
*   **Lo que verás:** Móvil vs Desktop. Si Móvil es 80%, ¡véndeles una mejora de diseño móvil!

---

**💡 Tip de Venta:**
Cuando entregues esto, di: *"No te doy datos, te doy inteligencia. Con este mapa sabrás si tienes que hacer publicidad en Santiago o en Concepción."*
