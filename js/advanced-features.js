/**
 * FUNCIONALIDADES AVANZADAS - FASE 3
 * Modo oscuro, ayuda contextual, atajos de teclado, notificaciones
 */

// ============ MODO OSCURO ============
const ThemeManager = {
    modoOscuro: localStorage.getItem('modoOscuro') === 'true',
    
    init() {
        if (this.modoOscuro) {
            this.aplicarModoOscuro();
        }
        this.crearBotonToggle();
    },
    
    toggle() {
        this.modoOscuro = !this.modoOscuro;
        localStorage.setItem('modoOscuro', this.modoOscuro);
        
        if (this.modoOscuro) {
            this.aplicarModoOscuro();
        } else {
            this.aplicarModoClaro();
        }
    },
    
    aplicarModoOscuro() {
        const estilos = `
            <style id="modoOscuroStyles">
                :root {
                    --bg: #1a1a2e !important;
                    --card-bg: #16213e !important;
                    --text: #eaeaea !important;
                    --text-secondary: #a0a0a0 !important;
                    --border: #0f3460 !important;
                    --bg-secondary: #0f3460 !important;
                }
                
                body {
                    background: var(--bg) !important;
                    color: var(--text) !important;
                }
                
                .card, .kpi-card, .modal-content {
                    background: var(--card-bg) !important;
                    border-color: var(--border) !important;
                }
                
                .sidebar {
                    background: #0f0f23 !important;
                    border-color: var(--border) !important;
                }
                
                .form-input, .form-select {
                    background: var(--bg-secondary) !important;
                    color: var(--text) !important;
                    border-color: var(--border) !important;
                }
                
                table th {
                    background: var(--bg-secondary) !important;
                }
                
                table td {
                    border-color: var(--border) !important;
                }
                
                .nav-link:hover {
                    background: var(--bg-secondary) !important;
                }
                
                .alert {
                    opacity: 0.9;
                }
            </style>
        `;
        
        if (!document.getElementById('modoOscuroStyles')) {
            document.head.insertAdjacentHTML('beforeend', estilos);
        }
        
        // Actualizar icono del botón
        const btn = document.getElementById('themeToggle');
        if (btn) btn.innerHTML = '☀️';
    },
    
    aplicarModoClaro() {
        const styles = document.getElementById('modoOscuroStyles');
        if (styles) styles.remove();
        
        const btn = document.getElementById('themeToggle');
        if (btn) btn.innerHTML = '🌙';
    },
    
    crearBotonToggle() {
        // Insertar en el header
        const header = document.querySelector('.header-stats');
        if (header && !document.getElementById('themeToggle')) {
            const btn = document.createElement('button');
            btn.id = 'themeToggle';
            btn.className = 'btn btn-secondary';
            btn.style.marginLeft = '10px';
            btn.innerHTML = this.modoOscuro ? '☀️' : '🌙';
            btn.title = 'Cambiar tema';
            btn.onclick = () => this.toggle();
            header.appendChild(btn);
        }
    }
};

// ============ AYUDA CONTEXTUAL ============
const HelpSystem = {
    activo: false,
    
    toggle() {
        this.activo = !this.activo;
        if (this.activo) {
            this.activarModoAyuda();
            UI.showToast('Modo ayuda activado. Haga click en cualquier elemento para ver información.', 'info');
        } else {
            this.desactivarModoAyuda();
        }
    },
    
    activarModoAyuda() {
        document.body.classList.add('modo-ayuda');
        
        // Agregar listeners a elementos interactivos
        document.querySelectorAll('button, .card, .kpi-card, input, select').forEach(el => {
            el.addEventListener('click', this.mostrarAyuda);
            el.style.cursor = 'help';
        });
        
        // Cambiar cursor global
        document.body.style.cursor = 'help';
    },
    
    desactivarModoAyuda() {
        document.body.classList.remove('modo-ayuda');
        
        document.querySelectorAll('button, .card, .kpi-card, input, select').forEach(el => {
            el.removeEventListener('click', this.mostrarAyuda);
            el.style.cursor = '';
        });
        
        document.body.style.cursor = '';
    },
    
    mostrarAyuda(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const el = e.currentTarget;
        const texto = el.textContent?.substring(0, 50) || '';
        const titulo = el.querySelector('.card-title, .kpi-title, .section-title')?.textContent || 
                      el.placeholder || 
                      texto ||
                      'Elemento';
        
        const ayudas = {
            'Dashboard': 'Vista general del feedlot con indicadores clave, alertas y actividad reciente.',
            'Animales': 'Gestión completa del inventario: entradas, salidas, movimientos y fichas individuales.',
            'Sanidad': 'Control de tratamientos, calendario sanitario y seguimiento de enfermos.',
            'Insumos': 'Inventario de alimentos, gestión de proveedores y órdenes de compra.',
            'Dietas': 'Laboratorio de formulación nutricional y análisis de costos.',
            'Reparto': 'Plan de alimentación diario por corral con cálculo de raciones.',
            'Corrales': 'Distribución de animales, movimientos entre corrales y ocupación.',
            'Reportes': 'Análisis de conversión, rentabilidad, costos y proyecciones.',
            'Administración': 'Configuración del establecimiento, parámetros y respaldo de datos.'
        };
        
        let mensaje = ayudas[titulo] || `Elemento: ${titulo}\n\nEsta función le permite interactuar con el sistema.`;
        
        alert(`ℹ️ AYUDA\n\n${mensaje}`);
    },
    
    crearBotonAyuda() {
        const sidebar = document.querySelector('.sidebar-footer');
        if (sidebar && !document.getElementById('helpToggle')) {
            const btn = document.createElement('button');
            btn.id = 'helpToggle';
            btn.className = 'btn btn-sm btn-secondary';
            btn.style.marginTop = '10px';
            btn.style.width = '100%';
            btn.innerHTML = '❓ Ayuda';
            btn.onclick = () => this.toggle();
            sidebar.insertBefore(btn, sidebar.firstChild);
        }
    }
};

// ============ ATAJOS DE TECLADO ============
const KeyboardShortcuts = {
    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.mostrarBienvenida();
    },
    
    handleKeydown(e) {
        // Ctrl/Cmd + tecla
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'd':
                    e.preventDefault();
                    navigate('dashboard');
                    break;
                case 'a':
                    e.preventDefault();
                    navigate('animales');
                    break;
                case 's':
                    e.preventDefault();
                    navigate('sanidad');
                    break;
                case 'r':
                    e.preventDefault();
                    navigate('reportes');
                    break;
                case 'p':
                    e.preventDefault();
                    window.print();
                    break;
                case 'h':
                    e.preventDefault();
                    this.mostrarAtajos();
                    break;
            }
        }
        
        // Escape para cerrar modales
        if (e.key === 'Escape') {
            const modales = document.querySelectorAll('.modal-overlay');
            modales.forEach(m => {
                if (!m.classList.contains('hidden')) {
                    m.classList.add('hidden');
                }
            });
        }
        
        // F1 para ayuda
        if (e.key === 'F1') {
            e.preventDefault();
            HelpSystem.toggle();
        }
    },
    
    mostrarAtajos() {
        const atajos = `
╔════════════════════════════════════════════════════════════╗
║                    ATAJOS DE TECLADO                       ║
╠════════════════════════════════════════════════════════════╣
║  Ctrl + D     → Ir al Dashboard                            ║
║  Ctrl + A     → Ir a Animales                              ║
║  Ctrl + S     → Ir a Sanidad                               ║
║  Ctrl + R     → Ir a Reportes                              ║
║  Ctrl + P     → Imprimir                                   ║
║  Ctrl + H     → Mostrar esta ayuda                         ║
║                                                            ║
║  ESC          → Cerrar ventanas modales                    ║
║  F1           → Activar modo ayuda                         ║
╚════════════════════════════════════════════════════════════╝
        `;
        
        alert(atajos);
    },
    
    mostrarBienvenida() {
        if (localStorage.getItem('bienvenidaMostrada') === 'true') return;
        
        setTimeout(() => {
            UI.showToast('💡 Presione Ctrl+H para ver los atajos de teclado', 'info', 5000);
            localStorage.setItem('bienvenidaMostrada', 'true');
        }, 2000);
    }
};

// ============ NOTIFICACIONES PUSH (SIMULADAS) ============
const NotificationManager = {
    permiso: false,
    
    init() {
        // Verificar si el navegador soporta notificaciones
        if ('Notification' in window) {
            Notification.requestPermission().then(perm => {
                this.permiso = perm === 'granted';
            });
        }
        
        // Verificar alertas periódicamente
        setInterval(() => this.verificarAlertas(), 60000); // Cada minuto
    },
    
    verificarAlertas() {
        if (!this.permiso) return;
        
        // Verificar tratamientos por vencer
        const tratamientos = (AppData.tratamientos || []).filter(t => {
            if (!t.fechaFin) return false;
            const dias = Math.ceil((new Date(t.fechaFin) - new Date()) / (1000 * 60 * 60 * 24));
            return dias === 1; // Vence mañana
        });
        
        if (tratamientos.length > 0) {
            this.enviar('Tratamientos por vencer', 
                `${tratamientos.length} tratamiento(s) vencen mañana`, 
                'sanidad');
        }
        
        // Verificar stock bajo
        const insumosBajos = (AppData.insumos || []).filter(i => i.stock < i.stockMinimo);
        if (insumosBajos.length > 0 && insumosBajos.length <= 3) {
            this.enviar('Stock bajo', 
                `${insumosBajos[0].nombre}: ${insumosBajos[0].stock} ${insumosBajos[0].unidad}`, 
                'insumos');
        }
    },
    
    enviar(titulo, mensaje, seccion) {
        if (!this.permiso) {
            // Fallback a toast
            UI.showToast(`${titulo}: ${mensaje}`, 'warning');
            return;
        }
        
        const notif = new Notification(titulo, {
            body: mensaje,
            icon: '🐄',
            badge: '🐄',
            tag: seccion,
            requireInteraction: false
        });
        
        notif.onclick = () => {
            window.focus();
            navigate(seccion);
        };
    }
};

// ============ AUTOGUARDADO ============
const AutoSave = {
    intervalo: null,
    
    init() {
        // Autoguardado cada 2 minutos
        this.intervalo = setInterval(() => {
            DataManager.save();
            console.log('💾 Autoguardado: ' + new Date().toLocaleTimeString());
        }, 120000);
        
        // Guardar antes de cerrar
        window.addEventListener('beforeunload', () => {
            DataManager.save();
        });
    },
    
    detener() {
        if (this.intervalo) {
            clearInterval(this.intervalo);
        }
    }
};

// ============ INDICADOR DE CONEXIÓN/SINCRONIZACIÓN ============
const SyncIndicator = {
    init() {
        this.crearIndicador();
    },
    
    crearIndicador() {
        const header = document.querySelector('.header-title');
        if (header && !document.getElementById('syncIndicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'syncIndicator';
            indicator.style.cssText = `
                display: inline-flex;
                align-items: center;
                gap: 5px;
                margin-left: 15px;
                padding: 4px 10px;
                background: #e8f5e9;
                border-radius: 12px;
                font-size: 12px;
                color: #2e7d32;
            `;
            indicator.innerHTML = `
                <span id="syncIcon">☁️</span>
                <span id="syncText">Sincronizado</span>
            `;
            header.appendChild(indicator);
        }
    },
    
    mostrarSincronizando() {
        const icon = document.getElementById('syncIcon');
        const text = document.getElementById('syncText');
        if (icon && text) {
            icon.textContent = '🔄';
            text.textContent = 'Guardando...';
        }
    },
    
    mostrarSincronizado() {
        const icon = document.getElementById('syncIcon');
        const text = document.getElementById('syncText');
        const indicator = document.getElementById('syncIndicator');
        if (icon && text && indicator) {
            icon.textContent = '☁️';
            text.textContent = 'Sincronizado';
            indicator.style.background = '#e8f5e9';
            indicator.style.color = '#2e7d32';
        }
    },
    
    mostrarError() {
        const indicator = document.getElementById('syncIndicator');
        if (indicator) {
            indicator.style.background = '#ffebee';
            indicator.style.color = '#c62828';
            indicator.querySelector('#syncIcon').textContent = '⚠️';
            indicator.querySelector('#syncText').textContent = 'Error';
        }
    }
};

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todas las funcionalidades avanzadas
    ThemeManager.init();
    KeyboardShortcuts.init();
    NotificationManager.init();
    AutoSave.init();
    SyncIndicator.init();
    
    // Crear botón de ayuda después de cargar el DOM
    setTimeout(() => {
        HelpSystem.crearBotonAyuda();
    }, 1000);
});

// Exponer funciones globales
window.ThemeManager = ThemeManager;
window.HelpSystem = HelpSystem;
window.KeyboardShortcuts = KeyboardShortcuts;
