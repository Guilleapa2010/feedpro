/**
 * SECCIÓN COMERCIALIZACIÓN V2 - COMPARACIÓN Y ANÁLISIS
 * Estilo Cattler - Ventas, comparación compra/venta y rentabilidad
 */

const ComercializacionSection = {
    vistaActual: 'ventas', // ventas, comparacion, clientes, precios
    
    render() {
        const section = document.getElementById('comercializacion');
        
        // Calcular KPIs
        const animalesListos = AppData.animales.filter(a => 
            a.pesoActual >= 480 && a.estado === 'engorde'
        );
        
        const ventasMes = (AppData.ventas || []).filter(v => {
            const fechaVenta = new Date(v.fecha);
            const hoy = new Date();
            return fechaVenta.getMonth() === hoy.getMonth() && 
                   fechaVenta.getFullYear() === hoy.getFullYear();
        });
        
        const totalVentasMes = ventasMes.reduce((sum, v) => sum + v.total, 0);
        const cabezasVendidasMes = ventasMes.reduce((sum, v) => sum + v.cantidad, 0);
        
        const precioPromedio = 2.85;
        const pesoTotalListos = animalesListos.reduce((sum, a) => sum + a.pesoActual, 0);
        const proyeccionIngresos = pesoTotalListos * precioPromedio;
        
        section.innerHTML = `
            <!-- NAVEGACIÓN -->
            <div class="sanidad-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e9ecef;">
                <button class="tab-btn ${this.vistaActual === 'ventas' ? 'active' : ''}" onclick="ComercializacionSection.cambiarVista('ventas')">
                    💰 Ventas
                </button>
                <button class="tab-btn ${this.vistaActual === 'comparacion' ? 'active' : ''}" onclick="ComercializacionSection.cambiarVista('comparacion')">
                    ⚖️ Comparación Compra/Venta
                </button>
                <button class="tab-btn ${this.vistaActual === 'clientes' ? 'active' : ''}" onclick="ComercializacionSection.cambiarVista('clientes')">
                    👥 Clientes
                </button>
                <button class="tab-btn ${this.vistaActual === 'precios' ? 'active' : ''}" onclick="ComercializacionSection.cambiarVista('precios')">
                    📈 Histórico de Precios
                </button>
            </div>

            <!-- KPIs -->
            <div class="grid-4">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">Precio Promedio</span>
                    </div>
                    <div class="kpi-value">$${precioPromedio.toFixed(2)}</div>
                    <div class="kpi-subtitle">Por kg vivo</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">Animales Listos</span>
                    </div>
                    <div class="kpi-value" style="color: ${animalesListos.length > 0 ? 'var(--success)' : 'inherit'};">
                        ${animalesListos.length}
                    </div>
                    <div class="kpi-subtitle">Para venta inmediata (>480kg)</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">Ventas del Mes</span>
                    </div>
                    <div class="kpi-value">${Formatters.currency(totalVentasMes)}</div>
                    <div class="kpi-subtitle">${cabezasVendidasMes} cabezas</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">Proyección</span>
                    </div>
                    <div class="kpi-value">${Formatters.currency(proyeccionIngresos)}</div>
                    <div class="kpi-subtitle">Ingresos esperados (listos)</div>
                </div>
            </div>
            
            ${animalesListos.length > 0 && this.vistaActual === 'ventas' ? `
                <div class="alert alert-success" style="margin-bottom: 20px;">
                    <span>✅</span>
                    <div>
                        <strong>Hay ${animalesListos.length} animales listos para venta</strong>
                        <button class="btn btn-sm btn-success" onclick="ComercializacionSection.venderListos()" style="margin-left: 15px;">
                            Vender Ahora
                        </button>
                    </div>
                </div>
            ` : ''}

            <!-- CONTENIDO DINÁMICO -->
            <div id="comercializacionContent">
                ${this.renderContenidoVista()}
            </div>
        `;
        
        this.addStyles();
    },

    cambiarVista(vista) {
        this.vistaActual = vista;
        this.render();
    },

    renderContenidoVista() {
        switch(this.vistaActual) {
            case 'ventas':
                return this.renderVentas();
            case 'comparacion':
                return this.renderComparacion();
            case 'clientes':
                return this.renderClientesVista();
            case 'precios':
                return this.renderPrecios();
            default:
                return this.renderVentas();
        }
    },

    // ============ VISTA VENTAS ============
    renderVentas() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">💰 Registro de Ventas</h3>
                    <button class="btn btn-primary" onclick="openModal('ventaModal')">+ Nueva Venta</button>
                </div>
                <div class="filters-bar">
                    <div class="search-box">
                        <input type="text" class="form-input" id="searchVenta" 
                            placeholder="Buscar por cliente..." 
                            onkeyup="ComercializacionSection.filtrarVentas()">
                    </div>
                    <input type="date" class="form-input" id="filtroVentaDesde" onchange="ComercializacionSection.filtrarVentas()">
                    <input type="date" class="form-input" id="filtroVentaHasta" onchange="ComercializacionSection.filtrarVentas()">
                </div>
                <div class="table-container">
                    <table id="tablaVentasMain">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Cantidad</th>
                                <th>Peso Prom.</th>
                                <th>Precio/kg</th>
                                <th>Total</th>
                                <th>Margen Est.</th>
                                <th>Pago</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaVentas">
                            ${this.renderVentasRows()}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- RESUMEN ANUAL -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📊 Resumen de Ventas Anual</h3>
                </div>
                <div style="padding: 20px;">
                    ${this.renderResumenAnual()}
                </div>
            </div>
        `;
    },

    renderVentasRows() {
        if (!AppData.ventas || AppData.ventas.length === 0) {
            return '<tr><td colspan="10" class="text-center">No hay ventas registradas</td></tr>';
        }
        
        return AppData.ventas.slice().reverse().map((v, idx) => {
            // Calcular margen estimado
            const margen = v.total - (v.costoTotal || v.total * 0.7);
            const margenPct = v.total > 0 ? (margen / v.total) * 100 : 0;
            
            return `
                <tr>
                    <td>#${AppData.ventas.length - idx}</td>
                    <td>${DateUtils.format(v.fecha)}</td>
                    <td><strong>${v.cliente}</strong></td>
                    <td>${v.cantidad} animales</td>
                    <td>${v.pesoPromedio} kg</td>
                    <td>$${v.precioKg}</td>
                    <td><strong>${Formatters.currency(v.total)}</strong></td>
                    <td style="color: ${margen >= 0 ? 'var(--success)' : 'var(--danger)'};">
                        ${Formatters.currency(margen)} (${margenPct.toFixed(1)}%)
                    </td>
                    <td><span class="badge badge-${v.pagado ? 'success' : 'warning'}">${v.pagado ? 'Pagado' : 'Pendiente'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="ComercializacionSection.verDetalleVenta(${v.id})">Ver</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderResumenAnual() {
        const ventas = AppData.ventas || [];
        const meses = {};
        
        ventas.forEach(v => {
            const fecha = new Date(v.fecha);
            const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            if (!meses[key]) meses[key] = { cantidad: 0, total: 0 };
            meses[key].cantidad += v.cantidad;
            meses[key].total += v.total;
        });
        
        const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        return `
            <div style="height: 250px; position: relative; margin-bottom: 20px;">
                <canvas id="ventasChart"></canvas>
            </div>
            <div class="grid-4">
                ${Object.entries(meses).slice(-4).map(([mes, datos]) => {
                    const [anio, numMes] = mes.split('-');
                    return `
                        <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <div style="font-size: 12px; color: #666;">${nombresMeses[parseInt(numMes) - 1]} ${anio}</div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${Formatters.currency(datos.total)}</div>
                            <div style="font-size: 12px; color: #666;">${datos.cantidad} cabezas</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    // ============ VISTA COMPARACIÓN ============
    renderComparacion() {
        // Análisis de compra vs venta
        const lotes = {};
        
        (AppData.animales || []).forEach(a => {
            const lote = a.lote || 'Sin lote';
            if (!lotes[lote]) {
                lotes[lote] = { 
                    animales: [], 
                    costoCompra: 0, 
                    pesoCompra: 0,
                    ventas: []
                };
            }
            lotes[lote].animales.push(a);
            lotes[lote].costoCompra += (a.costoIngreso || 0) * (a.pesoEntrada || 0);
            lotes[lote].pesoCompra += a.pesoEntrada || 0;
        });
        
        // Vincular ventas con lotes (simulado)
        (AppData.ventas || []).forEach(v => {
            // Asignar ventas al lote más reciente
            const loteKey = Object.keys(lotes).pop() || 'Sin lote';
            if (lotes[loteKey]) {
                lotes[loteKey].ventas.push(v);
            }
        });
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">⚖️ Análisis de Compra vs Venta por Lote</h3>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Lote</th>
                                <th>Cabezas</th>
                                <th>Costo Compra</th>
                                <th>Costo/kg Compra</th>
                                <th>Ingreso Venta</th>
                                <th>Precio/kg Venta</th>
                                <th>Resultado</th>
                                <th>Rentabilidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(lotes).map(([lote, datos]) => {
                                const cabezas = datos.animales.length;
                                const costoProm = datos.pesoCompra > 0 ? datos.costoCompra / datos.pesoCompra : 0;
                                const ingresoTotal = datos.ventas.reduce((sum, v) => sum + v.total, 0);
                                const pesoVendido = datos.ventas.reduce((sum, v) => sum + (v.pesoPromedio * v.cantidad), 0);
                                const precioProm = pesoVendido > 0 ? ingresoTotal / pesoVendido : 0;
                                const resultado = ingresoTotal - datos.costoCompra;
                                const rentabilidad = datos.costoCompra > 0 ? (resultado / datos.costoCompra) * 100 : 0;
                                
                                return `
                                    <tr>
                                        <td><strong>${lote}</strong></td>
                                        <td>${cabezas}</td>
                                        <td>${Formatters.currency(datos.costoCompra)}</td>
                                        <td>${Formatters.currency(costoProm)}/kg</td>
                                        <td>${Formatters.currency(ingresoTotal)}</td>
                                        <td>${Formatters.currency(precioProm)}/kg</td>
                                        <td style="color: ${resultado >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
                                            ${resultado >= 0 ? '+' : ''}${Formatters.currency(resultado)}
                                        </td>
                                        <td>
                                            <span class="badge badge-${rentabilidad >= 15 ? 'success' : rentabilidad >= 0 ? 'warning' : 'danger'}">
                                                ${rentabilidad.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('') || '<tr><td colspan="8" class="text-center">No hay datos suficientes</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ANÁLISIS DETALLADO -->
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📉 Evolución de Precios</h3>
                    </div>
                    <div style="padding: 20px; height: 250px;">
                        <canvas id="evolucionPreciosChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💡 Recomendaciones</h3>
                    </div>
                    <div style="padding: 20px;">
                        ${this.renderRecomendaciones()}
                    </div>
                </div>
            </div>
        `;
    },

    renderRecomendaciones() {
        const animales = AppData.animales || [];
        const listos = animales.filter(a => a.pesoActual >= 480 && a.estado === 'engorde');
        const precioActual = 2.85;
        const precioMesPasado = 2.65;
        const variacion = ((precioActual - precioMesPasado) / precioMesPasado) * 100;
        
        return `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${listos.length > 0 ? `
                    <div style="padding: 15px; background: #d4edda; border-radius: 8px; border-left: 4px solid var(--success);">
                        <strong>✅ Vender animales listos</strong>
                        <p style="margin: 5px 0 0 0; font-size: 13px;">Hay ${listos.length} animales que alcanzaron el peso objetivo. El precio actual es favorable.</p>
                    </div>
                ` : ''}
                
                ${variacion > 5 ? `
                    <div style="padding: 15px; background: #d4edda; border-radius: 8px; border-left: 4px solid var(--success);">
                        <strong>📈 Buen momento para vender</strong>
                        <p style="margin: 5px 0 0 0; font-size: 13px;">El precio subió ${variacion.toFixed(1)}% respecto al mes pasado.</p>
                    </div>
                ` : variacion < -5 ? `
                    <div style="padding: 15px; background: #f8d7da; border-radius: 8px; border-left: 4px solid var(--danger);">
                        <strong>📉 Considerar esperar</strong>
                        <p style="margin: 5px 0 0 0; font-size: 13px;">El precio bajó ${Math.abs(variacion).toFixed(1)}%. Evaluar mantener si es posible.</p>
                    </div>
                ` : `
                    <div style="padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid var(--warning);">
                        <strong>➡️ Precios estables</strong>
                        <p style="margin: 5px 0 0 0; font-size: 13px;">Los precios se mantienen sin cambios significativos.</p>
                    </div>
                `}
                
                <div style="padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid var(--info);">
                    <strong>💡 Consejo</strong>
                    <p style="margin: 5px 0 0 0; font-size: 13px;">Vender por lotes completos para obtener mejores precios y reducir costos de transporte.</p>
                </div>
            </div>
        `;
    },

    // ============ VISTA CLIENTES ============
    renderClientesVista() {
        return `
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">👥 Clientes</h3>
                        <button class="btn btn-primary" onclick="openModal('clienteModal')">+ Nuevo Cliente</button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Contacto</th>
                                    <th>CUIT</th>
                                    <th>Teléfono</th>
                                    <th>Compras</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tablaClientes">
                                ${this.renderClientesRows()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🏆 Top Clientes</h3>
                    </div>
                    <div style="padding: 20px;">
                        ${this.renderTopClientes()}
                    </div>
                </div>
            </div>
        `;
    },

    renderClientesRows() {
        const clientes = AppData.clientes || [];
        
        if (clientes.length === 0) {
            return '<tr><td colspan="6" class="text-center">No hay clientes registrados</td></tr>';
        }
        
        return clientes.map(c => {
            const comprasCliente = (AppData.ventas || []).filter(v => v.cliente === c.razonSocial);
            const totalComprado = comprasCliente.reduce((sum, v) => sum + v.total, 0);
            
            return `
                <tr>
                    <td><strong>${c.razonSocial}</strong></td>
                    <td>${c.contacto || '-'}</td>
                    <td>${c.cuit || '-'}</td>
                    <td>${c.telefono || '-'}</td>
                    <td>${Formatters.currency(totalComprado)}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="ComercializacionSection.editarCliente('${c.cuit}')">Editar</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderTopClientes() {
        const comprasPorCliente = {};
        
        (AppData.ventas || []).forEach(v => {
            if (!comprasPorCliente[v.cliente]) comprasPorCliente[v.cliente] = 0;
            comprasPorCliente[v.cliente] += v.total;
        });
        
        const sorted = Object.entries(comprasPorCliente).sort((a, b) => b[1] - a[1]).slice(0, 5);
        
        if (sorted.length === 0) {
            return '<p class="text-center">No hay datos de ventas</p>';
        }
        
        return sorted.map(([cliente, total], idx) => `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; 
                        border-bottom: 1px solid #eee;">
                <div style="width: 30px; height: 30px; background: ${idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#e9ecef'}; 
                            border-radius: 50%; display: flex; align-items: center; justify-content: center;
                            font-weight: 700; color: ${idx < 3 ? 'white' : '#666'};">
                    ${idx + 1}
                </div>
                <div style="flex: 1;">
                    <strong>${cliente}</strong>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--primary);">${Formatters.currency(total)}</div>
                    <div style="font-size: 12px; color: #666;">Total comprado</div>
                </div>
            </div>
        `).join('');
    },

    // ============ VISTA PRECIOS ============
    renderPrecios() {
        // Simulación de histórico de precios
        const historico = [
            { mes: 'Ene 2024', precio: 2.45 },
            { mes: 'Feb 2024', precio: 2.52 },
            { mes: 'Mar 2024', precio: 2.58 },
            { mes: 'Abr 2024', precio: 2.65 },
            { mes: 'May 2024', precio: 2.71 },
            { mes: 'Jun 2024', precio: 2.78 },
            { mes: 'Jul 2024', precio: 2.85 }
        ];
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📈 Histórico de Precios</h3>
                    <span style="font-size: 13px; color: #666;">Precio promedio mensual ($/kg)</span>
                </div>
                <div style="padding: 20px;">
                    <div style="height: 300px; position: relative; margin-bottom: 30px;">
                        <canvas id="historicoPreciosChart"></canvas>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Período</th>
                                <th>Precio Promedio</th>
                                <th>Variación Mensual</th>
                                <th>Variación Acumulada</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historico.map((h, idx) => {
                                const varMes = idx > 0 ? ((h.precio - historico[idx-1].precio) / historico[idx-1].precio) * 100 : 0;
                                const varAcum = idx > 0 ? ((h.precio - historico[0].precio) / historico[0].precio) * 100 : 0;
                                
                                return `
                                    <tr>
                                        <td><strong>${h.mes}</strong></td>
                                        <td>${Formatters.currency(h.precio)}/kg</td>
                                        <td style="color: ${varMes >= 0 ? 'var(--success)' : 'var(--danger)'}">
                                            ${idx === 0 ? '-' : (varMes >= 0 ? '+' : '') + varMes.toFixed(2) + '%'}
                                        </td>
                                        <td style="color: ${varAcum >= 0 ? 'var(--success)' : 'var(--danger)'}">
                                            ${idx === 0 ? '-' : (varAcum >= 0 ? '+' : '') + varAcum.toFixed(2) + '%'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ============ FUNCIONES DE ACCIÓN ============
    venderListos() {
        const listos = AppData.animales.filter(a => a.pesoActual >= 480 && a.estado === 'engorde');
        if (listos.length === 0) {
            UI.showToast('No hay animales listos para venta', 'warning');
            return;
        }
        
        const ids = listos.map(a => a.id).join(', ');
        if (!confirm(`¿Vender ${listos.length} animales listos?

IDs: ${ids}`)) return;
        
        openModal('ventaModal');
    },
    
    verDetalleVenta(id) {
        const venta = AppData.ventas.find(v => v.id === id);
        if (!venta) return;
        
        const margen = venta.total - (venta.costoTotal || venta.total * 0.7);
        
        UI.createModal('modalDetalleVenta', `
            <h3>📄 DETALLE DE VENTA #${id}</h3>
            <div class="grid-2" style="margin-top: 20px;">
                <div>
                    <p><strong>Fecha:</strong> ${DateUtils.format(venta.fecha)}</p>
                    <p><strong>Cliente:</strong> ${venta.cliente}</p>
                    <p><strong>Cantidad:</strong> ${venta.cantidad} animales</p>
                    <p><strong>Peso promedio:</strong> ${venta.pesoPromedio} kg</p>
                </div>
                <div>
                    <p><strong>Precio:</strong> $${venta.precioKg}/kg</p>
                    <p><strong>Total:</strong> ${Formatters.currency(venta.total)}</p>
                    <p><strong>Costo estimado:</strong> ${Formatters.currency(venta.costoTotal || venta.total * 0.7)}</p>
                    <p><strong>Margen:</strong> <span style="color: ${margen >= 0 ? 'var(--success)' : 'var(--danger)'}">${Formatters.currency(margen)}</span></p>
                    <p><strong>Estado:</strong> <span class="badge badge-${venta.pagado ? 'success' : 'warning'}">${venta.pagado ? 'Pagado' : 'Pendiente'}</span></p>
                </div>
            </div>
        `);
    },
    
    editarCliente(cuit) {
        const cliente = AppData.clientes.find(c => c.cuit === cuit);
        if (!cliente) return;
        
        const nuevoTelefono = prompt(`Editar teléfono de ${cliente.razonSocial}:`, cliente.telefono);
        if (nuevoTelefono !== null) {
            cliente.telefono = nuevoTelefono;
            DataManager.save();
            this.render();
            UI.showToast('Cliente actualizado');
        }
    },
    
    filtrarVentas() {
        // Implementación básica
        this.render();
    },
    
    crearContrato() {
        UI.showToast('Función de contratos en desarrollo', 'info');
    },

    addStyles() {
        if (document.getElementById('comercializacionStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'comercializacionStyles';
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
            }
            
            .sanidad-tabs .tab-btn:hover {
                color: var(--primary);
            }
            
            .sanidad-tabs .tab-btn.active {
                color: var(--primary);
                border-bottom-color: var(--primary);
            }
        `;
        document.head.appendChild(style);
    }
};
