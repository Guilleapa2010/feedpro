/**
 * SISTEMA DE MODALES COMPARTIDO
 */

const ModalManager = {
    // Stack de modales abiertos
    stack: [],
    
    // Abrir modal
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal ${modalId} no encontrado`);
            return;
        }
        
        modal.classList.add('active');
        this.stack.push(modalId);
        
        // Focus trap
        this.setupFocusTrap(modal);
        
        // Evento de tecla Escape
        document.addEventListener('keydown', this.handleEscape);
    },
    
    // Cerrar modal
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Remover del stack
        this.stack = this.stack.filter(id => id !== modalId);
        
        // Limpiar eventos si no hay más modales
        if (this.stack.length === 0) {
            document.removeEventListener('keydown', this.handleEscape);
        }
    },
    
    // Cerrar todos los modales
    closeAll() {
        [...this.stack].forEach(id => this.close(id));
    },
    
    // Cerrar el modal más reciente
    closeTop() {
        if (this.stack.length > 0) {
            this.close(this.stack[this.stack.length - 1]);
        }
    },
    
    // Manejar tecla Escape
    handleEscape(e) {
        if (e.key === 'Escape') {
            ModalManager.closeTop();
        }
    },
    
    // Setup focus trap para accesibilidad
    setupFocusTrap(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
        
        firstFocusable.focus();
    },
    
    // Crear modal dinámicamente
    create(options) {
        const {
            id,
            title,
            content,
            width = '700px',
            onConfirm,
            onCancel,
            showFooter = true
        } = options;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = id;
        
        modal.innerHTML = `
            <div class="modal" style="max-width: ${width};">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="ModalManager.close('${id}')">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${showFooter ? `
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ModalManager.close('${id}')">Cancelar</button>
                        ${onConfirm ? `<button class="btn btn-primary" id="${id}-confirm">Confirmar</button>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        if (onConfirm) {
            document.getElementById(`${id}-confirm`).addEventListener('click', onConfirm);
        }
        
        return modal;
    }
};

// Funciones globales para compatibilidad
window.openModal = function(id) {
    ModalManager.open(id);
};

window.closeModal = function(id) {
    ModalManager.close(id);
};