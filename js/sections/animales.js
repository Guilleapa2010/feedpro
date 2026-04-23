/**
 * SECCIÓN ANIMALES - CON ENTRADA/SALIDA DE HACIENDA Y MOVIMIENTOS
 * Estilo Cattler - Gestión completa de inventario
 */

const AnimalesSection = {
    vistaActual: 'inventario', // inventario, movimientos
    paginaActual: 1,
    itemsPorPagina: 20,
    
    render() {
        const section = document.getElementById('animales');
        
        section.innerHTML = `
            <!-- NAVEGACIÓN PRINCIPAL -->
            <div class="sanidad-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e9ecef;">
                <button class="tab-btn ${this.vistaActual === 'inventario' ? 'active' : ''}" onclick="AnimalesSection.cambiarVista('inventario')">
                    📋 Inventario
                </button>
                <button class="tab-btn ${this.vistaActual === 'movimientos' ? 'active' : ''}" onclick="AnimalesSection.cambiarVista('movimientos')">
                    🔄 Movimientos
                </button>
            </div>

            <!-- CONTENIDO -->
            <div id="animalesContent">
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
            case 'movimientos':
                return this.renderMovimientos();
            default:
                return this.renderInventario();
        }
    },

    // ============ VISTA INVENTARIO ============
    renderInventario() {
        return `
            <!-- KPIs DE INVENTARIO -->
            <div class="grid-4">
                <div class="kpi-card kpi-primary">
                    <div class="kpi-header">
                        <span class="kpi-title">Total en Feedlot</span>
                    </div>
                    <div class="kpi-value" id="kpiTotalFeedlot">0</div>
                    <div class="kpi-subtitle">cabezas</div>
                </div>
                <div class="kpi-card kpi-info">
                    <div class="kpi-header">
                        <span class="kpi-title">Peso Promedio</span>
                    </div>
                    <div class="kpi-value" id="kpiPesoProm">0</div>
                    <div class="kpi-subtitle">kg vivo</div>
                </div>
                <div class="kpi-card kpi-warning">
                    <div class="kpi-header">
                        <span class="kpi-title">En Cuarentena</span>
                    </div>
                    <div class="kpi-value" id="kpiCuarentena">0</div>
                    <div class="kpi-subtitle">cabezas</div>
                </div>
                <div class="kpi-card kpi-success">
                    <div class="kpi-header">
                        <span class="kpi-title">GMD Promedio</span>
                    </div>
                    <div class="kpi-value" id="kpiGMDProm">0</div>
                    <div class="kpi-subtitle">kg/día</div>
                </div>
            </div>

            <!-- FILTROS Y TABLA -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🐂 Inventario de Animales</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-sm btn-secondary" onclick="AnimalesSection.abrirModalImportar()">
                            📁 Importar Excel
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="AnimalesSection.exportar()">
                            📥 Exportar CSV
                        </button>
                    </div>
                </div>
                
                <div class="filters-bar">
                    <div class="search-box">
                        <input type="text" class="form-input" id="searchAnimal" 
                            placeholder="Buscar por ID, raza o proveedor..." 
                            onkeyup="AnimalesSection.filtrar()">
                    </div>
                    <select class="form-select" id="filterEstado" onchange="AnimalesSection.filtrar()" style="width: 150px;">
                        <option value="">Todos los estados</option>
                        <option value="engorde">En Engorde</option>
                        <option value="cuarentena">Cuarentena</option>
                        <option value="enfermo">Enfermo</option>
                        <option value="hospital">Hospital</option>
                        <option value="finalizado">Listo Venta</option>
                    </select>
                    <select class="form-select" id="filterCorral" onchange="AnimalesSection.filtrar()" style="width: 150px;">
                        <option value="">Todos los corrales</option>
                        ${(CorralesSection?.CORRALES_DEF || []).map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                    </select>
                    <button class="btn btn-secondary" onclick="AnimalesSection.limpiarFiltros()">Limpiar</button>
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID/Caravana</th>
                                <th>Raza</th>
                                <th>Sexo</th>
                                <th>Peso Entrada</th>
                                <th>Peso Actual</th>
                                <th>GMD</th>
                                <th>Días</th>
                                <th>Corral</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaAnimales"></tbody>
                    </table>
                </div>
                
                <div style="display: flex; justify-content: center; align-items: center; gap: 15px; padding: 15px;">
                    <button class="btn btn-sm btn-secondary" onclick="AnimalesSection.paginaAnterior()">← Anterior</button>
                    <span id="paginacionInfo">Página 1 de 1</span>
                    <button class="btn btn-sm btn-secondary" onclick="AnimalesSection.paginaSiguiente()">Siguiente →</button>
                </div>
            </div>
        `;
    },

    // ============ VISTA ENTRADA ============
    renderEntrada() {
        return `
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">⬇️ Nueva Entrada de Hacienda</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Fecha de Ingreso *</label>
                                <input type="date" class="form-input" id="entradaFecha" value="${DateUtils.today()}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Origen/Proveedor *</label>
                                <input type="text" class="form-input" id="entradaProveedor" placeholder="Nombre del proveedor">
                            </div>
                        </div>
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Tipo de Entrada</label>
                                <select class="form-select" id="entradaTipo">
                                    <option value="compra">Compra</option>
                                    <option value="cria">Cría Propia</option>
                                    <option value="traslado">Traslado desde otro establecimiento</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Documento (Guía/DTE)</label>
                                <input type="text" class="form-input" id="entradaDocumento" placeholder="Número de documento">
                            </div>
                        </div>

                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">

                        <h4 style="margin-bottom: 15px;">Características del Lote</h4>
                        
                        <div class="grid-3">
                            <div class="form-group">
                                <label class="form-label">Cantidad de Cabezas *</label>
                                <input type="number" class="form-input" id="entradaCantidad" min="1" placeholder="Ej: 50">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Raza</label>
                                <select class="form-select" id="entradaRaza">
                                    <option value="">Seleccionar...</option>
                                    <option value="Angus">Angus</option>
                                    <option value="Hereford">Hereford</option>
                                    <option value="Braford">Braford</option>
                                    <option value="Brangus">Brangus</option>
                                    <option value="Cruzado">Cruzado</option>
                                    <option value="Holando">Holando</option>
                                    <option value="Criollo">Criollo</option>
                                    <option value="Otra">Otra</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Sexo</label>
                                <select class="form-select" id="entradaSexo">
                                    <option value="Macho">Macho</option>
                                    <option value="Hembra">Hembra</option>
                                    <option value="Mixto">Mixto</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Peso Promedio (kg) *</label>
                                <input type="number" class="form-input" id="entradaPeso" placeholder="Ej: 280" step="0.1">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Edad Promedio (meses)</label>
                                <input type="number" class="form-input" id="entradaEdad" placeholder="Ej: 18" step="0.5">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Corral de Destino *</label>
                            <select class="form-select" id="entradaCorral">
                                <option value="">Seleccionar corral...</option>
                                ${(AppData.corrales || []).map(c => {
                                    const ocupacion = (AppData.animales || []).filter(a => a.corral === c.id && a.estado !== 'vendido').length;
                                    return `<option value="${c.id}">${c.nombre} (${ocupacion} animales - ${c.superficie || 0} m²)</option>`;
                                }).join('')}
                            </select>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Precio de Compra ($/kg)</label>
                                <input type="number" class="form-input" id="entradaPrecio" placeholder="Ej: 850.50" step="0.01">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Lote/Camada</label>
                                <input type="text" class="form-input" id="entradaLote" placeholder="Identificación del lote">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Observaciones</label>
                            <textarea class="form-input" id="entradaObservaciones" rows="2" placeholder="Notas adicionales..."></textarea>
                        </div>

                        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <strong>Resumen estimado:</strong>
                            <div style="display: flex; gap: 30px; margin-top: 10px;">
                                <span>Peso total: <strong id="resumenPesoTotal">0</strong> kg</span>
                                <span>Valor estimado: <strong id="resumenValor">$0</strong></span>
                            </div>
                        </div>

                        <button class="btn btn-primary btn-block" onclick="AnimalesSection.guardarEntrada()">
                            💾 Registrar Entrada
                        </button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📊 Entradas Recientes</h3>
                    </div>
                    <div class="table-container" style="max-height: 600px; overflow-y: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Proveedor</th>
                                    <th>Cantidad</th>
                                    <th>Peso Prom.</th>
                                    <th>Corral</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.getEntradasRecientes()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // ============ VISTA SALIDA ============
    renderSalida() {
        return `
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">⬆️ Egreso/Venta de Animales</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Fecha de Egreso *</label>
                                <input type="date" class="form-input" id="salidaFecha" value="${DateUtils.today()}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tipo de Egreso *</label>
                                <select class="form-select" id="salidaTipo">
                                    <option value="venta">Venta</option>
                                    <option value="muerte">Muerte/Descarte</option>
                                    <option value="traslado">Traslado</option>
                                    <option value="faena">Faena</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Buscar Animal/Lote *</label>
                            <input type="text" class="form-input" id="salidaBuscar" 
                                   placeholder="ID, Corral o Lote..." 
                                   onkeyup="AnimalesSection.buscarAnimalSalida()">
                        </div>

                        <div id="resultadosSalida" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px;">
                            <!-- Resultados de búsqueda -->
                        </div>

                        <div id="animalesSeleccionados" style="margin-bottom: 15px;">
                            <label class="form-label">Animales Seleccionados: <span id="cantidadSeleccionada">0</span></label>
                            <div id="listaSeleccionados" style="padding: 10px; background: #f8f9fa; border-radius: 6px; min-height: 50px;">
                                <span style="color: #999; font-size: 13px;">Ningún animal seleccionado</span>
                            </div>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Peso de Salida Prom. (kg)</label>
                                <input type="number" class="form-input" id="salidaPeso" step="0.1">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Destinatario/Comprador</label>
                                <input type="form-input" class="form-input" id="salidaComprador" placeholder="Nombre del comprador">
                            </div>
                        </div>

                        <div class="grid-2" id="camposVenta">
                            <div class="form-group">
                                <label class="form-label">Precio de Venta ($/kg)</label>
                                <input type="number" class="form-input" id="salidaPrecio" step="0.01" onchange="AnimalesSection.calcularTotalVenta()">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Total Venta ($)</label>
                                <input type="text" class="form-input" id="salidaTotal" readonly>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Documento (Guía/Factura)</label>
                            <input type="text" class="form-input" id="salidaDocumento" placeholder="Número de documento">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Motivo/Observaciones</label>
                            <textarea class="form-input" id="salidaObservaciones" rows="2"></textarea>
                        </div>

                        <button class="btn btn-danger btn-block" onclick="AnimalesSection.guardarSalida()">
                            ⬆️ Registrar Egreso
                        </button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📈 Egresos Recientes</h3>
                    </div>
                    <div class="table-container" style="max-height: 600px; overflow-y: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Cantidad</th>
                                    <th>Peso Prom.</th>
                                    <th>Destino</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.getSalidasRecientes()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar array de selección
        this.animalesSalida = [];
    },

    // ============ VISTA MOVIMIENTOS ============
    renderMovimientos() {
        const movimientos = AppData.movimientos || [];
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🔄 Historial de Movimientos</h3>
                    <div style="display: flex; gap: 10px;">
                        <select class="form-select form-select-sm" id="filtroMovTipo" onchange="AnimalesSection.filtrarMovimientos()">
                            <option value="">Todos los tipos</option>
                            <option value="entrada">Entradas</option>
                            <option value="salida">Salidas</option>
                            <option value="movimiento">Movimientos Internos</option>
                            <option value="pesaje">Pesajes</option>
                        </select>
                        <input type="date" class="form-input form-input-sm" id="filtroMovDesde" onchange="AnimalesSection.filtrarMovimientos()">
                        <input type="date" class="form-input form-input-sm" id="filtroMovHasta" onchange="AnimalesSection.filtrarMovimientos()">
                    </div>
                </div>
                <div class="table-container" style="max-height: 600px; overflow-y: auto;">
                    <table id="tablaMovimientos">
                        <thead>
                            <tr>
                                <th>Fecha/Hora</th>
                                <th>Tipo</th>
                                <th>Animal/Lote</th>
                                <th>Detalle</th>
                                <th>Origen</th>
                                <th>Destino</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${movimientos.slice().reverse().map(m => `
                                <tr>
                                    <td>${DateUtils.format(m.fecha)} ${m.hora || ''}</td>
                                    <td><span class="badge badge-${m.tipo === 'entrada' ? 'success' : m.tipo === 'salida' ? 'danger' : 'info'}">${m.tipo.toUpperCase()}</span></td>
                                    <td>${m.animal || m.cantidad + ' animales'}</td>
                                    <td>${m.detalle}</td>
                                    <td>${m.origen || '-'}</td>
                                    <td>${m.destino || '-'}</td>
                                    <td>${m.usuario || '-'}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="7" class="text-center">No hay movimientos registrados</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📊 Balance del Mes</h3>
                    </div>
                    <div style="padding: 20px;">
                        ${this.renderBalanceMes()}
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📈 Evolución de Inventario</h3>
                    </div>
                    <div style="padding: 20px; height: 250px;">
                        <canvas id="evolucionInventarioChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    },

    // ============ FUNCIONES AUXILIARES ============
    getEntradasRecientes() {
        const entradas = (AppData.movimientos || [])
            .filter(m => m.tipo === 'entrada')
            .slice(-10)
            .reverse();
        
        if (entradas.length === 0) {
            return '<tr><td colspan="5" class="text-center">No hay entradas recientes</td></tr>';
        }
        
        return entradas.map(e => `
            <tr>
                <td>${DateUtils.format(e.fecha)}</td>
                <td>${e.proveedor || '-'}</td>
                <td>${e.cantidad || 1}</td>
                <td>${e.pesoProm || '-'} kg</td>
                <td>${e.destino || '-'}</td>
            </tr>
        `).join('');
    },

    getSalidasRecientes() {
        const salidas = (AppData.movimientos || [])
            .filter(m => m.tipo === 'salida')
            .slice(-10)
            .reverse();
        
        if (salidas.length === 0) {
            return '<tr><td colspan="5" class="text-center">No hay egresos recientes</td></tr>';
        }
        
        return salidas.map(s => `
            <tr>
                <td>${DateUtils.format(s.fecha)}</td>
                <td><span class="badge badge-${s.subtipo === 'muerte' ? 'danger' : 'warning'}">${s.subtipo || 'venta'}</span></td>
                <td>${s.cantidad || 1}</td>
                <td>${s.pesoProm || '-'} kg</td>
                <td>${s.destino || '-'}</td>
            </tr>
        `).join('');
    },

    renderBalanceMes() {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();
        
        const movimientosMes = (AppData.movimientos || []).filter(m => {
            const fecha = new Date(m.fecha);
            return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
        });
        
        const entradas = movimientosMes.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + (m.cantidad || 0), 0);
        const salidas = movimientosMes.filter(m => m.tipo === 'salida').reduce((sum, m) => sum + (m.cantidad || 0), 0);
        const muertes = movimientosMes.filter(m => m.tipo === 'salida' && m.subtipo === 'muerte').reduce((sum, m) => sum + (m.cantidad || 0), 0);
        
        const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        return `
            <div style="text-align: center; margin-bottom: 20px;">
                <h4 style="color: var(--primary);">${nombresMeses[mesActual]} ${anioActual}</h4>
            </div>
            <div style="display: flex; justify-content: space-around; text-align: center;">
                <div>
                    <div style="font-size: 32px; color: var(--success); font-weight: 700;">+${entradas}</div>
                    <div style="color: #666;">Entradas</div>
                </div>
                <div>
                    <div style="font-size: 32px; color: var(--warning); font-weight: 700;">-${salidas}</div>
                    <div style="color: #666;">Salidas</div>
                </div>
                <div>
                    <div style="font-size: 32px; color: var(--danger); font-weight: 700;">${muertes}</div>
                    <div style="color: #666;">Muertes</div>
                </div>
                <div>
                    <div style="font-size: 32px; color: var(--info); font-weight: 700;">${entradas - salidas}</div>
                    <div style="color: #666;">Balance</div>
                </div>
            </div>
        `;
    },

    // ============ FUNCIONES DE ACCIÓN ============
    guardarEntrada() {
        const fecha = document.getElementById('entradaFecha').value;
        const proveedor = document.getElementById('entradaProveedor').value.trim();
        const cantidad = parseInt(document.getElementById('entradaCantidad').value);
        const peso = parseFloat(document.getElementById('entradaPeso').value);
        const corral = document.getElementById('entradaCorral').value;
        const raza = document.getElementById('entradaRaza').value || 'Cruzado';
        const sexo = document.getElementById('entradaSexo').value;
        const edad = parseFloat(document.getElementById('entradaEdad').value) || 0;
        const precio = parseFloat(document.getElementById('entradaPrecio').value) || 0;
        const lote = document.getElementById('entradaLote').value.trim() || `Lote-${DateUtils.today()}`;
        const tipo = document.getElementById('entradaTipo').value;
        const documento = document.getElementById('entradaDocumento').value.trim();
        const observaciones = document.getElementById('entradaObservaciones').value.trim();
        
        // Validaciones
        if (!fecha || !proveedor || !cantidad || !peso || !corral) {
            UI.showToast('Complete los campos obligatorios (*)', 'error');
            return;
        }
        
        // Nota: ya no se valida por capacidad fija en cabezas, se maneja por superficie
        
        // Crear animales
        if (!AppData.animales) AppData.animales = [];
        if (!AppData.movimientos) AppData.movimientos = [];
        
        const idsGenerados = [];
        const hoy = new Date();
        const prefijo = proveedor.substring(0, 3).toUpperCase() + hoy.getFullYear().toString().substring(2);
        
        for (let i = 0; i < cantidad; i++) {
            const id = `${prefijo}-${String(AppData.animales.length + i + 1).padStart(4, '0')}`;
            idsGenerados.push(id);
            
            AppData.animales.push({
                id: id,
                raza: raza,
                sexo: sexo === 'Mixto' ? (Math.random() > 0.5 ? 'Macho' : 'Hembra') : sexo,
                pesoEntrada: peso,
                pesoActual: peso,
                edad: edad,
                fechaIngreso: fecha,
                estado: tipo === 'compra' ? 'cuarentena' : 'engorde',
                corral: corral,
                lote: lote,
                proveedor: proveedor,
                costoIngreso: precio,
                observaciones: observaciones
            });
        }
        
        // Registrar movimiento
        AppData.movimientos.push({
            id: Date.now(),
            tipo: 'entrada',
            fecha: fecha,
            hora: new Date().toLocaleTimeString(),
            cantidad: cantidad,
            pesoProm: peso,
            pesoTotal: peso * cantidad,
            proveedor: proveedor,
            origen: proveedor,
            destino: corralInfo.nombre,
            documento: documento,
            subtipo: tipo,
            detalle: `Entrada de ${cantidad} ${raza} desde ${proveedor}`,
            valor: precio * peso * cantidad,
            usuario: 'Usuario'
        });
        
        DataManager.save();
        UI.showToast(`✓ ${cantidad} animales registrados correctamente`, 'success');
        
        // Limpiar formulario y cambiar a inventario
        this.cambiarVista('inventario');
        DashboardSection.render();
    },

    buscarAnimalSalida() {
        const query = document.getElementById('salidaBuscar').value.toLowerCase();
        const resultados = (AppData.animales || []).filter(a => 
            a.estado !== 'vendido' && 
            a.estado !== 'muerto' &&
            (a.id.toLowerCase().includes(query) ||
             a.lote?.toLowerCase().includes(query) ||
             a.corral.toLowerCase().includes(query))
        ).slice(0, 10);
        
        const container = document.getElementById('resultadosSalida');
        if (!container) return;
        
        if (query.length < 2) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = resultados.length === 0 ? 
            '<p class="text-center">No se encontraron animales</p>' :
            resultados.map(a => `
                <div class="animal-salida-item" onclick="AnimalesSection.toggleSeleccionSalida('${a.id}')" 
                     style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 5px;
                            cursor: pointer; display: flex; justify-content: space-between; align-items: center;
                            ${this.animalesSalida?.includes(a.id) ? 'background: #e3f2fd; border-color: var(--primary);' : ''}">
                    <div>
                        <strong>${a.id}</strong>
                        <div style="font-size: 12px; color: #666;">${a.raza} - ${a.pesoActual}kg - ${a.corral}</div>
                    </div>
                    <span class="badge badge-${a.estado === 'engorde' ? 'success' : a.estado === 'finalizado' ? 'info' : 'warning'}">${a.estado}</span>
                </div>
            `).join('');
    },

    toggleSeleccionSalida(id) {
        if (!this.animalesSalida) this.animalesSalida = [];
        
        const index = this.animalesSalida.indexOf(id);
        if (index > -1) {
            this.animalesSalida.splice(index, 1);
        } else {
            this.animalesSalida.push(id);
        }
        
        this.actualizarSeleccionSalida();
        this.buscarAnimalSalida(); // Actualizar estilos
    },

    actualizarSeleccionSalida() {
        const cantidad = this.animalesSalida?.length || 0;
        document.getElementById('cantidadSeleccionada').textContent = cantidad;
        
        const lista = document.getElementById('listaSeleccionados');
        if (cantidad === 0) {
            lista.innerHTML = '<span style="color: #999; font-size: 13px;">Ningún animal seleccionado</span>';
        } else {
            lista.innerHTML = (this.animalesSalida || []).map(id => {
                const animal = AppData.animales.find(a => a.id === id);
                return `
                    <span class="badge badge-primary" style="margin: 2px; cursor: pointer;" 
                          onclick="AnimalesSection.toggleSeleccionSalida('${id}')" title="Quitar">
                        ${id} ✕
                    </span>
                `;
            }).join('');
        }
        
        // Calcular peso promedio
        if (cantidad > 0) {
            const pesoProm = (this.animalesSalida || []).reduce((sum, id) => {
                const a = AppData.animales.find(an => an.id === id);
                return sum + (a?.pesoActual || 0);
            }, 0) / cantidad;
            document.getElementById('salidaPeso').value = pesoProm.toFixed(1);
        }
    },

    calcularTotalVenta() {
        const cantidad = this.animalesSalida?.length || 0;
        const peso = parseFloat(document.getElementById('salidaPeso').value) || 0;
        const precio = parseFloat(document.getElementById('salidaPrecio').value) || 0;
        
        const total = cantidad * peso * precio;
        document.getElementById('salidaTotal').value = total.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS'
        });
    },

    guardarSalida() {
        const fecha = document.getElementById('salidaFecha').value;
        const tipo = document.getElementById('salidaTipo').value;
        const peso = parseFloat(document.getElementById('salidaPeso').value) || 0;
        const comprador = document.getElementById('salidaComprador').value.trim();
        const precio = parseFloat(document.getElementById('salidaPrecio').value) || 0;
        const documento = document.getElementById('salidaDocumento').value.trim();
        const observaciones = document.getElementById('salidaObservaciones').value.trim();
        
        if (!fecha || !this.animalesSalida || this.animalesSalida.length === 0) {
            UI.showToast('Seleccione al menos un animal', 'error');
            return;
        }
        
        if (tipo === 'venta' && (!comprador || !precio)) {
            UI.showToast('Complete los datos de venta', 'error');
            return;
        }
        
        const cantidad = this.animalesSalida.length;
        
        // Actualizar animales
        this.animalesSalida.forEach(id => {
            const animal = AppData.animales.find(a => a.id === id);
            if (animal) {
                animal.estado = tipo === 'muerte' ? 'muerto' : 'vendido';
                animal.fechaEgreso = fecha;
                animal.pesoSalida = peso;
                animal.pesoActual = peso;
                if (tipo === 'venta') {
                    animal.precioVenta = precio;
                    animal.comprador = comprador;
                }
            }
        });
        
        // Registrar movimiento
        if (!AppData.movimientos) AppData.movimientos = [];
        AppData.movimientos.push({
            id: Date.now(),
            tipo: 'salida',
            subtipo: tipo,
            fecha: fecha,
            hora: new Date().toLocaleTimeString(),
            cantidad: cantidad,
            pesoProm: peso,
            pesoTotal: peso * cantidad,
            destino: comprador || observaciones,
            documento: documento,
            detalle: tipo === 'venta' ? `Venta de ${cantidad} animales a ${comprador}` : 
                     tipo === 'muerte' ? `Muerte/Descarte de ${cantidad} animales` : 
                     `Egreso de ${cantidad} animales`,
            valor: precio * peso * cantidad,
            usuario: 'Usuario'
        });
        
        DataManager.save();
        UI.showToast(`✓ ${cantidad} animales dados de egreso`, tipo === 'muerte' ? 'warning' : 'success');
        
        this.animalesSalida = [];
        this.cambiarVista('movimientos');
        DashboardSection.render();
    },

    // ============ FUNCIONES EXISTENTES MEJORADAS ============
    renderTabla() {
        const tbody = document.getElementById('tablaAnimales');
        if (!tbody) return;
        
        const filtroTexto = (AppState.filtros.animales?.search || '').toLowerCase();
        const filtroEstado = AppState.filtros.animales?.estado;
        const filtroCorral = AppState.filtros.animales?.corral;

        const animalesFiltrados = (AppData.animales || []).filter(a => {
            const matchTexto = !filtroTexto || 
                               a.id.toLowerCase().includes(filtroTexto) || 
                               (a.raza && a.raza.toLowerCase().includes(filtroTexto)) || 
                               (a.proveedor && a.proveedor.toLowerCase().includes(filtroTexto)) ||
                               (a.lote && a.lote.toLowerCase().includes(filtroTexto));
            const matchEstado = !filtroEstado || a.estado === filtroEstado;
            const matchCorral = !filtroCorral || a.corral === filtroCorral;
            return matchTexto && matchEstado && matchCorral;
        });

        // Actualizar KPIs
        this.actualizarKPIsInventario(animalesFiltrados);

        if (animalesFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">No se encontraron animales</td></tr>';
            return;
        }

        tbody.innerHTML = animalesFiltrados.map(a => {
            const dias = DateUtils.daysBetween(a.fechaIngreso, DateUtils.today());
            const gmd = this.calcularGMD(a);
            
            let badgeClass = 'badge-secondary';
            if (a.estado === 'engorde') badgeClass = 'badge-success';
            if (a.estado === 'cuarentena') badgeClass = 'badge-warning';
            if (a.estado === 'enfermo') badgeClass = 'badge-danger';
            if (a.estado === 'hospital') badgeClass = 'badge-danger';
            if (a.estado === 'finalizado') badgeClass = 'badge-info';

            return `
                <tr>
                    <td><strong>${a.id}</strong></td>
                    <td>${a.raza || '-'}</td>
                    <td>${a.sexo || '-'}</td>
                    <td>${a.pesoEntrada || '-'} kg</td>
                    <td><strong>${a.pesoActual || '-'} kg</strong></td>
                    <td>${gmd > 0 ? gmd.toFixed(2) : '-'} kg/d</td>
                    <td>${dias} días</td>
                    <td>${a.corral || '-'}</td>
                    <td><span class="badge ${badgeClass}">${(a.estado || 'engorde').toUpperCase()}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-icon btn-sm btn-secondary" onclick="AnimalesSection.verFicha('${a.id}')" title="Ver ficha">👁️</button>
                            <button class="btn btn-icon btn-sm btn-secondary" onclick="AnimalesSection.registrarPesaje('${a.id}')" title="Registrar pesaje">⚖️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    actualizarKPIsInventario(animales) {
        const activos = animales.filter(a => a.estado !== 'vendido' && a.estado !== 'muerto');
        const total = activos.length;
        const pesoProm = total > 0 ? activos.reduce((sum, a) => sum + (a.pesoActual || 0), 0) / total : 0;
        const cuarentena = activos.filter(a => a.estado === 'cuarentena').length;
        const gmdProm = total > 0 ? activos.reduce((sum, a) => sum + this.calcularGMD(a), 0) / total : 0;
        
        const kpiTotal = document.getElementById('kpiTotalFeedlot');
        const kpiPeso = document.getElementById('kpiPesoProm');
        const kpiCuar = document.getElementById('kpiCuarentena');
        const kpiGMD = document.getElementById('kpiGMDProm');
        
        if (kpiTotal) kpiTotal.textContent = total;
        if (kpiPeso) kpiPeso.textContent = pesoProm.toFixed(0);
        if (kpiCuar) kpiCuar.textContent = cuarentena;
        if (kpiGMD) kpiGMD.textContent = gmdProm.toFixed(2);
    },

    calcularGMD(animal) {
        if (!animal.fechaIngreso || !animal.pesoEntrada || !animal.pesoActual) return 0;
        const dias = DateUtils.daysBetween(animal.fechaIngreso, DateUtils.today());
        if (dias <= 0) return 0;
        return (animal.pesoActual - animal.pesoEntrada) / dias;
    },

    filtrar() {
        if (!AppState.filtros) AppState.filtros = {};
        if (!AppState.filtros.animales) AppState.filtros.animales = {};
        
        AppState.filtros.animales.search = document.getElementById('searchAnimal')?.value || '';
        AppState.filtros.animales.estado = document.getElementById('filterEstado')?.value || '';
        AppState.filtros.animales.corral = document.getElementById('filterCorral')?.value || '';
        this.renderTabla();
    },

    limpiarFiltros() {
        const search = document.getElementById('searchAnimal');
        const estado = document.getElementById('filterEstado');
        const corral = document.getElementById('filterCorral');
        
        if (search) search.value = '';
        if (estado) estado.value = '';
        if (corral) corral.value = '';
        this.filtrar();
    },

    verFicha(id) {
        if (typeof AnimalesModal !== 'undefined') {
            AnimalesModal.abrirFicha(id);
        } else {
            const animal = AppData.animales.find(a => a.id === id);
            if (!animal) return;
            
            const dias = DateUtils.daysBetween(animal.fechaIngreso, DateUtils.today());
            const gmd = this.calcularGMD(animal);
            
            UI.createModal('modalFicha', `
                <h3>🐂 Ficha del Animal: ${animal.id}</h3>
                <div class="grid-2" style="margin-top: 20px;">
                    <div>
                        <p><strong>Raza:</strong> ${animal.raza || '-'}</p>
                        <p><strong>Sexo:</strong> ${animal.sexo || '-'}</p>
                        <p><strong>Edad:</strong> ${animal.edad || '-'} meses</p>
                        <p><strong>Corral:</strong> ${animal.corral || '-'}</p>
                        <p><strong>Lote:</strong> ${animal.lote || '-'}</p>
                    </div>
                    <div>
                        <p><strong>Peso Entrada:</strong> ${animal.pesoEntrada || '-'} kg</p>
                        <p><strong>Peso Actual:</strong> ${animal.pesoActual || '-'} kg</p>
                        <p><strong>Ganancia:</strong> ${(animal.pesoActual - animal.pesoEntrada).toFixed(1)} kg</p>
                        <p><strong>GMD:</strong> ${gmd.toFixed(2)} kg/día</p>
                        <p><strong>Días en Feedlot:</strong> ${dias} días</p>
                    </div>
                </div>
            `);
        }
    },

    registrarPesaje(id) {
        const animal = AppData.animales.find(a => a.id === id);
        if (!animal) return;
        
        const nuevoPeso = parseFloat(prompt(`Registrar nuevo pesaje para ${animal.id}\n\nPeso actual: ${animal.pesoActual} kg\n\nNuevo peso (kg):`));
        
        if (!isNaN(nuevoPeso) && nuevoPeso > 0) {
            const pesoAnterior = animal.pesoActual;
            animal.pesoActual = nuevoPeso;
            
            // Registrar movimiento de pesaje
            if (!AppData.movimientos) AppData.movimientos = [];
            AppData.movimientos.push({
                id: Date.now(),
                tipo: 'pesaje',
                fecha: DateUtils.today(),
                animal: id,
                detalle: `Pesaje: ${pesoAnterior} → ${nuevoPeso} kg`,
                usuario: 'Usuario'
            });
            
            // Actualizar estado si alcanzó peso de finalización
            if (nuevoPeso >= 500 && animal.estado === 'engorde') {
                animal.estado = 'finalizado';
                UI.showToast(`¡Animal ${id} alcanzó peso de finalización!`, 'success');
            }
            
            DataManager.save();
            this.renderTabla();
            if (typeof DashboardSection !== 'undefined') DashboardSection.render();
            
            const ganancia = nuevoPeso - pesoAnterior;
            UI.showToast(`Pesaje registrado: ${ganancia > 0 ? '+' : ''}${ganancia.toFixed(1)} kg`);
        }
    },

    paginaAnterior() {
        if (this.paginaActual > 1) {
            this.paginaActual--;
            this.renderTabla();
        }
    },

    paginaSiguiente() {
        this.paginaActual++;
        this.renderTabla();
    },

    exportar() {
        const datos = (AppData.animales || []).map(a => ({
            ID: a.id,
            Raza: a.raza || '',
            Sexo: a.sexo || '',
            Peso_Entrada: a.pesoEntrada || '',
            Peso_Actual: a.pesoActual || '',
            Edad: a.edad || '',
            Fecha_Ingreso: a.fechaIngreso || '',
            Estado: a.estado || '',
            Corral: a.corral || '',
            Lote: a.lote || '',
            Proveedor: a.proveedor || ''
        }));
        
        const csv = this.convertirACSV(datos);
        this.descargarArchivo(csv, `animales_feedpro_${DateUtils.today()}.csv`);
        UI.showToast('Datos exportados a CSV');
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

    filtrarMovimientos() {
        // Implementación básica de filtrado
        this.render();
    },

    addStyles() {
        if (document.getElementById('animalesStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'animalesStyles';
        style.textContent = `
            .animal-salida-item:hover {
                background: #f8f9fa;
            }
            
            .kpi-primary { border-left: 4px solid var(--primary); }
            .kpi-success { border-left: 4px solid var(--success); }
            .kpi-info { border-left: 4px solid var(--info); }
            .kpi-warning { border-left: 4px solid var(--warning); }
            .kpi-danger { border-left: 4px solid var(--danger); }
        `;
        document.head.appendChild(style);
    },

    // ============ IMPORTACIÓN DESDE EXCEL ============
    
    abrirModalImportar() {
        UI.createModal('modalImportar', `
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; margin-bottom: 10px;">📁</div>
                <h2 style="margin: 0; color: var(--dark);">Importar Animales desde Excel</h2>
                <p style="color: #888; margin: 5px 0 0 0;">Cargue un archivo Excel con los datos de los animales</p>
            </div>
            
            <!-- Opciones de importación -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                <div style="padding: 20px; background: #f8f9fa; border-radius: 12px; text-align: center; cursor: pointer;"
                     onclick="document.getElementById('fileExcelAnimales').click()">
                    <div style="font-size: 36px; margin-bottom: 10px;">📊</div>
                    <div style="font-weight: 600; margin-bottom: 5px;">Seleccionar Archivo</div>
                    <div style="font-size: 12px; color: #888;">.xlsx, .xls, .csv</div>
                </div>
                <div style="padding: 20px; background: #f8f9fa; border-radius: 12px; text-align: center; cursor: pointer;"
                     onclick="HardwareManager.descargarPlantillaExcel('animales')">
                    <div style="font-size: 36px; margin-bottom: 10px;">📋</div>
                    <div style="font-weight: 600; margin-bottom: 5px;">Descargar Plantilla</div>
                    <div style="font-size: 12px; color: #888;">Ejemplo de formato</div>
                </div>
            </div>
            
            <!-- Input file oculto -->
            <input type="file" id="fileExcelAnimales" accept=".xlsx,.xls,.csv" 
                   style="display: none;"
                   onchange="AnimalesSection.procesarArchivoExcel(this)">
            
            <!-- Vista previa de importación -->
            <div id="previewImportacion" style="display: none;">
                <div style="background: #e8f5e9; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>✅ Registros válidos:</strong> <span id="validCount">0</span>
                        </div>
                        <div>
                            <strong>❌ Errores:</strong> <span id="errorCount">0</span>
                        </div>
                    </div>
                </div>
                
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <table style="width: 100%; font-size: 13px;">
                        <thead style="background: #f8f9fa; position: sticky; top: 0;">
                            <tr>
                                <th style="padding: 10px;">Caravana</th>
                                <th style="padding: 10px;">RFID</th>
                                <th style="padding: 10px;">Peso</th>
                                <th style="padding: 10px;">Raza</th>
                                <th style="padding: 10px;">Corral</th>
                                <th style="padding: 10px;">Estado</th>
                            </tr>
                        </thead>
                        <tbody id="previewTableBody"></tbody>
                    </table>
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn btn-success btn-lg" onclick="AnimalesSection.confirmarImportacion()">
                        ✅ Confirmar Importación
                    </button>
                </div>
            </div>
            
            <!-- Instrucciones -->
            <div style="background: #e3f2fd; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <h4 style="margin: 0 0 15px 0;">📋 Columnas requeridas:</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 13px;">
                    <div><code>caravana</code> - Número de caravana</div>
                    <div><code>rfid</code> - Código RFID (opcional)</div>
                    <div><code>peso</code> - Peso inicial en kg (obligatorio)</div>
                    <div><code>raza</code> - Raza del animal</div>
                    <div><code>origen</code> - Remate, particular, etc.</div>
                    <div><code>proveedor</code> - Nombre del proveedor</div>
                    <div><code>corral</code> - corral1, corral2, corral3, corral4</div>
                </div>
            </div>
        `, '90%');
        
        // Guardar referencia a datos de importación
        this.datosImportacion = null;
    },
    
    async procesarArchivoExcel(input) {
        const archivo = input.files[0];
        if (!archivo) return;
        
        try {
            console.log('Procesando archivo:', archivo.name);
            UI.showToast('Procesando archivo...', 'info');
            
            // Verificar HardwareManager
            if (typeof HardwareManager === 'undefined') {
                throw new Error('HardwareManager no está cargado. Recargue la página.');
            }
            
            const resultado = await HardwareManager.importarExcel(archivo);
            console.log('Excel procesado:', resultado);
            
            const validacion = HardwareManager.validarRegistrosAnimales(resultado.registros);
            console.log('Validación:', validacion);
            
            this.datosImportacion = validacion.validados;
            
            // Mostrar resumen
            const validCount = document.getElementById('validCount');
            const errorCount = document.getElementById('errorCount');
            const previewDiv = document.getElementById('previewImportacion');
            const tbody = document.getElementById('previewTableBody');
            
            if (validCount) validCount.textContent = validacion.validados.length;
            if (errorCount) errorCount.textContent = validacion.errores.length;
            
            // Mostrar vista previa
            if (tbody) {
                let html = validacion.validados.slice(0, 50).map(a => `
                    <tr>
                        <td style="padding: 8px;">${a.caravana || '-'}</td>
                        <td style="padding: 8px; font-size: 11px;">${a.rfid ? a.rfid.substring(0, 15) + '...' : '-'}</td>
                        <td style="padding: 8px;"><strong>${a.pesoInicial} kg</strong></td>
                        <td style="padding: 8px;">${a.raza}</td>
                        <td style="padding: 8px;">${a.corral || 'corral1'}</td>
                        <td style="padding: 8px;"><span class="badge badge-success">✓</span></td>
                    </tr>
                `).join('');
                
                if (validacion.validados.length > 50) {
                    html += `
                        <tr>
                            <td colspan="6" style="padding: 10px; text-align: center; color: #888;">
                                ... y ${validacion.validados.length - 50} animales más
                            </td>
                        </tr>
                    `;
                }
                
                // Mostrar errores si hay
                if (validacion.errores.length > 0) {
                    html += validacion.errores.slice(0, 5).map(e => `
                        <tr style="background: #ffebee;">
                            <td colspan="6" style="padding: 8px; color: #c62828; font-size: 12px;">
                                ❌ Fila ${e.fila}: ${e.errores.join(', ')}
                            </td>
                        </tr>
                    `).join('');
                }
                
                tbody.innerHTML = html;
            }
            
            if (previewDiv) previewDiv.style.display = 'block';
            
            if (validacion.validados.length === 0) {
                UI.showToast('No se encontraron registros válidos', 'error');
            } else {
                UI.showToast(`${validacion.validados.length} registros listos para importar`, 'success');
            }
            
        } catch (error) {
            console.error('Error procesando archivo:', error);
            UI.showToast('Error: ' + error.message, 'error');
        }
    },
    
    confirmarImportacion() {
        if (!this.datosImportacion || this.datosImportacion.length === 0) {
            UI.showToast('No hay datos para importar', 'error');
            return;
        }
        
        const fechaIngreso = DateUtils.today();
        const horaIngreso = new Date().toLocaleTimeString();
        let importados = 0;
        
        this.datosImportacion.forEach(datos => {
            // Generar ID único
            const id = datos.caravana || `RFID${datos.rfid?.slice(-6) || Date.now()}`;
            
            // Verificar duplicado
            const existente = AppData.animales?.find(a => a.id === id || a.rfid === datos.rfid);
            if (existente) return;
            
            const nuevoAnimal = {
                id: id,
                rfid: datos.rfid || '',
                raza: datos.raza || 'Cruzado',
                sexo: datos.sexo || 'Macho',
                pesoEntrada: datos.pesoInicial,
                pesoActual: datos.pesoInicial,
                fechaIngreso: fechaIngreso,
                horaIngreso: horaIngreso,
                estado: 'engorde',
                corral: datos.corral || 'corral1',
                origen: datos.origen || 'Importación Excel',
                proveedor: datos.proveedor || '',
                lote: `LOTE${DateUtils.format(DateUtils.today(), 'yyyyMMdd')}`
            };
            
            if (!AppData.animales) AppData.animales = [];
            AppData.animales.push(nuevoAnimal);
            importados++;
            
            // Registrar movimiento
            if (!AppData.movimientos) AppData.movimientos = [];
            AppData.movimientos.push({
                id: Date.now() + Math.random(),
                tipo: 'entrada',
                fecha: fechaIngreso,
                hora: horaIngreso,
                animal: id,
                cantidad: 1,
                pesoProm: datos.pesoInicial,
                pesoTotal: datos.pesoInicial,
                origen: datos.origen || 'Importación Excel',
                proveedor: datos.proveedor || '',
                destino: datos.corral || 'corral1',
                detalle: `Importado desde Excel (${datos.rfid ? 'RFID: ' + datos.rfid : 'Caravana: ' + id})`,
                usuario: 'Usuario'
            });
        });
        
        DataManager.save();
        UI.closeModal('modalImportar');
        
        if (importados > 0) {
            UI.showToast(`✅ ${importados} animales importados correctamente`, 'success');
            this.render();
            if (typeof DashboardSection !== 'undefined') DashboardSection.render();
        } else {
            UI.showToast('No se importaron animales (posiblemente duplicados)', 'warning');
        }
    }
};
