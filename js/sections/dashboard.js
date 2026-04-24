/**
 * SECCIÓN DASHBOARD - MEJORADO CON ESTILO CATTLER
 */

const DashboardSection = {
    charts: {},
    
    render() {
        const section = document.getElementById('dashboard');
        
        section.innerHTML = `
            <!-- BOTÓN CARGAR DATOS DEMO -->
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>🚀 ¿Primera vez?</strong> Carga datos de demostración para ver el sistema funcionando con información realista.
                </div>
                <button class="btn" style="background: white; color: #667eea; font-weight: 600;" onclick="DemoData.cargar()">
                    📊 Cargar Datos Demo
                </button>
            </div>

            <!-- KPIs PRINCIPALES -->
            <div class="grid-4">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">🐄 Inventario Total</span>
                        <span class="kpi-trend trend-up">↗ 12%</span>
                    </div>
                    <div class="kpi-value" id="kpiInventario">0</div>
                    <div class="kpi-subtitle">Cabezas en feedlot</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">⚖️ Peso Promedio</span>
                        <span class="kpi-trend trend-up">↗ 5%</span>
                    </div>
                    <div class="kpi-value" id="kpiPeso">0<span style="font-size:16px">kg</span></div>
                    <div class="kpi-subtitle">GMD: <span id="kpiGMD">0</span> kg/día</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">🌾 Consumo Diario</span>
                        <span class="kpi-trend trend-neutral">→</span>
                    </div>
                    <div class="kpi-value" id="kpiConsumo">0<span style="font-size:16px">tn</span></div>
                    <div class="kpi-subtitle"><span id="kpiMS">0</span> kg MS/cab</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-title">💰 Margen Estimado</span>
                        <span class="kpi-trend trend-up">↗ 8%</span>
                    </div>
                    <div class="kpi-value" id="kpiMargen">$0</div>
                    <div class="kpi-subtitle">Por animal encerrado</div>
                </div>
            </div>
            
            <!-- CONSUMO E INVENTARIO -->
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <div class="card-icon">📊</div>
                            Consumo de Alimentos
                        </h3>
                        <select class="form-select" id="periodoConsumo" onchange="DashboardSection.updateConsumoChart()" style="width: auto;">
                            <option value="7">Últimos 7 días</option>
                            <option value="30">Último mes</option>
                            <option value="90">Último trimestre</option>
                        </select>
                    </div>
                    <div style="height: 280px; position: relative;">
                        <canvas id="consumoChart"></canvas>
                    </div>
                    <div class="consumo-stats" id="consumoStats">
                        <!-- Estadísticas de consumo -->
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <div class="card-icon">📦</div>
                            Inventario de Insumos
                        </h3>
                        <button class="btn btn-sm btn-secondary" onclick="navigate('insumos')">Ver todo</button>
                    </div>
                    <div class="insumos-list" id="insumosList" style="max-height: 280px; overflow-y: auto;">
                        <!-- Lista de insumos -->
                    </div>
                </div>
            </div>

            <!-- ALERTAS Y DISTRIBUCIÓN -->
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <div class="card-icon">🔔</div>
                            Alertas del Sistema
                        </h3>
                        <span class="badge badge-warning" id="alertasCount">0</span>
                    </div>
                    <div id="alertasContainer" style="max-height: 250px; overflow-y: auto;">
                        <!-- Alertas dinámicas -->
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <div class="card-icon">🏷️</div>
                            Distribución por Categoría
                        </h3>
                    </div>
                    <div style="height: 200px; position: relative; margin-bottom: 15px;">
                        <canvas id="categoriasChart"></canvas>
                    </div>
                    <div id="categoriasStats">
                        <!-- Estadísticas por categoría -->
                    </div>
                </div>
            </div>

            <!-- OCUPACIÓN DE CORRALES -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <div class="card-icon">🏘️</div>
                        Ocupación del Feedlot
                    </h3>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <div style="display: flex; gap: 5px; align-items: center;">
                            <span style="width: 12px; height: 12px; background: var(--success); border-radius: 2px; flex-shrink:0;"></span>
                            <span style="font-size: 12px; white-space: nowrap;">Normal (&lt;70%)</span>
                        </div>
                        <div style="display: flex; gap: 5px; align-items: center;">
                            <span style="width: 12px; height: 12px; background: var(--warning); border-radius: 2px; flex-shrink:0;"></span>
                            <span style="font-size: 12px; white-space: nowrap;">Medio (70-90%)</span>
                        </div>
                        <div style="display: flex; gap: 5px; align-items: center;">
                            <span style="width: 12px; height: 12px; background: var(--danger); border-radius: 2px; flex-shrink:0;"></span>
                            <span style="font-size: 12px; white-space: nowrap;">Lleno (&gt;90%)</span>
                        </div>
                    </div>
                </div>
                <div id="ocupacionCorrales">
                    <!-- Barras de ocupación -->
                </div>
            </div>
            
            <!-- RESUMEN DE PERSONAL Y GASTOS -->
            <div class="grid-2">
                <!-- PERSONAL -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <div class="card-icon">👷</div>
                            Personal
                        </h3>
                        <button class="btn btn-sm btn-primary" onclick="navigate('personal')">Gestionar</button>
                    </div>
                    <div style="padding: 15px;">
                        <div class="grid-2" style="gap: 15px;">
                            <div style="text-align: center; padding: 15px; background: #e3f2fd; border-radius: 10px;">
                                <div style="font-size: 28px; font-weight: 700; color: #1565c0;" id="dashPersonalCantidad">0</div>
                                <div style="font-size: 12px; color: #666; text-transform: uppercase;">Empleados</div>
                            </div>
                            <div style="text-align: center; padding: 15px; background: #fff3e0; border-radius: 10px;">
                                <div style="font-size: 20px; font-weight: 700; color: #e65100;" id="dashPersonalCosto">$0</div>
                                <div style="font-size: 12px; color: #666; text-transform: uppercase;">Costo Mensual</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- GASTOS -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <div class="card-icon">💸</div>
                            Resumen de Gastos
                        </h3>
                        <button class="btn btn-sm btn-primary" onclick="navigate('gastos')">Ver detalle</button>
                    </div>
                    <div style="padding: 15px;">
                        <div class="grid-2" style="gap: 15px;">
                            <div style="text-align: center; padding: 15px; background: #fce4ec; border-radius: 10px;">
                                <div style="font-size: 20px; font-weight: 700; color: #c62828;" id="dashGastoEstructura">$0</div>
                                <div style="font-size: 12px; color: #666; text-transform: uppercase;">🏗️ Estructura</div>
                            </div>
                            <div style="text-align: center; padding: 15px; background: #e8f5e9; border-radius: 10px;">
                                <div style="font-size: 20px; font-weight: 700; color: #2e7d32;" id="dashGastoOperativo">$0</div>
                                <div style="font-size: 12px; color: #666; text-transform: uppercase;">⚙️ Operativos</div>
                            </div>
                        </div>
                        <div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                            <span style="font-size: 12px; color: #666;">Total últimos 30 días: </span>
                            <span style="font-size: 18px; font-weight: 700; color: #333;" id="dashGastoTotal">$0</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ACTIVIDAD RECIENTE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <div class="card-icon">📋</div>
                        Actividad Reciente
                    </h3>
                    <button class="btn btn-sm btn-secondary" onclick="navigate('reportes')">Ver todo</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha/Hora</th>
                                <th>Módulo</th>
                                <th>Acción</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody id="tablaActividad">
                            <tr><td colspan="4" class="text-center">Cargando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.updateKPIs();
        this.initCharts();
        this.renderInsumos();
        this.renderAlertas();
        this.renderOcupacionCorrales();
        this.renderActividad();
    },

    updateKPIs() {
        const animalesActivos = AppData.animales.filter(a => a.estado !== 'vendido' && a.estado !== 'muerto');
        const totalAnimales = animalesActivos.length;
        
        // Peso promedio
        const pesoTotal = animalesActivos.reduce((sum, a) => sum + (a.pesoActual || 0), 0);
        const pesoPromedio = totalAnimales > 0 ? (pesoTotal / totalAnimales).toFixed(0) : 0;
        
        // GMD promedio
        let gmdTotal = 0;
        let animalesConGMD = 0;
        animalesActivos.forEach(a => {
            if (a.pesoEntrada && a.fechaIngreso) {
                const dias = Math.max(1, Math.floor((new Date() - new Date(a.fechaIngreso)) / (1000 * 60 * 60 * 24)));
                const gmd = ((a.pesoActual || 0) - a.pesoEntrada) / dias;
                if (gmd > 0) {
                    gmdTotal += gmd;
                    animalesConGMD++;
                }
            }
        });
        const gmdPromedio = animalesConGMD > 0 ? (gmdTotal / animalesConGMD).toFixed(2) : 0;
        
        // Consumo diario estimado (2.5% del peso vivo)
        const consumoDiario = (pesoTotal * 0.025 / 1000).toFixed(1);
        const msPorAnimal = pesoPromedio > 0 ? (pesoPromedio * 0.025 * 0.85).toFixed(2) : 0;
        
        // Actualizar elementos
        document.getElementById('statAnimales').textContent = totalAnimales;
        document.getElementById('kpiInventario').textContent = totalAnimales;
        document.getElementById('badgeAnimales').textContent = totalAnimales;
        document.getElementById('kpiPeso').innerHTML = `${pesoPromedio}<span style="font-size:16px">kg</span>`;
        document.getElementById('kpiGMD').textContent = gmdPromedio;
        document.getElementById('kpiConsumo').innerHTML = `${consumoDiario}<span style="font-size:16px">tn</span>`;
        document.getElementById('kpiMS').textContent = msPorAnimal;
        
        // Actualizar KPIs de gastos
        this.updateGastosKPIs();
    },
    
    updateGastosKPIs() {
        // Fecha hace 30 días
        const fecha30Dias = new Date();
        fecha30Dias.setDate(fecha30Dias.getDate() - 30);
        const fecha30Str = fecha30Dias.toISOString().split('T')[0];
        
        // Actualizar datos de personal
        const personal = AppData.personal || [];
        const personalActivo = personal.filter(p => p.activo !== false);
        const totalPersonal = personalActivo.length;
        
        // Calcular costo mensual de personal
        const costoPersonal = personalActivo.reduce((sum, p) => {
            const salario = parseFloat(p.salario) || 0;
            const cargas = salario * 0.42; // 42% cargas sociales
            return sum + salario + cargas;
        }, 0);
        
        // Calcular gastos de operaciones (usando función consolidada de GastosSection si existe)
        let totalOperativos = 0;
        let totalEstructura = costoPersonal; // El personal es costo de estructura
        
        // Compras del período
        (AppData.compras || [])
            .filter(c => c.fecha >= fecha30Str)
            .forEach(c => {
                totalOperativos += (c.subtotal || 0) + (c.flete || 0) + (c.comisionMonto || 0) + (c.ivaMonto || 0) + (c.iibbMonto || 0);
            });
        
        // Ventas/Faena del período
        (AppData.ventas || [])
            .filter(v => v.fecha >= fecha30Str)
            .forEach(v => {
                totalOperativos += (v.comisionMonto || 0) + (v.flete || 0);
                if (v.tipoVenta === 'faena' && v.gastos) {
                    totalOperativos += (v.gastos.totalGastosFaena || 0);
                }
            });
        
        // Sanidad del período
        (AppData.tratamientos || [])
            .filter(t => t.fecha >= fecha30Str && t.costo)
            .forEach(t => {
                totalOperativos += parseFloat(t.costo) || 0;
            });
        
        // Insumos del período
        (AppData.movimientosInsumos || [])
            .filter(m => m.fecha >= fecha30Str && m.tipo === 'entrada' && m.costoTotal)
            .forEach(m => {
                const insumo = (AppData.insumos || []).find(i => i.id === m.insumoId);
                if (insumo?.categoria === 'mantenimiento') {
                    totalEstructura += m.costoTotal;
                } else {
                    totalOperativos += m.costoTotal;
                }
            });
        
        const totalGastos = totalOperativos + totalEstructura;
        
        // Actualizar elementos del dashboard
        const elPersonalCantidad = document.getElementById('dashPersonalCantidad');
        const elPersonalCosto = document.getElementById('dashPersonalCosto');
        const elTotal = document.getElementById('dashGastoTotal');
        const elEstructura = document.getElementById('dashGastoEstructura');
        const elOperativo = document.getElementById('dashGastoOperativo');
        
        if (elPersonalCantidad) elPersonalCantidad.textContent = totalPersonal;
        if (elPersonalCosto) elPersonalCosto.textContent = '$' + Formatters.currency(costoPersonal);
        if (elTotal) elTotal.textContent = '$' + Formatters.currency(totalGastos);
        if (elEstructura) elEstructura.textContent = '$' + Formatters.currency(totalEstructura);
        if (elOperativo) elOperativo.textContent = '$' + Formatters.currency(totalOperativos);
    },

    renderInsumos() {
        const container = document.getElementById('insumosList');
        if (!container) return;

        // Filtrar solo insumos de alimentación (no mostrar diesel, herramientas, etc.)
        const categoriasAlimentacion = ['grano', 'proteina', 'forraje', 'mineral', 'otro', 'alimento'];
        const insumos = (AppData.insumos || []).filter(i => categoriasAlimentacion.includes(i.categoria));
        
        if (insumos.length === 0) {
            container.innerHTML = '<p class="text-center" style="padding: 20px; color: #666;">No hay insumos registrados</p>';
            return;
        }

        // Ordenar por stock bajo primero
        const insumosOrdenados = [...insumos].sort((a, b) => {
            const nivelA = a.stock / (a.stockMinimo || 100);
            const nivelB = b.stock / (b.stockMinimo || 100);
            return nivelA - nivelB;
        });

        container.innerHTML = insumosOrdenados.slice(0, 8).map(i => {
            const nivel = i.stock / (i.stockMinimo || 100);
            let color = 'var(--success)';
            let icon = '✓';
            if (nivel < 0.5) {
                color = 'var(--danger)';
                icon = '!';
            } else if (nivel < 1) {
                color = 'var(--warning)';
                icon = '⚠';
            }

            return `
                <div class="insumo-item" style="display: flex; justify-content: space-between; align-items: center; 
                            padding: 10px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="width: 20px; height: 20px; background: ${color}; color: white; 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                                    font-size: 12px; font-weight: bold;">${icon}</span>
                        <div>
                            <div style="font-weight: 500;">${i.nombre}</div>
                            <div style="font-size: 12px; color: #666;">Stock: ${Formatters.number(i.stock)} ${i.unidad}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600;">$${Formatters.number(i.costo)}/ton</div>
                        <div style="font-size: 11px; color: ${color};">${nivel < 1 ? 'Stock bajo' : 'OK'}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderAlertas() {
        const container = document.getElementById('alertasContainer');
        if (!container) return;

        const alertas = this.generarAlertas();
        document.getElementById('alertasCount').textContent = alertas.length;

        if (alertas.length === 0) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <span>✓</span>
                    <div>No hay alertas pendientes. Todo está en orden.</div>
                </div>
            `;
            return;
        }

        container.innerHTML = alertas.map(a => `
            <div class="alert alert-${a.tipo}" style="margin-bottom: 10px; animation: slideIn 0.3s;">
                <span>${a.icon}</span>
                <div>
                    <strong>${a.titulo}</strong>
                    <p style="margin: 5px 0 0 0; font-size: 13px;">${a.mensaje}</p>
                    ${a.accion ? `<button class="btn btn-sm btn-${a.tipo}" style="margin-top: 8px;" onclick="${a.accion}">${a.textoAccion}</button>` : ''}
                </div>
            </div>
        `).join('');
    },

    generarAlertas() {
        const alertas = [];

        // Alertas de stock bajo (solo insumos de alimentación)
        const categoriasAlimentacion = ['grano', 'proteina', 'forraje', 'mineral', 'otro', 'alimento'];
        const insumosBajos = (AppData.insumos || [])
            .filter(i => categoriasAlimentacion.includes(i.categoria))
            .filter(i => i.stock < (i.stockMinimo || 100));
        insumosBajos.forEach(i => {
            alertas.push({
                tipo: 'warning',
                icon: '📦',
                titulo: `Stock bajo: ${i.nombre}`,
                mensaje: `Quedan ${Formatters.number(i.stock)} ${i.unidad}. Stock mínimo: ${Formatters.number(i.stockMinimo || 100)}`,
                accion: "navigate('insumos')",
                textoAccion: 'Ver insumos'
            });
        });

        // Alertas de corrales con alta densidad
        (AppData.corrales || []).forEach(c => {
            const animalesEnCorral = (AppData.animales || []).filter(a => a.corral === c.id && a.estado !== 'vendido').length;
            const m2PorAnimal = animalesEnCorral > 0 && c.superficie ? (c.superficie / animalesEnCorral) : Infinity;
            
            if (animalesEnCorral > 0 && m2PorAnimal < 8) {
                alertas.push({
                    tipo: 'danger',
                    icon: '🏘️',
                    titulo: `${c.nombre} muy justo`,
                    mensaje: `Sólo ${m2PorAnimal.toFixed(1)} m² por animal. Considere mover animales.`,
                    accion: "navigate('corrales')",
                    textoAccion: 'Gestionar'
                });
            } else if (animalesEnCorral > 0 && m2PorAnimal < 10) {
                alertas.push({
                    tipo: 'warning',
                    icon: '🏘️',
                    titulo: `${c.nombre} con densidad alta`,
                    mensaje: `${m2PorAnimal.toFixed(1)} m² por animal. Monitoree el espacio.`
                });
            }
        });

        // Alertas de animales enfermos
        const enfermos = (AppData.animales || []).filter(a => a.estado === 'enfermo').length;
        if (enfermos > 0) {
            alertas.push({
                tipo: 'warning',
                icon: '🏥',
                titulo: `${enfermos} animal${enfermos > 1 ? 'es' : ''} enfermo${enfermos > 1 ? 's' : ''}`,
                mensaje: 'Requieren atención veterinaria.',
                accion: "navigate('sanidad')",
                textoAccion: 'Ver sanidad'
            });
        }

        // Alertas de tratamientos pendientes
        const tratamientosActivos = (AppData.tratamientos || []).filter(t => {
            if (!t.fechaFin) return true;
            const diasRestantes = Math.ceil((new Date(t.fechaFin) - new Date()) / (1000 * 60 * 60 * 24));
            return diasRestantes <= 2 && diasRestantes >= 0;
        });

        tratamientosActivos.forEach(t => {
            const diasRestantes = t.fechaFin ? 
                Math.ceil((new Date(t.fechaFin) - new Date()) / (1000 * 60 * 60 * 24)) : '?';
            
            alertas.push({
                tipo: diasRestantes <= 0 ? 'danger' : 'warning',
                icon: '💊',
                titulo: `Tratamiento ${diasRestantes <= 0 ? 'vence hoy' : 'vence en ' + diasRestantes + ' días'}`,
                mensaje: `Animal ${t.idAnimal} - ${t.medicamento}`,
                accion: "navigate('sanidad')",
                textoAccion: 'Ver tratamiento'
            });
        });

        return alertas;
    },

    renderOcupacionCorrales() {
        const container = document.getElementById('ocupacionCorrales');
        if (!container) return;

        const corrales = AppData.corrales || [];
        if (corrales.length === 0) {
            container.innerHTML = '<p class="text-center" style="padding: 20px;">No hay corrales configurados</p>';
            return;
        }

        container.innerHTML = corrales.map(c => {
            const animales = (AppData.animales || []).filter(a => a.corral === c.id && a.estado !== 'vendido').length;
            const m2PorAnimal = animales > 0 && c.superficie ? (c.superficie / animales) : Infinity;
            
            let color = 'var(--success)';
            let estado = 'Holgado';
            if (animales > 0 && m2PorAnimal < 8) {
                color = 'var(--danger)';
                estado = 'Justo';
            } else if (animales > 0 && m2PorAnimal < 10) {
                color = 'var(--warning)';
                estado = 'Medio';
            }

            return `
                <div class="ocupacion-item" style="padding: 15px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <strong>${c.nombre}</strong>
                            <span style="font-size: 12px; color: #666;">${animales} animales · ${c.superficie || 0} m²</span>
                        </div>
                        <span style="font-weight: 600; color: ${color};">${estado}</span>
                    </div>
                    <div style="font-size: 13px; color: #555;">
                        ${animales > 0 ? `<strong>${m2PorAnimal.toFixed(1)} m²</strong> por animal` : 'Sin animales'}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderActividad() {
        const tbody = document.getElementById('tablaActividad');
        if (!tbody) return;

        // Generar actividad simulada o real
        const actividades = this.getActividadesRecientes();
        
        if (actividades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay actividad reciente</td></tr>';
            return;
        }

        tbody.innerHTML = actividades.slice(0, 10).map(a => `
            <tr>
                <td>${new Date(a.fecha).toLocaleString('es-AR')}</td>
                <td><span class="badge badge-${a.tipo}">${a.modulo}</span></td>
                <td>${a.accion}</td>
                <td>${a.detalle}</td>
            </tr>
        `).join('');
    },

    getActividadesRecientes() {
        const actividades = [];

        // Movimientos recientes
        (AppData.movimientosCorrales || []).slice(0, 5).forEach(m => {
            actividades.push({
                fecha: m.fecha,
                modulo: 'Corrales',
                tipo: 'info',
                accion: 'Movimiento',
                detalle: `Animal ${m.animalId} → ${m.corralDestino}`
            });
        });

        // Tratamientos recientes
        (AppData.tratamientos || []).slice(-5).forEach(t => {
            actividades.push({
                fecha: t.fechaInicio || new Date().toISOString(),
                modulo: 'Sanidad',
                tipo: 'warning',
                accion: 'Tratamiento',
                detalle: `${t.idAnimal} - ${t.diagnostico}`
            });
        });

        // Ventas recientes
        (AppData.ventas || []).slice(-5).forEach(v => {
            actividades.push({
                fecha: v.fecha,
                modulo: 'Ventas',
                tipo: 'success',
                accion: 'Venta',
                detalle: `${v.cantidad} animales - $${Formatters.number(v.total)}`
            });
        });

        // Ordenar por fecha descendente
        return actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },
    
    initCharts() {
        // Gráfico de consumo
        const consumoData = this.getConsumoData(7);
        this.charts.consumo = new Chart(document.getElementById('consumoChart'), {
            type: 'line',
            data: {
                labels: consumoData.labels,
                datasets: [{
                    label: 'Consumo (kg)',
                    data: consumoData.data,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });

        // Actualizar estadísticas de consumo
        const total = consumoData.data.reduce((a, b) => a + b, 0);
        const promedio = total / consumoData.data.length;
        const statsEl = document.getElementById('consumoStats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div style="display: flex; justify-content: space-around; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-top: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 20px; font-weight: 700; color: var(--primary);">${(total/1000).toFixed(1)}</div>
                        <div style="font-size: 12px; color: #666;">Total (tn)</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 20px; font-weight: 700; color: var(--info);">${(promedio/1000).toFixed(1)}</div>
                        <div style="font-size: 12px; color: #666;">Promedio (tn/día)</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 20px; font-weight: 700; color: var(--success);">+${(Math.random()*5).toFixed(1)}%</div>
                        <div style="font-size: 12px; color: #666;">vs semana anterior</div>
                    </div>
                </div>
            `;
        }

        // Gráfico de categorías
        const categorias = {};
        (AppData.animales || []).forEach(a => {
            const cat = a.categoria || 'Sin categoría';
            categorias[cat] = (categorias[cat] || 0) + 1;
        });

        new Chart(document.getElementById('categoriasChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(categorias),
                datasets: [{
                    data: Object.values(categorias),
                    backgroundColor: [
                        '#28a745', '#17a2b8', '#ffc107', '#dc3545', 
                        '#6c757d', '#007bff', '#6610f2'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 12 }
                    }
                }
            }
        });
    },

    getConsumoData(dias) {
        const labels = [];
        const data = [];
        
        for (let i = dias - 1; i >= 0; i--) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - i);
            labels.push(fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }));
            
            // Simular datos de consumo
            const base = 5000 + Math.random() * 2000;
            data.push(Math.round(base));
        }
        
        return { labels, data };
    },

    updateConsumoChart() {
        const periodo = parseInt(document.getElementById('periodoConsumo').value);
        const newData = this.getConsumoData(periodo);
        
        if (this.charts.consumo) {
            this.charts.consumo.data.labels = newData.labels;
            this.charts.consumo.data.datasets[0].data = newData.data;
            this.charts.consumo.update();
        }
    }
};

// Animación CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    .ocupacion-item:last-child {
        border-bottom: none !important;
    }
    
    .insumo-item:last-child {
        border-bottom: none !important;
    }
`;
document.head.appendChild(style);
