/**
 * MODALES DE COMERCIALIZACIÓN (Ventas y Clientes)
 */

const VentasModal = {
    // Modal de Venta
    getVentaHTML() {
        return `
            <div class="modal-overlay" id="ventaModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Registrar Venta</h3>
                        <button class="modal-close" onclick="closeModal('ventaModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formVenta">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Fecha Venta *</label>
                                    <input type="date" class="form-input" name="fechaVenta" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Cliente *</label>
                                    <select class="form-select" name="clienteVenta" id="selectClienteVenta" required>
                                        <option value="">Seleccionar...</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Animales (IDs) *</label>
                                    <input type="text" class="form-input" name="animalesVenta" 
                                        placeholder="Ej: A001, A002, A003" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Peso Promedio Salida (kg) *</label>
                                    <input type="number" class="form-input" name="pesoSalida" step="0.1" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Precio kg Vivo ($) *</label>
                                    <input type="number" class="form-input" name="precioKg" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Condición Pago *</label>
                                    <select class="form-select" name="condicionPago" required>
                                        <option value="contado">Contado</option>
                                        <option value="15dias">15 días</option>
                                        <option value="30dias">30 días</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeModal('ventaModal')">Cancelar</button>
                        <button class="btn btn-success" onclick="VentasModal.guardarVenta()">Confirmar Venta</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Modal de Cliente
    getClienteHTML() {
        return `
            <div class="modal-overlay" id="clienteModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Nuevo Cliente</h3>
                        <button class="modal-close" onclick="closeModal('clienteModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formCliente">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Razón Social *</label>
                                    <input type="text" class="form-input" name="razonSocial" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">CUIT *</label>
                                    <input type="text" class="form-input" name="cuit" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Contacto *</label>
                                    <input type="text" class="form-input" name="contacto" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Teléfono *</label>
                                    <input type="tel" class="form-input" name="telefono" required>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeModal('clienteModal')">Cancelar</button>
                        <button class="btn btn-primary" onclick="VentasModal.guardarCliente()">Guardar Cliente</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    guardarVenta() {
        closeModal('ventaModal');
        UI.showToast('Venta registrada');
    },
    
    guardarCliente() {
        closeModal('clienteModal');
        UI.showToast('Cliente guardado');
    }
};