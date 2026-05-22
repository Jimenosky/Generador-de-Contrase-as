# 🔐 Generador de Contraseñas Seguras

Aplicación web estática desarrollada con **HTML5, CSS3 y JavaScript Vanilla** que genera contraseñas seguras consumiendo la [API de API-Ninjas](https://api-ninjas.com/api/passwordgenerator), con un generador local como fallback automático.

---

## 🗂 Estructura del proyecto

```
├── index.html   → Estructura y marcado semántico
├── style.css    → Estilos, diseño responsivo y modo oscuro
├── app.js       → Lógica, llamada a la API y manejo de errores
└── README.md    → Esta documentación
```

---

## ✨ Características

- Longitud configurable entre **4 y 32 caracteres**
- Opciones para incluir **números** y **caracteres especiales**
- Petición `fetch` a la API de API-Ninjas con autenticación por header `X-Api-Key`
- Manejo de errores con `try/catch`: si la API falla, activa un **generador local criptográfico** (`crypto.getRandomValues`) como respaldo
- Mensajes de estado visibles y diferenciados (éxito, advertencia, error)
- Botón **Copiar** con feedback visual directo (`¡Copiado!`) y fallback para navegadores sin permisos de portapapeles
- Diseño responsivo con modo oscuro y animaciones sutiles

---

## 🚀 Cómo ejecutar localmente

> ⚠️ **Importante:** abrir `index.html` directamente con doble clic (`file://`) bloqueará la llamada `fetch` por restricciones CORS del navegador. Se debe usar un servidor local.

### Opción 1 — VS Code + Live Server (recomendado)

1. Instalar la extensión **Live Server** de Ritwick Dey en VS Code.
2. Abrir la carpeta del proyecto en VS Code.
3. Hacer clic derecho en `index.html` → **"Open with Live Server"**.
4. El navegador abrirá `http://127.0.0.1:5500` automáticamente.

### Opción 2 — Python 3

```powershell
# Desde la carpeta raíz del proyecto
python -m http.server 5500
```

Luego abrir: [http://localhost:5500](http://localhost:5500)

### Opción 3 — Node.js / npx

```powershell
npx http-server -p 5500
```

Luego abrir: [http://localhost:5500](http://localhost:5500)

---

## 🔑 Nota sobre la API Key

La clave de autenticación se incluye directamente en `app.js` **por requerimiento explícito de esta prueba técnica**.  
En un entorno de producción real, esta clave **nunca** debería exponerse en el cliente; lo correcto sería delegar la llamada a la API a un backend o proxy seguro.

---

## 🛡 Manejo de errores

| Escenario | Comportamiento |
|---|---|
| API responde correctamente | Contraseña mostrada en blanco, mensaje de éxito en verde |
| API falla / sin internet | Fallback local activado, contraseña en amarillo, mensaje de advertencia |
| Longitud fuera de rango (< 4 o > 32) | Mensaje de error en rojo, foco devuelto al input |
| Portapapeles bloqueado | Fallback con `execCommand('copy')`, o mensaje para copiar manualmente |

---

## ✅ Checklist de requisitos

- [x] Estructura HTML5 semántica
- [x] Estilos modernos, responsivos y modo oscuro
- [x] Input numérico para longitud y checkboxes para opciones
- [x] Petición `fetch` GET a la API de API-Ninjas con `X-Api-Key` en headers
- [x] Parámetros enviados como Query Strings en la URL
- [x] Bloque `try/catch` con mensajes de error amigables para el usuario
- [x] Algoritmo de fallback local con `crypto.getRandomValues`
- [x] Botón Copiar con feedback visual (`¡Copiado!`) y fallback
- [x] Botón Copiar deshabilitado hasta que se genere una contraseña
- [x] Validación de rango de longitud antes de llamar a la API
