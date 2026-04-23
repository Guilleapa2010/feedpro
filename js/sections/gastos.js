/**
 * SECCIÓN: GASTOS - RESUMEN AUTOMÁTICO
 * Dashboard consolidado de todos los costos del feedlot
 * NO permite registro manual - se alimenta de compras, ventas, sanidad, insumos, personal
 */

const GastosSection = {
    // Estado de filtros
    filtros: {
        periodo: 'mes', // mes, trimestre, año, todo
        tipo: 'todos',
        categoria: 'todas'
    },
    
    // Categorías de gastos (para clasificación visual)
    CATEGORIAS: {
        // COMPRAS
        'compra_animales': { nombre: 'Compra de Animales', icono: '🛒', tipo: 'operativo', color: '#4caf50' },
        'compra_flete': { nombre: 'Flete de Compra', icono: '🚛', tipo: 'operativo', color: '#ff9800' },
        'compra_comision': { nombre: 'Comisión de Compra', icono: '🤝', tipo: 'operativo', color: '#9c27b0' },
        'compra_impuestos': { nombre: 'Impuestos Compra (IVA/IIBB)', icono: '🏛️', tipo: 'operativo', color: '#f44336' },
        
        // VENTAS
        'venta_faena': { nombre: 'Gastos de Faena', icono: '🏭', tipo: 'operativo', color: '#e65100' },
        'venta_comision': { nombre: 'Comisión de Venta', icono: '🤝', tipo: 'operativo', color: '#9c27b0' },
        'venta_flete': { nombre: 'Flete de Venta', icono: '🚛', tipo: 'operativo', color: '#ff9800' },
        
        // SANIDAD
        'sanidad_tratamiento': { nombre: 'Tratamientos Sanitarios', icono: '💉', tipo: 'operativo', color: '#e91e63' },
        'sanidad_vacunas': { nombre: 'Vacunas', icono: '🩺', tipo: 'operativo', color: '#2196f3' },
        'sanidad_antibioticos': { nombre: 'Antibióticos', icono: '💊', tipo: 'operativo', color: '#f44336' },
        
        // INSUMOS
        'insumo_alimento': { nombre: 'Alimentos', icono: '🌾', tipo: 'operativo', color: '#8bc34a' },
        'insumo_suplemento': { nombre: 'Suplementos', icono: '🧪', tipo: 'operativo', color: '#00bcd4' },
        'insumo_mantenimiento': { nombre: 'Mantenimiento', icono: '🔧', tipo: 'estructura', color: '#795548' },
        'insumo_combustible': { nombre: 'Combustible', icono: '⛽', tipo: 'operativo', color: '#ff5722' },
        'insumo_otros': { nombre: 'Otros Insumos', icono: '📦', tipo: 'operativo', color: '#607d8b' },
        
        // PERSONAL
        'personal_salarios': { nombre: 'Salarios Personal', icono: '👷', tipo: 'estructura', color: '#3f51b5' },
        'personal_cargas': { nombre: 'Cargas Sociales', icono: '📊', tipo: 'estructura', color: '#e91e63' }
    },
    
    render() {
        this.ensureData();
        
        const container = document.getElementById('gastos');
        if (!container) return;
        
        // Calcular período
        const { fechaInicio, fechaFin, labelPeriodo } = this.getPeriodoActual();
        
        // Obtener todos los gastos consolidados
        const gastosConsolidados = this.consolidarGastos(fechaInicio, fechaFin);
        
        container.innerHTML = `
            <div class="section-header">
                <h2>💸 Resumen de Gastos</h2>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <select id="gastoPeriodo" class="form-select" onchange="GastosSection.cambiarPeriodo()" style="width: auto;">
                        <option value="mes" ${this.filtros.periodo === 'mes' ? 'selected' : ''}>Este Mes</option>
                        <option value="trimestre" ${this.filtros.periodo === 'trimestre' ? 'selected' : ''}>Este Trimestre</option>
                        <option value="anio" ${this.filtros.periodo === 'anio' ? 'selected' : ''}>Este Año</option>
                        <option value="todo" ${this.filtros.periodo === 'todo' ? 'selected' : ''}>Todo el Historial</option>
                    </select>
                    <button class="btn btn-primary" onclick="GastosSection.exportarReporte()">
                        📄 Exportar
                    </button>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="font-size: 14px; opacity: 0.9; text-transform: uppercase;">Período Analizado</div>
                <div style="font-size: 24px; font-weight: 700;">${labelPeriodo}</div>
                <div style="font-size: 13px; opacity: 0.8; margin-top: 5px;">
                    ${DateUtils.format(fechaInicio)} al ${DateUtils.format(fechaFin)}
                </div>
            </div>
            
            <!-- KPIs PRINCIPALES -->
            <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #ffebee; color: #c62828;">💰</div>
                    <div class="stat-info">
                        <span class="stat-value" style="color: #c62828;">${Formatters.currency(gastosConsolidados.total)}</span>
                        <span class="stat-label">Total Gastos</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fff3e0; color: #e65100;">🏗️</div>
                    <div class="stat-info">
                        <span class="stat-value">${Formatters.currency(gastosConsolidados.estructura)}</span>
                        <span class="stat-label">Costos Estructura</span>
                        <span class="stat-label" style="font-size: 11px; color: #888;">${gastosConsolidados.porcentajeEstructura}% del total</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e8f5e9; color: #2e7d32;">⚙️</div>
                    <div class="stat-info">
                        <span class="stat-value">${Formatters.currency(gastosConsolidados.operativos)}</span>
                        <span class="stat-label">Costos Operativos</span>
                        <span class="stat-label" style="font-size: 11px; color: #888;">${gastosConsolidados.porcentajeOperativos}% del total</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e3f2fd; color: #1565c0;">🐄</div>
                    <div class="stat-info">
                        <span class="stat-value">${Formatters.currency(gastosConsolidados.costoPorAnimal)}</span>
                        <span class="stat-label">Costo por Animal</span>
                        <span class="stat-label" style="font-size: 11px; color: #888;">Promedio del período</span>
                    </div>
                </div>
            </div>
            
            <!-- GRÁFICOS -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div class="card">
                    <h3 style="margin-bottom: 15px;">📊 Distribución por Origen</h3>
                    <canvas id="gastosOrigenChart" height="250"></canvas>
                </div>
                <div class="card">
                    <h3 style="margin-bottom: 15px;">📈 Comparativo Estructura vs Operativos</h3>
                    <canvas id="gastosTipoChart" height="250"></canvas>
                </div>
            </div>
            
            <!-- DESGLOSE POR CATEGORÍA -->
            <div class="card" style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px;">📋 Desglose Detallado por Categoría</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    <!-- Costos de Estructura -->
                    <div>
                        <h4 style="color: #e65100; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #ff9800;">
                            🏗️ Costos de Estructura
                        </h4>
                        ${this.renderDesglosePorTipo(gastosConsolidados.detalle, 'estructura')}
                    </div>
                    <!-- Costos Operativos -->
                    <div>
                        <h4 style="color: #2e7d32; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #4caf50;">
                            ⚙️ Costos Operativos
                        </h4>
                        ${this.renderDesglosePorTipo(gastosConsolidados.detalle, 'operativo')}
                    </div>
                </div>
            </div>
            
            <!-- ORIGEN DE LOS GASTOS -->
            <div class="card" style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px;">🔍 Origen de los Gastos</h3>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px;">
                    ${this.renderOrigenCards(gastosConsolidados.origenes)}
                </div>
            </div>
            
            <!-- TABLA DETALLADA -->
            <div class="card">
                <h3 style="margin-bottom: 15px;">📑 Detalle de Movimientos</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Origen</th>
                                <th>Categoría</th>
                                <th>Descripción</th>
                                <th style="text-align: right;">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderTablaDetalle(gastosConsolidados.movimientos)}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff8e1; border-radius: 10px; border-left: 4px solid #ff9800;">
                <strong>💡 Nota:</strong> Los gastos se calculan automáticamente a partir de:
                <strong>Compras</strong> (animales, fletes, comisiones, impuestos), 
                <strong>Ventas</strong> (faena, comisiones), 
                <strong>Sanidad</strong> (tratamientos), 
                <strong>Insumos</strong> (alimentos, mantenimiento) y 
                <strong>Personal</strong> (salarios + cargas sociales).
            </div>
        `;
        
        this.initCharts(gastosConsolidados);
    },
    
    // Consolidar todos los gastos de las diferentes fuentes
    consolidarGastos(fechaInicio, fechaFin) {
        const movimientos = [];
        let totalEstructura = 0;
        let totalOperativos = 0;
        
        // Origenes
        const origenes = {
            compras: 0,
            ventas: 0,
            sanidad: 0,
            insumos: 0,
            personal: 0
        };
        
        // 1. COMPRAS DE ANIMALES
        (AppData.compras || []).forEach(comp => {
            if (comp.fecha < fechaInicio || comp.fecha > fechaFin) return;
            
            // Costo de animales
            if (comp.subtotal > 0) {
                movimientos.push({
                    fecha: comp.fecha,
                    origen: 'Compras',
                    categoria: 'compra_animales',
                    descripcion: `Compra ${comp.cantidad} animales - ${comp.proveedor}`,
                    monto: comp.subtotal,
                    tipo: 'operativo'
                });
                totalOperativos += comp.subtotal;
                origenes.compras += comp.subtotal;
            }
            
            // Flete
            if (comp.flete > 0) {
                movimientos.push({
                    fecha: comp.fecha,
                    origen: 'Compras',
                    categoria: 'compra_flete',
                    descripcion: 'Flete de compra',
                    monto: comp.flete,
                    tipo: 'operativo'
                });
                totalOperativos += comp.flete;
                origenes.compras += comp.flete;
            }
            
            // Comisión
            if (comp.comisionMonto > 0) {
                movimientos.push({
                    fecha: comp.fecha,
                    origen: 'Compras',
                    categoria: 'compra_comision',
                    descripcion: `Comisión ${comp.comisionPorcentaje}%`,
                    monto: comp.comisionMonto,
                    tipo: 'operativo'
                });
                totalOperativos += comp.comisionMonto;
                origenes.compras += comp.comisionMonto;
            }
            
            // Impuestos (IVA + IIBB)
            const impuestos = (comp.ivaMonto || 0) + (comp.iibbMonto || 0);
            if (impuestos > 0) {
                movimientos.push({
                    fecha: comp.fecha,
                    origen: 'Compras',
                    categoria: 'compra_impuestos',
                    descripcion: `IVA + IIBB`,
                    monto: impuestos,
                    tipo: 'operativo'
                });
                totalOperativos += impuestos;
                origenes.compras += impuestos;
            }
        });
        
        // 2. VENTAS/FAENA (solo gastos, no ingresos)
        (AppData.ventas || []).forEach(vent => {
            if (vent.fecha < fechaInicio || vent.fecha > fechaFin) return;
            
            // Comisión
            if (vent.comisionMonto > 0) {
                movimientos.push({
                    fecha: vent.fecha,
                    origen: 'Ventas',
                    categoria: 'venta_comision',
                    descripcion: `Comisión ${vent.comisionPorcentaje}% - ${vent.cliente}`,
                    monto: vent.comisionMonto,
                    tipo: 'operativo'
                });
                totalOperativos += vent.comisionMonto;
                origenes.ventas += vent.comisionMonto;
            }
            
            // Gastos de faena
            if (vent.tipoVenta === 'faena' && vent.gastos) {
                const gastosFaena = vent.gastos.totalGastosFaena || 0;
                if (gastosFaena > 0) {
                    movimientos.push({
                        fecha: vent.fecha,
                        origen: 'Ventas',
                        categoria: 'venta_faena',
                        descripcion: `Gastos faena - ${vent.cliente}`,
                        monto: gastosFaena,
                        tipo: 'operativo'
                    });
                    totalOperativos += gastosFaena;
                    origenes.ventas += gastosFaena;
                }
            }
            
            // Flete de venta (solo si es venta en pie)
            if (vent.tipoVenta === 'pie' && vent.flete > 0) {
                movimientos.push({
                    fecha: vent.fecha,
                    origen: 'Ventas',
                    categoria: 'venta_flete',
                    descripcion: `Flete - ${vent.cliente}`,
                    monto: vent.flete,
                    tipo: 'operativo'
                });
                totalOperativos += vent.flete;
                origenes.ventas += vent.flete;
            }
        });
        
        // 3. TRATAMIENTOS DE SANIDAD
        (AppData.tratamientos || []).forEach(trat => {
            if (trat.fecha < fechaInicio || trat.fecha > fechaFin) return;
            if (!trat.costo || trat.costo <= 0) return;
            
            const catKey = trat.tipo === 'vacuna' ? 'sanidad_vacunas' : 
                          trat.tipo === 'antibiotico' ? 'sanidad_antibioticos' : 'sanidad_tratamiento';
            
            movimientos.push({
                fecha: trat.fecha,
                origen: 'Sanidad',
                categoria: catKey,
                descripcion: `${trat.producto || trat.tipo} - ${trat.animalesAfectados || 0} animales`,
                monto: trat.costo,
                tipo: 'operativo'
            });
            totalOperativos += trat.costo;
            origenes.sanidad += trat.costo;
        });
        
        // 4. INSUMOS (movimientos de stock)
        (AppData.movimientosInsumos || []).forEach(mov => {
            if (mov.fecha < fechaInicio || mov.fecha > fechaFin) return;
            if (mov.tipo !== 'entrada' || !mov.costoTotal) return;
            
            // Buscar insumo por ID o por nombre
            let insumo = null;
            if (mov.insumoId) {
                insumo = (AppData.insumos || []).find(i => i.id === mov.insumoId);
            }
            if (!insumo && mov.insumo) {
                insumo = (AppData.insumos || []).find(i => i.nombre === mov.insumo);
            }
            
            const catKey = insumo?.categoria === 'alimento' ? 'insumo_alimento' :
                          insumo?.categoria === 'suplemento' ? 'insumo_suplemento' :
                          insumo?.categoria === 'mantenimiento' ? 'insumo_mantenimiento' :
                          insumo?.categoria === 'combustible' ? 'insumo_combustible' : 'insumo_otros';
            
            const tipoCosto = insumo?.categoria === 'mantenimiento' ? 'estructura' : 'operativo';
            
            movimientos.push({
                fecha: mov.fecha,
                origen: 'Insumos',
                categoria: catKey,
                descripcion: `${insumo?.nombre || mov.insumo || 'Insumo'} - ${mov.cantidad} ${insumo?.unidad || 'un'}`,
                monto: mov.costoTotal,
                tipo: tipoCosto
            });
            
            if (tipoCosto === 'estructura') {
                totalEstructura += mov.costoTotal;
            } else {
                totalOperativos += mov.costoTotal;
            }
            origenes.insumos += mov.costoTotal;
        });
        
        // 5. PERSONAL (salarios + cargas)
        const personal = AppData.personal || [];
        const mesesEnPeriodo = this.calcularMesesEnPeriodo(fechaInicio, fechaFin);
        
        personal.forEach(emp => {
            if (emp.activo === false) return;
            
            const salarioMensual = parseFloat(emp.salario) || 0;
            const totalPeriodo = salarioMensual * mesesEnPeriodo;
            const cargasSociales = totalPeriodo * 0.42; // ~42% cargas sociales
            
            if (totalPeriodo > 0) {
                movimientos.push({
                    fecha: fechaFin,
                    origen: 'Personal',
                    categoria: 'personal_salarios',
                    descripcion: `Salario ${emp.nombre} (${mesesEnPeriodo} meses)`,
                    monto: totalPeriodo,
                    tipo: 'estructura'
                });
                totalEstructura += totalPeriodo;
                origenes.personal += totalPeriodo;
            }
            
            if (cargasSociales > 0) {
                movimientos.push({
                    fecha: fechaFin,
                    origen: 'Personal',
                    categoria: 'personal_cargas',
                    descripcion: `Cargas sociales ${emp.nombre}`,
                    monto: cargasSociales,
                    tipo: 'estructura'
                });
                totalEstructura += cargasSociales;
                origenes.personal += cargasSociales;
            }
        });
        
        const total = totalEstructura + totalOperativos;
        const cantidadAnimales = (AppData.animales || []).filter(a => a.estado !== 'vendido').length || 1;
        
        return {
            movimientos: movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
            detalle: this.agruparPorCategoria(movimientos),
            origenes,
            estructura: totalEstructura,
            operativos: totalOperativos,
            total,
            porcentajeEstructura: total > 0 ? ((totalEstructura / total) * 100).toFixed(1) : 0,
            porcentajeOperativos: total > 0 ? ((totalOperativos / total) * 100).toFixed(1) : 0,
            costoPorAnimal: cantidadAnimales > 0 ? total / cantidadAnimales : 0
        };
    },
    
    calcularMesesEnPeriodo(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return Math.max(1, (fin - inicio) / (1000 * 60 * 60 * 24 * 30));
    },
    
    agruparPorCategoria(movimientos) {
        const agrupado = {};
        movimientos.forEach(mov => {
            if (!agrupado[mov.categoria]) {
                agrupado[mov.categoria] = { total: 0, items: [] };
            }
            agrupado[mov.categoria].total += mov.monto;
            agrupado[mov.categoria].items.push(mov);
        });
        return agrupado;
    },
    
    renderDesglosePorTipo(detalle, tipo) {
        const items = Object.entries(detalle)
            .filter(([key, val]) => this.CATEGORIAS[key]?.tipo === tipo)
            .sort((a, b) => b[1].total - a[1].total);
        
        if (items.length === 0) {
            return '<p style="color: #888; padding: 20px; text-align: center;">Sin movimientos en este período</p>';
        }
        
        return items.map(([key, val]) => {
            const cat = this.CATEGORIAS[key];
            return `
                <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span style="font-size: 24px; margin-right: 12px;">${cat.icono}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 14px;">${cat.nombre}</div>
                        <div style="font-size: 12px; color: #888;">${val.items.length} movimientos</div>
                    </div>
                    <div style="font-weight: 700; font-size: 16px; color: ${tipo === 'estructura' ? '#e65100' : '#2e7d32'};">
                        ${Formatters.currency(val.total)}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    renderOrigenCards(origenes) {
        const config = {
            compras: { icono: '🛒', nombre: 'Compras', color: '#4caf50' },
            ventas: { icono: '💰', nombre: 'Ventas/Faena', color: '#ff9800' },
            sanidad: { icono: '💉', nombre: 'Sanidad', color: '#e91e63' },
            insumos: { icono: '📦', nombre: 'Insumos', color: '#2196f3' },
            personal: { icono: '👷', nombre: 'Personal', color: '#9c27b0' }
        };
        
        return Object.entries(origenes).map(([key, monto]) => {
            const cfg = config[key];
            return `
                <div style="background: ${cfg.color}15; border-left: 4px solid ${cfg.color}; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 28px; margin-bottom: 8px;">${cfg.icono}</div>
                    <div style="font-size: 12px; color: #666; text-transform: uppercase;">${cfg.nombre}</div>
                    <div style="font-size: 20px; font-weight: 700; color: ${cfg.color};">${Formatters.currency(monto)}</div>
                </div>
            `;
        }).join('');
    },
    
    renderTablaDetalle(movimientos) {
        if (movimientos.length === 0) {
            return '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #888;">No hay movimientos en el período seleccionado</td></tr>';
        }
        
        return movimientos.slice(0, 50).map(mov => { // Mostrar solo los primeros 50
            const cat = this.CATEGORIAS[mov.categoria] || { icono: '❓', nombre: 'Desconocido', color: '#999' };
            return `
                <tr>
                    <td>${DateUtils.format(mov.fecha)}</td>
                    <td><span class="badge badge-secondary">${mov.origen}</span></td>
                    <td>
                        <span style="font-size: 16px; margin-right: 5px;">${cat.icono}</span>
                        <span style="font-size: 12px; color: ${cat.color};">${cat.nombre}</span>
                    </td>
                    <td>${mov.descripcion}</td>
                    <td style="text-align: right; font-weight: 600;">${Formatters.currency(mov.monto)}</td>
                </tr>
            `;
        }).join('') + (movimientos.length > 50 ? `
            <tr><td colspan="5" style="text-align: center; padding: 15px; color: #888; font-style: italic;">
                ... y ${movimientos.length - 50} movimientos más
            </td></tr>
        ` : '');
    },
    
    getPeriodoActual() {
        const hoy = new Date();
        let fechaInicio, fechaFin, label;
        
        switch(this.filtros.periodo) {
            case 'mes':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                fechaFin = hoy;
                label = hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                break;
            case 'trimestre':
                const trimestre = Math.floor(hoy.getMonth() / 3);
                fechaInicio = new Date(hoy.getFullYear(), trimestre * 3, 1);
                fechaFin = hoy;
                label = `Q${trimestre + 1} ${hoy.getFullYear()}`;
                break;
            case 'anio':
                fechaInicio = new Date(hoy.getFullYear(), 0, 1);
                fechaFin = hoy;
                label = `Año ${hoy.getFullYear()}`;
                break;
            default:
                fechaInicio = new Date(2000, 0, 1);
                fechaFin = hoy;
                label = 'Todo el Historial';
        }
        
        return {
            fechaInicio: fechaInicio.toISOString().split('T')[0],
            fechaFin: fechaFin.toISOString().split('T')[0],
            labelPeriodo: label.charAt(0).toUpperCase() + label.slice(1)
        };
    },
    
    cambiarPeriodo() {
        this.filtros.periodo = document.getElementById('gastoPeriodo').value;
        this.render();
    },
    
    initCharts(data) {
        // Gráfico de origen
        const ctxOrigen = document.getElementById('gastosOrigenChart');
        if (ctxOrigen) {
            new Chart(ctxOrigen, {
                type: 'doughnut',
                data: {
                    labels: ['Compras', 'Ventas', 'Sanidad', 'Insumos', 'Personal'],
                    datasets: [{
                        data: [
                            data.origenes.compras,
                            data.origenes.ventas,
                            data.origenes.sanidad,
                            data.origenes.insumos,
                            data.origenes.personal
                        ],
                        backgroundColor: ['#4caf50', '#ff9800', '#e91e63', '#2196f3', '#9c27b0']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            });
        }
        
        // Gráfico de tipo (estructura vs operativos)
        const ctxTipo = document.getElementById('gastosTipoChart');
        if (ctxTipo) {
            new Chart(ctxTipo, {
                type: 'bar',
                data: {
                    labels: ['Estructura', 'Operativos'],
                    datasets: [{
                        label: 'Monto',
                        data: [data.estructura, data.operativos],
                        backgroundColor: ['#ff9800', '#4caf50']
                    }]
                },
                options: {
                    responsive: true,
                    indexAxis: 'y'
                }
            });
        }
    },
    
    exportarReporte() {
        UI.showToast('Generando reporte de gastos...', 'info');
        // Aquí se implementaría la exportación a Excel/PDF
    },
    
    ensureData() {
        // Asegurar que existan todas las fuentes de datos
        if (!AppData.compras) AppData.compras = [];
        if (!AppData.ventas) AppData.ventas = [];
        if (!AppData.tratamientos) AppData.tratamientos = [];
        if (!AppData.movimientosInsumos) AppData.movimientosInsumos = [];
        if (!AppData.insumos) AppData.insumos = [];
        if (!AppData.personal) AppData.personal = [];
    }
};

window.GastosSection = GastosSection;
