# Interfaz 360

Sitio web oficial de **Interfaz 360**, estudio de desarrollo web, software a medida y automatización con IA.

🌐 [www.interfaz360.cl](https://www.interfaz360.cl)

## Funcionalidades

- Sitio corporativo con servicios, portafolio y páginas legales.
- Asistente virtual con IA integrado en el chat del sitio.
- Formulario de contacto y búsqueda de dominios.
- Portal de clientes con acceso autenticado.
- Chequeo automático diario del estado del sitio.

## Stack

| Área          | Tecnología                                  |
| ------------- | ------------------------------------------- |
| Frontend      | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend       | Funciones serverless en Vercel (`/api`)     |
| Datos y auth  | Supabase                                    |
| IA            | Claude API (Anthropic)                      |
| Correo        | Resend                                      |
| Infraestructura | Vercel, Cloudflare DNS                    |

## Desarrollo local

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción
npm run lint      # análisis estático
npm run checkup   # chequeo de estado del sitio
```

Las variables de entorno se configuran en un archivo `.env` local (excluido del repositorio) y en el panel de Vercel para producción.

## Estructura

```
api/        Funciones serverless (chat, contacto, dominios, mantenimiento)
checkup/    Chequeo automático del sitio
public/     Recursos estáticos
src/        Aplicación React (páginas y componentes)
```

## Licencia

© 2026 Interfaz 360. Todos los derechos reservados.
