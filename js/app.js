/**
 * FEEDPRO ENTERPRISE v2.0 - MODO LOCAL
 * Punto de entrada principal de la aplicación
 */

// Variables globales para modales
let modalesInicializados = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🐄 FeedPro Enterprise v' + CONFIG.version + ' iniciando...');

    // Inicializar sesión automática (sin login)
    AuthManager.init();
    
    // Cargar datos
    DataManager.load();
    
    // Inicializar aplicación directamente
    inicializarApp();

    console.log('✅ FeedPro Enterprise iniciado correctamente (Modo Local)');
});

function inicializarApp() {
    // 1. Mostrar info del usuario (local)
    mostrarInfoUsuario();
    
    // 2. Configurar menú (todos los permisos en local)
    configurarMenuPermisos();
    
    // 3. Migrar datos si es necesario
    migrarDatos();
    
    // 4. Inicializar UI
    inicializarModales();
    inicializarFechas();
    
    // 5. Inicializar navegación
    Navigation.init();
    
    // 6. Inicializar órdenes de Telegram
    if (window.TelegramOrdenesApp) {
        TelegramOrdenesApp.init();
    }
    
    // Inicializar suministro desde Telegram
    suministroApp.init();
    
    // 7. Renderizar sección inicial
    const hash = window.location.hash.replace('#', '');
    if (hash && Navigation.titles[hash]) {
        Navigation.navigate(hash);
    } else {
        DashboardSection.render();
    }
}

function mostrarInfoUsuario() {
    const session = AuthManager.getSession();
    if (!session) return;
    
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.style.display = 'flex';
        document.getElementById('userName').textContent = session.nombre;
        document.getElementById('userRole').textContent = 'Modo Local';
    }
}

function configurarMenuPermisos() {
    // En modo local, mostrar todas las opciones del menú
    const navUsuarios = document.getElementById('navUsuarios');
    if (navUsuarios) {
        navUsuarios.style.display = 'none'; // Ocultar sección usuarios en modo local
    }
}

// Función para proteger navegación - siempre permite en modo local
function canNavigateTo(section) {
    return true;
}

// Funciones de inicialización
function cargarDatosDemo() {
    const hoy = new Date();
    
    AppData.animales = [
        {
            id: 'A001', 
            raza: 'Angus', 
            sexo: 'macho', 
            pesoEntrada: 320, 
            pesoActual: 485, 
            fechaIngreso: new Date(hoy - 86400000 * 90).toISOString().split('T')[0],
            estado: 'engorde', 
            proveedor: 'Estancia La Rosa', 
            corral: 'corral3', 
            precioCompra: 2.45
        },
        {
            id: 'A002', 
            raza: 'Hereford', 
            sexo: 'macho', 
            pesoEntrada: 350, 
            pesoActual: 545,
            fechaIngreso: new Date(hoy - 86400000 * 120).toISOString().split('T')[0],
            estado: 'finalizado', 
            proveedor: 'Ganadería Norte', 
            corral: 'corral4', 
            precioCompra: 2.30
        },
        {
            id: 'A003', 
            raza: 'Braford', 
            sexo: 'hembra', 
            pesoEntrada: 280, 
            pesoActual: 420,
            fechaIngreso: new Date(hoy - 86400000 * 60).toISOString().split('T')[0],
            estado: 'engorde', 
            proveedor: 'Estancia La Rosa', 
            corral: 'corral3', 
            precioCompra: 2.50
        },
        {
            id: 'A004', 
            raza: 'Angus', 
            sexo: 'macho', 
            pesoEntrada: 300, 
            pesoActual: 380,
            fechaIngreso: new Date(hoy - 86400000 * 45).toISOString().split('T')[0],
            estado: 'engorde', 
            proveedor: 'Ganadería Sur', 
            corral: 'corral2', 
            precioCompra: 2.60
        }
    ];
    
    AppData.clientes = [
        {
            razonSocial: 'Frigorífico Patagónico S.A.', 
            cuit: '30-12345678-9', 
            contacto: 'Juan Pérez', 
            telefono: '11-5555-1234'
        },
        {
            razonSocial: 'Carnes Premium S.A.', 
            cuit: '30-87654321-0', 
            contacto: 'María González', 
            telefono: '11-5555-5678'
        }
    ];
    
    AppData.insumos = [
        {
            nombre: 'Maíz Rolado', 
            categoria: 'grano', 
            stock: 45000, 
            unidad: 'kg', 
            stockMinimo: 10000, 
            costo: 0.45
        },
        {
            nombre: 'Harina de Soja', 
            categoria: 'proteico', 
            stock: 12000, 
            unidad: 'kg', 
            stockMinimo: 5000, 
            costo: 0.85
        },
        {
            nombre: 'Sal Mineral', 
            categoria: 'mineral', 
            stock: 800, 
            unidad: 'kg', 
            stockMinimo: 1000, 
            costo: 1.20
        },
        {
            nombre: 'Silo de Maíz', 
            categoria: 'forraje', 
            stock: 25000, 
            unidad: 'kg', 
            stockMinimo: 5000, 
            costo: 0.25
        },
        {
            nombre: 'Heno de Alfalfa', 
            categoria: 'forraje', 
            stock: 8000, 
            unidad: 'kg', 
            stockMinimo: 2000, 
            costo: 0.55
        },
        {
            nombre: 'Melaza', 
            categoria: 'energetico', 
            stock: 1500, 
            unidad: 'kg', 
            stockMinimo: 500, 
            costo: 0.65
        },
        {
            nombre: 'Premezcla Mineral', 
            categoria: 'aditivo', 
            stock: 500, 
            unidad: 'kg', 
            stockMinimo: 200, 
            costo: 3.50
        },
        {
            nombre: 'Bicarbonato de Sodio', 
            categoria: 'aditivo', 
            stock: 300, 
            unidad: 'kg', 
            stockMinimo: 100, 
            costo: 1.10
        }
    ];
    
    AppData.dietas = [
        {
            id: 1,
            nombre: 'Inicio Adaptación 2024',
            etapa: 'inicio',
            descripcion: 'Dieta de recepción con bajo almidón para adaptación ruminal',
            pesoObjetivo: 350,
            gdpEsperada: 0.8,
            consumoPV: 2.2,
            composicion: [
                { ingrediente: 'Silo de Maíz', porcentaje: 40 },
                { ingrediente: 'Heno de Alfalfa', porcentaje: 25 },
                { ingrediente: 'Maíz Rolado', porcentaje: 20 },
                { ingrediente: 'Harina de Soja', porcentaje: 10 },
                { ingrediente: 'Premezcla Mineral', porcentaje: 3 },
                { ingrediente: 'Bicarbonato de Sodio', porcentaje: 2 }
            ],
            fechaCreacion: '2024-01-15',
            versiones: [
                { fecha: '2024-01-15', cambios: 'Creación inicial' },
                { fecha: '2024-02-01', cambios: 'Aumento heno de 20% a 25%' }
            ]
        },
        {
            id: 2,
            nombre: 'Engorde Alta Energía',
            etapa: 'engorde',
            descripcion: 'Máxima ganancia de peso con alto contenido energético',
            pesoObjetivo: 480,
            gdpEsperada: 1.6,
            consumoPV: 2.5,
            composicion: [
                { ingrediente: 'Maíz Rolado', porcentaje: 55 },
                { ingrediente: 'Harina de Soja', porcentaje: 20 },
                { ingrediente: 'Silo de Maíz', porcentaje: 15 },
                { ingrediente: 'Melaza', porcentaje: 5 },
                { ingrediente: 'Sal Mineral', porcentaje: 3 },
                { ingrediente: 'Premezcla Mineral', porcentaje: 2 }
            ],
            fechaCreacion: '2024-01-20',
            versiones: [{ fecha: '2024-01-20', cambios: 'Creación inicial' }]
        }
    ];
    
    DataManager.save();
}

function migrarDatos() {
    // Asegurar que todas las dietas tengan las propiedades necesarias
    AppData.dietas = AppData.dietas.map(d => {
        const dieta = {
            ...d,
            pesoObjetivo: d.pesoObjetivo || 450,
            gdpEsperada: d.gdpEsperada || 1.4,
            consumoPV: d.consumoPV || 2.5,
            versiones: d.versiones || [{ 
                fecha: d.fechaCreacion || new Date().toISOString(), 
                cambios: 'Migración automática' 
            }]
        };
        // Migrar dietas antiguas con composicion a ingredientes
        if (!dieta.ingredientes && dieta.composicion) {
            dieta.ingredientes = dieta.composicion.map(c => {
                let costo = 0;
                let nutricion = null;
                const ingDB = typeof INGREDIENTES_DB !== 'undefined' ? INGREDIENTES_DB[c.ingrediente] : null;
                if (ingDB) {
                    costo = ingDB.costo;
                    nutricion = ingDB.nutricion;
                } else if (typeof DietasSection !== 'undefined' && DietasSection.getBibliotecaIngredientes) {
                    const bib = DietasSection.getBibliotecaIngredientes().find(i => i.nombre === c.ingrediente);
                    if (bib) {
                        costo = bib.costo || 0;
                        nutricion = bib.nutricion || null;
                    }
                }
                return {
                    nombre: c.ingrediente,
                    porcentaje: c.porcentaje,
                    kg: c.porcentaje * 10,
                    costo: costo,
                    nutricion: nutricion
                };
            });
        }
        if (!dieta.ingredientes) dieta.ingredientes = [];
        // Recalcular costo total de la dieta
        dieta.costo = (dieta.ingredientes || []).reduce((sum, ing) => {
            let costoUnitario = parseFloat(ing.costo) || 0;
            if (!costoUnitario && ing.nombre) {
                if (typeof INGREDIENTES_DB !== 'undefined' && INGREDIENTES_DB[ing.nombre]) {
                    costoUnitario = INGREDIENTES_DB[ing.nombre].costo;
                } else if (typeof DietasSection !== 'undefined' && DietasSection.getBibliotecaIngredientes) {
                    const bib = DietasSection.getBibliotecaIngredientes().find(i => i.nombre === ing.nombre);
                    if (bib) costoUnitario = bib.costo || 0;
                }
            }
            return sum + (costoUnitario * (parseFloat(ing.porcentaje) || 0) / 100 / 1000);
        }, 0);
        return dieta;
    });
    
    AppState.dietaActiva = AppData.dietas[0] || null;
}

function inicializarModales() {
    if (modalesInicializados) return;
    
    const container = document.getElementById('modals-container');
    if (!container) return;
    
    container.innerHTML = 
        AnimalesModal.getHTML() +
        VentasModal.getVentaHTML() +
        VentasModal.getClienteHTML();
    
    modalesInicializados = true;
}

function inicializarFechas() {
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) input.value = DateUtils.today();
    });
}

// Exponer funciones necesarias globalmente
window.guardarAnimal = () => AnimalesModal.guardar();
window.guardarVenta = () => VentasModal.guardarVenta();
window.guardarCliente = () => VentasModal.guardarCliente();

// Funciones para ficha de animal
window.switchFichaTab = (tab) => AnimalesModal.switchFichaTab(tab);
window.cerrarFicha = () => AnimalesModal.cerrarFicha();
window.registrarPesajeDesdeFicha = () => AnimalesModal.registrarPesajeDesdeFicha();

// Funciones para suministro - Sistema de Lectura de Comederos y Mixer
window.iniciarSesion = () => SuministroSection.iniciarSesion();
window.onChangeTurno = () => SuministroSection.onChangeTurno();
window.onChangeDietaConfig = () => SuministroSection.onChangeDietaConfig();
window.registrarLectura = (corralId, score) => SuministroSection.registrarLectura(corralId, score);
window.actualizarCheckMixer = () => SuministroSection.actualizarCheckMixer();
window.confirmarPreparacionMixer = () => SuministroSection.confirmarPreparacionMixer();
window.marcarEntregado = (corralId) => SuministroSection.marcarEntregado(corralId);
window.siguientePaso = () => SuministroSection.siguientePaso();
window.pasoAnterior = () => SuministroSection.pasoAnterior();
window.irAPaso = (numero) => SuministroSection.irAPaso(numero);
window.cancelarSesion = () => SuministroSection.cancelarSesion();
window.finalizarSesion = () => SuministroSection.finalizarSesion();
window.verEstadisticas = () => SuministroSection.verEstadisticas();
