/**
 * FUNCIONES UTILITARIAS GLOBALES
 */

// Formateo de números
const Formatters = {
    currency(value) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    },
    
    number(value, decimals = 0) {
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },
    
    percentage(value, decimals = 1) {
        return value.toFixed(decimals) + '%';
    },
    
    date(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
    },
    
    dateTime(dateString) {
        return new Date(dateString).toLocaleString('es-ES');
    }
};

// Utilidades de fecha
const DateUtils = {
    today() {
        return new Date().toISOString().split('T')[0];
    },
    
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    },
    
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    },
    
    format(date) {
        return new Date(date).toLocaleDateString('es-AR');
    },
    
    getNombreDia() {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return dias[new Date().getDay()];
    }
};

// Calculadoras
const Calculators = {
    // Ganancia de peso diaria
    gdp(pesoActual, pesoEntrada, dias) {
        if (!dias || dias === 0) return 0;
        return ((pesoActual - pesoEntrada) / dias).toFixed(2);
    },
    
    // Costo por kg de dieta
    costoDieta(composicion) {
        if (!composicion || !Array.isArray(composicion)) return 0;
        return composicion.reduce((sum, item) => {
            // Si el item trae su propio costo, usarlo; si no, buscar en la base de datos
            const costoUnitario = item.costo !== undefined ? parseFloat(item.costo) : (INGREDIENTES_DB[item.ingrediente] ? INGREDIENTES_DB[item.ingrediente].costo : 0);
            return sum + (costoUnitario * item.porcentaje / 100);
        }, 0);
    },
    
    // Nutrición total de dieta
    calcularNutricion(composicion) {
        const total = { 
            PB: 0, EM: 0, FC: 0, Grasa: 0, 
            Ca: 0, P: 0, NDT: 0, UFC: 0 
        };
        
        if (!composicion || !Array.isArray(composicion)) return total;
        
        composicion.forEach(item => {
            const ing = INGREDIENTES_DB[item.ingrediente];
            if (!ing) return;
            
            const p = item.porcentaje / 100;
            total.PB += ing.nutricion.PB * p;
            total.EM += ing.nutricion.EM * p;
            total.FC += ing.nutricion.FC * p;
            total.Grasa += ing.nutricion.Grasa * p;
            total.Ca += ing.nutricion.Ca * p;
            total.P += ing.nutricion.P * p;
            total.NDT += ing.nutricion.NDT * p;
            total.UFC += ing.nutricion.UFC * p;
        });
        
        return total;
    },
    
    // Validar rango
    inRange(value, min, max) {
        return value >= min && value <= max;
    }
};

// UI Helpers
const UI = {
    // Toggle sidebar en mobile
    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) overlay.classList.toggle('active');
    },

    // Cerrar sidebar en mobile
    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) overlay.classList.remove('active');
    },
    
    // Mostrar toast notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span style="font-size: 20px;">${icons[type] || icons.success}</span>
            <span style="font-weight: 500;">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },
    
    // Crear elemento HTML desde string
    createElement(html) {
        const div = document.createElement('div');
        div.innerHTML = html.trim();
        return div.firstChild;
    },
    
    // Crear modal
    createModal(id, content, width = '700px') {
        // Cerrar modal existente si hay
        this.closeModal(id);
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'modal-container';
        modal.style.cssText = `
            background: white;
            border-radius: 16px;
            max-width: ${width};
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        `;
        
        // Botón cerrar
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            z-index: 10;
        `;
        closeBtn.onclick = () => this.closeModal(id);
        
        // Contenido
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'padding: 30px; position: relative;';
        contentDiv.innerHTML = content;
        contentDiv.appendChild(closeBtn);
        
        modal.appendChild(contentDiv);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Animar entrada
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });
        
        // Cerrar al hacer click fuera
        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeModal(id);
        };
        
        // Cerrar con Escape
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(id);
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    },
    
    // Cerrar modal
    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.opacity = '0';
            const container = modal.querySelector('.modal-container');
            if (container) container.style.transform = 'scale(0.9)';
            setTimeout(() => modal.remove(), 300);
        }
    },
    
    // Debounce para eventos
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Validadores
const Validators = {
    required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    number(value, min, max) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;
    },
    
    percentage(value) {
        return this.number(value, 0, 100);
    },
    
    email(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
};