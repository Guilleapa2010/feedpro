/**
 * BASE DE DATOS NUTRICIONAL Y ESTADO GLOBAL
 * Versión Local - Almacenamiento en localStorage
 * Precios de alimentos en $/tonelada
 */

// Base de datos de ingredientes con valores nutricionales
// NOTA: Los costos están expresados en $/tonelada (USD/ton)
const INGREDIENTES_DB = {
    'Maíz Rolado': {
        categoria: 'grano',
        costo: 450,  // $/ton
        nutricion: { 
            MS: 88.0, PB: 9.0, EM: 3.35, FC: 2.5, Grasa: 4.0, 
            Ca: 0.03, P: 0.31, NDT: 85, UFC: 1.05 
        },
        descripcion: 'Alto contenido energético, base de la mayoría de las dietas'
    },
    'Maíz Quebrado': {
        categoria: 'grano',
        costo: 420,  // $/ton
        nutricion: { 
            MS: 88.0, PB: 9.0, EM: 3.30, FC: 2.8, Grasa: 4.0, 
            Ca: 0.03, P: 0.31, NDT: 83, UFC: 1.03 
        },
        descripcion: 'Más económico, menor digestibilidad que rolado'
    },
    'Sorgo': {
        categoria: 'grano',
        costo: 380,  // $/ton
        nutricion: { 
            MS: 89.0, PB: 11.0, EM: 3.25, FC: 2.8, Grasa: 3.5, 
            Ca: 0.04, P: 0.32, NDT: 82, UFC: 1.00 
        },
        descripcion: 'Alternativa al maíz, similar valor energético'
    },
    'Harina de Soja': {
        categoria: 'proteico',
        costo: 850,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 44.0, EM: 3.35, FC: 6.0, Grasa: 1.5, 
            Ca: 0.35, P: 0.70, NDT: 85, UFC: 1.10 
        },
        descripcion: 'Principal fuente proteica, alto valor biológico'
    },
    'Harina de Girasol': {
        categoria: 'proteico',
        costo: 650,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 38.0, EM: 2.80, FC: 12.0, Grasa: 2.0, 
            Ca: 0.40, P: 1.00, NDT: 75, UFC: 0.95 
        },
        descripcion: 'Proteína de buena calidad, más fibra que soja'
    },
    'Sal Mineral': {
        categoria: 'mineral',
        costo: 1200,  // $/ton
        nutricion: { 
            MS: 99.0, PB: 0, EM: 0, FC: 0, Grasa: 0, 
            Ca: 20.0, P: 0, NDT: 0, UFC: 0 
        },
        descripcion: 'Fuente de calcio y minerales traza'
    },
    'Fosfato Bicálcico': {
        categoria: 'mineral',
        costo: 2500,  // $/ton
        nutricion: { 
            MS: 99.0, PB: 0, EM: 0, FC: 0, Grasa: 0, 
            Ca: 24.0, P: 18.0, NDT: 0, UFC: 0 
        },
        descripcion: 'Corrector de fósforo y calcio'
    },
    'Melaza': {
        categoria: 'energetico',
        costo: 650,  // $/ton
        nutricion: { 
            MS: 75.0, PB: 5.0, EM: 2.90, FC: 0, Grasa: 0, 
            Ca: 1.00, P: 0.10, NDT: 75, UFC: 0.90 
        },
        descripcion: 'Palatabilizante, fuente de azúcares'
    },
    'Grasa Protegida': {
        categoria: 'energetico',
        costo: 1800,  // $/ton
        nutricion: { 
            MS: 99.0, PB: 0, EM: 7.50, FC: 0, Grasa: 99.0, 
            Ca: 0, P: 0, NDT: 200, UFC: 2.50 
        },
        descripcion: 'Alto contenido energético para dietas de finalización'
    },
    'Silo de Maíz': {
        categoria: 'forraje',
        costo: 250,  // $/ton
        nutricion: { 
            MS: 35.0, PB: 8.0, EM: 2.70, FC: 20.0, Grasa: 3.0, 
            Ca: 0.25, P: 0.25, NDT: 70, UFC: 0.85 
        },
        descripcion: 'Forraje conservado, buena fuente de energía'
    },
    'Heno de Alfalfa': {
        categoria: 'forraje',
        costo: 550,  // $/ton
        nutricion: { 
            MS: 88.0, PB: 18.0, EM: 2.20, FC: 28.0, Grasa: 2.5, 
            Ca: 1.40, P: 0.25, NDT: 60, UFC: 0.70 
        },
        descripcion: 'Alta proteína y calcio, buena fuente de fibra'
    },
    'Premezcla Mineral': {
        categoria: 'aditivo',
        costo: 3500,  // $/ton
        nutricion: { 
            MS: 95.0, PB: 0, EM: 0, FC: 0, Grasa: 0, 
            Ca: 15.0, P: 8.0, NDT: 0, UFC: 0 
        },
        descripcion: 'Vitaminas, minerales y aditivos específicos'
    },
    'Bicarbonato de Sodio': {
        categoria: 'aditivo',
        costo: 1100,  // $/ton
        nutricion: { 
            MS: 99.0, PB: 0, EM: 0, FC: 0, Grasa: 0, 
            Ca: 0, P: 0, NDT: 0, UFC: 0 
        },
        descripcion: 'Buffer ruminal, previene acidosis'
    },
    'Urea': {
        categoria: 'proteico',
        costo: 900,  // $/ton
        nutricion: { 
            MS: 99.0, PB: 280.0, EM: 0, FC: 0, Grasa: 0, 
            Ca: 0, P: 0, NDT: 0, UFC: 0 
        },
        descripcion: 'Fuente de nitrógeno no proteico'
    },
    'Sorgo Grano': {
        categoria: 'grano',
        costo: 380,  // $/ton
        nutricion: { 
            MS: 89.0, PB: 11.0, EM: 3.25, FC: 2.8, Grasa: 3.5, 
            Ca: 0.04, P: 0.32, NDT: 82, UFC: 1.00 
        },
        descripcion: 'Alternativa energética al maíz, buena digestibilidad'
    },
    'Silaje de Sorgo': {
        categoria: 'forraje',
        costo: 220,  // $/ton
        nutricion: { 
            MS: 32.0, PB: 8.5, EM: 2.55, FC: 24.0, Grasa: 3.0, 
            Ca: 0.35, P: 0.22, NDT: 68, UFC: 0.80 
        },
        descripcion: 'Forraje conservado de sorgo, buena aceptación'
    },
    'Silaje de Maíz': {
        categoria: 'forraje',
        costo: 240,  // $/ton
        nutricion: { 
            MS: 35.0, PB: 8.0, EM: 2.75, FC: 18.0, Grasa: 3.0, 
            Ca: 0.25, P: 0.24, NDT: 72, UFC: 0.84 
        },
        descripcion: 'Alto valor energético como forraje'
    },
    'Granos de Destilería (DDGS)': {
        categoria: 'proteico',
        costo: 520,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 26.0, EM: 3.20, FC: 8.0, Grasa: 10.0, 
            Ca: 0.10, P: 0.85, NDT: 80, UFC: 1.05 
        },
        descripcion: 'Subproducto de la industria del etanol, alta proteína'
    },
    'Avena': {
        categoria: 'grano',
        costo: 420,  // $/ton
        nutricion: { 
            MS: 89.0, PB: 11.5, EM: 3.10, FC: 10.0, Grasa: 5.0, 
            Ca: 0.07, P: 0.35, NDT: 75, UFC: 0.95 
        },
        descripcion: 'Grano de fibra media, buena para iniciación'
    },
    'Cebada': {
        categoria: 'grano',
        costo: 400,  // $/ton
        nutricion: { 
            MS: 88.0, PB: 12.0, EM: 3.05, FC: 5.5, Grasa: 2.5, 
            Ca: 0.05, P: 0.38, NDT: 78, UFC: 0.96 
        },
        descripcion: 'Buena alternativa energética con más fibra que el maíz'
    },
    'Trigo': {
        categoria: 'grano',
        costo: 460,  // $/ton
        nutricion: { 
            MS: 89.0, PB: 13.5, EM: 3.30, FC: 2.8, Grasa: 2.0, 
            Ca: 0.05, P: 0.40, NDT: 85, UFC: 1.02 
        },
        descripcion: 'Alto valor energético y proteico'
    },
    'Afrechillo de Trigo': {
        categoria: 'proteico',
        costo: 380,  // $/ton
        nutricion: { 
            MS: 88.0, PB: 15.5, EM: 2.80, FC: 9.0, Grasa: 3.5, 
            Ca: 0.08, P: 0.95, NDT: 70, UFC: 0.88 
        },
        descripcion: 'Subproducto molinero, fuente de proteína y fibra'
    },
    'Expeller de Soja': {
        categoria: 'proteico',
        costo: 780,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 42.0, EM: 3.10, FC: 6.5, Grasa: 3.5, 
            Ca: 0.30, P: 0.65, NDT: 78, UFC: 1.05 
        },
        descripcion: 'Proteína de alta calidad con algo de grasa residual'
    },
    'Pellet de Soja': {
        categoria: 'proteico',
        costo: 820,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 44.0, EM: 3.25, FC: 6.0, Grasa: 1.5, 
            Ca: 0.32, P: 0.68, NDT: 82, UFC: 1.08 
        },
        descripcion: 'Harina de soja peletizada, fácil manejo'
    },
    'Harina de Carne y Huesos': {
        categoria: 'proteico',
        costo: 650,  // $/ton
        nutricion: { 
            MS: 92.0, PB: 50.0, EM: 2.80, FC: 2.0, Grasa: 10.0, 
            Ca: 10.0, P: 5.0, NDT: 72, UFC: 0.85 
        },
        descripcion: 'Alta proteína animal, rica en calcio y fósforo'
    },
    'Gluten de Maíz': {
        categoria: 'proteico',
        costo: 680,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 60.0, EM: 3.50, FC: 2.0, Grasa: 2.5, 
            Ca: 0.05, P: 0.50, NDT: 88, UFC: 1.15 
        },
        descripcion: 'Proteína concentrada de maíz, alto valor energético'
    },
    'Salvado de Trigo': {
        categoria: 'forraje',
        costo: 320,  // $/ton
        nutricion: { 
            MS: 89.0, PB: 15.0, EM: 2.40, FC: 10.5, Grasa: 4.0, 
            Ca: 0.10, P: 1.20, NDT: 65, UFC: 0.78 
        },
        descripcion: 'Fuente de fibra y proteína de origen cerealero'
    },
    'Alfalfa Pellet': {
        categoria: 'forraje',
        costo: 580,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 17.0, EM: 2.25, FC: 26.0, Grasa: 2.5, 
            Ca: 1.30, P: 0.24, NDT: 62, UFC: 0.72 
        },
        descripcion: 'Forraje deshidratado y peletizado, alto calcio'
    },
    'Pastura de Alfalfa': {
        categoria: 'forraje',
        costo: 180,  // $/ton
        nutricion: { 
            MS: 22.0, PB: 20.0, EM: 2.10, FC: 30.0, Grasa: 2.5, 
            Ca: 1.50, P: 0.28, NDT: 58, UFC: 0.68 
        },
        descripcion: 'Forraje verde fresca, alta proteína y calcio'
    },
    'Rastrojo de Maíz': {
        categoria: 'forraje',
        costo: 150,  // $/ton
        nutricion: { 
            MS: 85.0, PB: 6.0, EM: 2.00, FC: 35.0, Grasa: 1.5, 
            Ca: 0.40, P: 0.10, NDT: 55, UFC: 0.60 
        },
        descripcion: 'Residuo de cosecha, baja calidad nutricional'
    },
    'Pulpa de Remolacha': {
        categoria: 'forraje',
        costo: 280,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 9.0, EM: 2.60, FC: 15.0, Grasa: 0.5, 
            Ca: 0.65, P: 0.10, NDT: 72, UFC: 0.82 
        },
        descripcion: 'Subproducto azucarero, buena fuente de energía digestible'
    },
    'Núcleo Vitamínico Mineral': {
        categoria: 'aditivo',
        costo: 4500,  // $/ton
        nutricion: { 
            MS: 95.0, PB: 0, EM: 0, FC: 0, Grasa: 0, 
            Ca: 12.0, P: 6.0, NDT: 0, UFC: 0 
        },
        descripcion: 'Concentrado de vitaminas, minerales y oligoelementos'
    },
    'Yeso Agrícola': {
        categoria: 'mineral',
        costo: 800,  // $/ton
        nutricion: { 
            MS: 99.0, PB: 0, EM: 0, FC: 0, Grasa: 0, 
            Ca: 23.0, P: 0, NDT: 0, UFC: 0 
        },
        descripcion: 'Fuente de calcio y azufre'
    },
    'Cal Agrícola': {
        categoria: 'mineral',
        costo: 600,  // $/ton
        nutricion: { 
            MS: 99.0, PB: 0, EM: 0, FC: 0, Grasa: 0, 
            Ca: 38.0, P: 0, NDT: 0, UFC: 0 
        },
        descripcion: 'Corrector de calcio y pH ruminal'
    },
    'Cloruro de Magnesio': {
        categoria: 'mineral',
        costo: 1400,  // $/ton
        nutricion: { 
            MS: 99.0, PB: 0, EM: 0, FC: 0, Grasa: 0, 
            Ca: 0, P: 0, NDT: 0, UFC: 0 
        },
        descripcion: 'Fuente de magnesio para prevenir hipomagnesemia'
    },
    'Harina de Pescado': {
        categoria: 'proteico',
        costo: 1200,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 62.0, EM: 3.00, FC: 1.0, Grasa: 8.0, 
            Ca: 5.50, P: 3.20, NDT: 78, UFC: 0.95 
        },
        descripcion: 'Proteína animal de alto valor biológico'
    },
    'Chuchillo de Soja': {
        categoria: 'proteico',
        costo: 720,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 40.0, EM: 3.05, FC: 7.0, Grasa: 5.5, 
            Ca: 0.25, P: 0.60, NDT: 76, UFC: 1.00 
        },
        descripcion: 'Subproducto de extracción de aceite de soja'
    },
    'Cascarilla de Soja': {
        categoria: 'forraje',
        costo: 260,  // $/ton
        nutricion: { 
            MS: 90.0, PB: 12.0, EM: 2.10, FC: 38.0, Grasa: 1.0, 
            Ca: 0.50, P: 0.18, NDT: 60, UFC: 0.65 
        },
        descripcion: 'Fuente de fibra, bajo valor energético'
    },
    'Miel de Caña': {
        categoria: 'energetico',
        costo: 550,  // $/ton
        nutricion: { 
            MS: 75.0, PB: 3.0, EM: 2.80, FC: 0, Grasa: 0, 
            Ca: 0.80, P: 0.08, NDT: 70, UFC: 0.88 
        },
        descripcion: 'Palatabilizante y fuente de azúcares fermentables'
    },
    'Grasa Animal': {
        categoria: 'energetico',
        costo: 1500,  // $/ton
        nutricion: { 
            MS: 99.0, PB: 0, EM: 7.20, FC: 0, Grasa: 99.0, 
            Ca: 0, P: 0, NDT: 190, UFC: 2.40 
        },
        descripcion: 'Alto aporte energético para dietas de alta producción'
    }
};

// Función helper para obtener costo por kg (para cálculos internos)
// Los precios se almacenan en $/ton pero los cálculos usan $/kg
function getCostoPorKg(ingredienteNombre) {
    const ing = INGREDIENTES_DB[ingredienteNombre];
    return ing ? (ing.costo / 1000) : 0;
}

// Estado global de la aplicación
const AppState = {
    currentPage: 1,
    currentSection: 'dashboard',
    filtros: { 
        animales: { search: '', estado: '', corral: '' } 
    },
    usuario: { 
        nombre: 'Usuario Local', 
        rol: 'admin' 
    },
    dietaActiva: null
};

// Datos persistentes
let AppData = {
    animales: [],
    compras: [],
    ventas: [],
    clientes: [],
    insumos: [],
    movimientosInsumos: [],
    ordenesCompra: [],
    dietas: [],
    nucleos: [], // Núcleos minerales (premix)
    suministros: [],
    sesionesSuministro: [],
    tratamientos: [],
    lecturas: [],
    corrales: [],
    movimientosCorrales: [],
    actividad: [],
    movimientosStock: [],
    personal: [],
    proveedores: [],
    proyecciones: [], // Lotes proyectados para planificación
    asignacionesProyeccion: [] // Asignaciones de lotes a corrales
};

// Funciones de persistencia
const DataManager = {
    // Clave fija para almacenamiento local (sin depender de sesión)
    STORAGE_KEY: 'feedlotData_local',

    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                AppData = JSON.parse(saved);
                // Asegurar propiedades existen
                if (!AppData.dietas) AppData.dietas = [];
                if (!AppData.nucleos) AppData.nucleos = [];
                if (!AppData.tratamientos) AppData.tratamientos = [];
                if (!AppData.actividad) AppData.actividad = [];
                if (!AppData.sesionesSuministro) AppData.sesionesSuministro = [];
                if (!AppData.movimientosStock) AppData.movimientosStock = [];
                if (!AppData.corrales) AppData.corrales = [];
                if (!AppData.movimientosCorrales) AppData.movimientosCorrales = [];
                if (!AppData.proyecciones) AppData.proyecciones = [];
                if (!AppData.asignacionesProyeccion) AppData.asignacionesProyeccion = [];
                return true;
            }
        } catch (e) {
            console.error('Error cargando datos:', e);
        }
        return false;
    },
    
    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(AppData));
            this.updateBackupIndicator();
            
            // Actualizar dashboard si está disponible
            this.notifyDashboard();
            
            return true;
        } catch (e) {
            console.error('Error guardando datos:', e);
            return false;
        }
    },
    
    notifyDashboard() {
        // Solo actualizar si estamos en la página del dashboard
        const dashboardContainer = document.getElementById('dashboard-container');
        if (!dashboardContainer) {
            return; // No estamos en el dashboard, no hay nada que actualizar
        }
        
        // Actualizar inventario de insumos en el dashboard
        if (typeof DashboardSection !== 'undefined' && DashboardSection.renderInsumos) {
            DashboardSection.renderInsumos();
        }
        
        // Actualizar KPIs del dashboard
        if (typeof DashboardSection !== 'undefined' && DashboardSection.updateKPIs) {
            DashboardSection.updateKPIs();
        }
        
        // Actualizar alertas
        if (typeof DashboardSection !== 'undefined' && DashboardSection.renderAlertas) {
            DashboardSection.renderAlertas();
        }
    },
    
    updateBackupIndicator() {
        const indicator = document.getElementById('lastBackup');
        if (indicator) {
            indicator.textContent = new Date().toLocaleTimeString();
        }
    },
    
    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        location.reload();
    },

    // Exportar datos a JSON
    exportData() {
        return JSON.stringify(AppData, null, 2);
    },

    // Importar datos desde JSON
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            AppData = { ...AppData, ...data };
            this.save();
            return { success: true };
        } catch (e) {
            return { success: false, error: 'Formato JSON inválido' };
        }
    }
};
