/**
 * SISTEMA DE AUTENTICACIÓN - FeedPro Local
 * Versión simplificada sin login requerido
 */

const ROLES = {
    ADMIN: {
        id: 'admin',
        nombre: 'Administrador',
        permisos: ['*'] // Acceso total
    }
};

// Usuario local por defecto
const DEFAULT_USER = {
    id: 'local_user',
    nombre: 'Usuario Local',
    username: 'admin',
    rol: 'admin',
    activo: true
};

const AuthManager = {
    SESSION_KEY: 'feedpro_session',

    init() {
        // Crear sesión automática si no existe
        if (!this.isAuthenticated()) {
            this.createLocalSession();
        }
    },

    // Crear sesión local automática
    createLocalSession() {
        const session = {
            usuarioId: DEFAULT_USER.id,
            username: DEFAULT_USER.username,
            nombre: DEFAULT_USER.nombre,
            rol: DEFAULT_USER.rol,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        return session;
    },

    // Login simulado - siempre exitoso
    async login(username, password) {
        // Simular pequeño delay para feedback visual
        await new Promise(r => setTimeout(r, 300));
        
        const session = this.createLocalSession();
        return { success: true, session, user: DEFAULT_USER };
    },

    // Logout - recarga la página y crea nueva sesión automática
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        location.reload();
    },

    // Siempre autenticado en modo local
    isAuthenticated() {
        const session = this.getSession();
        return !!session;
    },

    // Obtener sesión actual
    getSession() {
        try {
            const session = localStorage.getItem(this.SESSION_KEY);
            return session ? JSON.parse(session) : null;
        } catch (e) {
            return null;
        }
    },

    // Obtener usuario actual
    getCurrentUser() {
        return this.getSession() || DEFAULT_USER;
    },

    // Siempre tiene permiso en modo local
    hasPermission(permission) {
        return true;
    },

    // Siempre puede acceder a cualquier sección
    canAccessSection(section) {
        return true;
    },

    // Crear usuario - no aplica en modo local
    createUser(userData) {
        return { success: false, error: 'Función no disponible en modo local' };
    },

    // Actualizar usuario - no aplica en modo local
    updateUser(userId, updates) {
        return { success: false, error: 'Función no disponible en modo local' };
    },

    // Eliminar usuario - no aplica en modo local
    deleteUser(userId) {
        return { success: false, error: 'Función no disponible en modo local' };
    },

    // Cambiar contraseña - no aplica en modo local
    changePassword(currentPassword, newPassword) {
        return { success: false, error: 'Función no disponible en modo local' };
    },

    // Obtener lista de roles
    getRoles() {
        return [{
            id: ROLES.ADMIN.id,
            nombre: ROLES.ADMIN.nombre,
            permisos: ROLES.ADMIN.permisos
        }];
    },

    // Obtener descripción de permisos
    getPermissionDescription(permission) {
        const descriptions = {
            'dashboard.view': 'Ver dashboard',
            'animales.view': 'Ver animales',
            'animales.create': 'Crear animales',
            'animales.edit': 'Editar animales',
            'animales.move': 'Mover animales entre corrales',
            'animales.delete': 'Eliminar animales',
            'corrales.view': 'Ver corrales',
            'corrales.manage': 'Gestionar corrales',
            'dietas.view': 'Ver dietas',
            'dietas.create': 'Crear dietas',
            'dietas.edit': 'Editar dietas',
            'insumos.view': 'Ver insumos',
            'insumos.manage': 'Gestionar insumos',
            'suministro.view': 'Ver suministros',
            'suministro.create': 'Registrar suministros',
            'sanidad.view': 'Ver sanidad',
            'sanidad.create': 'Registrar tratamientos',
            'sanidad.edit': 'Editar tratamientos',
            'pesaje.view': 'Ver pesajes',
            'pesaje.create': 'Registrar pesajes',
            'movimientos.view': 'Ver movimientos',
            'movimientos.create': 'Crear movimientos',
            'compras.view': 'Ver compras',
            'compras.create': 'Registrar compras',
            'ventas.view': 'Ver ventas',
            'ventas.create': 'Registrar ventas',
            'gastos.view': 'Ver gastos',
            'gastos.create': 'Registrar gastos',
            'reportes.view': 'Ver reportes',
            'reportes.export': 'Exportar reportes',
            'personal.view': 'Ver personal',
            'personal.manage': 'Gestionar personal',
            'usuarios.view': 'Ver usuarios',
            'usuarios.manage': 'Gestionar usuarios',
            'config.view': 'Ver configuración',
            'config.manage': 'Gestionar configuración'
        };
        return descriptions[permission] || permission;
    }
};

// Hacer disponible globalmente
window.AuthManager = AuthManager;
window.ROLES = ROLES;
