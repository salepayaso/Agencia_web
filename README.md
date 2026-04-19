# Interfaz 360 | Agencia de Diseño Web & SEO

![Interfaz 360 Logo](public/logo%20sin%20fondo%20optimizado.png)

> **Transformamos visibilidad en conversión con tecnología de vanguardia.**

Este repositorio contiene el código fuente de la plataforma oficial de **Interfaz 360**, una agencia especializada en soluciones digitales de alto rendimiento.

---

## 🚀 Tecnologías y Herramientas

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) (Arquitectura rápida y modular).
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) (Diseño responsivo y utilitario).
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/) (Experiencias interactivas premium).
- **Despliegue**: [Vercel](https://vercel.com/) (Optimización automática y Edge Network).
- **Infraestructura**: Cloudflare para la gestión de DNS y seguridad.

---

## ⚡ Optimización de Rendimiento (WPO)

Hemos implementado mejoras críticas para asegurar una carga ultra rápida, logrando un **Largest Contentful Paint (LCP)** optimizado:

- **Optimización de Imágenes**: Conversión masiva de assets pesados (.png) a formatos ligeros (.jpg) con reducciones de hasta el 90% en peso.
- **Resource Preloading**: Implementación de etiquetas `preload` en el HTML para recursos críticos (Hero & Logo).
- **DNS Directo**: Configuración de Cloudflare en modo "DNS Only" para permitir que Vercel gestione la seguridad y optimización de tráfico directamente.
- **Lazy Loading**: Carga diferida de componentes e imágenes fuera del área visible.

---

## 🔒 Seguridad y Mantenimiento

- **Gestión de Secretos**: El archivo `.env` está estrictamente ignorado en Git para proteger las claves de API y base de datos.
- **Gestión de Datos**: Uso de variables de entorno seguras para la conexión con el backend y base de datos.
- **Archivos Estáticos**: Ubicados en `/public` para ser servidos directamente (sitemap, robots.txt, assets).

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Construir para producción
npm run build
```

---

## 📞 Conectemos

- **Web**: [www.interfaz360.cl](https://www.interfaz360.cl)

---
*Desarrollado con ❤️ por Interfaz 360.*
