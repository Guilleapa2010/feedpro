/**
 * BOTÓN UNIVERSAL DE ACCIONES RÁPIDAS
 * Permite acceder rápidamente a las operaciones más frecuentes
 */

const QuickActions = {
    menuAbierto: false,
    
    // Asegurar que AppData esté inicializado
    ensureData() {
        if (typeof AppData === 'undefined') window.AppData = {};
        if (!AppData.animales) AppData.animales = [];
        if (!AppData.insumos) AppData.insumos = [];
        if (!AppData.corrales) AppData.corrales = [];
        if (!AppData.tratamientos) AppData.tratamientos = [];
        if (!AppData.ventas) AppData.ventas = [];
        if (!AppData.compras) AppData.compras = [];
        if (!AppData.proveedores) AppData.proveedores = [];
        if (!AppData.ordenesCompra) AppData.ordenesCompra = [];
        if (!AppData.sesionesSuministro) AppData.sesionesSuministro = [];
        if (!AppData.historialPesos) AppData.historialPesos = {};
    },
    
    init() {
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            const container = document.querySelector('.quick-actions-container');
            if (container && !container.contains(e.target) && this.menuAbierto) {
                this.cerrar();
            }
        });
        
        // Atajo de teclado: Ctrl+N o Ctrl+Shift+N
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.toggle();
            }
        });
    },
    
    toggle() {
        console.log('[QuickActions] Toggle llamado');
        const menu = document.getElementById('quickActionsMenu');
        if (!menu) {
            console.error('[QuickActions] Menu no encontrado');
            return;
        }
        
        if (this.menuAbierto) {
            this.cerrar();
        } else {
            this.abrir();
        }
    },
    
    abrir() {
        console.log('[QuickActions] Abriendo menu');
        const menu = document.getElementById('quickActionsMenu');
        if (menu) {
            menu.classList.remove('hidden');
            this.menuAbierto = true;
            console.log('[QuickActions] Menu abierto');
            
            // Agregar overlay
            const overlay = document.createElement('div');
            overlay.className = 'quick-actions-overlay';
            overlay.id = 'quickActionsOverlay';
            overlay.onclick = () => this.cerrar();
            document.body.appendChild(overlay);
        }
    },
    
    cerrar() {
        const menu = document.getElementById('quickActionsMenu');
        if (menu) {
            menu.classList.add('hidden');
            this.menuAbierto = false;
        }
        
        // Remover overlay
        const overlay = document.getElementById('quickActionsOverlay');
        if (overlay) {
            overlay.remove();
        }
    },
    
    // ============================================
    // ACCIONES RÁPIDAS - COMPRAS
    // ============================================
    
    nuevaCompra() {
        this.cerrar();
        // Abrir modal directamente sin navegar
        this.crearModalCompra();
    },
    
    crearModalCompra() {
        this.ensureData();
        const content = `
            <div style="padding: 25px; max-height: 85vh; overflow-y: auto;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #4caf50, #2e7d32); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                        🛒
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 22px;">Nueva Compra de Animales</h3>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Registre la entrada de ganado al establecimiento</p>
                    </div>
                </div>
                
                <!-- OPCIONES DE CARGA -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="QuickActions.mostrarFormCompraManual()">
                        📝 Carga Manual
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="QuickActions.abrirImportarExcelCompra()">
                        📁 Importar Excel
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="QuickActions.abrirLectorRFIDCompra()">
                        📡 Leer RFID
                    </button>
                </div>
                
                <form id="formCompra" onsubmit="QuickActions.guardarCompra(event)">
                    
                    <!-- DATOS BÁSICOS -->
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #666; text-transform: uppercase;">📋 Datos del Operación</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Fecha</label>
                                <input type="date" id="compraFecha" class="form-input" value="${DateUtils.today()}" required>
                            </div>
                            <div class="form-group">
                                <label>Proveedor</label>
                                <input type="text" id="compraProveedor" class="form-input" placeholder="Nombre del proveedor" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Cantidad Cabezas</label>
                                <input type="number" id="compraCantidad" class="form-input" min="1" required 
                                       onchange="QuickActions.calcularTotalCompra()">
                            </div>
                            <div class="form-group">
                                <label>Peso por Cabeza (kg)</label>
                                <input type="number" id="compraPesoPorCabeza" class="form-input" min="1" step="0.1" required
                                       onchange="QuickActions.calcularTotalCompra()">
                            </div>
                            <div class="form-group">
                                <label>Precio por kg ($)</label>
                                <input type="number" id="compraPrecioKg" class="form-input" min="0" step="0.01" required
                                       onchange="QuickActions.calcularTotalCompra()">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Corral de Destino</label>
                            <select id="compraCorral" class="form-select" required>
                                <option value="">Seleccione corral...</option>
                                ${this.getOpcionesCorrales()}
                            </select>
                        </div>
                    </div>
                    
                    <!-- LISTA DE ANIMALES INDIVIDUALES (para carga RFID/Excel) -->
                    <div id="listaAnimalesCompraContainer" style="display: none; background: #e3f2fd; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #1565c0; text-transform: uppercase;">
                            📋 Animales Cargados
                            <span id="contadorAnimalesCompra" class="badge badge-primary" style="margin-left: 10px;">0</span>
                        </h4>
                        <div id="listaAnimalesCompra" style="max-height: 200px; overflow-y: auto;">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>

                    <!-- GASTOS Y COMISIONES -->
                    <div style="background: #fff3e0; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #e65100; text-transform: uppercase;">💰 Gastos y Comisiones</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>% Comisión Consignatario</label>
                                <input type="number" id="compraComision" class="form-input" min="0" max="100" step="0.01" value="0"
                                       onchange="QuickActions.calcularTotalCompra()">
                            </div>
                            <div class="form-group">
                                <label>Costo Flete ($)</label>
                                <input type="number" id="compraFlete" class="form-input" min="0" step="0.01" value="0"
                                       onchange="QuickActions.calcularTotalCompra()">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Seguro ($)</label>
                                <input type="number" id="compraSeguro" class="form-input" min="0" step="0.01" value="0"
                                       onchange="QuickActions.calcularTotalCompra()">
                            </div>
                            <div class="form-group">
                                <label>Otros Gastos ($)</label>
                                <input type="number" id="compraOtros" class="form-input" min="0" step="0.01" value="0"
                                       onchange="QuickActions.calcularTotalCompra()">
                            </div>
                        </div>
                    </div>

                    <!-- LIQUIDACIÓN -->
                    <div style="background: linear-gradient(135deg, #1a5f3f, #2d8a5e); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase;">📑 Liquidación</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; opacity: 0.8;">
                                    <span>Cantidad de cabezas:</span>
                                    <span id="compLiqCantidad">0</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; opacity: 0.8;">
                                    <span>Peso por cabeza:</span>
                                    <span id="compLiqPesoPorCabeza">0 kg</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; opacity: 0.8;">
                                    <span>Precio por kg:</span>
                                    <span id="compLiqPrecioKg">$ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; opacity: 0.8;">
                                    <span>Costo por cabeza:</span>
                                    <span id="compLiqCostoPorCabeza">$ 0.00</span>
                                </div>
                                <div style="border-top: 1px solid rgba(255,255,255,0.3); margin: 8px 0; padding-top: 8px; display: flex; justify-content: space-between;">
                                    <span>Subtotal:</span>
                                    <span id="compLiqSubtotal" style="font-weight: 600;">$ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Comisión:</span>
                                    <span id="compLiqComision" style="font-weight: 600;">$ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Flete:</span>
                                    <span id="compLiqFlete" style="font-weight: 600;">$ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Seguro:</span>
                                    <span id="compLiqSeguro" style="font-weight: 600;">$ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Otros:</span>
                                    <span id="compLiqOtros" style="font-weight: 600;">$ 0.00</span>
                                </div>
                            </div>
                            <div>
                                <div style="border-top: 2px solid rgba(255,255,255,0.3); margin: 10px 0; padding-top: 10px; display: flex; justify-content: space-between; font-size: 18px;">
                                    <span style="font-weight: 700;">TOTAL:</span>
                                    <span id="compLiqTotal" style="font-weight: 700;">$ 0.00</span>
                                </div>
                                <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">
                                    Precio final por kg: <span id="compLiqPrecioFinal">$ 0.00</span>
                                </div>
                                <div style="font-size: 12px; opacity: 0.9; margin-top: 3px;">
                                    Inversión por cabeza: <span id="compLiqInversionPorCabeza">$ 0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Observaciones</label>
                        <textarea id="compraObservaciones" class="form-input" rows="2" 
                                  placeholder="Estado de los animales, transporte, etc."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.cerrarModalActual('modalNuevaCompra')">Cancelar</button>
                        <button type="submit" class="btn btn-success" style="font-size: 16px; padding: 12px 30px;">💾 Guardar Compra</button>
                    </div>
                </form>
            </div>
        `;
        
        this.crearYAbrirModal('modalNuevaCompra', content, '800px');
    },
    
    // Cerrar modal específico
    cerrarModalActual(id) {
        if (typeof ModalManager !== 'undefined' && ModalManager.close) {
            ModalManager.close(id);
        } else {
            const modal = document.getElementById(id);
            if (modal) modal.classList.remove('active');
        }
        
        // Remover del DOM después de la animación
        setTimeout(() => {
            const modal = document.getElementById(id);
            if (modal) modal.remove();
        }, 300);
    },
    
    // Cerrar todos los modales
    cerrarTodosLosModales() {
        if (typeof ModalManager !== 'undefined' && ModalManager.closeAll) {
            ModalManager.closeAll();
        } else {
            document.querySelectorAll('.modal-overlay').forEach(m => {
                m.classList.remove('active');
                setTimeout(() => m.remove(), 300);
            });
        }
    },
    
    // Mostrar notificación (con fallback)
    mostrarNotificacion(mensaje, tipo = 'info') {
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(mensaje, tipo);
        } else if (typeof showToast === 'function') {
            showToast(mensaje, tipo);
        } else {
            // Fallback simple
            console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
        }
    },
    
    // Helper para crear y abrir modales
    crearYAbrirModal(id, content, width = '700px') {
        console.log(`[QuickActions] Creando modal: ${id}`);
        
        // Eliminar modal existente si hay
        const existing = document.getElementById(id);
        if (existing) existing.remove();
        
        // Crear estructura del modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = id;
        
        modal.innerHTML = `
            <div class="modal" style="max-width: ${width}; width: 95%;">
                <div class="modal-body" style="padding: 0;">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log(`[QuickActions] Modal agregado al DOM`);
        
        // Abrir usando ModalManager si existe, sino manualmente
        if (typeof ModalManager !== 'undefined' && ModalManager.open) {
            console.log(`[QuickActions] Abriendo con ModalManager`);
            ModalManager.open(id);
        } else {
            console.log(`[QuickActions] Abriendo manualmente`);
            modal.classList.add('active');
        }
        console.log(`[QuickActions] Modal abierto`);
    },
    
    calcularTotalCompra() {
        const cantidad = parseFloat(document.getElementById('compraCantidad')?.value) || 0;
        const pesoPorCabeza = parseFloat(document.getElementById('compraPesoPorCabeza')?.value) || 0;
        const precioKg = parseFloat(document.getElementById('compraPrecioKg')?.value) || 0;
        
        // Calcular peso total
        const pesoTotal = cantidad * pesoPorCabeza;
        
        // Gastos
        const comisionPct = parseFloat(document.getElementById('compraComision')?.value) || 0;
        const flete = parseFloat(document.getElementById('compraFlete')?.value) || 0;
        const seguro = parseFloat(document.getElementById('compraSeguro')?.value) || 0;
        const otros = parseFloat(document.getElementById('compraOtros')?.value) || 0;
        
        // Cálculo: Cantidad × Peso × Precio = Total
        const costoPorCabeza = pesoPorCabeza * precioKg;
        const subtotal = cantidad * costoPorCabeza;
        const comision = subtotal * (comisionPct / 100);
        const total = subtotal + comision + flete + seguro + otros;
        
        const precioFinalKg = pesoPorCabeza > 0 ? total / (cantidad * pesoPorCabeza) : 0;
        const inversionPorCabeza = cantidad > 0 ? total / cantidad : 0;
        
        // Actualizar UI
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = typeof Formatters !== 'undefined' ? Formatters.currency(value) : '$ ' + value.toFixed(2);
        };
        
        // Mostrar datos del cálculo
        const elCantidad = document.getElementById('compLiqCantidad');
        if (elCantidad) elCantidad.textContent = cantidad;
        
        const elPesoPorCabeza = document.getElementById('compLiqPesoPorCabeza');
        if (elPesoPorCabeza) elPesoPorCabeza.textContent = pesoPorCabeza.toFixed(1) + ' kg';
        
        const elPrecioKg = document.getElementById('compLiqPrecioKg');
        if (elPrecioKg) elPrecioKg.textContent = '$ ' + precioKg.toFixed(2);
        
        const elCostoPorCabeza = document.getElementById('compLiqCostoPorCabeza');
        if (elCostoPorCabeza) elCostoPorCabeza.textContent = typeof Formatters !== 'undefined' ? Formatters.currency(costoPorCabeza) : '$ ' + costoPorCabeza.toFixed(2);
        
        setText('compLiqSubtotal', subtotal);
        setText('compLiqComision', comision);
        setText('compLiqFlete', flete);
        setText('compLiqSeguro', seguro);
        setText('compLiqOtros', otros);
        setText('compLiqTotal', total);
        
        const elPrecioFinal = document.getElementById('compLiqPrecioFinal');
        if (elPrecioFinal) elPrecioFinal.textContent = '$ ' + precioFinalKg.toFixed(2);
        
        const elInversion = document.getElementById('compLiqInversionPorCabeza');
        if (elInversion) elInversion.textContent = '$ ' + inversionPorCabeza.toFixed(2);
    },
    
    guardarCompra(e) {
        e.preventDefault();
        
        const cantidad = parseInt(document.getElementById('compraCantidad').value);
        const pesoPorCabeza = parseFloat(document.getElementById('compraPesoPorCabeza').value);
        const precioKg = parseFloat(document.getElementById('compraPrecioKg').value);
        
        // Calcular peso total
        const pesoTotal = cantidad * pesoPorCabeza;
        const subtotal = pesoTotal * precioKg;
        
        // Calcular totales
        const comisionPct = parseFloat(document.getElementById('compraComision').value) || 0;
        const flete = parseFloat(document.getElementById('compraFlete').value) || 0;
        const seguro = parseFloat(document.getElementById('compraSeguro').value) || 0;
        const otros = parseFloat(document.getElementById('compraOtros').value) || 0;
        
        const comision = subtotal * (comisionPct / 100);
        const total = subtotal + comision + flete + seguro + otros;
        
        const compra = {
            id: Date.now(),
            tipo: 'compra',
            fecha: document.getElementById('compraFecha').value,
            proveedor: document.getElementById('compraProveedor').value,
            cantidad: cantidad,
            pesoTotal: pesoTotal,
            pesoPromedio: pesoTotal / cantidad,
            precioKg: precioKg,
            precioKgFinal: total / pesoTotal,
            corralDestino: document.getElementById('compraCorral').value,
            
            // Gastos
            comisionPorcentaje: comisionPct,
            comisionMonto: comision,
            flete: flete,
            seguro: seguro,
            otrosGastos: otros,
            
            // Totales
            subtotal: subtotal,
            total: total,
            
            observaciones: document.getElementById('compraObservaciones').value,
            fechaRegistro: new Date().toISOString()
        };
        
        // Guardar en AppData
        if (!AppData.compras) AppData.compras = [];
        AppData.compras.unshift(compra);
        
        // Crear animales con costo real
        const costoPorAnimal = total / cantidad;
        
        // Si hay animales temporales (de Excel o RFID), usarlos
        if (this.animalesCompraTemp && this.animalesCompraTemp.length > 0) {
            this.animalesCompraTemp.forEach((datos, i) => {
                const animal = {
                    id: datos.caravana || datos.rfid || 'AN' + Date.now() + i,
                    rfid: datos.rfid || '',
                    caravana: datos.caravana || '',
                    fechaIngreso: compra.fecha,
                    pesoIngreso: datos.pesoInicial || pesoPorCabeza,
                    pesoActual: datos.pesoInicial || pesoPorCabeza,
                    corral: datos.corral || compra.corralDestino,
                    estado: 'engorde',
                    proveedor: compra.proveedor,
                    costoInicial: costoPorAnimal,
                    compraId: compra.id,
                    raza: datos.raza || 'Cruzado',
                    origen: datos.origen || 'Compra'
                };
                AppData.animales.push(animal);
            });
            // Limpiar array temporal
            this.animalesCompraTemp = [];
        } else {
            // Crear animales genéricos (carga manual)
            for (let i = 0; i < cantidad; i++) {
                const animal = {
                    id: 'AN' + Date.now() + i,
                    rfid: '',
                    fechaIngreso: compra.fecha,
                    pesoIngreso: pesoPorCabeza,
                    pesoActual: pesoPorCabeza,
                    corral: compra.corralDestino,
                    estado: 'engorde',
                    proveedor: compra.proveedor,
                    costoInicial: costoPorAnimal,
                    compraId: compra.id,
                    raza: 'Cruzado'
                };
                AppData.animales.push(animal);
            }
        }
        
        // Guardar datos
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('feedpro-data', JSON.stringify(AppData));
        }
        
        QuickActions.cerrarTodosLosModales();
        this.mostrarNotificacion(`✅ Compra registrada: ${cantidad} animales - Total: $${total.toFixed(2)}`, 'success');
        
        // Actualizar dashboard si estamos en esa sección
        if (typeof AppState !== 'undefined' && AppState.seccionActual === 'dashboard' && typeof DashboardSection !== 'undefined') {
            DashboardSection.render();
        }
    },
    
    // ============================================
    // ACCIONES RÁPIDAS - VENTAS
    // ============================================
    
    nuevaVenta() {
        this.cerrar();
        this.crearModalVenta();
    },
    
    crearModalVenta() {
        this.ensureData();
        const animalesDisponibles = AppData.animales.filter(a => a.estado === 'engorde');
        
        const content = `
            <div style="padding: 25px; max-height: 85vh; overflow-y: auto;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff9800, #f57c00); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                        💰
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 22px;">Nueva Venta</h3>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Faena o venta en pie</p>
                    </div>
                </div>
                <form id="formVenta" onsubmit="QuickActions.guardarVenta(event)">
                    
                    <!-- TIPO DE VENTA (Selector principal) -->
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase;">Seleccione el Tipo de Venta</h4>
                        <div style="display: flex; gap: 15px; justify-content: center;">
                            <label style="display: flex; align-items: center; gap: 10px; padding: 15px 25px; background: rgba(255,255,255,0.2); border-radius: 10px; cursor: pointer; transition: all 0.3s;" 
                                   onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                                <input type="radio" name="tipoVenta" value="faena" checked 
                                       onchange="QuickActions.cambiarTipoVenta(this.value)">
                                <div style="text-align: left;">
                                    <strong style="font-size: 16px;">🏭 Faena</strong>
                                    <div style="font-size: 12px; opacity: 0.9;">A frigorífico (consignación)</div>
                                </div>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 15px 25px; background: rgba(255,255,255,0.2); border-radius: 10px; cursor: pointer; transition: all 0.3s;"
                                   onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                                <input type="radio" name="tipoVenta" value="pie"
                                       onchange="QuickActions.cambiarTipoVenta(this.value)">
                                <div style="text-align: left;">
                                    <strong style="font-size: 16px;">🐂 En Pie</strong>
                                    <div style="font-size: 12px; opacity: 0.9;">A otro productor</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <!-- DATOS BÁSICOS -->
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #666; text-transform: uppercase;">📋 Datos de la Operación</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Fecha</label>
                                <input type="date" id="ventaFecha" class="form-input" value="${DateUtils.today()}" required>
                            </div>
                            <div class="form-group">
                                <label id="ventaLabelCliente">Frigorífico/Consignatario</label>
                                <input type="text" id="ventaCliente" class="form-input" placeholder="Nombre del frigorífico" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>N° Factura/Liquidación</label>
                                <input type="text" id="ventaFactura" class="form-input" placeholder="Ej: A-0001-48163">
                            </div>
                            <div class="form-group" id="ventaGrupoNroGuia">
                                <label>N° Guía</label>
                                <input type="text" id="ventaNroGuia" class="form-input" placeholder="Ej: D782177">
                            </div>
                        </div>
                    </div>

                    <!-- ANIMALES -->
                    <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #2e7d32; text-transform: uppercase;">🐂 Animales a Vender (${animalesDisponibles.length} disponibles)</h4>
                        <div style="max-height: 180px; overflow-y: auto; background: white; border-radius: 8px; padding: 10px; margin-bottom: 15px;">
                            ${animalesDisponibles.length === 0 ? 
                                '<p style="color: #888; text-align: center;">No hay animales disponibles para venta</p>' :
                                animalesDisponibles.map(a => `
                                    <label style="display: flex; align-items: center; gap: 10px; padding: 8px; 
                                                  border-bottom: 1px solid #eee; cursor: pointer;">
                                        <input type="checkbox" name="animalesVenta" value="${a.id}" 
                                               class="animal-venta-check" onchange="QuickActions.calcularTotalVenta()">
                                        <div style="flex: 1;">
                                            <strong>${a.rfid}</strong> - ${a.pesoActual} kg
                                            <div style="font-size: 12px; color: #666;">
                                                ${this.getCorralNombre(a.corral)} | Ingresó: ${DateUtils.format(a.fechaIngreso)}
                                            </div>
                                        </div>
                                    </label>
                                `).join('')
                            }
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Precio por kg ($)</label>
                                <input type="number" id="ventaPrecioKg" class="form-input" min="0" step="0.01" required
                                       onchange="QuickActions.calcularTotalVenta()">
                            </div>
                            <div class="form-group">
                                <label>Peso Total</label>
                                <input type="text" id="ventaPesoTotal" class="form-input" readonly value="0 kg"
                                       style="background: #f0f0f0; font-weight: 600;">
                            </div>
                        </div>
                    </div>

                    <!-- SUBIR FACTURA OCR -->
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">📄 Cargar Factura (OCR)</h4>
                        <p style="margin: 0 0 15px 0; font-size: 13px; opacity: 0.9;">
                            Sube una foto o PDF de la factura/liquidación y el sistema extraerá los datos automáticamente
                        </p>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <input type="file" id="facturaOCR" accept="image/*,.pdf" 
                                   style="display: none;"
                                   onchange="QuickActions.procesarFacturaOCR(this)">
                            <button type="button" class="btn" 
                                    style="background: white; color: #667eea; font-weight: 600;"
                                    onclick="document.getElementById('facturaOCR').click()">
                                📷 Subir Factura
                            </button>
                            <span id="ocrStatus" style="font-size: 13px;"></span>
                        </div>
                        <div id="ocrPreview" style="margin-top: 15px; display: none;">
                            <img id="ocrPreviewImg" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 2px solid white;">
                        </div>
                        <div id="ocrLoading" style="display: none; margin-top: 15px; text-align: center;">
                            <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                            <span style="margin-left: 10px;">Extrayendo información...</span>
                        </div>
                    </div>

                    <!-- SECCIÓN: COMISIONES Y GASTOS FAENA (Porcentajes fijos) -->
                    <div id="seccionFaena" style="background: #fff3e0; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #e65100; text-transform: uppercase;">💰 Comisiones y Gastos de Faena (Automáticos)</h4>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>% Comisión Consignatario</label>
                                <input type="number" id="ventaComision" class="form-input" min="0" max="100" step="0.01" value="1.0"
                                       onchange="QuickActions.calcularTotalVenta()">
                            </div>
                            <div class="form-group">
                                <label>C.S.E. <small style="color: #888;">(0.5% fijo)</small></label>
                                <input type="text" id="ventaCSE" class="form-input" readonly 
                                       style="background: #f0f0f0; color: #666;"
                                       value="$ 0.00">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>IMEBA <small style="color: #888;">(2.5% fijo)</small></label>
                                <input type="text" id="ventaIMEBA" class="form-input" readonly 
                                       style="background: #f0f0f0; color: #666;"
                                       value="$ 0.00">
                            </div>
                            <div class="form-group">
                                <label>INIA <small style="color: #888;">(0.5% fijo)</small></label>
                                <input type="text" id="ventaINIA" class="form-input" readonly 
                                       style="background: #f0f0f0; color: #666;"
                                       value="$ 0.00">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>MEVIR <small style="color: #888;">(0.25% fijo)</small></label>
                                <input type="text" id="ventaMEVIR" class="form-input" readonly 
                                       style="background: #f0f0f0; color: #666;"
                                       value="$ 0.00">
                            </div>
                            <div class="form-group">
                                <label>TCB/TCF <small style="color: #888;">(0.3% fijo)</small></label>
                                <input type="text" id="ventaTCB" class="form-input" readonly 
                                       style="background: #f0f0f0; color: #666;"
                                       value="$ 0.00">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Otros Gastos ($) <small style="color: #888;">(editable)</small></label>
                                <input type="number" id="ventaOtrosFaena" class="form-input" min="0" step="0.01" value="0"
                                       onchange="QuickActions.calcularTotalVenta()">
                            </div>
                        </div>
                    </div>
                    
                    <!-- SECCIÓN: VENTA EN PIE (Oculto por defecto) -->
                    <div id="seccionPie" style="background: #fff3e0; padding: 15px; border-radius: 10px; margin-bottom: 20px; display: none;">
                        <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #e65100; text-transform: uppercase;">💰 Gastos de Venta en Pie</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>% Comisión (si aplica)</label>
                                <input type="number" id="ventaComisionPie" class="form-input" min="0" max="100" step="0.01" value="0"
                                       onchange="QuickActions.calcularTotalVenta()">
                            </div>
                            <div class="form-group">
                                <label>Costo Flete ($)</label>
                                <input type="number" id="ventaFletePie" class="form-input" min="0" step="0.01" value="0"
                                       onchange="QuickActions.calcularTotalVenta()">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Otros Gastos ($)</label>
                                <input type="number" id="ventaOtrosPie" class="form-input" min="0" step="0.01" value="0"
                                       onchange="QuickActions.calcularTotalVenta()">
                            </div>
                        </div>
                    </div>

                    <!-- LIQUIDACIÓN -->
                    <div style="background: linear-gradient(135deg, #1a5f3f, #2d8a5e); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase;">📑 Liquidación Final</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Subtotal (animales):</span>
                                    <span id="ventLiqSubtotal" style="font-weight: 600;">$ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ffcdd2;">
                                    <span>Comisión consignatario:</span>
                                    <span id="ventLiqComision" style="font-weight: 600;">- $ 0.00</span>
                                </div>
                                <div id="ventLiqItemFlete" style="display: none; justify-content: space-between; margin-bottom: 8px; color: #ffcdd2;">
                                    <span>Flete:</span>
                                    <span id="ventLiqFlete" style="font-weight: 600;">- $ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ffcdd2;">
                                    <span>C.S.E. (0.5%):</span>
                                    <span id="ventLiqCSE" style="font-weight: 600;">- $ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ffcdd2;">
                                    <span>IMEBA (2.5%):</span>
                                    <span id="ventLiqIMEBA" style="font-weight: 600;">- $ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ffcdd2;">
                                    <span>INIA (0.5%):</span>
                                    <span id="ventLiqINIA" style="font-weight: 600;">- $ 0.00</span>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ffcdd2;">
                                    <span>MEVIR (0.25%):</span>
                                    <span id="ventLiqMEVIR" style="font-weight: 600;">- $ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ffcdd2;">
                                    <span>TCB/TCF (0.3%):</span>
                                    <span id="ventLiqTCB" style="font-weight: 600;">- $ 0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ffcdd2;">
                                    <span>Otros gastos:</span>
                                    <span id="ventLiqOtros" style="font-weight: 600;">- $ 0.00</span>
                                </div>
                                <div style="border-top: 2px solid rgba(255,255,255,0.3); margin: 10px 0; padding-top: 10px; display: flex; justify-content: space-between; font-size: 18px;">
                                    <span style="font-weight: 700;">TOTAL A COBRAR:</span>
                                    <span id="ventLiqTotal" style="font-weight: 700;">$ 0.00</span>
                                </div>
                                <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">
                                    Precio por kg final: <span id="ventLiqPrecioFinal">$ 0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Observaciones</label>
                        <textarea id="ventaObservaciones" class="form-input" rows="2" 
                                  placeholder="Plazo de pago, condiciones, etc."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.cerrarModalActual('modalNuevaVenta')">Cancelar</button>
                        <button type="submit" class="btn btn-success" style="font-size: 16px; padding: 12px 30px;" ${animalesDisponibles.length === 0 ? 'disabled' : ''}>
                            💾 Registrar Venta
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        this.crearYAbrirModal('modalNuevaVenta', content, '850px');
    },
    
    // Cambiar entre tipo de venta Faena o Pie
    cambiarTipoVenta(tipo) {
        const seccionFaena = document.getElementById('seccionFaena');
        const seccionPie = document.getElementById('seccionPie');
        const labelCliente = document.getElementById('ventaLabelCliente');
        const inputCliente = document.getElementById('ventaCliente');
        const itemFlete = document.getElementById('ventLiqItemFlete');
        
        if (tipo === 'faena') {
            seccionFaena.style.display = 'block';
            seccionPie.style.display = 'none';
            labelCliente.textContent = 'Frigorífico/Consignatario';
            inputCliente.placeholder = 'Nombre del frigorífico';
            if (itemFlete) itemFlete.style.display = 'none';
        } else {
            seccionFaena.style.display = 'none';
            seccionPie.style.display = 'block';
            labelCliente.textContent = 'Comprador/Productor';
            inputCliente.placeholder = 'Nombre del comprador';
            if (itemFlete) itemFlete.style.display = 'flex';
        }
        
        this.calcularTotalVenta();
    },
    
    // Procesar factura con OCR
    async procesarFacturaOCR(input) {
        const file = input.files[0];
        if (!file) return;
        
        const statusEl = document.getElementById('ocrStatus');
        const previewEl = document.getElementById('ocrPreview');
        const previewImg = document.getElementById('ocrPreviewImg');
        const loadingEl = document.getElementById('ocrLoading');
        
        // Mostrar preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                previewEl.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewEl.style.display = 'none';
        }
        
        statusEl.textContent = '📄 Procesando...';
        loadingEl.style.display = 'block';
        
        try {
            // Intentar usar Tesseract.js si está disponible
            if (typeof Tesseract !== 'undefined') {
                const result = await Tesseract.recognize(file, 'spa');
                this.extraerDatosFactura(result.data.text);
                statusEl.textContent = '✅ Datos extraídos';
            } else {
                // Fallback: Guardar archivo y mostrar mensaje
                await this.guardarFacturaAdjunta(file);
                statusEl.textContent = '✅ Factura guardada (OCR no disponible)';
            }
        } catch (error) {
            console.error('OCR Error:', error);
            statusEl.textContent = '⚠️ Error al procesar, factura guardada';
            await this.guardarFacturaAdjunta(file);
        } finally {
            loadingEl.style.display = 'none';
        }
    },
    
    // Guardar factura adjunta
    async guardarFacturaAdjunta(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Guardar en localStorage (base64)
                const facturaData = {
                    nombre: file.name,
                    tipo: file.type,
                    data: e.target.result,
                    fecha: new Date().toISOString()
                };
                if (!AppData.facturasAdjuntas) AppData.facturasAdjuntas = [];
                AppData.facturasAdjuntas.unshift(facturaData);
                
                if (typeof DataManager !== 'undefined' && DataManager.save) {
                    DataManager.save();
                } else if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('feedpro-data', JSON.stringify(AppData));
                }
                resolve();
            };
            reader.readAsDataURL(file);
        });
    },
    
    // Extraer datos de la factura usando patrones
    extraerDatosFactura(texto) {
        console.log('Texto extraído:', texto);
        
        // Patrones comunes de facturas uruguayas
        const patrones = {
            // Número de factura (formatos: A-0001-123456, 001-123456, etc.)
            factura: /(?:factura|liquidaci[oó]n|nro?)[\s:.-]*([A-Z]?[\s-]?\d{3,5}[\s-]\d{6,8})/i,
            
            // Fecha (formatos: 21/01/2026, 21-01-2026, etc.)
            fecha: /(\d{1,2}[\/\-]\d{1,2}[\/\-]20\d{2})/,
            
            // Cantidad de animales
            cantidad: /(\d+)\s*(?:vacas?|novillos?|toros?|animales?|cabezas?)/i,
            
            // Peso total
            pesoTotal: /(\d+[.,]?\d*)\s*(?:kg|kilo)/i,
            
            // Precio por kg
            precioKg: /[\$\s]*(\d+[.,]?\d*)\s*(?:por|x|\/)?\s*kg/i,
            
            // Total/Subtotal
            total: /(?:total|subtotal|importe)[\s:.$]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
            
            // Cliente/Frigorífico (línea que contiene el nombre después de "Señor(es)" o similar)
            cliente: /(?:se[nñ]or\(es\)|cliente|comprador)[\s:]*([A-Z][A-Z\s&]+(?:S\.A\.|S\.R\.L\.|LTDA|SA|SRL)?)/i
        };
        
        const datosExtraidos = {};
        
        // Extraer cada dato
        for (const [campo, regex] of Object.entries(patrones)) {
            const match = texto.match(regex);
            if (match) {
                datosExtraidos[campo] = match[1].trim();
            }
        }
        
        console.log('Datos extraídos:', datosExtraidos);
        
        // Llenar formulario con datos extraídos
        if (datosExtraidos.factura) {
            const facturaInput = document.getElementById('ventaFactura');
            if (facturaInput) facturaInput.value = datosExtraidos.factura;
        }
        
        if (datosExtraidos.fecha) {
            const fechaInput = document.getElementById('ventaFecha');
            if (fechaInput) {
                // Convertir formato DD/MM/YYYY a YYYY-MM-DD
                const partes = datosExtraidos.fecha.split(/[\/\-]/);
                if (partes.length === 3) {
                    fechaInput.value = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                }
            }
        }
        
        if (datosExtraidos.precioKg) {
            const precioInput = document.getElementById('ventaPrecioKg');
            if (precioInput) {
                precioInput.value = datosExtraidos.precioKg.replace(',', '.');
            }
        }
        
        if (datosExtraidos.cliente) {
            const clienteInput = document.getElementById('ventaCliente');
            if (clienteInput) clienteInput.value = datosExtraidos.cliente;
        }
        
        // Recalcular totales
        this.calcularTotalVenta();
        
        // Notificar
        const camposEncontrados = Object.keys(datosExtraidos).length;
        if (camposEncontrados > 0) {
            this.mostrarNotificacion(`✅ OCR: ${camposEncontrados} campos detectados`, 'success');
        }
    },
    
    // Porcentajes fijos de gastos de faena
    GASTOS_FAENA_PCT: {
        cse: 0.5,      // Contribución Seguridad Social
        imeba: 2.5,    // Impuesto a la Carne
        inia: 0.5,     // INIA
        mevir: 0.25,   // MEVIR
        tcb: 0.3       // TCB/TCF
    },
    
    calcularTotalVenta() {
        const checkboxes = document.querySelectorAll('.animal-venta-check:checked');
        const precioKg = parseFloat(document.getElementById('ventaPrecioKg')?.value) || 0;
        
        let pesoTotal = 0;
        checkboxes.forEach(cb => {
            const animal = AppData.animales.find(a => a.id === cb.value);
            if (animal) pesoTotal += animal.pesoActual;
        });
        
        // Actualizar peso total
        const pesoInput = document.getElementById('ventaPesoTotal');
        if (pesoInput) pesoInput.value = pesoTotal.toFixed(1) + ' kg';
        
        // Cálculos base
        const subtotal = pesoTotal * precioKg;
        
        // Determinar tipo de venta
        const tipoVenta = document.querySelector('input[name="tipoVenta"]:checked')?.value || 'faena';
        
        let comision = 0, flete = 0, otros = 0;
        let gastosFaenaDetalle = { cse: 0, imeba: 0, inia: 0, mevir: 0, tcb: 0 };
        
        if (tipoVenta === 'faena') {
            // Gastos de faena - Porcentajes fijos automáticos
            const comisionPct = parseFloat(document.getElementById('ventaComision')?.value) || 0;
            const otrosFaena = parseFloat(document.getElementById('ventaOtrosFaena')?.value) || 0;
            
            comision = subtotal * (comisionPct / 100);
            gastosFaenaDetalle.cse = subtotal * (this.GASTOS_FAENA_PCT.cse / 100);
            gastosFaenaDetalle.imeba = subtotal * (this.GASTOS_FAENA_PCT.imeba / 100);
            gastosFaenaDetalle.inia = subtotal * (this.GASTOS_FAENA_PCT.inia / 100);
            gastosFaenaDetalle.mevir = subtotal * (this.GASTOS_FAENA_PCT.mevir / 100);
            gastosFaenaDetalle.tcb = subtotal * (this.GASTOS_FAENA_PCT.tcb / 100);
            otros = otrosFaena;
            
            // Actualizar inputs de gastos faena (solo visuales)
            const updateInput = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.value = '$ ' + value.toFixed(2);
            };
            updateInput('ventaCSE', gastosFaenaDetalle.cse);
            updateInput('ventaIMEBA', gastosFaenaDetalle.imeba);
            updateInput('ventaINIA', gastosFaenaDetalle.inia);
            updateInput('ventaMEVIR', gastosFaenaDetalle.mevir);
            updateInput('ventaTCB', gastosFaenaDetalle.tcb);
        } else {
            // Gastos de venta en pie
            const comisionPct = parseFloat(document.getElementById('ventaComisionPie')?.value) || 0;
            flete = parseFloat(document.getElementById('ventaFletePie')?.value) || 0;
            otros = parseFloat(document.getElementById('ventaOtrosPie')?.value) || 0;
            comision = subtotal * (comisionPct / 100);
        }
        
        // Total (sin impuestos)
        const gastosFaenaTotal = Object.values(gastosFaenaDetalle).reduce((a, b) => a + b, 0);
        const total = subtotal - comision - flete - gastosFaenaTotal - otros;
        const precioFinalKg = pesoTotal > 0 ? total / pesoTotal : 0;
        
        // Actualizar UI
        const setText = (id, value, esNegativo = false) => {
            const el = document.getElementById(id);
            if (el) {
                const signo = esNegativo && value > 0 ? '- ' : '';
                el.textContent = signo + (typeof Formatters !== 'undefined' ? Formatters.currency(value) : '$ ' + value.toFixed(2));
            }
        };
        
        setText('ventLiqSubtotal', subtotal);
        setText('ventLiqComision', comision, true);
        setText('ventLiqFlete', flete, true);
        setText('ventLiqCSE', gastosFaenaDetalle.cse, true);
        setText('ventLiqIMEBA', gastosFaenaDetalle.imeba, true);
        setText('ventLiqINIA', gastosFaenaDetalle.inia, true);
        setText('ventLiqMEVIR', gastosFaenaDetalle.mevir, true);
        setText('ventLiqTCB', gastosFaenaDetalle.tcb, true);
        setText('ventLiqOtros', otros, true);
        setText('ventLiqTotal', total);
        
        const elPrecioFinal = document.getElementById('ventLiqPrecioFinal');
        if (elPrecioFinal) elPrecioFinal.textContent = '$ ' + precioFinalKg.toFixed(2) + '/kg';
    },
    
    guardarVenta(e) {
        e.preventDefault();
        
        const checkboxes = document.querySelectorAll('.animal-venta-check:checked');
        const animalesIds = Array.from(checkboxes).map(cb => cb.value);
        
        if (animalesIds.length === 0) {
            this.mostrarNotificacion('Seleccione al menos un animal', 'error');
            return;
        }
        
        // Calcular peso total y subtotal
        let pesoTotal = 0;
        animalesIds.forEach(id => {
            const animal = AppData.animales.find(a => a.id === id);
            if (animal) pesoTotal += animal.pesoActual;
        });
        
        const precioKg = parseFloat(document.getElementById('ventaPrecioKg').value);
        const subtotal = pesoTotal * precioKg;
        
        // Determinar tipo de venta
        const tipoVenta = document.querySelector('input[name="tipoVenta"]:checked')?.value || 'faena';
        
        // Leer gastos según tipo
        let comisionPct = 0, flete = 0, otros = 0;
        let detalleGastosFaena = {};
        
        if (tipoVenta === 'faena') {
            // Gastos de faena - Porcentajes fijos calculados automáticamente
            comisionPct = parseFloat(document.getElementById('ventaComision')?.value) || 0;
            otros = parseFloat(document.getElementById('ventaOtrosFaena')?.value) || 0;
            
            // Calcular gastos automáticos según porcentajes fijos
            detalleGastosFaena = {
                cse: subtotal * (this.GASTOS_FAENA_PCT.cse / 100),
                imeba: subtotal * (this.GASTOS_FAENA_PCT.imeba / 100),
                inia: subtotal * (this.GASTOS_FAENA_PCT.inia / 100),
                mevir: subtotal * (this.GASTOS_FAENA_PCT.mevir / 100),
                tcb: subtotal * (this.GASTOS_FAENA_PCT.tcb / 100),
                otros: otros
            };
        } else {
            // Gastos de venta en pie
            comisionPct = parseFloat(document.getElementById('ventaComisionPie')?.value) || 0;
            flete = parseFloat(document.getElementById('ventaFletePie')?.value) || 0;
            otros = parseFloat(document.getElementById('ventaOtrosPie')?.value) || 0;
        }
        
        // Calcular
        const comision = subtotal * (comisionPct / 100);
        const gastosFaenaTotal = tipoVenta === 'faena' ? 
            Object.values(detalleGastosFaena).reduce((a, b) => a + b, 0) : 0;
        const total = subtotal - comision - flete - gastosFaenaTotal - otros;
        
        const venta = {
            id: Date.now(),
            tipo: 'venta',
            tipoVenta: tipoVenta,
            fecha: document.getElementById('ventaFecha').value,
            cliente: document.getElementById('ventaCliente').value,
            factura: document.getElementById('ventaFactura').value,
            guia: document.getElementById('ventaNroGuia')?.value || '',
            animales: animalesIds,
            cantidad: animalesIds.length,
            pesoTotal: pesoTotal,
            precioKg: precioKg,
            precioKgFinal: total / pesoTotal,
            
            // Comisión
            comisionPorcentaje: comisionPct,
            comisionMonto: comision,
            
            // Gastos según tipo
            gastos: tipoVenta === 'faena' ? {
                ...detalleGastosFaena,
                totalGastosFaena: gastosFaenaTotal
            } : {
                flete: flete,
                otros: otros,
                totalGastos: flete + otros
            },
            flete: tipoVenta === 'pie' ? flete : 0,
            
            // Totales (sin impuestos)
            subtotal: subtotal,
            total: total,
            
            observaciones: document.getElementById('ventaObservaciones').value,
            fechaRegistro: new Date().toISOString()
        };
        
        // Marcar animales como vendidos
        animalesIds.forEach(id => {
            const animal = AppData.animales.find(a => a.id === id);
            if (animal) {
                animal.estado = 'vendido';
                animal.fechaVenta = venta.fecha;
                animal.precioVenta = precioKg;
                animal.precioVentaFinal = total / pesoTotal;
                animal.ventaId = venta.id;
            }
        });
        
        if (!AppData.ventas) AppData.ventas = [];
        AppData.ventas.unshift(venta);
        
        // Guardar datos
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('feedpro-data', JSON.stringify(AppData));
        }
        
        QuickActions.cerrarTodosLosModales();
        const tipoStr = tipoVenta === 'faena' ? 'Faena' : 'Venta en pie';
        this.mostrarNotificacion(`✅ ${tipoStr} registrada: ${animalesIds.length} animales - Total: $${total.toFixed(2)}`, 'success');
    },
    
    // ============================================
    // ACCIONES RÁPIDAS - MOVIMIENTOS
    // ============================================
    
    nuevoMovimiento() {
        this.cerrar();
        // Abrir modal directamente sin navegar
        this.crearModalMovimiento();
    },
    
    crearModalMovimiento() {
        this.ensureData();
        const animalesDisponibles = AppData.animales.filter(a => a.estado === 'engorde');
        const corrales = [...new Set(AppData.animales.map(a => a.corral).filter(Boolean))];
        
        const content = `
            <div style="padding: 20px;">
                <h3>🔄 Mover Animales entre Corrales</h3>
                <form id="formMovimiento" onsubmit="QuickActions.guardarMovimiento(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="movFecha" class="form-input" value="${DateUtils.today()}" required>
                        </div>
                        <div class="form-group">
                            <label>Motivo</label>
                            <select id="movMotivo" class="form-select">
                                <option value="rotacion">Rotación de pastura</option>
                                <option value="engorde">Cambio de etapa (engorde)</option>
                                <option value="sanidad">Aislamiento sanitario</option>
                                <option value="venta">Preparación para venta</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Seleccionar Animales</label>
                        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; padding: 10px;">
                            ${animalesDisponibles.map(a => `
                                <label style="display: flex; align-items: center; gap: 10px; padding: 8px; 
                                              border-bottom: 1px solid #eee; cursor: pointer;">
                                    <input type="checkbox" name="animalesMov" value="${a.id}">
                                    <div style="flex: 1;">
                                        <strong>${a.rfid}</strong> - ${a.pesoActual} kg
                                    </div>
                                    <span class="badge" style="background: #e3f2fd; color: #1565c0;">
                                        ${this.getCorralNombre(a.corral)}
                                    </span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Corral de Destino</label>
                        <select id="movCorralDestino" class="form-select" required>
                            <option value="">Seleccione destino...</option>
                            ${this.getOpcionesCorrales()}
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.cerrarModalActual('modalMovimiento')">Cancelar</button>
                        <button type="submit" class="btn btn-primary">🔄 Realizar Movimiento</button>
                    </div>
                </form>
            </div>
        `;
        
        this.crearYAbrirModal('modalMovimiento', content, '750px');
    },
    
    guardarMovimiento(e) {
        e.preventDefault();
        
        const checkboxes = document.querySelectorAll('input[name="animalesMov"]:checked');
        const animalesIds = Array.from(checkboxes).map(cb => cb.value);
        
        if (animalesIds.length === 0) {
            this.mostrarNotificacion('Seleccione al menos un animal', 'error');
            return;
        }
        
        const corralDestino = document.getElementById('movCorralDestino').value;
        const fecha = document.getElementById('movFecha').value;
        const motivo = document.getElementById('movMotivo').value;
        
        // Mover animales
        let movidos = 0;
        animalesIds.forEach(id => {
            const animal = AppData.animales.find(a => a.id === id);
            if (animal && animal.corral !== corralDestino) {
                // Guardar historial
                if (!animal.historialCorrales) animal.historialCorrales = [];
                animal.historialCorrales.push({
                    fecha: fecha,
                    de: animal.corral,
                    a: corralDestino,
                    motivo: motivo
                });
                
                animal.corral = corralDestino;
                movidos++;
            }
        });
        
        // Guardar datos
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('feedpro-data', JSON.stringify(AppData));
        }
        
        QuickActions.cerrarTodosLosModales();
        this.mostrarNotificacion(`✅ ${movidos} animales movidos a ${this.getCorralNombre(corralDestino)}`, 'success');
    },
    
    // ============================================
    // ACCIONES RÁPIDAS - SUMINISTRO
    // ============================================
    
    nuevaSesionSuministro() {
        this.cerrar();
        // Navegar a suministro e iniciar sesión inmediatamente
        navigate('suministro');
        setTimeout(() => {
            if (typeof SuministroSection !== 'undefined' && SuministroSection.iniciarSesion) {
                SuministroSection.iniciarSesion();
            }
        }, 200);
    },
    
    // ============================================
    // ACCIONES RÁPIDAS - SANIDAD
    // ============================================
    
    nuevoTratamiento() {
        this.cerrar();
        // Abrir modal directamente sin navegar
        this.crearModalTratamiento();
    },
    
    crearModalTratamiento() {
        this.ensureData();
        const animalesDisponibles = AppData.animales.filter(a => a.estado === 'engorde');
        
        const content = `
            <div style="padding: 25px; max-height: 85vh; overflow-y: auto;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #e91e63, #c2185b); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                        💉
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 22px;">Nuevo Tratamiento Sanitario</h3>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Vacunación, desparasitación o tratamiento</p>
                    </div>
                </div>
                <form id="formTratamiento" onsubmit="QuickActions.guardarTratamiento(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="tratFecha" class="form-input" value="${DateUtils.today()}" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <select id="tratTipo" class="form-select" required>
                                <option value="">Seleccione...</option>
                                <option value="vacunacion">Vacunación</option>
                                <option value="desparasitacion">Desparasitación</option>
                                <option value="antibiotico">Antibiótico</option>
                                <option value="vitaminas">Vitaminas/Minerales</option>
                                <option value="curativo">Curativo</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Producto/Medicamento</label>
                        <input type="text" id="tratProducto" class="form-input" placeholder="Nombre del producto" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Dosis</label>
                            <input type="text" id="tratDosis" class="form-input" placeholder="Ej: 5ml por animal">
                        </div>
                        <div class="form-group">
                            <label>Vía de administración</label>
                            <select id="tratVia" class="form-select">
                                <option value="subcutanea">Subcutánea</option>
                                <option value="intramuscular">Intramuscular</option>
                                <option value="oral">Oral</option>
                                <option value="endovenosa">Endovenosa</option>
                                <option value="topica">Tópica</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Aplicar a:</label>
                        <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                                <input type="radio" name="tratAplicacion" value="todos" checked 
                                       onchange="QuickActions.toggleAnimalesTratamiento()">
                                Todos los animales
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                                <input type="radio" name="tratAplicacion" value="seleccion" 
                                       onchange="QuickActions.toggleAnimalesTratamiento()">
                                Seleccionar animales
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                                <input type="radio" name="tratAplicacion" value="corral" 
                                       onchange="QuickActions.toggleAnimalesTratamiento()">
                                Por corral
                            </label>
                        </div>
                        
                        <div id="tratCorralSelector" style="display: none;">
                            <select id="tratCorral" class="form-select">
                                <option value="">Seleccione corral...</option>
                                ${this.getOpcionesCorrales()}
                            </select>
                        </div>
                        
                        <div id="tratAnimalesSelector" style="display: none; max-height: 150px; overflow-y: auto; 
                                                                  border: 1px solid #ddd; border-radius: 8px; padding: 10px;">
                            ${animalesDisponibles.map(a => `
                                <label style="display: block; padding: 5px; cursor: pointer;">
                                    <input type="checkbox" name="tratAnimales" value="${a.id}">
                                    ${a.rfid} - ${a.pesoActual}kg (${this.getCorralNombre(a.corral)})
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha de próxima aplicación (opcional)</label>
                            <input type="date" id="tratProxima" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Costo ($)</label>
                            <input type="number" id="tratCosto" class="form-input" min="0" step="0.01">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Observaciones</label>
                        <textarea id="tratObservaciones" class="form-input" rows="2"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.cerrarModalActual('modalTratamiento')">Cancelar</button>
                        <button type="submit" class="btn btn-success">💉 Registrar Tratamiento</button>
                    </div>
                </form>
            </div>
        `;
        
        this.crearYAbrirModal('modalTratamiento', content, '750px');
    },
    
    toggleAnimalesTratamiento() {
        const tipo = document.querySelector('input[name="tratAplicacion"]:checked')?.value;
        const corralDiv = document.getElementById('tratCorralSelector');
        const animalesDiv = document.getElementById('tratAnimalesSelector');
        
        if (corralDiv) corralDiv.style.display = tipo === 'corral' ? 'block' : 'none';
        if (animalesDiv) animalesDiv.style.display = tipo === 'seleccion' ? 'block' : 'none';
    },
    
    guardarTratamiento(e) {
        e.preventDefault();
        
        const tipoAplicacion = document.querySelector('input[name="tratAplicacion"]:checked')?.value;
        let animalesIds = [];
        
        if (tipoAplicacion === 'todos') {
            animalesIds = AppData.animales.filter(a => a.estado === 'engorde').map(a => a.id);
        } else if (tipoAplicacion === 'corral') {
            const corral = document.getElementById('tratCorral').value;
            animalesIds = AppData.animales.filter(a => a.corral === corral && a.estado === 'engorde').map(a => a.id);
        } else if (tipoAplicacion === 'seleccion') {
            const checkboxes = document.querySelectorAll('input[name="tratAnimales"]:checked');
            animalesIds = Array.from(checkboxes).map(cb => cb.value);
        }
        
        if (animalesIds.length === 0) {
            this.mostrarNotificacion('No hay animales seleccionados para el tratamiento', 'error');
            return;
        }
        
        const tratamiento = {
            id: Date.now(),
            fecha: document.getElementById('tratFecha').value,
            tipo: document.getElementById('tratTipo').value,
            producto: document.getElementById('tratProducto').value,
            dosis: document.getElementById('tratDosis').value,
            via: document.getElementById('tratVia').value,
            animales: animalesIds,
            proximaAplicacion: document.getElementById('tratProxima').value,
            costo: parseFloat(document.getElementById('tratCosto').value) || 0,
            observaciones: document.getElementById('tratObservaciones').value,
            aplicadoPor: AppState.usuario?.nombre || 'Sistema'
        };
        
        if (!AppData.tratamientos) AppData.tratamientos = [];
        AppData.tratamientos.unshift(tratamiento);
        
        // Actualizar estado de animales si es tratamiento curativo
        if (tratamiento.tipo === 'curativo' || tratamiento.tipo === 'antibiotico') {
            animalesIds.forEach(id => {
                const animal = AppData.animales.find(a => a.id === id);
                if (animal) {
                    animal.estadoSalud = 'en_tratamiento';
                }
            });
        }
        
        // Guardar datos
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('feedpro-data', JSON.stringify(AppData));
        }
        
        QuickActions.cerrarTodosLosModales();
        this.mostrarNotificacion(`✅ Tratamiento registrado en ${animalesIds.length} animales`, 'success');
    },
    
    // ============================================
    // ACCIONES RÁPIDAS - INSUMOS
    // ============================================
    
    nuevaOrdenCompra() {
        this.cerrar();
        // Abrir modal directamente sin navegar
        this.crearModalOrdenCompra();
    },
    
    crearModalOrdenCompra() {
        this.ensureData();
        const insumos = AppData.insumos || [];
        
        const content = `
            <div style="padding: 25px; max-height: 85vh; overflow-y: auto;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #9c27b0, #7b1fa2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                        📋
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 22px;">Nueva Orden de Compra</h3>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Solicitud de insumos o alimentos</p>
                    </div>
                </div>
                <form id="formOrden" onsubmit="QuickActions.guardarOrden(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="ordenFecha" class="form-input" value="${DateUtils.today()}" required>
                        </div>
                        <div class="form-group">
                            <label>Proveedor</label>
                            <select id="ordenProveedor" class="form-select" required>
                                <option value="">Seleccione...</option>
                                ${(AppData.proveedores || []).map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Insumos a Comprar</label>
                        <div id="ordenItems">
                            <div class="orden-item" style="display: flex; gap: 10px; margin-bottom: 10px;">
                                <select class="orden-insumo form-select" style="flex: 2;" onchange="QuickActions.actualizarPrecioOrden(this)">
                                    <option value="">Seleccione insumo...</option>
                                    ${insumos.map(i => `<option value="${i.id}" data-precio="${i.costo}">${i.nombre}</option>`).join('')}
                                </select>
                                <input type="number" class="orden-cantidad form-input" placeholder="Cantidad" 
                                       style="flex: 1;" min="1" onchange="QuickActions.calcularTotalOrden()">
                                <input type="number" class="orden-precio form-input" placeholder="Precio ($/ton)" 
                                       style="flex: 1;" min="0" step="1" onchange="QuickActions.calcularTotalOrden()">
                                <button type="button" class="btn btn-danger" onclick="this.parentElement.remove(); QuickActions.calcularTotalOrden();">🗑️</button>
                            </div>
                        </div>
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.agregarItemOrden()">
                            ➕ Agregar Insumo
                        </button>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong>Total de la Orden:</strong>
                            <span id="ordenTotal" style="font-size: 24px; font-weight: 700; color: var(--primary, #1a5f3f);">
                                $ 0.00
                            </span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Observaciones</label>
                        <textarea id="ordenObservaciones" class="form-input" rows="2"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.cerrarModalActual('modalOrden')">Cancelar</button>
                        <button type="submit" class="btn btn-success">📋 Crear Orden</button>
                    </div>
                </form>
            </div>
        `;
        
        this.crearYAbrirModal('modalOrden', content, '850px');
    },
    
    agregarItemOrden() {
        const container = document.getElementById('ordenItems');
        const insumos = AppData.insumos || [];
        
        const div = document.createElement('div');
        div.className = 'orden-item';
        div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';
        div.innerHTML = `
            <select class="orden-insumo form-select" style="flex: 2;" onchange="QuickActions.actualizarPrecioOrden(this)">
                <option value="">Seleccione insumo...</option>
                ${insumos.map(i => `<option value="${i.id}" data-precio="${i.costo}">${i.nombre}</option>`).join('')}
            </select>
            <input type="number" class="orden-cantidad form-input" placeholder="Cantidad" 
                   style="flex: 1;" min="1" onchange="QuickActions.calcularTotalOrden()">
            <input type="number" class="orden-precio form-input" placeholder="Precio unit." 
                   style="flex: 1;" min="0" step="0.01" onchange="QuickActions.calcularTotalOrden()">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.remove(); QuickActions.calcularTotalOrden();">🗑️</button>
        `;
        container.appendChild(div);
    },
    
    actualizarPrecioOrden(select) {
        const option = select.selectedOptions[0];
        const precio = option?.dataset?.precio || 0;
        const precioInput = select.parentElement.querySelector('.orden-precio');
        if (precioInput) {
            precioInput.value = precio;
        }
        this.calcularTotalOrden();
    },
    
    calcularTotalOrden() {
        const items = document.querySelectorAll('.orden-item');
        let total = 0;
        
        items.forEach(item => {
            const cantidad = parseFloat(item.querySelector('.orden-cantidad')?.value) || 0;
            const precio = parseFloat(item.querySelector('.orden-precio')?.value) || 0;
            total += cantidad * (precio / 1000);
        });
        
        const totalEl = document.getElementById('ordenTotal');
        if (totalEl) {
            totalEl.textContent = Formatters.currency(total);
        }
    },
    
    guardarOrden(e) {
        e.preventDefault();
        
        const items = [];
        document.querySelectorAll('.orden-item').forEach(item => {
            const insumoId = item.querySelector('.orden-insumo')?.value;
            const cantidad = parseFloat(item.querySelector('.orden-cantidad')?.value);
            const precio = parseFloat(item.querySelector('.orden-precio')?.value);
            
            if (insumoId && cantidad && precio) {
                const insumo = AppData.insumos.find(i => i.id == insumoId);
                items.push({
                    insumoId,
                    nombre: insumo?.nombre || '',
                    cantidad,
                    precioUnitario: precio,
                    subtotal: cantidad * (precio / 1000)
                });
            }
        });
        
        if (items.length === 0) {
            this.mostrarNotificacion('Agregue al menos un insumo', 'error');
            return;
        }
        
        const orden = {
            id: Date.now(),
            fecha: document.getElementById('ordenFecha').value,
            proveedor: document.getElementById('ordenProveedor').value,
            items,
            total: items.reduce((sum, i) => sum + i.subtotal, 0),
            observaciones: document.getElementById('ordenObservaciones').value,
            estado: 'pendiente',
            creadaPor: AppState.usuario?.nombre || 'Sistema'
        };
        
        if (!AppData.ordenesCompra) AppData.ordenesCompra = [];
        AppData.ordenesCompra.unshift(orden);
        
        // Guardar datos
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('feedpro-data', JSON.stringify(AppData));
        }
        
        QuickActions.cerrarTodosLosModales();
        this.mostrarNotificacion(`✅ Orden #${orden.id} creada`, 'success');
    },
    
    // ============================================
    // ACCIONES RÁPIDAS - PESAJE
    // ============================================
    
    registrarPesaje() {
        this.cerrar();
        // Abrir modal directamente sin navegar
        this.crearModalPesaje();
    },
    
    crearModalPesaje() {
        this.ensureData();
        const animalesDisponibles = AppData.animales.filter(a => a.estado === 'engorde');
        
        // Validación: si no hay animales disponibles
        const tablaContenido = animalesDisponibles.length === 0 
            ? `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #666;">
                <div style="font-size: 24px; margin-bottom: 10px;">🐄</div>
                <div>No hay animales en estado "Engorde" para pesar.</div>
                <div style="font-size: 12px; margin-top: 5px;">Registre animales primero usando "Alta de Animal"</div>
               </td></tr>`
            : animalesDisponibles.map(a => {
                const rfid = (a.rfid || a.id || 'SIN_RFID').toString();
                const animalId = (a.id || '').toString();
                const pesoActual = parseFloat(a.pesoActual) || 0;
                return `
                <tr class="pesaje-fila" data-rfid="${rfid.toLowerCase()}" data-animal-id="${animalId}">
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        <strong>${rfid}</strong>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        ${this.getCorralNombre(a.corral)}
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                        ${pesoActual.toFixed(1)} kg
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                        <div style="display: flex; align-items: center; gap: 5px; justify-content: flex-end;">
                            <input type="number" class="form-input pesaje-nuevo" id="peso-${animalId}"
                                   data-animal="${animalId}" data-anterior="${pesoActual}"
                                   style="width: 100px; text-align: right;" min="1" step="0.1"
                                   onchange="QuickActions.calcularGanancia(this)">
                            <button type="button" class="btn btn-secondary btn-sm" 
                                    onclick="QuickActions.leerBalanzaParaAnimal('${animalId}')"
                                    title="Leer de balanza">
                                ⚖️
                            </button>
                        </div>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                        <span class="pesaje-ganancia" id="ganancia-${animalId}" style="font-weight: 600;">-</span>
                    </td>
                </tr>
                `;
            }).join('');
        
        const content = `
            <div style="padding: 25px; max-height: 85vh; overflow-y: auto;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #795548, #5d4037); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                            ⚖️
                        </div>
                        <div>
                            <h3 style="margin: 0; font-size: 22px;">Registro de Pesaje</h3>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Control de peso y ganancia de animales</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.abrirModalBalanzaPesaje()">
                            ⚖️ Conectar Balanza
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.abrirRFIDPesaje()">
                            📡 Leer RFID
                        </button>
                    </div>
                </div>
                
                <!-- Panel de balanza conectada (oculto por defecto) -->
                <div id="panelBalanzaPesaje" style="display: none; background: linear-gradient(135deg, #1a5f3f, #2d8a5e); color: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 14px; opacity: 0.9;">Balanza TruTest Conectada</div>
                            <div id="balanzaDisplayPesaje" style="font-size: 36px; font-weight: 700;">--- kg</div>
                            <div id="balanzaEstadoPesaje" style="font-size: 12px;">Esperando...</div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button type="button" class="btn" style="background: rgba(255,255,255,0.2); color: white;" 
                                    onclick="QuickActions.capturarPesoBalanzaPesaje()">
                                📸 Capturar Peso
                            </button>
                            <button type="button" class="btn" style="background: rgba(255,255,255,0.2); color: white;" 
                                    onclick="QuickActions.desconectarBalanzaPesaje()">
                                🔌 Desconectar
                            </button>
                        </div>
                    </div>
                </div>
                
                <form id="formPesaje" onsubmit="QuickActions.guardarPesaje(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="pesajeFecha" class="form-input" value="${DateUtils.today()}" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo de Pesaje</label>
                            <select id="pesajeTipo" class="form-select">
                                <option value="individual">Individual ( báscula )</option>
                                <option value="grupal">Grupal ( camión )</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Buscar Animal (por RFID o Caravana)</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="pesajeBusqueda" class="form-input" 
                                   placeholder="Escriba RFID/caravana o seleccione de la lista..."
                                   oninput="QuickActions.filtrarAnimalesPesaje(this.value)"
                                   ${animalesDisponibles.length === 0 ? 'disabled' : ''}>
                            <button type="button" class="btn btn-secondary" onclick="QuickActions.limpiarBusquedaPesaje()">Limpiar</button>
                        </div>
                    </div>
                    
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead style="background: #f8f9fa; position: sticky; top: 0;">
                                <tr>
                                    <th style="padding: 10px; text-align: left;">RFID/Caravana</th>
                                    <th style="padding: 10px; text-align: left;">Corral</th>
                                    <th style="padding: 10px; text-align: right;">Peso Anterior</th>
                                    <th style="padding: 10px; text-align: right;">Nuevo Peso</th>
                                    <th style="padding: 10px; text-align: right;">Ganancia</th>
                                </tr>
                            </thead>
                            <tbody id="pesajeTablaBody">
                                ${tablaContenido}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="form-group" style="margin-top: 20px;">
                        <label>Observaciones</label>
                        <textarea id="pesajeObservaciones" class="form-input" rows="2"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.cerrarModalActual('modalPesaje')">Cancelar</button>
                        <button type="submit" class="btn btn-success">⚖️ Guardar Pesajes</button>
                    </div>
                </form>
            </div>
        `;
        
        this.crearYAbrirModal('modalPesaje', content, '950px');
    },
    
    filtrarAnimalesPesaje(busqueda) {
        const filas = document.querySelectorAll('.pesaje-fila');
        const termino = busqueda.toLowerCase();
        
        filas.forEach(fila => {
            const rfid = fila.dataset.rfid;
            fila.style.display = rfid.includes(termino) ? '' : 'none';
        });
    },
    
    calcularGanancia(input) {
        const nuevo = parseFloat(input.value) || 0;
        const anterior = parseFloat(input.dataset.anterior) || 0;
        const ganancia = nuevo - anterior;
        
        const celdaGanancia = input.closest('tr').querySelector('.pesaje-ganancia');
        if (celdaGanancia) {
            const signo = ganancia > 0 ? '+' : '';
            const color = ganancia > 0 ? '#28a745' : (ganancia < 0 ? '#dc3545' : '#666');
            celdaGanancia.innerHTML = `<span style="color: ${color};">${signo}${ganancia.toFixed(1)} kg</span>`;
        }
    },
    
    guardarPesaje(e) {
        e.preventDefault();
        
        const fecha = document.getElementById('pesajeFecha').value;
        const observaciones = document.getElementById('pesajeObservaciones').value;
        const pesajes = [];
        
        document.querySelectorAll('.pesaje-nuevo').forEach(input => {
            const nuevoPeso = parseFloat(input.value);
            if (nuevoPeso && nuevoPeso > 0) {
                const animalId = input.dataset.animal;
                const pesoAnterior = parseFloat(input.dataset.anterior) || 0;
                
                if (!animalId) return;
                
                const animal = AppData.animales.find(a => a.id === animalId);
                if (animal) {
                    // Guardar en historial
                    if (!AppData.historialPesos) AppData.historialPesos = {};
                    if (!AppData.historialPesos[animalId]) AppData.historialPesos[animalId] = [];
                    
                    AppData.historialPesos[animalId].push({
                        fecha,
                        peso: nuevoPeso,
                        ganancia: nuevoPeso - pesoAnterior,
                        observaciones: observaciones || ''
                    });
                    
                    // Actualizar peso actual
                    animal.pesoActual = nuevoPeso;
                    
                    // Actualizar estado si alcanzó peso de finalización
                    if (nuevoPeso >= 500 && animal.estado === 'engorde') {
                        animal.estado = 'finalizado';
                    }
                    
                    pesajes.push({
                        animalId,
                        rfid: animal.rfid || animal.id || 'SIN_RFID',
                        pesoAnterior,
                        pesoNuevo: nuevoPeso,
                        ganancia: nuevoPeso - pesoAnterior
                    });
                }
            }
        });
        
        if (pesajes.length === 0) {
            this.mostrarNotificacion('No se registraron pesos', 'warning');
            return;
        }
        
        // Guardar datos
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('feedpro-data', JSON.stringify(AppData));
        }
        
        QuickActions.cerrarTodosLosModales();
        this.mostrarNotificacion(`✅ ${pesajes.length} pesajes registrados`, 'success');
    },
    
    limpiarBusquedaPesaje() {
        document.getElementById('pesajeBusqueda').value = '';
        this.filtrarAnimalesPesaje('');
    },
    
    // ============ BALANZA TRUTEST EN PESAJE ============
    
    async abrirModalBalanzaPesaje() {
        UI.createModal('modalBalanzaPesaje', `
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; margin-bottom: 10px;">⚖️</div>
                <h2 style="margin: 0; color: var(--dark);">Conectar Balanza TruTest</h2>
                <p style="color: #888; margin: 5px 0 0 0;">Conecte la balanza para leer pesos automáticamente</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 20px; text-align: center;">
                <div id="balanzaStatusIcon" style="font-size: 64px; margin-bottom: 15px;">🔌</div>
                <div id="balanzaStatusText" style="font-size: 18px; font-weight: 600; color: #666;">Balanza desconectada</div>
                <div id="balanzaPesoDisplay" style="font-size: 48px; font-weight: 700; color: var(--primary); margin: 20px 0; display: none;">
                    --- kg
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-primary btn-lg" onclick="QuickActions.conectarBalanzaPesajeModal()">
                    🔌 Conectar
                </button>
                <button class="btn btn-secondary" onclick="QuickActions.simularBalanzaPesajeModal()">
                    🧪 Simular
                </button>
            </div>
            
            <div style="background: #e3f2fd; border-radius: 12px; padding: 15px; font-size: 12px; color: #666;">
                <strong>Instrucciones:</strong>
                <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Conecte la balanza TruTest vía USB o Bluetooth</li>
                    <li>Haga clic en "Conectar"</li>
                    <li>Seleccione el puerto correspondiente</li>
                    <li>El peso se leerá automáticamente</li>
                </ol>
                <p style="margin-top: 10px;"><strong>Nota:</strong> Requiere navegador Chrome/Edge con soporte Web Serial API.</p>
            </div>
        `, '550px');
        
        // Actualizar estado si ya está conectada
        if (HardwareManager.estado.balanza.conectado) {
            this.actualizarEstadoBalanzaModal(true);
        }
    },
    
    async conectarBalanzaPesajeModal() {
        const conectado = await HardwareManager.conectarBalanzaTruTest();
        this.actualizarEstadoBalanzaModal(conectado);
        
        if (conectado) {
            HardwareManager.setCallback('onPeso', (peso) => {
                this.actualizarPesoBalanzaModal(peso);
            });
            
            // Mostrar en el panel principal también
            document.getElementById('panelBalanzaPesaje').style.display = 'block';
            UI.closeModal('modalBalanzaPesaje');
        }
    },
    
    actualizarEstadoBalanzaModal(conectado) {
        const icon = document.getElementById('balanzaStatusIcon');
        const text = document.getElementById('balanzaStatusText');
        const peso = document.getElementById('balanzaPesoDisplay');
        
        if (conectado) {
            icon.textContent = '✅';
            text.textContent = 'Balanza conectada';
            text.style.color = '#2e7d32';
            peso.style.display = 'block';
        } else {
            icon.textContent = '🔌';
            text.textContent = 'Balanza desconectada';
            text.style.color = '#666';
            peso.style.display = 'none';
        }
    },
    
    actualizarPesoBalanzaModal(peso) {
        const display = document.getElementById('balanzaPesoDisplay');
        if (display) {
            display.textContent = peso.valor.toFixed(1) + ' kg';
            display.style.color = peso.estable ? '#2e7d32' : '#f57c00';
        }
        
        // También actualizar el display principal
        const displayPrincipal = document.getElementById('balanzaDisplayPesaje');
        const estadoPrincipal = document.getElementById('balanzaEstadoPesaje');
        
        if (displayPrincipal) {
            displayPrincipal.textContent = peso.valor.toFixed(1) + ' kg';
        }
        if (estadoPrincipal) {
            estadoPrincipal.textContent = peso.estable ? '✅ Peso estable' : '⏳ Peso inestable';
        }
        
        this.pesoBalanzaActual = peso.valor;
    },
    
    simularBalanzaPesajeModal() {
        const peso = HardwareManager.simularPeso();
        this.actualizarEstadoBalanzaModal(true);
        this.actualizarPesoBalanzaModal(peso);
        
        // Mostrar en panel principal
        document.getElementById('panelBalanzaPesaje').style.display = 'block';
        
        setTimeout(() => {
            UI.closeModal('modalBalanzaPesaje');
        }, 1000);
    },
    
    leerBalanzaParaAnimal(animalId) {
        if (!HardwareManager.estado.balanza.conectado && !HardwareManager.estado.balanza.modoManual) {
            UI.showToast('Conecte la balanza primero', 'warning');
            this.abrirModalBalanzaPesaje();
            return;
        }
        
        const peso = this.pesoBalanzaActual || HardwareManager.estado.balanza.pesoActual;
        if (peso > 0) {
            const input = document.getElementById(`peso-${animalId}`);
            if (input) {
                input.value = peso.toFixed(1);
                this.calcularGanancia(input);
                UI.showToast(`Peso ${peso.toFixed(1)} kg asignado`, 'success');
            }
        } else {
            UI.showToast('Espere a que la balanza se estabilice', 'warning');
        }
    },
    
    capturarPesoBalanzaPesaje() {
        const peso = HardwareManager.capturarPeso();
        if (peso && peso.valor > 0) {
            this.pesoBalanzaActual = peso.valor;
            UI.showToast(`Peso capturado: ${peso.valor.toFixed(1)} kg`, 'success');
        }
    },
    
    desconectarBalanzaPesaje() {
        HardwareManager.desconectarBalanza();
        document.getElementById('panelBalanzaPesaje').style.display = 'none';
        UI.showToast('Balanza desconectada', 'info');
    },
    
    // ============ RFID EN PESAJE ============
    
    abrirRFIDPesaje() {
        UI.createModal('modalRFIDPesaje', `
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; margin-bottom: 10px;">📡</div>
                <h2 style="margin: 0; color: var(--dark);">Lector RFID - Pesaje</h2>
                <p style="color: #888; margin: 5px 0 0 0;">Lea la caravana para buscar el animal</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 20px; text-align: center;">
                <div id="rfidIconPesaje" style="font-size: 64px; margin-bottom: 15px;">📡</div>
                <div id="rfidStatusPesaje" style="font-size: 18px; font-weight: 600; color: #666;">Listo para leer</div>
                <div id="rfidCodePesaje" style="font-size: 24px; font-weight: 700; color: var(--primary); margin-top: 15px; min-height: 30px;"></div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="QuickActions.conectarRFIDPesajeModal()">
                    🔌 Conectar Lector
                </button>
                <button class="btn btn-secondary" onclick="QuickActions.simularRFIDPesajeModal()">
                    🧪 Simular Lectura
                </button>
            </div>
            
            <div style="background: #e3f2fd; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                <label style="font-weight: 600; margin-bottom: 10px; display: block;">Búsqueda Manual:</label>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="rfidBusquedaManual" class="form-input" placeholder="Ingrese RFID o caravana...">
                    <button class="btn btn-primary" onclick="QuickActions.buscarAnimalRFIDManual()">🔍</button>
                </div>
            </div>
            
            <div id="rfidResultadoPesaje" style="display: none; background: #e8f5e9; border-radius: 12px; padding: 15px;">
                <div style="font-weight: 600; margin-bottom: 10px;">🐄 Animal Encontrado</div>
                <div id="rfidAnimalInfo"></div>
            </div>
        `, '550px');
        
        // Configurar callback
        HardwareManager.setCallback('onRfidTag', (tag) => {
            this.procesarTagRFIDPesaje(tag);
        });
    },
    
    async conectarRFIDPesajeModal() {
        const conectado = await HardwareManager.conectarRFID();
        if (conectado) {
            document.getElementById('rfidIconPesaje').textContent = '✅';
            document.getElementById('rfidStatusPesaje').textContent = 'Lector conectado';
            document.getElementById('rfidStatusPesaje').style.color = '#2e7d32';
        }
    },
    
    simularRFIDPesajeModal() {
        // Buscar un animal aleatorio para simular
        const animales = AppData.animales.filter(a => a.estado === 'engorde');
        if (animales.length > 0) {
            const animal = animales[Math.floor(Math.random() * animales.length)];
            const tag = {
                id: animal.rfid || animal.id,
                simulado: true
            };
            this.procesarTagRFIDPesaje(tag);
        } else {
            UI.showToast('No hay animales para simular', 'warning');
        }
    },
    
    procesarTagRFIDPesaje(tag) {
        const statusEl = document.getElementById('rfidStatusPesaje');
        const codeEl = document.getElementById('rfidCodePesaje');
        
        if (statusEl) statusEl.textContent = 'Tag leído';
        if (codeEl) codeEl.textContent = tag.id;
        
        // Buscar animal
        this.buscarYMostrarAnimalRFID(tag.id);
    },
    
    buscarAnimalRFIDManual() {
        const codigo = document.getElementById('rfidBusquedaManual').value.trim();
        if (codigo) {
            this.buscarYMostrarAnimalRFID(codigo);
        }
    },
    
    buscarYMostrarAnimalRFID(codigo) {
        const animal = AppData.animales.find(a => 
            a.rfid === codigo || 
            a.id === codigo || 
            a.caravana === codigo
        );
        
        const resultadoDiv = document.getElementById('rfidResultadoPesaje');
        const infoDiv = document.getElementById('rfidAnimalInfo');
        
        if (animal) {
            infoDiv.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div><strong>RFID:</strong> ${animal.rfid || animal.id}</div>
                    <div><strong>Corral:</strong> ${this.getCorralNombre(animal.corral)}</div>
                    <div><strong>Peso Actual:</strong> ${animal.pesoActual} kg</div>
                    <div><strong>Estado:</strong> ${animal.estado}</div>
                </div>
                <button class="btn btn-success btn-lg" style="width: 100%;" 
                        onclick="QuickActions.seleccionarAnimalRFIDPesaje('${animal.id}')">
                    ✅ Seleccionar para Pesaje
                </button>
            `;
            resultadoDiv.style.display = 'block';
            resultadoDiv.style.background = '#e8f5e9';
        } else {
            infoDiv.innerHTML = `
                <div style="color: #c62828;">
                    ❌ Animal no encontrado con código: ${codigo}
                </div>
            `;
            resultadoDiv.style.display = 'block';
            resultadoDiv.style.background = '#ffebee';
        }
    },
    
    seleccionarAnimalRFIDPesaje(animalId) {
        UI.closeModal('modalRFIDPesaje');
        
        // Filtrar la tabla para mostrar solo este animal
        this.filtrarAnimalesPesaje(animalId);
        
        // Scroll al input del animal
        setTimeout(() => {
            const input = document.getElementById(`peso-${animalId}`);
            if (input) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                input.focus();
            }
        }, 100);
        
        UI.showToast('Animal seleccionado. Ingrese el nuevo peso.', 'success');
    },
    
    // ============================================
    // ACCIONES RÁPIDAS - ALTA ANIMAL
    // ============================================
    
    nuevoAnimal() {
        this.cerrar();
        // Abrir modal directamente sin navegar
        this.crearModalAltaAnimal();
    },
    
    crearModalAltaAnimal() {
        this.ensureData();
        const content = `
            <div style="padding: 25px; max-height: 85vh; overflow-y: auto;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #607d8b, #455a64); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                        🐂
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 22px;">Alta de Animal</h3>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Registro individual de nuevo animal</p>
                    </div>
                </div>
                <form id="formAlta" onsubmit="QuickActions.guardarAlta(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>RFID *</label>
                            <input type="text" id="altaRFID" class="form-input" placeholder="Ej: RF12345678" required>
                        </div>
                        <div class="form-group">
                            <label>Fecha de Ingreso *</label>
                            <input type="date" id="altaFecha" class="form-input" value="${DateUtils.today()}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Peso de Ingreso (kg) *</label>
                            <input type="number" id="altaPeso" class="form-input" min="1" step="0.1" required>
                        </div>
                        <div class="form-group">
                            <label>Corral de Destino *</label>
                            <select id="altaCorral" class="form-select" required>
                                <option value="">Seleccione...</option>
                                ${this.getOpcionesCorrales()}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Proveedor/Origen</label>
                            <input type="text" id="altaProveedor" class="form-input" placeholder="Dejar en blanco si es propio">
                        </div>
                        <div class="form-group">
                            <label>Costo Inicial ($)</label>
                            <input type="number" id="altaCosto" class="form-input" min="0" step="0.01" placeholder="Opcional">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Observaciones</label>
                        <textarea id="altaObservaciones" class="form-input" rows="2"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.cerrarModalActual('modalAlta')">Cancelar</button>
                        <button type="submit" class="btn btn-success">🐂 Guardar Animal</button>
                    </div>
                </form>
            </div>
        `;
        
        this.crearYAbrirModal('modalAlta', content, '650px');
    },
    
    guardarAlta(e) {
        e.preventDefault();
        
        const animal = {
            id: 'AN' + Date.now(),
            rfid: document.getElementById('altaRFID').value.toUpperCase(),
            fechaIngreso: document.getElementById('altaFecha').value,
            pesoIngreso: parseFloat(document.getElementById('altaPeso').value),
            pesoActual: parseFloat(document.getElementById('altaPeso').value),
            corral: document.getElementById('altaCorral').value,
            proveedor: document.getElementById('altaProveedor').value || 'Propio',
            costoInicial: parseFloat(document.getElementById('altaCosto').value) || 0,
            observaciones: document.getElementById('altaObservaciones').value,
            estado: 'engorde',
            fechaRegistro: new Date().toISOString()
        };
        
        // Verificar RFID duplicado
        const existe = AppData.animales.find(a => a.rfid === animal.rfid);
        if (existe) {
            this.mostrarNotificacion('Ya existe un animal con ese RFID', 'error');
            return;
        }
        
        AppData.animales.push(animal);
        
        // Inicializar historial de pesos
        if (!AppData.historialPesos) AppData.historialPesos = {};
        AppData.historialPesos[animal.id] = [{
            fecha: animal.fechaIngreso,
            peso: animal.pesoIngreso,
            ganancia: 0
        }];
        
        // Guardar datos
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('feedpro-data', JSON.stringify(AppData));
        }
        
        QuickActions.cerrarTodosLosModales();
        this.mostrarNotificacion(`✅ Animal ${animal.rfid} registrado correctamente`, 'success');
        
        // Actualizar dashboard si estamos en esa sección
        if (typeof AppState !== 'undefined' && AppState.seccionActual === 'dashboard' && typeof DashboardSection !== 'undefined') {
            DashboardSection.render();
        }
    },
    
    // ============================================
    // HELPERS
    // ============================================
    
    getOpcionesCorrales() {
        const corrales = [...new Set(AppData.animales.map(a => a.corral).filter(Boolean))];
        const corralesDefinidos = [
            { id: 'corral1', nombre: 'Corral 1 - Adaptación' },
            { id: 'corral2', nombre: 'Corral 2 - Crecimiento' },
            { id: 'corral3', nombre: 'Corral 3 - Engorde' },
            { id: 'corral4', nombre: 'Corral 4 - Finalización' }
        ];
        
        return corralesDefinidos.map(c => 
            `<option value="${c.id}">${c.nombre}</option>`
        ).join('');
    },
    
    getCorralNombre(corralId) {
        const nombres = {
            'corral1': 'C1 - Adaptación',
            'corral2': 'C2 - Crecimiento',
            'corral3': 'C3 - Engorde',
            'corral4': 'C4 - Finalización'
        };
        return nombres[corralId] || corralId;
    },
    
    // ============================================
    // IMPORTACIÓN EXCEL Y RFID PARA COMPRAS
    // ============================================
    
    animalesCompraTemp: [], // Array temporal para animales cargados
    
    mostrarFormCompraManual() {
        console.log('mostrarFormCompraManual llamado');
        const listaContainer = document.getElementById('listaAnimalesCompraContainer');
        const cantidadInput = document.getElementById('compraCantidad');
        const pesoInput = document.getElementById('compraPesoPorCabeza');
        
        if (listaContainer) listaContainer.style.display = 'none';
        this.animalesCompraTemp = [];
        
        // Mostrar campos manuales normales
        if (cantidadInput) {
            cantidadInput.value = '';
            cantidadInput.disabled = false;
        }
        if (pesoInput) {
            pesoInput.value = '';
            pesoInput.disabled = false;
        }
    },
    
    abrirImportarExcelCompra() {
        console.log('abrirImportarExcelCompra llamado');
        if (typeof UI === 'undefined' || !UI.createModal) {
            console.error('UI.createModal no está disponible');
            alert('Error: UI no cargado correctamente');
            return;
        }
        UI.createModal('modalImportarExcelCompra', `
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; margin-bottom: 10px;">📁</div>
                <h2 style="margin: 0; color: var(--dark);">Importar Animales desde Excel</h2>
                <p style="color: #888; margin: 5px 0 0 0;">Cargue el archivo con los datos de la compra</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="padding: 20px; background: #f8f9fa; border-radius: 12px; text-align: center; cursor: pointer; border: 2px dashed #ccc;"
                     onclick="document.getElementById('fileExcelCompra').click()">
                    <div style="font-size: 36px; margin-bottom: 10px;">📂</div>
                    <div style="font-weight: 600; margin-bottom: 5px;">Seleccionar Archivo</div>
                    <div style="font-size: 12px; color: #888;">.xlsx, .xls, .csv</div>
                </div>
                <div style="padding: 20px; background: #f8f9fa; border-radius: 12px; text-align: center; cursor: pointer;"
                     onclick="HardwareManager.descargarPlantillaExcel('compra')">
                    <div style="font-size: 36px; margin-bottom: 10px;">📋</div>
                    <div style="font-weight: 600; margin-bottom: 5px;">Descargar Plantilla</div>
                    <div style="font-size: 12px; color: #888;">Ver formato requerido</div>
                </div>
            </div>
            
            <input type="file" id="fileExcelCompra" accept=".xlsx,.xls,.csv" 
                   style="display: none;"
                   onchange="QuickActions.procesarExcelCompra(this)">
            
            <div id="previewCompraExcel" style="display: none;">
                <div style="background: #e8f5e9; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <strong>✅ Animales válidos:</strong> <span id="compraValidCount">0</span>
                </div>
                <div style="max-height: 250px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <table style="width: 100%; font-size: 13px;">
                        <thead style="background: #f8f9fa;">
                            <tr>
                                <th style="padding: 10px;">Caravana/RFID</th>
                                <th style="padding: 10px;">Peso</th>
                                <th style="padding: 10px;">Raza</th>
                                <th style="padding: 10px;">Corral</th>
                            </tr>
                        </thead>
                        <tbody id="compraPreviewBody"></tbody>
                    </table>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn btn-success btn-lg" onclick="QuickActions.confirmarImportacionCompra()">
                        ✅ Cargar Animales
                    </button>
                </div>
            </div>
            
            <div style="background: #e3f2fd; border-radius: 12px; padding: 15px; margin-top: 15px; font-size: 12px;">
                <strong>Columnas requeridas:</strong> caravana (o rfid), peso, raza, corral<br>
                <strong>Opcionales:</strong> proveedor, origen, sexo
            </div>
        `, '700px');
    },
    
    async procesarExcelCompra(input) {
        console.log('procesarExcelCompra llamado');
        const archivo = input.files[0];
        if (!archivo) {
            console.log('No se seleccionó archivo');
            return;
        }
        
        console.log('Archivo seleccionado:', archivo.name);
        
        try {
            UI.showToast('Procesando archivo...', 'info');
            
            if (typeof HardwareManager === 'undefined') {
                throw new Error('HardwareManager no está cargado');
            }
            
            const resultado = await HardwareManager.importarExcel(archivo);
            console.log('Resultado importación:', resultado);
            
            const validacion = HardwareManager.validarRegistrosAnimales(resultado.registros);
            console.log('Validación:', validacion);
            
            this.animalesCompraTemp = validacion.validados;
            
            const validCount = document.getElementById('compraValidCount');
            const previewDiv = document.getElementById('previewCompraExcel');
            const tbody = document.getElementById('compraPreviewBody');
            
            if (validCount) validCount.textContent = validacion.validados.length;
            
            if (tbody) {
                tbody.innerHTML = validacion.validados.map(a => `
                    <tr>
                        <td style="padding: 8px;">${a.caravana || a.rfid}</td>
                        <td style="padding: 8px;"><strong>${a.pesoInicial} kg</strong></td>
                        <td style="padding: 8px;">${a.raza || '-'}</td>
                        <td style="padding: 8px;">${a.corral || 'corral1'}</td>
                    </tr>
                `).join('');
            }
            
            if (previewDiv) previewDiv.style.display = 'block';
            
            UI.showToast(`${validacion.validados.length} animales listos`, 'success');
            
        } catch (error) {
            console.error('Error procesando Excel:', error);
            UI.showToast('Error: ' + error.message, 'error');
        }
    },
    
    confirmarImportacionCompra() {
        if (!this.animalesCompraTemp || this.animalesCompraTemp.length === 0) {
            UI.showToast('No hay animales para cargar', 'error');
            return;
        }
        
        // Actualizar el formulario principal con los datos
        const totalAnimales = this.animalesCompraTemp.length;
        const pesoPromedio = this.animalesCompraTemp.reduce((sum, a) => sum + a.pesoInicial, 0) / totalAnimales;
        
        document.getElementById('compraCantidad').value = totalAnimales;
        document.getElementById('compraPesoPorCabeza').value = pesoPromedio.toFixed(1);
        
        // Si todos los animales van al mismo corral, seleccionarlo
        const corrales = [...new Set(this.animalesCompraTemp.map(a => a.corral || 'corral1'))];
        if (corrales.length === 1 && document.getElementById('compraCorral')) {
            document.getElementById('compraCorral').value = corrales[0];
        }
        
        // Deshabilitar campos manuales y mostrar lista
        document.getElementById('compraCantidad').disabled = true;
        document.getElementById('compraPesoPorCabeza').disabled = true;
        
        // Mostrar lista de animales
        document.getElementById('listaAnimalesCompraContainer').style.display = 'block';
        document.getElementById('contadorAnimalesCompra').textContent = totalAnimales;
        document.getElementById('listaAnimalesCompra').innerHTML = this.animalesCompraTemp.map((a, i) => `
            <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #e0e0e0;">
                <span><strong>#${i+1}</strong> ${a.caravana || a.rfid}</span>
                <span>${a.pesoInicial} kg | ${a.raza || 'Cruzado'}</span>
            </div>
        `).join('');
        
        this.calcularTotalCompra();
        UI.closeModal('modalImportarExcelCompra');
        
        UI.showToast(`${totalAnimales} animales cargados`, 'success');
    },
    
    // ============ RFID PARA COMPRAS ============
    
    abrirLectorRFIDCompra() {
        console.log('abrirLectorRFIDCompra llamado');
        this.animalesCompraTemp = [];
        
        if (typeof UI === 'undefined' || !UI.createModal) {
            console.error('UI.createModal no está disponible');
            alert('Error: UI no cargado correctamente');
            return;
        }
        
        UI.createModal('modalRFIDCompra', `
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; margin-bottom: 10px;">📡</div>
                <h2 style="margin: 0; color: var(--dark);">Lector RFID - Compra</h2>
                <p style="color: #888; margin: 5px 0 0 0;">Acérquese a la caravana para leer el código</p>
            </div>
            
            <!-- Estado de conexión -->
            <div id="rfidEstadoCompra" style="background: #fff3e0; border-radius: 12px; padding: 15px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;">🔌</div>
                <div style="font-weight: 600; color: #e65100;">Lector no conectado</div>
                <div style="font-size: 12px; color: #888; margin-top: 5px;">Conecte el lector RFID o use entrada manual</div>
            </div>
            
            <!-- Botones de conexión -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-secondary" onclick="QuickActions.conectarRFIDCompra()">
                    🔌 Conectar Lector
                </button>
                <button class="btn btn-secondary" onclick="QuickActions.simularLecturaRFIDCompra()">
                    🧪 Simular Lectura
                </button>
            </div>
            
            <!-- Entrada manual -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <label style="font-weight: 600; margin-bottom: 10px; display: block;">Entrada Manual:</label>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="rfidManualCompra" class="form-input" placeholder="Ingrese RFID o caravana...">
                    <input type="number" id="pesoManualCompra" class="form-input" placeholder="Peso (kg)" style="width: 120px;">
                    <button class="btn btn-primary" onclick="QuickActions.agregarRFIDManualCompra()">➕</button>
                </div>
            </div>
            
            <!-- Lista de animales leídos -->
            <div style="background: #e8f5e9; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0;">🐄 Animales Leídos</h4>
                    <span id="rfidContadorCompra" class="badge badge-primary">0</span>
                </div>
                <div id="rfidListaCompra" style="max-height: 200px; overflow-y: auto;">
                    <div style="text-align: center; color: #888; padding: 20px;">
                        Ningún animal leído aún
                    </div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <button class="btn btn-success btn-lg" onclick="QuickActions.confirmarRFIDCompra()">
                    ✅ Confirmar y Cargar
                </button>
            </div>
        `, '700px');
        
        // Configurar callback RFID
        HardwareManager.setCallback('onRfidTag', (tag) => {
            this.procesarTagRFIDCompra(tag);
        });
        
        // Intentar auto-conectar si ya estaba conectado
        if (HardwareManager.estado.rfid.conectado) {
            this.actualizarEstadoRFIDCompra(true);
        }
    },
    
    async conectarRFIDCompra() {
        const conectado = await HardwareManager.conectarRFID();
        this.actualizarEstadoRFIDCompra(conectado);
    },
    
    actualizarEstadoRFIDCompra(conectado) {
        const estadoEl = document.getElementById('rfidEstadoCompra');
        if (!estadoEl) return;
        
        if (conectado) {
            estadoEl.style.background = '#e8f5e9';
            estadoEl.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 10px;">✅</div>
                <div style="font-weight: 600; color: #2e7d32;">Lector conectado</div>
                <div style="font-size: 12px; color: #888; margin-top: 5px;">Listo para leer caravanas</div>
            `;
        } else {
            estadoEl.style.background = '#fff3e0';
            estadoEl.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 10px;">🔌</div>
                <div style="font-weight: 600; color: #e65100;">Lector no conectado</div>
                <div style="font-size: 12px; color: #888; margin-top: 5px;">Use entrada manual</div>
            `;
        }
    },
    
    simularLecturaRFIDCompra() {
        const tag = HardwareManager.simularLecturaRFID();
        this.procesarTagRFIDCompra(tag);
    },
    
    procesarTagRFIDCompra(tag) {
        if (!tag || !tag.id) return;
        
        // Verificar duplicado en la lista temporal
        const existe = this.animalesCompraTemp.find(a => a.rfid === tag.id);
        if (existe) {
            UI.showToast('Este animal ya fue leído', 'warning');
            return;
        }
        
        // Verificar si existe en la base de datos
        const existenteDB = AppData.animales?.find(a => a.rfid === tag.id);
        if (existenteDB) {
            UI.showToast('Este animal ya existe en el sistema', 'error');
            return;
        }
        
        // Solicitar peso
        const peso = prompt(`RFID: ${tag.id}\n\nIngrese el peso del animal (kg):`);
        if (!peso || isNaN(parseFloat(peso))) {
            UI.showToast('Peso inválido', 'error');
            return;
        }
        
        // Agregar a la lista
        this.animalesCompraTemp.push({
            caravana: '',
            rfid: tag.id,
            pesoInicial: parseFloat(peso),
            raza: 'Cruzado',
            corral: 'corral1',
            origen: 'Compra',
            proveedor: ''
        });
        
        this.actualizarListaRFIDCompra();
        UI.showToast(`Animal ${tag.id.slice(-6)} agregado`, 'success');
    },
    
    agregarRFIDManualCompra() {
        const rfid = document.getElementById('rfidManualCompra').value.trim();
        const peso = parseFloat(document.getElementById('pesoManualCompra').value);
        
        if (!rfid || !peso || peso <= 0) {
            UI.showToast('Ingrese RFID y peso válidos', 'error');
            return;
        }
        
        // Verificar duplicados
        const existe = this.animalesCompraTemp.find(a => a.rfid === rfid || a.caravana === rfid);
        if (existe) {
            UI.showToast('Este animal ya fue agregado', 'warning');
            return;
        }
        
        this.animalesCompraTemp.push({
            caravana: rfid,
            rfid: rfid.startsWith('840') ? rfid : '',
            pesoInicial: peso,
            raza: 'Cruzado',
            corral: 'corral1',
            origen: 'Compra',
            proveedor: ''
        });
        
        // Limpiar campos
        document.getElementById('rfidManualCompra').value = '';
        document.getElementById('pesoManualCompra').value = '';
        document.getElementById('rfidManualCompra').focus();
        
        this.actualizarListaRFIDCompra();
    },
    
    actualizarListaRFIDCompra() {
        const contador = document.getElementById('rfidContadorCompra');
        const lista = document.getElementById('rfidListaCompra');
        
        if (contador) contador.textContent = this.animalesCompraTemp.length;
        
        if (lista) {
            if (this.animalesCompraTemp.length === 0) {
                lista.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">Ningún animal leído aún</div>';
            } else {
                lista.innerHTML = this.animalesCompraTemp.map((a, i) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; 
                                padding: 10px; background: white; border-radius: 8px; margin-bottom: 5px;">
                        <div>
                            <strong>#${i+1}</strong> ${a.rfid || a.caravana}
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="badge badge-info">${a.pesoInicial} kg</span>
                            <button class="btn btn-danger btn-sm" onclick="QuickActions.eliminarAnimalRFIDCompra(${i})">🗑️</button>
                        </div>
                    </div>
                `).join('');
            }
        }
    },
    
    eliminarAnimalRFIDCompra(index) {
        this.animalesCompraTemp.splice(index, 1);
        this.actualizarListaRFIDCompra();
    },
    
    confirmarRFIDCompra() {
        if (this.animalesCompraTemp.length === 0) {
            UI.showToast('No hay animales leídos', 'error');
            return;
        }
        
        // Actualizar formulario principal
        const totalAnimales = this.animalesCompraTemp.length;
        const pesoPromedio = this.animalesCompraTemp.reduce((sum, a) => sum + a.pesoInicial, 0) / totalAnimales;
        
        document.getElementById('compraCantidad').value = totalAnimales;
        document.getElementById('compraPesoPorCabeza').value = pesoPromedio.toFixed(1);
        document.getElementById('compraCantidad').disabled = true;
        document.getElementById('compraPesoPorCabeza').disabled = true;
        
        // Mostrar lista
        document.getElementById('listaAnimalesCompraContainer').style.display = 'block';
        document.getElementById('contadorAnimalesCompra').textContent = totalAnimales;
        document.getElementById('listaAnimalesCompra').innerHTML = this.animalesCompraTemp.map((a, i) => `
            <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #e0e0e0;">
                <span><strong>#${i+1}</strong> ${a.rfid || a.caravana}</span>
                <span>${a.pesoInicial} kg</span>
            </div>
        `).join('');
        
        this.calcularTotalCompra();
        UI.closeModal('modalRFIDCompra');
        
        UI.showToast(`${totalAnimales} animales cargados desde RFID`, 'success');
    },
    
    // ============================================
    // PESAJE CON BALANZA TRUTEST
    // ============================================
    
    pesoBalanzaActual: 0,
    animalActualPesaje: null,
    
    async conectarBalanzaPesaje() {
        const conectado = await HardwareManager.conectarBalanzaTruTest();
        if (conectado) {
            HardwareManager.setCallback('onPeso', (peso) => {
                this.pesoBalanzaActual = peso.valor;
                this.actualizarDisplayBalanza(peso);
            });
        }
        return conectado;
    },
    
    actualizarDisplayBalanza(peso) {
        const display = document.getElementById('balanzaDisplay');
        const input = document.getElementById('pesoBalanzaInput');
        
        if (display) {
            display.innerHTML = `
                <div style="font-size: 48px; font-weight: 700; color: ${peso.estable ? '#2e7d32' : '#f57c00'};">
                    ${peso.valor.toFixed(1)} kg
                </div>
                <div style="font-size: 14px; color: #888;">
                    ${peso.estable ? '✅ Peso estable' : '⏳ Peso inestable'}
                </div>
            `;
        }
        
        if (input && peso.estable) {
            input.value = peso.valor.toFixed(1);
        }
    },
    
    simularPesoBalanza() {
        const peso = HardwareManager.simularPeso();
        this.actualizarDisplayBalanza(peso);
    },
    
    capturarPesoBalanza() {
        const peso = HardwareManager.capturarPeso();
        if (peso) {
            const input = document.getElementById('pesoBalanzaInput');
            if (input) input.value = peso.valor.toFixed(1);
            return peso.valor;
        }
        return null;
    }
};

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    QuickActions.init();
});

// Exponer globalmente
window.QuickActions = QuickActions;
