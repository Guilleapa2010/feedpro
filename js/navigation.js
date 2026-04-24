/**
 * SISTEMA DE NAVEGACIÓN Y RUTAS
 */

const Navigation = {
    // Mapeo de títulos por sección
    titles: {
        'dashboard': 'Dashboard General',
        'animales': 'Gestión de Animales',
        'sanidad': 'Sanidad',
        'insumos': 'Insumos y Stock',
        'dietas': 'Laboratorio de Dietas',
        'suministro': 'Suministro Diario',
        'corrales': 'Gestión de Corrales',
        'comercializacion': 'Comercialización',
        'personal': 'Personal y Mano de Obra',
        'gastos': 'Resumen de Gastos',
        'proyeccion': 'Proyección de Ocupación',
        'reportes': 'Reportes y Análisis',
        'administracion': 'Administración',
        'usuarios': 'Gestión de Usuarios'
    },
    
    // Inicializar navegación
    init() {
        // Cerrar modales al hacer click fuera
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    ModalManager.close(overlay.id);
                }
            });
        });
        
        // Manejar hash para rutas directas
        window.addEventListener('hashchange', () => this.handleHash());
        this.handleHash();
    },
    
    // Mapeo de permisos por sección
    permissions: {
        'dashboard': 'dashboard.view',
        'animales': 'animales.view',
        'sanidad': 'sanidad.view',
        'insumos': 'insumos.view',
        'dietas': 'dietas.view',
        'suministro': 'suministro.view',
        'corrales': 'corrales.view',
        'comercializacion': 'comercializacion.view',
        'personal': 'personal.view',
        'gastos': 'gastos.view',
        'proyeccion': 'proyeccion.view',
        'reportes': 'reportes.view',
        'administracion': 'config.view',
        'usuarios': 'usuarios.manage'
    },
    
    // Navegar a una sección
    navigate(sectionId) {
        // Verificar permisos
        const permiso = this.permissions[sectionId];
        if (permiso && typeof AuthManager !== 'undefined' && !AuthManager.hasPermission(permiso)) {
            UI.showToast('No tiene permisos para acceder a esta sección', 'error');
            return;
        }
        
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(s => {
            s.classList.add('hidden');
        });
        
        // Mostrar sección objetivo
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.remove('hidden');
            AppState.currentSection = sectionId;
        }
        
        if (sectionId === 'suministro') cargarSuministro();
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Activar link correspondiente
        const activeLink = document.querySelector(`.nav-link[onclick="navigate('${sectionId}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Actualizar título y breadcrumb
        this.updateHeader(sectionId);
        
        // Cerrar sidebar en mobile
        if (window.innerWidth <= 768) {
            UI.closeSidebar();
        }
        
        // Renderizar contenido específico de la sección
        this.renderSection(sectionId);
        
        // Actualizar URL hash
        window.location.hash = sectionId;
    },
    
    // Actualizar header
    updateHeader(sectionId) {
        const title = this.titles[sectionId] || 'Dashboard';
        const pageTitle = document.getElementById('pageTitle');
        const breadcrumb = document.getElementById('breadcrumb');
        
        if (pageTitle) pageTitle.textContent = title;
        if (breadcrumb) breadcrumb.textContent = `Inicio / ${title}`;
    },
    
    // Renderizar contenido según sección
    renderSection(sectionId) {
        const renderers = {
            'dashboard': () => DashboardSection.render(),
            'animales': () => AnimalesSection.render(),
            'sanidad': () => SanidadSection.render(),
            'insumos': () => InsumosSection.render(),
            'dietas': () => DietasSection.render(),
            'suministro': () => SuministroSection.render(),
            'corrales': () => CorralesSection.render(),
            'comercializacion': () => ComercializacionSection.render(),
            'personal': () => PersonalSection.render(),
            'gastos': () => GastosSection.render(),
            'proyeccion': () => ProyeccionSection.render(),
            'reportes': () => ReportesSection.render(),
            'administracion': () => AdministracionSection.render(),
            'usuarios': () => UsuariosSection.render()
        };
        
        if (renderers[sectionId]) {
            renderers[sectionId]();
        }
    },
    
    // Manejar hash de URL
    handleHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash && this.titles[hash]) {
            this.navigate(hash);
        } else if (!AppState.currentSection || AppState.currentSection === 'dashboard') {
            this.navigate('dashboard');
        }
    },
    
    // Switch entre tabs
    switchTab(tabId, tabGroup = '') {
        const prefix = tabGroup ? `${tabGroup}-` : '';
        
        // Desactivar todos los tabs del grupo
        document.querySelectorAll(`.tab[data-group="${tabGroup}"]`).forEach(t => {
            t.classList.remove('active');
        });
        document.querySelectorAll(`.tab-content[data-group="${tabGroup}"]`).forEach(t => {
            t.classList.remove('active');
        });
        
        // Activar tab seleccionado
        const selectedTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
        const selectedContent = document.getElementById(`${prefix}tab-${tabId}`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');
    }
};

// Función global para compatibilidad
function navigate(section) {
    Navigation.navigate(section);
}

function toggleSidebar() {
    UI.toggleSidebar();
}

function switchTab(tab) {
    Navigation.switchTab(tab);
}
