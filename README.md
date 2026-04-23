# FeedPro - Sistema Local de Gestión de Feedlot

Sistema integral de gestión para feedlots **100% local**. No requiere servidor ni conexión a internet.

## 🚀 Características

- ✅ **Sin login requerido** - Abre y usa directamente
- ✅ **100% Offline** - Funciona sin internet
- ✅ **Almacenamiento local** - Datos guardados en el navegador
- ✅ **Exportación/Importación** - Respalda tus datos en JSON
- ✅ **Responsive** - Funciona en desktop, tablet y móvil

## 📦 Módulos incluidos

- **Dashboard** - Panel general con estadísticas
- **Animales** - Registro y seguimiento de ganado
- **Sanidad** - Tratamientos y vacunación
- **Insumos** - Control de stock de alimentos
- **Dietas** - Formulación nutricional
- **Suministro** - Control de alimentación (Bunk)
- **Corrales** - Gestión de espacios
- **Reportes** - Análisis y estadísticas
- **Personal** - Gestión de empleados
- **Gastos** - Control de costos

## 🚀 Cómo usar

### Opción 1: Abrir directamente
1. Navega a la carpeta del proyecto
2. Haz doble clic en `index.html`
3. ¡Listo! La app se abre en tu navegador

### Opción 2: Servidor local simple (opcional)
Si prefieres usar un servidor local:

```bash
# Python 3
python -m http.server 8080

# Node.js (si tienes http-server instalado)
npx http-server -p 8080

# PHP
php -S localhost:8080
```

Luego abre `http://localhost:8080` en tu navegador.

## 💾 Respaldo de datos

Los datos se almacenan en el **localStorage** de tu navegador.

### Para respaldar:
1. Ve a la sección **Administración**
2. Haz clic en **Exportar Datos**
3. Guarda el archivo JSON en tu computadora

### Para restaurar:
1. Ve a la sección **Administración**
2. Haz clic en **Importar Datos**
3. Selecciona tu archivo JSON de respaldo

## ⚠️ Importante

- Los datos se guardan **solo en el navegador** donde abres la app
- Si borras los datos del navegador, perderás la información
- Para usar en otro navegador/computadora, exporta e importa los datos

## 🛠️ Tecnologías

- HTML5 / CSS3 / JavaScript vanilla
- Chart.js para gráficos
- SheetJS para exportar a Excel
- LocalStorage para persistencia de datos

## 📄 Versión

v2.0 Local - Modo Offline

---

**Nota:** Esta es una versión local simplificada. No incluye sincronización en la nube, multiusuario, ni acceso remoto.
