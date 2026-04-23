/**
 * SECCIÓN INSUMOS V2 - CON PROVEEDORES Y ÓRDENES DE COMPRA
 * Estilo Cattler - Gestión completa de abastecimiento
 */

const InsumosSection = {
    vistaActual: 'inventario', // inventario, proveedores, ordenes, movimientos
    
    render() {
        const section = document.getElementById('insumos');
        
        // Calcular KPIs
        // Categorías válidas para alimentos
        const categoriasValidas = ['grano', 'proteico', 'forraje', 'mineral', 'aditivo'];
        const alimentos = (AppData.insumos || []).filter(i => categoriasValidas.includes(i.categoria));
        
        const valorTotal = alimentos.reduce((sum, i) => sum + (i.stock * (i.costo / 1000)), 0);
        const insumosBajos = alimentos.filter(i => i.stock < (i.stockMinimo || 1000));
        const valorOrdenesPendientes = (AppData.ordenesCompra || [])
            .filter(o => o.estado === 'pendiente')
            .reduce((sum, o) => sum + o.total, 0);
        const totalProveedores = (AppData.proveedores || []).length;
        
        section.innerHTML = `
            <!-- NAVEGACIÓN -->
            <div class="sanidad-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e9ecef;">
                <button class="tab-btn ${this.vistaActual === 'inventario' ? 'active' : ''}" onclick="InsumosSection.cambiarVista('inventario')">
                    📦 Inventario
                </button>
                <button class="tab-btn ${this.vistaActual === 'proveedores' ? 'active' : ''}" onclick="InsumosSection.cambiarVista('proveedores')">
                    🏢 Proveedores
                </button>
                <button class="tab-btn ${this.vistaActual === 'ordenes' ? 'active' : ''}" onclick="InsumosSection.cambiarVista('ordenes')">
                    📋 Órdenes de Compra
                    ${(AppData.ordenesCompra || []).filter(o => o.estado === 'pendiente').length > 0 ? 
                        `<span class="badge badge-warning">${(AppData.ordenesCompra || []).filter(o => o.estado === 'pendiente').length}</span>` : ''}
                </button>
                <button class="tab-btn ${this.vistaActual === 'movimientos' ? 'active' : ''}" onclick="InsumosSection.cambiarVista('movimientos')">
                    📊 Movimientos
                </button>
            </div>

            <!-- KPIs -->
            <div class="grid-4">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">💰 Valor Inventario</span>
                    </div>
                    <div class="kpi-value">${Formatters.currency(valorTotal)}</div>
                    <div class="kpi-subtitle">Costo total almacenado</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">⚠️ Stock Bajo</span>
                    </div>
                    <div class="kpi-value" style="color: ${insumosBajos.length > 0 ? 'var(--danger)' : 'var(--success)'};">
                        ${insumosBajos.length}
                    </div>
                    <div class="kpi-subtitle">Insumos críticos</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">📋 Órdenes Pendientes</span>
                    </div>
                    <div class="kpi-value" style="color: ${valorOrdenesPendientes > 0 ? 'var(--warning)' : 'inherit'};">
                        ${Formatters.currency(valorOrdenesPendientes)}
                    </div>
                    <div class="kpi-subtitle">Por recibir</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">🏢 Proveedores</span>
                    </div>
                    <div class="kpi-value">${totalProveedores}</div>
                    <div class="kpi-subtitle">Activos</div>
                </div>
            </div>

            ${insumosBajos.length > 0 && this.vistaActual === 'inventario' ? `
                <div class="alert alert-danger" style="margin-bottom: 20px;">
                    <span>⚠️</span>
                    <div>
                        <strong>Alimentos con stock crítico:</strong>
                        <ul style="margin: 10px 0 0 20px; font-size: 16px;">
                            ${insumosBajos.map(i => `<li><strong>${i.nombre}</strong>: <span style="color: var(--danger); font-weight: 700; font-size: 18px;">${Formatters.number(i.stock)}</span> ${i.unidad} (mín: ${i.stockMinimo})</li>`).join('')}
                        </ul>
                    </div>
                </div>
            ` : ''}

            <!-- CONTENIDO DINÁMICO -->
            <div id="insumosContent">
                ${this.renderContenidoVista()}
            </div>
        `;
        
        this.addStyles();
        
        // Renderizar tabla si estamos en vista de inventario
        if (this.vistaActual === 'inventario') {
            setTimeout(() => this.renderTabla(), 0);
        }
    },

    cambiarVista(vista) {
        this.vistaActual = vista;
        this.render();
    },

    renderContenidoVista() {
        switch(this.vistaActual) {
            case 'inventario':
                return this.renderInventario();
            case 'proveedores':
                return this.renderProveedores();
            case 'ordenes':
                return this.renderOrdenes();
            case 'movimientos':
                return this.renderMovimientos();
            default:
                return this.renderInventario();
        }
    },

    // ============ VISTA INVENTARIO ============
    renderInventario() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🌾 Alimentos para Dietas</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="InsumosSection.abrirModalInsumo()">+ Nuevo Insumo</button>
                        <button class="btn btn-warning" onclick="InsumosSection.abrirModalAjuste()">⚖️ Ajuste Stock</button>
                        <button class="btn btn-secondary" onclick="InsumosSection.exportarInventario()">📥 Exportar</button>
                    </div>
                </div>
                
                <div class="filters-bar">
                    <div class="search-box">
                        <input type="text" class="form-input" id="searchInsumo" 
                            placeholder="Buscar alimento..." 
                            onkeyup="InsumosSection.filtrarInsumos()">
                    </div>
                    <select class="form-select" id="filterCategoria" onchange="InsumosSection.filtrarInsumos()" style="width: 150px;">
                        <option value="">Todas las categorías</option>
                        <option value="grano">🌽 Granos</option>
                        <option value="proteico">🥜 Proteicos</option>
                        <option value="forraje">🌾 Forrajes</option>
                        <option value="mineral">⚗️ Minerales</option>
                        <option value="aditivo">⚡ Aditivos</option>
                    </select>
                </div>
                
                <div class="table-container">
                    <table id="tablaInsumosMain">
                        <thead>
                            <tr>
                                <th>Insumo</th>
                                <th>Categoría</th>
                                <th>Stock Actual</th>
                                <th>Unidad</th>
                                <th>Stock Mín.</th>
                                <th>Costo Unit.</th>
                                <th>Valor Total</th>
                                <th>Cobertura (días)</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaInsumos"></tbody>
                    </table>
                </div>
            </div>

            <!-- PROYECCIÓN DE COMPRAS -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📈 Proyección de Compras de Alimentos</h3>
                    <span style="font-size: 13px; color: #666;">Basado en consumo actual</span>
                </div>
                <div id="proyeccionCompras">
                    ${this.renderProyeccionCompras()}
                </div>
            </div>
        `;
    },

    renderTabla() {
        const tbody = document.getElementById('tablaInsumos');
        if (!tbody) return;
        
        const filtroTexto = (document.getElementById('searchInsumo')?.value || '').toLowerCase();
        const filtroCategoria = document.getElementById('filterCategoria')?.value || '';
        
        // Categorías válidas para alimentos de dietas
        const categoriasValidas = ['grano', 'proteico', 'forraje', 'mineral', 'aditivo'];
        
        const insumosFiltrados = (AppData.insumos || []).filter(i => {
            // Solo mostrar alimentos de categorías válidas para dietas
            if (!categoriasValidas.includes(i.categoria)) return false;
            const matchTexto = !filtroTexto || i.nombre.toLowerCase().includes(filtroTexto);
            const matchCat = !filtroCategoria || i.categoria === filtroCategoria;
            return matchTexto && matchCat;
        });

        tbody.innerHTML = insumosFiltrados.map(i => {
            const esBajo = i.stock < (i.stockMinimo || 1000);
            const estado = esBajo 
                ? '<span class="badge badge-danger">⚠️ CRÍTICO</span>' 
                : '<span class="badge badge-success">✅ OK</span>';
            
            // Calcular cobertura (días) - estimación simplificada
            const consumoDiario = this.calcularConsumoDiario(i.nombre);
            const cobertura = consumoDiario > 0 ? Math.floor(i.stock / consumoDiario) : '-';
            
            return `
                <tr style="${esBajo ? 'background: rgba(220, 20, 60, 0.05);' : ''}">
                    <td>
                        <strong>${i.nombre}</strong>
                        ${i.origen === 'FEDNA' ? '<span style="font-size: 11px; background: #e3f2fd; color: #1976d2; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">📚 FEDNA</span>' : ''}
                    </td>
                    <td><span class="badge badge-secondary">${i.categoria}</span></td>
                    <td style="${esBajo ? 'color: var(--danger);' : 'color: var(--primary);'} font-size: 20px; font-weight: 800;">
                        ${Formatters.number(i.stock)} <span style="font-size: 14px; font-weight: 400;">${i.unidad}</span>
                    </td>
                    <td>${i.unidad}</td>
                    <td>${i.stockMinimo || 1000}</td>
                    <td>${Formatters.currency(i.costo)}/ton</td>
                    <td>${Formatters.currency(i.stock * (i.costo / 1000))}</td>
                    <td>
                        ${cobertura !== '-' ? `
                            <span class="badge badge-${cobertura < 7 ? 'danger' : cobertura < 14 ? 'warning' : 'success'}">
                                ${cobertura} días
                            </span>
                        ` : '-'}
                    </td>
                    <td>${estado}</td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="InsumosSection.registrarCompraDirecta('${i.nombre}')">💰 Compra</button>
                        <button class="btn btn-sm btn-primary" onclick="InsumosSection.crearOrdenDesdeInsumo('${i.nombre}')">📋 Orden</button>
                        <button class="btn btn-sm btn-secondary" onclick="InsumosSection.editarInsumo('${i.nombre}')">✏️</button>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="10" class="text-center">No hay insumos registrados</td></tr>';
    },

    calcularConsumoDiario(nombreInsumo) {
        // Estimación basada en sesiones de suministro recientes
        let alimentoTotal = 5000;
        if (AppData.sesionesSuministro && AppData.sesionesSuministro.length > 0) {
            const ultimasSesiones = AppData.sesionesSuministro.slice(-7);
            const totalConsumido = ultimasSesiones.reduce((sum, s) => sum + (s.totalKg || 0), 0);
            alimentoTotal = totalConsumido / ultimasSesiones.length;
        }
        
        // Distribución aproximada - en producción vendría de las dietas
        const distribucion = {
            'Maíz': 0.50,
            'Sorgo': 0.30,
            'Harina de Soja': 0.15,
            'Expeller de Soja': 0.10,
            'Sal': 0.01,
            'Premezcla': 0.02
        };
        
        const factor = distribucion[nombreInsumo] || 0.05;
        return (alimentoTotal * factor) / 1000; // Convertir a toneladas si es necesario
    },

    renderProyeccionCompras() {
        // Categorías válidas para alimentos
        const categoriasValidas = ['grano', 'proteico', 'forraje', 'mineral', 'aditivo'];
        const alimentos = (AppData.insumos || []).filter(i => categoriasValidas.includes(i.categoria));
        const insumosBajos = alimentos.filter(i => i.stock < (i.stockMinimo || 1000) * 1.5);
        
        if (insumosBajos.length === 0) {
            return '<p class="text-center" style="padding: 20px;">✅ No se requieren compras inmediatas</p>';
        }
        
        return `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Insumo</th>
                            <th>Stock Actual</th>
                            <th>Consumo Est. (día)</th>
                            <th>Días Restantes</th>
                            <th>Cantidad a Comprar</th>
                            <th>Costo Estimado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${insumosBajos.map(i => {
                            const consumo = this.calcularConsumoDiario(i.nombre);
                            const dias = consumo > 0 ? Math.floor(i.stock / consumo) : 30;
                            const cantidadComprar = Math.ceil(((i.stockMinimo || 1000) * 2 - i.stock) / 1000) * 1000;
                            const costo = cantidadComprar * (i.costo / 1000);
                            
                            return `
                                <tr>
                                    <td><strong>${i.nombre}</strong></td>
                                    <td style="color: var(--primary); font-size: 18px; font-weight: 700;">${Formatters.number(i.stock)} <span style="font-size: 12px; font-weight: 400;">${i.unidad}</span></td>
                                    <td>${consumo > 0 ? consumo.toFixed(1) : '-'} ${i.unidad}</td>
                                    <td><span class="badge badge-${dias < 7 ? 'danger' : 'warning'}">${dias} días</span></td>
                                    <td>${Formatters.number(cantidadComprar)} ${i.unidad}</td>
                                    <td>${Formatters.currency(costo)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="InsumosSection.crearOrdenDesdeInsumo('${i.nombre}', ${cantidadComprar})">
                                            Crear Orden
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // ============ VISTA PROVEEDORES ============
    renderProveedores() {
        const proveedores = AppData.proveedores || [];
        
        return `
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🏢 Proveedores</h3>
                        <button class="btn btn-primary" onclick="InsumosSection.abrirModalProveedor()">+ Nuevo Proveedor</button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Proveedor</th>
                                    <th>Contacto</th>
                                    <th>Teléfono</th>
                                    <th>Email</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${proveedores.length === 0 ? 
                                    '<tr><td colspan="6" class="text-center">No hay proveedores registrados</td></tr>' :
                                    proveedores.map(p => `
                                        <tr>
                                            <td><strong>${p.nombre}</strong></td>
                                            <td>${p.contacto || '-'}</td>
                                            <td>${p.telefono || '-'}</td>
                                            <td>${p.email || '-'}</td>
                                            <td><span class="badge badge-${p.activo !== false ? 'success' : 'secondary'}">${p.activo !== false ? 'Activo' : 'Inactivo'}</span></td>
                                            <td>
                                                <button class="btn btn-sm btn-secondary" onclick="InsumosSection.editarProveedor(${p.id})">✏️</button>
                                            </td>
                                        </tr>
                                    `).join('')
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📊 Compras por Proveedor</h3>
                    </div>
                    <div style="padding: 20px;">
                        ${this.renderComprasPorProveedor()}
                    </div>
                </div>
            </div>
        `;
    },

    renderComprasPorProveedor() {
        const ordenes = (AppData.ordenesCompra || []).filter(o => o.estado === 'recibida');
        const comprasPorProv = {};
        
        ordenes.forEach(o => {
            if (!comprasPorProv[o.proveedor]) {
                comprasPorProv[o.proveedor] = { cantidad: 0, total: 0 };
            }
            comprasPorProv[o.proveedor].cantidad++;
            comprasPorProv[o.proveedor].total += o.total;
        });
        
        const sorted = Object.entries(comprasPorProv).sort((a, b) => b[1].total - a[1].total);
        
        if (sorted.length === 0) {
            return '<p class="text-center">No hay historial de compras</p>';
        }
        
        return sorted.map(([prov, datos]) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; 
                        border-bottom: 1px solid #eee;">
                <div>
                    <strong>${prov}</strong>
                    <div style="font-size: 12px; color: #666;">${datos.cantidad} órdenes</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--primary);">${Formatters.currency(datos.total)}</div>
                    <div style="font-size: 12px; color: #666;">Total comprado</div>
                </div>
            </div>
        `).join('');
    },

    // ============ VISTA ÓRDENES DE COMPRA ============
    renderOrdenes() {
        const ordenes = AppData.ordenesCompra || [];
        const pendientes = ordenes.filter(o => o.estado === 'pendiente');
        const recibidas = ordenes.filter(o => o.estado === 'recibida');
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📋 Órdenes de Compra</h3>
                    <button class="btn btn-primary" onclick="InsumosSection.abrirModalOrden()">+ Nueva Orden</button>
                </div>

                <div style="padding: 20px;">
                    <h4 style="margin-bottom: 15px;">⏳ Pendientes de Recepción (${pendientes.length})</h4>
                    ${pendientes.length === 0 ? 
                        '<p style="padding: 15px; background: #f8f9fa; border-radius: 8px;">No hay órdenes pendientes</p>' :
                        `<div class="table-container" style="margin-bottom: 30px;">
                            <table>
                                <thead>
                                    <tr>
                                        <th>N° Orden</th>
                                        <th>Fecha</th>
                                        <th>Proveedor</th>
                                        <th>Insumo</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unit.</th>
                                        <th>Total</th>
                                        <th>Entrega Est.</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pendientes.map(o => `
                                        <tr>
                                            <td><strong>#${o.id}</strong></td>
                                            <td>${DateUtils.format(o.fecha)}</td>
                                            <td>${o.proveedor}</td>
                                            <td>${o.insumo}</td>
                                            <td>${Formatters.number(o.cantidad)} ${o.unidad}</td>
                                            <td>${Formatters.currency(o.precioUnitario)}</td>
                                            <td><strong>${Formatters.currency(o.total)}</strong></td>
                                            <td>${o.fechaEntrega ? DateUtils.format(o.fechaEntrega) : '-'}</td>
                                            <td>
                                                <button class="btn btn-sm btn-success" onclick="InsumosSection.recibirOrden(${o.id})">✓ Recibir</button>
                                                <button class="btn btn-sm btn-danger" onclick="InsumosSection.cancelarOrden(${o.id})">✕</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>`
                    }

                    <h4 style="margin-bottom: 15px;">✅ Historial de Compras (${recibidas.length})</h4>
                    ${recibidas.length === 0 ? 
                        '<p style="padding: 15px; background: #f8f9fa; border-radius: 8px;">No hay compras registradas</p>' :
                        `<div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>N° Orden</th>
                                        <th>Fecha</th>
                                        <th>Proveedor</th>
                                        <th>Insumo</th>
                                        <th>Cantidad</th>
                                        <th>Total</th>
                                        <th>Fecha Recepción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recibidas.slice(-10).reverse().map(o => `
                                        <tr>
                                            <td>#${o.id}</td>
                                            <td>${DateUtils.format(o.fecha)}</td>
                                            <td>${o.proveedor}</td>
                                            <td>${o.insumo}</td>
                                            <td>${Formatters.number(o.cantidad)} ${o.unidad}</td>
                                            <td>${Formatters.currency(o.total)}</td>
                                            <td>${o.fechaRecepcion ? DateUtils.format(o.fechaRecepcion) : '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>`
                    }
                </div>
            </div>
        `;
    },

    // ============ VISTA MOVIMIENTOS ============
    renderMovimientos() {
        const movimientos = AppData.movimientosInsumos || [];
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📊 Historial de Movimientos</h3>
                    <div style="display: flex; gap: 10px;">
                        <input type="date" class="form-input" id="filtroMovDesde" onchange="InsumosSection.filtrarMovimientos()">
                        <input type="date" class="form-input" id="filtroMovHasta" onchange="InsumosSection.filtrarMovimientos()">
                        <select class="form-select" id="filtroMovTipo" onchange="InsumosSection.filtrarMovimientos()">
                            <option value="">Todos</option>
                            <option value="entrada">Entradas</option>
                            <option value="salida">Salidas</option>
                            <option value="ajuste">Ajustes</option>
                        </select>
                    </div>
                </div>
                <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                    <table id="tablaMovimientos">
                        <thead>
                            <tr>
                                <th>Fecha/Hora</th>
                                <th>Tipo</th>
                                <th>Insumo</th>
                                <th>Cantidad</th>
                                <th>Stock Anterior</th>
                                <th>Stock Nuevo</th>
                                <th>Origen/Destino</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${movimientos.slice().reverse().map(m => `
                                <tr>
                                    <td>${DateUtils.format(m.fecha)} ${m.hora || ''}</td>
                                    <td><span class="badge badge-${m.tipo === 'entrada' ? 'success' : m.tipo === 'salida' ? 'danger' : 'warning'}">${m.tipo.toUpperCase()}</span></td>
                                    <td><strong>${m.insumo}</strong></td>
                                    <td style="color: ${m.tipo === 'entrada' ? 'var(--success)' : m.tipo === 'salida' ? 'var(--danger)' : 'inherit'}; font-weight: 600;">
                                        ${m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '-' : '±'}${Formatters.number(m.cantidad)}
                                    </td>
                                    <td>${Formatters.number(m.stockAnterior)}</td>
                                    <td><strong>${Formatters.number(m.stockNuevo)}</strong></td>
                                    <td>${m.origen || m.destino || '-'}</td>
                                    <td>${m.usuario || '-'}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="8" class="text-center">No hay movimientos registrados</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ============ FUNCIONES DE ACCIÓN ============
    abrirModalInsumo() {
        // Crear modal con opción de FEDNA
        const modal = document.createElement('div');
        modal.id = 'modalNuevoInsumo';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;';
        
        // Obtener ingredientes de FEDNA que no estén ya en insumos
        const insumosExistentes = new Set((AppData.insumos || []).map(i => i.nombre));
        const ingredientesFEDNA = Object.entries(INGREDIENTES_DB || {})
            .filter(([nombre]) => !insumosExistentes.has(nombre))
            .sort(([a], [b]) => a.localeCompare(b));
        
        modal.innerHTML = `
            <div class="modal-content" style="background: white; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 20px;">➕ Nuevo Alimento</h3>
                    <button onclick="InsumosSection.cerrarModalInsumo()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <div class="modal-body" style="padding: 20px; overflow-y: auto; flex: 1;">
                    <!-- Opciones de origen -->
                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <button type="button" id="btnTabFEDNA" class="btn btn-primary" onclick="InsumosSection.mostrarTabInsumo('fedna')" style="flex: 1;">
                            📚 Desde FEDNA
                        </button>
                        <button type="button" id="btnTabPersonalizado" class="btn btn-secondary" onclick="InsumosSection.mostrarTabInsumo('personalizado')" style="flex: 1;">
                            ✏️ Personalizado
                        </button>
                    </div>
                    
                    <!-- Tab FEDNA -->
                    <div id="tabFEDNA">
                        <p style="color: #666; margin-bottom: 15px; font-size: 13px;">
                            Seleccione un alimento de la base de datos FEDNA. Se importarán los datos nutricionales y el costo estimado.
                        </p>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Alimento FEDNA *</label>
                            <select class="form-select" id="selectFEDNA" style="width: 100%;" onchange="InsumosSection.onSelectFEDNA()">
                                <option value="">Seleccionar alimento...</option>
                                ${ingredientesFEDNA.map(([nombre, datos]) => `
                                    <option value="${nombre}" data-categoria="${datos.categoria}" data-costo="${datos.costo}">
                                        ${nombre} (${datos.categoria}) - ${Formatters.currency(datos.costo)}/ton
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div id="previewFEDNA" style="display: none; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <h4 style="margin: 0 0 10px 0; color: var(--primary);" id="previewNombre"></h4>
                            <div style="font-size: 13px; color: #666;" id="previewNutricion"></div>
                        </div>
                    </div>
                    
                    <!-- Tab Personalizado -->
                    <div id="tabPersonalizado" style="display: none;">
                        <p style="color: #666; margin-bottom: 15px; font-size: 13px;">
                            Cree un alimento personalizado con sus propios valores nutricionales.
                        </p>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Nombre del Alimento *</label>
                            <input type="text" class="form-input" id="inputNombrePersonalizado" placeholder="Ej: Maíz Premium">
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Categoría *</label>
                            <select class="form-select" id="selectCategoriaPersonalizado">
                                <option value="grano">🌽 Grano</option>
                                <option value="proteico">🥜 Proteico</option>
                                <option value="forraje">🌾 Forraje</option>
                                <option value="mineral">⚗️ Mineral</option>
                                <option value="aditivo">⚡ Aditivo</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Campos comunes -->
                    <div style="border-top: 1px solid #e9ecef; padding-top: 15px; margin-top: 15px;">
                        <div class="grid-3" style="grid-template-columns: 1fr 1fr 1fr;">
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label class="form-label">Stock Inicial (kg) *</label>
                                <input type="number" class="form-input" id="inputStock" value="0" min="0" step="100">
                            </div>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label class="form-label">Stock Mínimo (kg)</label>
                                <input type="number" class="form-input" id="inputStockMinimo" value="1000" min="0" step="100">
                            </div>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label class="form-label">Costo ($/ton) *</label>
                                <input type="number" class="form-input" id="inputCosto" value="450" min="0" step="1">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e9ecef; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="btn btn-secondary" onclick="InsumosSection.cerrarModalInsumo()">Cancelar</button>
                    <button class="btn btn-primary" onclick="InsumosSection.guardarInsumo()">💾 Guardar Alimento</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Guardar referencia al tab activo
        this.tabInsumoActivo = 'fedna';
    },
    
    mostrarTabInsumo(tab) {
        this.tabInsumoActivo = tab;
        document.getElementById('tabFEDNA').style.display = tab === 'fedna' ? 'block' : 'none';
        document.getElementById('tabPersonalizado').style.display = tab === 'personalizado' ? 'block' : 'none';
        document.getElementById('btnTabFEDNA').className = tab === 'fedna' ? 'btn btn-primary' : 'btn btn-secondary';
        document.getElementById('btnTabPersonalizado').className = tab === 'personalizado' ? 'btn btn-primary' : 'btn btn-secondary';
    },
    
    onSelectFEDNA() {
        const select = document.getElementById('selectFEDNA');
        const nombre = select.value;
        const option = select.selectedOptions[0];
        
        if (!nombre) {
            document.getElementById('previewFEDNA').style.display = 'none';
            return;
        }
        
        const datos = INGREDIENTES_DB[nombre];
        if (datos) {
            // Los valores en INGREDIENTES_DB ya están expresados en base seca
            
            document.getElementById('previewNombre').textContent = nombre;
            document.getElementById('previewNutricion').innerHTML = `
                <strong>Categoría:</strong> ${datos.categoria}<br>
                <strong>MS:</strong> ${datos.nutricion.MS}% | <strong>Costo base:</strong> ${Formatters.currency(datos.costo)}/ton<br>
                <strong>PB:</strong> ${(datos.nutricion.PB || 0).toFixed(1)}% | 
                <strong>EM:</strong> ${(datos.nutricion.EM || 0).toFixed(2)} Mcal/kg | 
                <strong>NDT:</strong> ${(datos.nutricion.NDT || 0).toFixed(0)}%<br>
                <span style="font-size: 11px; color: #888;">(valores en base seca)</span>
            `;
            document.getElementById('previewFEDNA').style.display = 'block';
            
            // Actualizar costo en el input común
            document.getElementById('inputCosto').value = datos.costo;
        }
    },
    
    cerrarModalInsumo() {
        const modal = document.getElementById('modalNuevoInsumo');
        if (modal) modal.remove();
        delete this.tabInsumoActivo;
    },
    
    guardarInsumo() {
        const stock = parseFloat(document.getElementById('inputStock').value);
        const stockMinimo = parseFloat(document.getElementById('inputStockMinimo').value);
        const costo = parseFloat(document.getElementById('inputCosto').value);
        
        if (isNaN(stock) || isNaN(costo) || costo < 0) {
            UI.showToast('Complete los campos numéricos correctamente', 'error');
            return;
        }
        
        let nombre, categoria, datosFEDNA;
        
        if (this.tabInsumoActivo === 'fedna') {
            nombre = document.getElementById('selectFEDNA').value;
            if (!nombre) {
                UI.showToast('Seleccione un alimento de FEDNA', 'error');
                return;
            }
            const datos = INGREDIENTES_DB[nombre];
            categoria = datos.categoria;
            datosFEDNA = datos;
        } else {
            nombre = document.getElementById('inputNombrePersonalizado').value.trim();
            categoria = document.getElementById('selectCategoriaPersonalizado').value;
            if (!nombre) {
                UI.showToast('Ingrese el nombre del alimento', 'error');
                return;
            }
        }
        
        // Verificar que no exista
        if ((AppData.insumos || []).some(i => i.nombre === nombre)) {
            UI.showToast('Este alimento ya existe en el inventario', 'error');
            return;
        }
        
        if (!AppData.insumos) AppData.insumos = [];
        
        const nuevoInsumo = {
            id: 'INS' + Date.now(),
            nombre: nombre,
            categoria: categoria,
            stock: stock,
            unidad: 'kg',
            stockMinimo: stockMinimo || 1000,
            costo: costo,
            fechaRegistro: DateUtils.today(),
            origen: this.tabInsumoActivo === 'fedna' ? 'FEDNA' : 'personalizado',
            datosNutricionales: datosFEDNA ? datosFEDNA.nutricion : null
        };
        
        AppData.insumos.push(nuevoInsumo);
        
        // Registrar movimiento con costo
        this.registrarMovimiento(nombre, 'entrada', stock, 0, stock, stock * (costo / 1000), 'Stock inicial');
        
        if (typeof DataManager !== "undefined" && DataManager.save) { 
            DataManager.save(); 
        } else if (typeof localStorage !== "undefined") { 
            localStorage.setItem("feedpro-data", JSON.stringify(AppData)); 
        }
        
        this.cerrarModalInsumo();
        this.render();
        UI.showToast(`Alimento "${nombre}" agregado correctamente`, 'success');
    },

    abrirModalAjuste() {
        if (!AppData.insumos || AppData.insumos.length === 0) {
            UI.showToast('No hay insumos para ajustar', 'error');
            return;
        }
        
        const nombres = AppData.insumos.map((i, idx) => `${idx + 1}. ${i.nombre} (Stock: ${i.stock})`).join('\n');
        const seleccion = prompt(`Seleccione el número del insumo a ajustar:\n\n${nombres}`);
        
        if (!seleccion) return;
        const idx = parseInt(seleccion) - 1;
        if (isNaN(idx) || idx < 0 || idx >= AppData.insumos.length) {
            UI.showToast('Selección inválida', 'error');
            return;
        }
        
        const insumo = AppData.insumos[idx];
        const nuevoStock = parseFloat(prompt(`Ajuste de stock para ${insumo.nombre}\n\nStock actual: ${insumo.stock} ${insumo.unidad}\n\nNuevo stock (${insumo.unidad}):`, insumo.stock.toString()));
        
        if (!isNaN(nuevoStock) && nuevoStock >= 0) {
            const diferencia = nuevoStock - insumo.stock;
            const tipo = diferencia > 0 ? 'entrada' : diferencia < 0 ? 'salida' : 'ajuste';
            
            this.registrarMovimiento(insumo.nombre, tipo, Math.abs(diferencia), insumo.stock, nuevoStock, 0, 'Ajuste manual');
            
            insumo.stock = nuevoStock;
            if (typeof DataManager !== "undefined" && DataManager.save) { DataManager.save(); } else if (typeof localStorage !== "undefined") { localStorage.setItem("feedpro-data", JSON.stringify(AppData)); }
            this.render();
            UI.showToast(`Stock ajustado a ${nuevoStock} ${insumo.unidad}`);
        }
    },

    abrirModalProveedor() {
        const nombre = prompt('Nombre del proveedor:');
        if (!nombre) return;
        
        const contacto = prompt('Nombre del contacto:');
        const telefono = prompt('Teléfono:');
        const email = prompt('Email:');
        const direccion = prompt('Dirección:');
        
        if (!AppData.proveedores) AppData.proveedores = [];
        
        AppData.proveedores.push({
            id: Date.now(),
            nombre: nombre,
            contacto: contacto,
            telefono: telefono,
            email: email,
            direccion: direccion,
            activo: true
        });
        
        if (typeof DataManager !== "undefined" && DataManager.save) { DataManager.save(); } else if (typeof localStorage !== "undefined") { localStorage.setItem("feedpro-data", JSON.stringify(AppData)); }
        this.render();
        UI.showToast('Proveedor agregado correctamente');
    },

    abrirModalOrden() {
        if (!AppData.proveedores || AppData.proveedores.length === 0) {
            UI.showToast('Primero debe registrar proveedores', 'error');
            this.cambiarVista('proveedores');
            return;
        }
        
        if (!AppData.insumos || AppData.insumos.length === 0) {
            UI.showToast('No hay insumos registrados', 'error');
            return;
        }
        
        const proveedores = AppData.proveedores.filter(p => p.activo !== false).map((p, idx) => `${idx + 1}. ${p.nombre}`).join('\n');
        const selProv = prompt(`Seleccione proveedor:\n\n${proveedores}`);
        if (!selProv) return;
        
        const proveedor = AppData.proveedores.filter(p => p.activo !== false)[parseInt(selProv) - 1];
        if (!proveedor) {
            UI.showToast('Proveedor inválido', 'error');
            return;
        }
        
        const insumos = AppData.insumos.map((i, idx) => `${idx + 1}. ${i.nombre}`).join('\n');
        const selIns = prompt(`Seleccione insumo:\n\n${insumos}`);
        if (!selIns) return;
        
        const insumo = AppData.insumos[parseInt(selIns) - 1];
        if (!insumo) {
            UI.showToast('Insumo inválido', 'error');
            return;
        }
        
        const cantidad = parseFloat(prompt(`Cantidad a comprar (${insumo.unidad}):`, '1000'));
        const precio = parseFloat(prompt(`Precio unitario ($/ton):`, insumo.costo.toString()));
        const fechaEntrega = prompt('Fecha estimada de entrega (YYYY-MM-DD):', DateUtils.addDays(DateUtils.today(), 7));
        
        if (!isNaN(cantidad) && !isNaN(precio) && cantidad > 0 && precio > 0) {
            if (!AppData.ordenesCompra) AppData.ordenesCompra = [];
            
            AppData.ordenesCompra.push({
                id: Date.now(),
                fecha: DateUtils.today(),
                proveedor: proveedor.nombre,
                insumo: insumo.nombre,
                cantidad: cantidad,
                unidad: insumo.unidad,
                precioUnitario: precio,
                total: cantidad * precio,
                fechaEntrega: fechaEntrega,
                estado: 'pendiente'
            });
            
            if (typeof DataManager !== "undefined" && DataManager.save) { DataManager.save(); } else if (typeof localStorage !== "undefined") { localStorage.setItem("feedpro-data", JSON.stringify(AppData)); }
            this.render();
            UI.showToast('Orden de compra creada', 'success');
        }
    },

    crearOrdenDesdeInsumo(nombreInsumo, cantidadSugerida) {
        if (!AppData.proveedores || AppData.proveedores.length === 0) {
            UI.showToast('Primero debe registrar proveedores', 'error');
            return;
        }
        
        const insumo = AppData.insumos.find(i => i.nombre === nombreInsumo);
        if (!insumo) return;
        
        const proveedores = AppData.proveedores.filter(p => p.activo !== false).map((p, idx) => `${idx + 1}. ${p.nombre}`).join('\n');
        const selProv = prompt(`Seleccione proveedor para ${nombreInsumo}:\n\n${proveedores}`);
        if (!selProv) return;
        
        const proveedor = AppData.proveedores.filter(p => p.activo !== false)[parseInt(selProv) - 1];
        if (!proveedor) return;
        
        const cantidad = parseFloat(prompt(`Cantidad a comprar (${insumo.unidad}):`, (cantidadSugerida || 1000).toString()));
        const precio = parseFloat(prompt(`Precio unitario ($/ton):`, insumo.costo.toString()));
        
        if (!isNaN(cantidad) && !isNaN(precio) && cantidad > 0 && precio > 0) {
            if (!AppData.ordenesCompra) AppData.ordenesCompra = [];
            
            AppData.ordenesCompra.push({
                id: Date.now(),
                fecha: DateUtils.today(),
                proveedor: proveedor.nombre,
                insumo: insumo.nombre,
                cantidad: cantidad,
                unidad: insumo.unidad,
                precioUnitario: precio,
                total: cantidad * precio,
                estado: 'pendiente'
            });
            
            if (typeof DataManager !== "undefined" && DataManager.save) { DataManager.save(); } else if (typeof localStorage !== "undefined") { localStorage.setItem("feedpro-data", JSON.stringify(AppData)); }
            this.render();
            UI.showToast('Orden de compra creada', 'success');
        }
    },

    recibirOrden(id) {
        const orden = AppData.ordenesCompra.find(o => o.id === id);
        if (!orden) return;
        
        if (!confirm(`¿Confirmar recepción de:\n${orden.insumo} - ${Formatters.number(orden.cantidad)} ${orden.unidad}\nde ${orden.proveedor}?`)) {
            return;
        }
        
        // Actualizar stock del insumo
        const insumo = AppData.insumos.find(i => i.nombre === orden.insumo);
        if (insumo) {
            const stockAnterior = insumo.stock;
            insumo.stock += orden.cantidad;
            
            // Registrar movimiento con costo
            const costoTotal = orden.cantidad * orden.precioUnitario;
            this.registrarMovimiento(insumo.nombre, 'entrada', orden.cantidad, stockAnterior, insumo.stock, costoTotal, `Orden #${orden.id} - ${orden.proveedor}`);
            
            // Actualizar costo promedio ponderado
            const valorTotal = (stockAnterior * (insumo.costo / 1000)) + (orden.cantidad * (orden.precioUnitario / 1000));
            insumo.costo = (valorTotal / insumo.stock) * 1000;
        }
        
        // Actualizar orden
        orden.estado = 'recibida';
        orden.fechaRecepcion = DateUtils.today();
        
        if (typeof DataManager !== "undefined" && DataManager.save) { DataManager.save(); } else if (typeof localStorage !== "undefined") { localStorage.setItem("feedpro-data", JSON.stringify(AppData)); }
        this.render();
        UI.showToast('Orden recibida correctamente', 'success');
    },

    cancelarOrden(id) {
        if (!confirm('¿Cancelar esta orden de compra?')) return;
        
        AppData.ordenesCompra = AppData.ordenesCompra.filter(o => o.id !== id);
        if (typeof DataManager !== "undefined" && DataManager.save) { DataManager.save(); } else if (typeof localStorage !== "undefined") { localStorage.setItem("feedpro-data", JSON.stringify(AppData)); }
        this.render();
        UI.showToast('Orden cancelada');
    },

    registrarMovimiento(insumoNombre, tipo, cantidad, stockAnterior, stockNuevo, costoTotal, origen) {
        if (!AppData.movimientosInsumos) AppData.movimientosInsumos = [];
        
        // Buscar el ID del insumo
        const insumo = AppData.insumos.find(i => i.nombre === insumoNombre);
        
        AppData.movimientosInsumos.push({
            id: Date.now(),
            fecha: DateUtils.today(),
            hora: new Date().toLocaleTimeString(),
            insumo: insumoNombre,
            insumoId: insumo?.id || null,
            tipo: tipo,
            cantidad: cantidad,
            stockAnterior: stockAnterior,
            stockNuevo: stockNuevo,
            costoTotal: costoTotal || 0,
            origen: origen,
            usuario: 'Usuario'
        });
        
        // Guardar y actualizar dashboard
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        }
    },

    // Registrar compra directa de insumo (sin orden previa)
    registrarCompraDirecta(nombreInsumo) {
        const insumo = AppData.insumos.find(i => i.nombre === nombreInsumo);
        if (!insumo) {
            UI.showToast('Insumo no encontrado', 'error');
            return;
        }
        
        const cantidad = parseFloat(prompt(`Cantidad comprada (${insumo.unidad}):`));
        if (isNaN(cantidad) || cantidad <= 0) {
            UI.showToast('Cantidad inválida', 'error');
            return;
        }
        
        const precioUnitario = parseFloat(prompt(`Precio unitario ($/ton):`, insumo.costo.toString()));
        if (isNaN(precioUnitario) || precioUnitario <= 0) {
            UI.showToast('Precio inválido', 'error');
            return;
        }
        
        const proveedor = prompt('Proveedor (opcional):') || 'Compra directa';
        
        const stockAnterior = insumo.stock;
        const costoTotal = cantidad * (precioUnitario / 1000);
        
        // Actualizar stock
        insumo.stock += cantidad;
        
        // Registrar movimiento
        this.registrarMovimiento(
            insumo.nombre, 
            'entrada', 
            cantidad, 
            stockAnterior, 
            insumo.stock, 
            costoTotal, 
            `Compra directa - ${proveedor}`
        );
        
        // Actualizar costo promedio ponderado
        const valorTotal = (stockAnterior * (insumo.costo / 1000)) + costoTotal;
        insumo.costo = (valorTotal / insumo.stock) * 1000;
        
        if (typeof DataManager !== "undefined" && DataManager.save) { DataManager.save(); } else if (typeof localStorage !== "undefined") { localStorage.setItem("feedpro-data", JSON.stringify(AppData)); }
        this.render();
        UI.showToast(`✅ Compra registrada: ${cantidad} ${insumo.unidad} de ${insumo.nombre} por ${Formatters.currency(costoTotal)}`, 'success');
    },

    editarInsumo(nombre) {
        const insumo = AppData.insumos.find(i => i.nombre === nombre);
        if (!insumo) return;
        
        const nuevoNombre = prompt('Nombre:', insumo.nombre);
        const nuevoCosto = parseFloat(prompt('Costo unitario ($/ton):', insumo.costo.toString()));
        const nuevoMinimo = parseFloat(prompt('Stock mínimo:', (insumo.stockMinimo || 1000).toString()));
        
        if (nuevoNombre) {
            insumo.nombre = nuevoNombre;
            if (!isNaN(nuevoCosto)) insumo.costo = nuevoCosto;
            if (!isNaN(nuevoMinimo)) insumo.stockMinimo = nuevoMinimo;
            if (typeof DataManager !== "undefined" && DataManager.save) { DataManager.save(); } else if (typeof localStorage !== "undefined") { localStorage.setItem("feedpro-data", JSON.stringify(AppData)); }
            this.render();
            UI.showToast('Insumo actualizado');
        }
    },

    editarProveedor(id) {
        const proveedor = AppData.proveedores.find(p => p.id === id);
        if (!proveedor) return;
        
        proveedor.nombre = prompt('Nombre:', proveedor.nombre) || proveedor.nombre;
        proveedor.contacto = prompt('Contacto:', proveedor.contacto || '');
        proveedor.telefono = prompt('Teléfono:', proveedor.telefono || '');
        proveedor.email = prompt('Email:', proveedor.email || '');
        
        if (typeof DataManager !== "undefined" && DataManager.save) { DataManager.save(); } else if (typeof localStorage !== "undefined") { localStorage.setItem("feedpro-data", JSON.stringify(AppData)); }
        this.render();
        UI.showToast('Proveedor actualizado');
    },

    filtrarInsumos() {
        this.renderTabla();
    },

    filtrarMovimientos() {
        // Implementación básica - recarga la vista
        this.render();
    },

    exportarInventario() {
        const datos = AppData.insumos.map(i => ({
            Insumo: i.nombre,
            Categoria: i.categoria,
            Stock: i.stock,
            Unidad: i.unidad,
            Stock_Minimo: i.stockMinimo,
            Costo_Unitario: i.costo,
            Valor_Total: i.stock * (i.costo / 1000)
        }));
        
        const csv = this.convertirACSV(datos);
        this.descargarArchivo(csv, `inventario_insumos_${DateUtils.today()}.csv`);
        UI.showToast('Inventario exportado');
    },

    convertirACSV(datos) {
        if (datos.length === 0) return '';
        const encabezados = Object.keys(datos[0]).join(';');
        const filas = datos.map(obj => Object.values(obj).join(';')).join('\n');
        return encabezados + '\n' + filas;
    },

    descargarArchivo(contenido, nombreArchivo) {
        const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nombreArchivo;
        link.click();
    },

    addStyles() {
        if (document.getElementById('insumosStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'insumosStyles';
        style.textContent = `
            .sanidad-tabs .tab-btn {
                padding: 12px 20px;
                background: transparent;
                border: none;
                border-bottom: 3px solid transparent;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #666;
                transition: all 0.3s;
                position: relative;
            }
            
            .sanidad-tabs .tab-btn:hover {
                color: var(--primary);
            }
            
            .sanidad-tabs .tab-btn.active {
                color: var(--primary);
                border-bottom-color: var(--primary);
            }
            
            .sanidad-tabs .tab-btn .badge {
                position: absolute;
                top: 5px;
                right: 5px;
                font-size: 10px;
                padding: 2px 6px;
            }
        `;
        document.head.appendChild(style);
    }
};
