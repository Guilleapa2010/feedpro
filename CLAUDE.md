# FeedPro Enterprise v2.0 - Sistema de Gestión de Feedlot

## Descripción
Sistema web completo para la gestión de feedlots desarrollado con HTML5, CSS3 y JavaScript vanilla. Diseñado para optimizar la producción ganadera mediante el seguimiento integral de animales, alimentación, sanidad y métricas de rendimiento.

## Arquitectura

### Estructura de Archivos
```
feedlot-system/
├── index.html                 # Punto de entrada principal
├── css/
│   ├── base.css              # Variables, reset, utilidades
│   ├── components.css        # Componentes reutilizables
│   ├── layout.css            # Grid, navegación, estructura
│   └── modules/              # Estilos específicos por módulo
│       ├── dashboard.css
│       ├── animales.css
│       ├── sanidad.css
│       ├── insumos.css
│       ├── dietas.css
│       ├── suministro.css
│       ├── corrales.css
│       ├── comercializacion.css
│       ├── reportes.css
│       └── administracion.css
├── js/
│   ├── core/
│   │   ├── app.js            # Inicialización y router
│   │   ├── data.js           # Estado global y persistencia
│   │   ├── ui.js             # Componentes UI y helpers
│   │   └── utils.js          # Utilidades generales
│   ├── sections/             # Módulos funcionales
│   │   ├── dashboard.js
│   │   ├── animales.js
│   │   ├── sanidad.js
│   │   ├── insumos.js
│   │   ├── dietas.js
│   │   ├── suministro.js
│   │   ├── corrales.js
│   │   ├── comercializacion.js
│   │   ├── reportes.js
│   │   └── administracion.js
│   └── services/
│       └── weather.js        # Servicio de clima
├── data/
│   └── sample-data.js        # Datos de ejemplo
├── README.md                 # Documentación usuario
├── TODO.md                   # Plan de desarrollo
└── CLAUDE.md                 # Esta documentación
```

### Patrones de Diseño
- **Módulos ES6**: Cada sección es un objeto auto-contenido
- **Estado centralizado**: `AppState` y `AppData` globales
- **Persistencia local**: `localStorage` para datos del usuario
- **CSS Variables**: Tema personalizable (light/dark)
- **Componentes reutilizables**: `UI` helpers para modales, toasts, etc.

## Módulos del Sistema

### 1. Dashboard
Panel de control con métricas clave:
- KPIs de producción (animales activos, consumo, mortalidad)
- Widget de clima integrado
- Alertas de stock bajo y eventos próximos
- Gráfico de ocupación de corrales

### 2. Animales
Registro completo del ganado:
- Alta de animales con información detallada
- Seguimiento de peso y evolución
- Movimientos entre corrales
- Estados: en_proceso, finalizado, vendido

### 3. Sanidad
Gestión de salud animal:
- Calendario de tratamientos
- Registro de vacunaciones
- Tratamientos curativos
- Trazabilidad completa

### 4. Insumos
Control de inventario:
- Stock de alimentos y medicamentos
- Proveedores y contactos
- Órdenes de compra
- Alertas de stock mínimo

### 5. Dietas
Laboratorio de formulación:
- Base de datos de ingredientes con valores nutricionales
- Simulador de escenarios (variación de precios)
- Análisis nutricional (PB, EM, NDT, calcio, fósforo)
- Comparación lado a lado
- Categorías: inicio, crecimiento, engorde, finalización

### 6. Suministro
Ejecución de alimentación (Método SDSU):
- Sistema de lecturas Bunk (score 0-4)
- Wizard de 4 pasos con timer
- Cálculo automático de ajustes
- Historial de sesiones
- Estadísticas de rendimiento

**Escala Bunk (SDSU):**
| Score | Descripción | Ajuste | Color |
|-------|-------------|--------|-------|
| 0 | Vacío | +10% | 🔴 |
| 0.5 | Disperso | +5% | 🟠 |
| 1 | Óptimo | 0% | 🟢 |
| 2 | Sobrante | -5% | 🟡 |
| 3 | Exceso | -10% | 🟠 |
| 4 | Intacto | -15% | 🟣 |

### 7. Corrales
Gestión de espacios físicos:
- Definición de corrales por etapa
- Seguimiento de ocupación
- Capacidad máxima

### 8. Comercialización
Operaciones de compra/venta:
- Comparativa de compra vs venta
- Rentabilidad por lote
- Proyección de ventas

### 9. Reportes
Análisis de rendimiento:
- Conversión alimenticia (CAD)
- Rentabilidad por animal
- Proyecciones de ingresos
- Indicadores de desempeño (KPIs)

### 10. Administración
Configuración del sistema:
- Datos del establecimiento
- Parámetros de producción
- Gestión de usuarios
- Respaldo y restauración

### Botón Universal de Acciones Rápidas ⚡
Acceso directo a operaciones frecuentes desde cualquier pantalla:

| Acción | Descripción | Atajo |
|--------|-------------|-------|
| 🛒 Compra de Animales | Registrar nueva compra de ganado | - |
| 💰 Venta de Animales | Registrar venta o envío a faena | - |
| 🔄 Mover Animales | Traslado entre corrales | - |
| 🚜 Sesión de Suministro | Iniciar alimentación Bunk | - |
| 💉 Tratamiento Sanitario | Vacuna o tratamiento | - |
| 📋 Orden de Compra | Insumos o alimentos | - |
| ⚖️ Registrar Pesaje | Control de peso | - |
| 🐂 Alta de Animal | Individual o lote | - |

**Ubicación:** Header derecho (botón amarillo "⚡ Nuevo")
**Teclado:** Ctrl+N para abrir menú

## Sistema de Datos

### Estructura Principal
```javascript
AppData = {
    animales: [],
    corrales: [],
    dietas: [],
    insumos: [],
    tratamientos: [],
    ventas: [],
    compras: [],
    proveedores: [],
    ordenesCompra: [],
    sesionesSuministro: [],
    historialPesos: {}
};

AppState = {
    seccionActual: 'dashboard',
    usuario: { nombre: '', rol: '' },
    configuracion: {},
    filtros: {}
};
```

### Persistencia
```javascript
// Guardar
localStorage.setItem('feedpro-data', JSON.stringify(AppData));

// Cargar
const saved = localStorage.getItem('feedpro-data');
if (saved) Object.assign(AppData, JSON.parse(saved));
```

## API y Servicios

### UI Helpers (`UI` object)
```javascript
// Toast notifications
UI.showToast(message, type = 'info'); // types: info, success, error, warning

// Modales
UI.createModal(id, content, width = '80%');
UI.closeModal(id);
UI.closeAllModals();

// Confirmación
UI.confirm(message, onConfirm, onCancel);

// Loading
UI.showLoading(message = 'Cargando...');
UI.hideLoading();
```

### Date Utilities (`DateUtils`)
```javascript
DateUtils.today();           // "2026-02-16"
DateUtils.now();             // "2026-02-16 14:30:45"
DateUtils.addDays(date, n);  // Añade días
DateUtils.format(date);      // Formateo local
```

### Theme Manager
```javascript
ThemeManager.setTheme('dark');  // o 'light'
ThemeManager.toggle();
```

## Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| Ctrl + S | Guardar datos |
| Ctrl + D | Ir a Dashboard |
| Ctrl + ? | Mostrar ayuda |
| Esc | Cerrar modal |
| Ctrl + Shift + E | Exportar datos |

## Personalización

### Variables CSS
```css
:root {
    --primary: #1a5f3f;
    --secondary: #2d8a5e;
    --accent: #e8b923;
    --success: #28a745;
    --warning: #ffc107;
    --danger: #dc3545;
    --info: #17a2b8;
    --dark: #1a2e1a;
    --light: #f8f9fa;
    --border-light: #e0e0e0;
}

/* Modo oscuro */
[data-theme="dark"] {
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
}
```

## Desarrollo

### Agregar Nuevo Módulo
1. Crear `js/sections/nuevo-modulo.js`
2. Crear `css/modules/nuevo-modulo.css`
3. Registrar en `index.html`
4. Agregar enlace en navegación
5. Registrar en `App.init()`

### Convenciones de Código
- Nombres de funciones: camelCase (`renderAnimales`)
- Nombres de constantes: UPPER_SNAKE (`ESCALA_LECTURA`)
- IDs de elementos: kebab-case (`btn-guardar`)
- Clases CSS: kebab-case con BEM (`animal-card__header`)

### Testing Manual
1. Verificar carga de datos de ejemplo
2. Probar flujo completo de animales
3. Validar cálculos de dietas
4. Probar wizard de suministro
5. Verificar exportación/importación

## Características Técnicas

### Rendimiento
- Lazy loading de módulos (carga bajo demanda)
- Debounce en búsquedas
- Virtualización de listas grandes
- Caché de datos frecuentes

### Accesibilidad
- ARIA labels en componentes interactivos
- Navegación por teclado
- Contraste de colores WCAG AA
- Textos descriptivos

### Seguridad
- Validación de inputs
- Sanitización de datos
- Confirmación en acciones destructivas
- Backup automático antes de importar

## Integraciones Futuras

### Hardware
- Balanzas electrónicas (puerto serie/USB)
- Lectores RFID
- Sensores de temperatura

### Servicios Cloud
- Sincronización multi-dispositivo
- Backup automático en la nube
- Notificaciones push

### APIs
- API REST para integraciones
- Webhooks para eventos
- Exportación a sistemas contables

## Licencia y Créditos

Desarrollado para la gestión moderna de feedlots.
Versión 2.0 - 2026

Basado en investigaciones de:
- SDSU Extension (Sistema Bunk Scoring)
- NRC Nutrient Requirements of Beef Cattle
- Parámetros productivos del Mercosur

---

*Para soporte técnico o consultas de desarrollo, consultar la documentación en README.md*
