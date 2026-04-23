/**
 * SECCIÓN REPORTES V2 - ANÁLISIS AVANZADO
 * Estilo Cattler - Análisis de conversión, rentabilidad y proyecciones
 */

const ReportesSection = {
    reporteActual: null,
    
    render() {
        const section = document.getElementById('reportes');
        
        section.innerHTML = `
            <div class="grid-4">
                <div class="card" onclick="ReportesSection.generar('inventario')" style="cursor: pointer; text-align: center; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                    <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
                    <h3 style="margin-bottom: 10px;">Inventario</h3>
                    <p style="color: #666; font-size: 14px;">Estado actual y trazabilidad</p>
                </div>
                <div class="card" onclick="ReportesSection.generar('sanidad')" style="cursor: pointer; text-align: center; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                    <div style="font-size: 48px; margin-bottom: 15px;">💉</div>
                    <h3 style="margin-bottom: 10px;">Sanidad</h3>
                    <p style="color: #666; font-size: 14px;">Morbilidad y mortalidad</p>
                </div>
                <div class="card" onclick="ReportesSection.generar('conversion')" style="cursor: pointer; text-align: center; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                    <div style="font-size: 48px; margin-bottom: 15px;">📊</div>
                    <h3 style="margin-bottom: 10px;">Conversión</h3>
                    <p style="color: #666; font-size: 14px;">GMD y eficiencia alimenticia</p>
                </div>
                <div class="card" onclick="ReportesSection.generar('rentabilidad')" style="cursor: pointer; text-align: center; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                    <div style="font-size: 48px; margin-bottom: 15px;">💹</div>
                    <h3 style="margin-bottom: 10px;">Rentabilidad</h3>
                    <p style="color: #666; font-size: 14px;">Márgenes por lote</p>
                </div>
            </div>

            <div class="grid-2">
                <div class="card" onclick="ReportesSection.generar('costos')" style="cursor: pointer; text-align: center; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                    <div style="font-size: 48px; margin-bottom: 15px;">💰</div>
                    <h3 style="margin-bottom: 10px;">Costos</h3>
                    <p style="color: #666; font-size: 14px;">Análisis de costos por categoría</p>
                </div>
                <div class="card" onclick="ReportesSection.generar('proyecciones')" style="cursor: pointer; text-align: center; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                    <div style="font-size: 48px; margin-bottom: 15px;">📈</div>
                    <h3 style="margin-bottom: 10px;">Proyecciones</h3>
                    <p style="color: #666; font-size: 14px;">Simulaciones y escenarios</p>
                </div>
            </div>
            
            <div id="reporteContainer" class="card hidden">
                <div class="card-header">
                    <h3 class="card-title" id="reporteTitulo">Reporte</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" onclick="window.print()">🖨️ Imprimir</button>
                        <button class="btn btn-primary" onclick="ReportesSection.exportarExcel()">📊 Excel</button>
                        <button class="btn btn-danger" onclick="ReportesSection.cerrarReporte()">✕ Cerrar</button>
                    </div>
                </div>
                <div id="reporteContenido"></div>
            </div>
        `;
    },
    
    generar(tipo) {
        this.reporteActual = tipo;
        const container = document.getElementById('reporteContainer');
        const titulo = document.getElementById('reporteTitulo');
        const contenido = document.getElementById('reporteContenido');
        
        container.classList.remove('hidden');
        
        const titulos = {
            'inventario': 'Reporte de Inventario',
            'sanidad': 'Reporte de Sanidad',
            'conversion': 'Análisis de Conversión',
            'rentabilidad': 'Análisis de Rentabilidad',
            'costos': 'Análisis de Costos',
            'proyecciones': 'Proyecciones'
        };
        
        titulo.textContent = titulos[tipo] || 'Reporte';
        UI.showToast(`Generando reporte de ${tipo}...`);
        
        switch(tipo) {
            case 'inventario':
                contenido.innerHTML = this.generarReporteInventario();
                break;
            case 'sanidad':
                contenido.innerHTML = this.generarReporteSanidad();
                break;
            case 'conversion':
                contenido.innerHTML = this.generarReporteConversion();
                break;
            case 'rentabilidad':
                contenido.innerHTML = this.generarReporteRentabilidad();
                break;
            case 'costos':
                contenido.innerHTML = this.generarReporteCostos();
                break;
            case 'proyecciones':
                contenido.innerHTML = this.generarReporteProyecciones();
                break;
        }
        
        container.scrollIntoView({ behavior: 'smooth' });
    },

    // ============ REPORTE INVENTARIO ============
    generarReporteInventario() {
        const animales = AppData.animales || [];
        const animalesActivos = animales.filter(a => a.estado !== 'vendido' && a.estado !== 'muerto');
        const totalAnimales = animalesActivos.length;
        
        const pesoPromedio = totalAnimales > 0 ? 
            (animalesActivos.reduce((sum, a) => sum + (a.pesoActual || 0), 0) / totalAnimales) : 0;
        
        const valorInventario = (AppData.insumos || []).reduce((sum, i) => sum + (i.stock * (i.costo / 1000)), 0);
        const biomasaTotal = animalesActivos.reduce((sum, a) => sum + (a.pesoActual || 0), 0);
        
        // Distribución por corral
        const distribucionCorral = {};
        animalesActivos.forEach(a => {
            if (!distribucionCorral[a.corral]) {
                distribucionCorral[a.corral] = { cantidad: 0, peso: 0 };
            }
            distribucionCorral[a.corral].cantidad++;
            distribucionCorral[a.corral].peso += a.pesoActual || 0;
        });
        
        return `
            <div style="padding: 20px;">
                <div class="grid-4" style="margin-bottom: 30px;">
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${totalAnimales}</div>
                        <div style="color: #666;">Animales activos</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${pesoPromedio.toFixed(1)} kg</div>
                        <div style="color: #666;">Peso promedio</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${Formatters.number(biomasaTotal)} kg</div>
                        <div style="color: #666;">Biomasa total</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${Formatters.currency(valorInventario)}</div>
                        <div style="color: #666;">Valor insumos</div>
                    </div>
                </div>
                
                <h4 style="margin-bottom: 15px;">Distribución por Corral</h4>
                <table style="margin-bottom: 30px;">
                    <thead>
                        <tr>
                            <th>Corral</th>
                            <th>Animales</th>
                            <th>Peso Promedio</th>
                            <th>Biomasa Total</th>
                            <th>m² / Animal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(distribucionCorral).map(([corral, datos]) => {
                            const corralDef = (AppData.corrales || []).find(c => c.id === corral);
                            const superficie = corralDef?.superficie || 0;
                            const m2PorAnimal = datos.cantidad > 0 && superficie > 0 ? (superficie / datos.cantidad) : 0;
                            const pesoProm = datos.cantidad > 0 ? datos.peso / datos.cantidad : 0;
                            const color = m2PorAnimal >= 12 ? 'var(--success)' : m2PorAnimal >= 10 ? 'var(--warning)' : datos.cantidad > 0 ? 'var(--danger)' : '#999';
                            
                            return `
                                <tr>
                                    <td>${corralDef?.nombre || corral}</td>
                                    <td>${datos.cantidad}</td>
                                    <td>${pesoProm.toFixed(1)} kg</td>
                                    <td>${Formatters.number(datos.peso)} kg</td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <span style="font-size: 12px; font-weight: 600; color: ${color};">
                                                ${datos.cantidad > 0 ? m2PorAnimal.toFixed(1) + ' m²' : '-'}
                                            </span>
                                            <span style="font-size: 11px; color: #999;">(${superficie} m² total)</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <h4 style="margin-bottom: 15px;">Distribución por Lote</h4>
                <div style="height: 250px; position: relative; margin-bottom: 30px;">
                    <canvas id="distribucionLotesChart"></canvas>
                </div>
            </div>
        `;
    },

    // ============ REPORTE SANIDAD ============
    generarReporteSanidad() {
        const tratamientos = AppData.tratamientos || [];
        const activos = tratamientos.filter(t => !t.fechaFin || new Date(t.fechaFin) > new Date());
        
        // Análisis por diagnóstico
        const diagnosticos = {};
        tratamientos.forEach(t => {
            const diag = t.diagnostico || 'Sin diagnóstico';
            if (!diagnosticos[diag]) {
                diagnosticos[diag] = { total: 0, activos: 0, finalizados: 0 };
            }
            diagnosticos[diag].total++;
            if (!t.fechaFin || new Date(t.fechaFin) > new Date()) {
                diagnosticos[diag].activos++;
            } else {
                diagnosticos[diag].finalizados++;
            }
        });
        
        // Mortalidad
        const muertos = (AppData.animales || []).filter(a => a.estado === 'muerto').length;
        const totalAnimales = (AppData.animales || []).length;
        const mortalidad = totalAnimales > 0 ? (muertos / totalAnimales) * 100 : 0;
        
        return `
            <div style="padding: 20px;">
                <div class="grid-3" style="margin-bottom: 30px;">
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--danger);">${activos.length}</div>
                        <div style="color: #666;">Tratamientos activos</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: ${mortalidad > 2 ? 'var(--danger)' : 'var(--success)'}">${mortalidad.toFixed(2)}%</div>
                        <div style="color: #666;">Mortalidad</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--info);">${Object.keys(diagnosticos).length}</div>
                        <div style="color: #666;">Diagnósticos diferentes</div>
                    </div>
                </div>

                <h4 style="margin-bottom: 15px;">Tratamientos por Diagnóstico</h4>
                <table style="margin-bottom: 30px;">
                    <thead>
                        <tr>
                            <th>Diagnóstico</th>
                            <th>Total</th>
                            <th>Activos</th>
                            <th>Finalizados</th>
                            <th>% del Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(diagnosticos).sort((a, b) => b[1].total - a[1].total).map(([diag, datos]) => {
                            const pct = tratamientos.length > 0 ? (datos.total / tratamientos.length) * 100 : 0;
                            return `
                                <tr>
                                    <td><strong>${diag}</strong></td>
                                    <td>${datos.total}</td>
                                    <td><span class="badge badge-warning">${datos.activos}</span></td>
                                    <td><span class="badge badge-success">${datos.finalizados}</span></td>
                                    <td>${pct.toFixed(1)}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <h4 style="margin-bottom: 15px;">Evolución de Tratamientos</h4>
                <div style="height: 250px; position: relative;">
                    <canvas id="sanidadEvolucionChart"></canvas>
                </div>
            </div>
        `;
    },

    // ============ REPORTE CONVERSIÓN ============
    generarReporteConversion() {
        const animales = (AppData.animales || []).filter(a => a.estado !== 'muerto');
        
        // Calcular GMD para cada animal
        const animalesConGMD = animales.map(a => {
            const dias = DateUtils.daysBetween(a.fechaIngreso, DateUtils.today());
            const gmd = dias > 0 ? ((a.pesoActual || 0) - (a.pesoEntrada || 0)) / dias : 0;
            return { ...a, dias, gmd };
        }).filter(a => a.gmd > 0);
        
        const gmdPromedio = animalesConGMD.length > 0 ? 
            animalesConGMD.reduce((sum, a) => sum + a.gmd, 0) / animalesConGMD.length : 0;
        
        const gmdMax = animalesConGMD.length > 0 ? Math.max(...animalesConGMD.map(a => a.gmd)) : 0;
        const gmdMin = animalesConGMD.length > 0 ? Math.min(...animalesConGMD.map(a => a.gmd)) : 0;
        
        // Clasificación por GMD
        const buenos = animalesConGMD.filter(a => a.gmd >= 1.4).length;
        const regulares = animalesConGMD.filter(a => a.gmd >= 1.0 && a.gmd < 1.4).length;
        const malos = animalesConGMD.filter(a => a.gmd < 1.0).length;
        
        return `
            <div style="padding: 20px;">
                <div class="grid-4" style="margin-bottom: 30px;">
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--success);">${gmdPromedio.toFixed(2)}</div>
                        <div style="color: #666;">GMD Promedio (kg/día)</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${gmdMax.toFixed(2)}</div>
                        <div style="color: #666;">GMD Máximo</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--warning);">${gmdMin.toFixed(2)}</div>
                        <div style="color: #666;">GMD Mínimo</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--info);">${animalesConGMD.length}</div>
                        <div style="color: #666;">Animales con datos</div>
                    </div>
                </div>

                <div class="grid-2" style="margin-bottom: 30px;">
                    <div class="card">
                        <div class="card-header">
                            <h4>Clasificación por GMD</h4>
                        </div>
                        <div style="padding: 20px;">
                            <div style="display: flex; justify-content: space-around; text-align: center;">
                                <div>
                                    <div style="font-size: 36px; color: var(--success); font-weight: 700;">${buenos}</div>
                                    <div style="color: #666;">Buenos<br>(≥1.4 kg/d)</div>
                                </div>
                                <div>
                                    <div style="font-size: 36px; color: var(--warning); font-weight: 700;">${regulares}</div>
                                    <div style="color: #666;">Regulares<br>(1.0-1.4)</div>
                                </div>
                                <div>
                                    <div style="font-size: 36px; color: var(--danger); font-weight: 700;">${malos}</div>
                                    <div style="color: #666;">Bajos<br>(<1.0)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h4>Conversión Alimenticia Estimada</h4>
                        </div>
                        <div style="padding: 20px;">
                            <div style="text-align: center; margin-bottom: 15px;">
                                <div style="font-size: 48px; font-weight: 700; color: var(--primary);">6.8</div>
                                <div style="color: #666;">kg alimento / kg ganancia</div>
                            </div>
                            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                                <strong>Estimación:</strong> Basada en consumo diario de 2.5% del peso vivo y GMD promedio.
                            </div>
                        </div>
                    </div>
                </div>

                <h4 style="margin-bottom: 15px;">Animales con Mejor GMD</h4>
                <table style="margin-bottom: 30px;">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Raza</th>
                            <th>Peso Entrada</th>
                            <th>Peso Actual</th>
                            <th>Días</th>
                            <th>GMD (kg/día)</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${animalesConGMD
                            .sort((a, b) => b.gmd - a.gmd)
                            .slice(0, 10)
                            .map(a => `
                                <tr>
                                    <td><strong>${a.id}</strong></td>
                                    <td>${a.raza}</td>
                                    <td>${a.pesoEntrada} kg</td>
                                    <td>${a.pesoActual} kg</td>
                                    <td>${a.dias}</td>
                                    <td style="color: ${a.gmd >= 1.4 ? 'var(--success)' : a.gmd >= 1.0 ? 'var(--warning)' : 'var(--danger)'}; font-weight: 700;">${a.gmd.toFixed(2)}</td>
                                    <td><span class="badge badge-${a.estado === 'engorde' ? 'success' : 'warning'}">${a.estado}</span></td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>

                <h4 style="margin-bottom: 15px;">Gráfico de GMD por Animal</h4>
                <div style="height: 300px; position: relative;">
                    <canvas id="gmdChart"></canvas>
                </div>
            </div>
        `;
    },

    // ============ REPORTE RENTABILIDAD ============
    generarReporteRentabilidad() {
        // Agrupar por lote
        const lotes = {};
        (AppData.animales || []).forEach(a => {
            const lote = a.lote || 'Sin lote';
            if (!lotes[lote]) {
                lotes[lote] = { animales: [], costoTotal: 0, ingresoEstimado: 0 };
            }
            lotes[lote].animales.push(a);
        });
        
        // Calcular métricas por lote
        Object.entries(lotes).forEach(([lote, datos]) => {
            datos.costoTotal = datos.animales.reduce((sum, a) => sum + ((a.costoIngreso || 0) * (a.pesoEntrada || 0)), 0);
            datos.ingresoEstimado = datos.animales.reduce((sum, a) => sum + ((a.pesoActual || 0) * 2.85), 0); // Precio estimado
            datos.gananciaEstimada = datos.ingresoEstimado - datos.costoTotal;
            datos.rentabilidad = datos.costoTotal > 0 ? (datos.gananciaEstimada / datos.costoTotal) * 100 : 0;
        });
        
        return `
            <div style="padding: 20px;">
                <div class="alert alert-info" style="margin-bottom: 20px;">
                    <span>ℹ️</span>
                    <div>
                        <strong>Análisis preliminar:</strong> Los cálculos de rentabilidad utilizan precios estimados. 
                        Para resultados exactos, registre las ventas reales en el módulo de Comercialización.
                    </div>
                </div>

                <h4 style="margin-bottom: 15px;">Rentabilidad por Lote</h4>
                <table style="margin-bottom: 30px;">
                    <thead>
                        <tr>
                            <th>Lote</th>
                            <th>Cabezas</th>
                            <th>Costo Total</th>
                            <th>Ingreso Estimado</th>
                            <th>Ganancia Est.</th>
                            <th>Rentabilidad</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(lotes).map(([lote, datos]) => `
                            <tr>
                                <td><strong>${lote}</strong></td>
                                <td>${datos.animales.length}</td>
                                <td>${Formatters.currency(datos.costoTotal)}</td>
                                <td>${Formatters.currency(datos.ingresoEstimado)}</td>
                                <td style="color: ${datos.gananciaEstimada >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
                                    ${Formatters.currency(datos.gananciaEstimada)}
                                </td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div class="progress-bar" style="width: 100px; height: 8px;">
                                            <div class="progress-fill" style="width: ${Math.min(Math.abs(datos.rentabilidad), 100)}%; background: ${datos.rentabilidad >= 0 ? 'var(--success)' : 'var(--danger)'}"></div>
                                        </div>
                                        <span>${datos.rentabilidad.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge badge-${datos.rentabilidad >= 15 ? 'success' : datos.rentabilidad >= 0 ? 'warning' : 'danger'}">
                                        ${datos.rentabilidad >= 15 ? 'Excelente' : datos.rentabilidad >= 0 ? 'Regular' : 'Pérdida'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h4 style="margin-bottom: 15px;">Desglose de Costos (Estimado)</h4>
                <div class="grid-2">
                    <div style="height: 250px; position: relative;">
                        <canvas id="costosChart"></canvas>
                    </div>
                    <div style="padding: 20px;">
                        <h5>Distribución de Costos</h5>
                        <div style="margin-top: 15px;">
                            <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; margin-bottom: 5px; border-radius: 4px;">
                                <span>🐄 Compra animales</span>
                                <strong>65%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; margin-bottom: 5px; border-radius: 4px;">
                                <span>🌾 Alimentación</span>
                                <strong>28%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; margin-bottom: 5px; border-radius: 4px;">
                                <span>💉 Sanidad</span>
                                <strong>4%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; margin-bottom: 5px; border-radius: 4px;">
                                <span>⚙️ Otros</span>
                                <strong>3%</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ============ REPORTE COSTOS ============
    generarReporteCostos() {
        const costoInsumos = (AppData.insumos || []).reduce((sum, i) => sum + (i.stock * (i.costo / 1000)), 0);
        
        return `
            <div style="padding: 20px;">
                <div class="grid-3" style="margin-bottom: 30px;">
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${Formatters.currency(costoInsumos)}</div>
                        <div style="color: #666;">Valor insumos en stock</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--info);">${Formatters.currency(costoInsumos / 30)}</div>
                        <div style="color: #666;">Costo diario estimado</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--success);">${Formatters.currency(2.15)}</div>
                        <div style="color: #666;">Costo/kg ganancia est.</div>
                    </div>
                </div>

                <h4 style="margin-bottom: 15px;">Valor de Insumos por Categoría</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th>Cantidad Insumos</th>
                            <th>Valor Total</th>
                            <th>% del Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${['grano', 'proteico', 'forraje', 'mineral', 'aditivo'].map(cat => {
                            const insumosCat = (AppData.insumos || []).filter(i => i.categoria === cat);
                            const valor = insumosCat.reduce((sum, i) => sum + (i.stock * (i.costo / 1000)), 0);
                            const cantidad = insumosCat.length;
                            const pct = costoInsumos > 0 ? (valor / costoInsumos) * 100 : 0;
                            
                            return cantidad > 0 ? `
                                <tr>
                                    <td><strong>${cat.charAt(0).toUpperCase() + cat.slice(1)}</strong></td>
                                    <td>${cantidad}</td>
                                    <td>${Formatters.currency(valor)}</td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div class="progress-bar" style="width: 100px; height: 8px;">
                                                <div class="progress-fill" style="width: ${pct}%"></div>
                                            </div>
                                            <span>${pct.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ` : '';
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // ============ REPORTE PROYECCIONES ============
    generarReporteProyecciones() {
        const animales = (AppData.animales || []).filter(a => a.estado === 'engorde');
        const pesoVenta = AppData.config?.pesoVenta || 500;
        const gmdEsperado = AppData.config?.gmdEsperado || 1.4;
        const precioVenta = 2.85; // Precio estimado
        
        // Proyección para cada animal
        const proyecciones = animales.map(a => {
            const pesoFaltante = pesoVenta - (a.pesoActual || 0);
            const diasEstimados = pesoFaltante > 0 ? Math.ceil(pesoFaltante / gmdEsperado) : 0;
            const fechaVenta = diasEstimados > 0 ? DateUtils.addDays(DateUtils.today(), diasEstimados) : DateUtils.today();
            const ingresoEstimado = (a.pesoActual || 0) * precioVenta;
            const costoEstimado = ((a.costoIngreso || 0) * (a.pesoEntrada || 0)) + (diasEstimados * 15); // $15/día estimado
            const margenEstimado = ingresoEstimado - costoEstimado;
            
            return {
                ...a,
                diasEstimados,
                fechaVenta,
                ingresoEstimado,
                margenEstimado
            };
        });
        
        // Animales listos para venta
        const listos = proyecciones.filter(p => p.diasEstimados <= 0);
        
        return `
            <div style="padding: 20px;">
                <div class="alert alert-warning" style="margin-bottom: 20px;">
                    <span>⚠️</span>
                    <div>
                        <strong>Nota importante:</strong> Estas proyecciones son estimaciones basadas en el GMD esperado 
                        (${gmdEsperado} kg/día) y precios actuales. Los resultados reales pueden variar.
                    </div>
                </div>

                <div class="grid-3" style="margin-bottom: 30px;">
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--success);">${listos.length}</div>
                        <div style="color: #666;">Animales listos ahora</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--info);">${proyecciones.filter(p => p.diasEstimados > 0 && p.diasEstimados <= 30).length}</div>
                        <div style="color: #666;">Listos en 30 días</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${Formatters.currency(proyecciones.reduce((sum, p) => sum + p.ingresoEstimado, 0))}</div>
                        <div style="color: #666;">Ingreso total estimado</div>
                    </div>
                </div>

                ${listos.length > 0 ? `
                    <div class="alert alert-success" style="margin-bottom: 20px;">
                        <span>✅</span>
                        <div>
                            <strong>${listos.length} animales han alcanzado el peso de venta (${pesoVenta} kg)</strong>
                            <button class="btn btn-sm btn-success" style="margin-left: 15px;" onclick="QuickActions.registrarVenta()">
                                Registrar Venta
                            </button>
                        </div>
                    </div>
                ` : ''}

                <h4 style="margin-bottom: 15px;">Proyección de Ventas por Animal</h4>
                <table style="margin-bottom: 30px;">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Peso Actual</th>
                            <th>Peso Objetivo</th>
                            <th>Ganancia Faltante</th>
                            <th>Días Estimados</th>
                            <th>Fecha Est. Venta</th>
                            <th>Ingreso Estimado</th>
                            <th>Margen Est.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${proyecciones
                            .sort((a, b) => a.diasEstimados - b.diasEstimados)
                            .map(p => `
                                <tr style="${p.diasEstimados <= 0 ? 'background: rgba(40, 167, 69, 0.1);' : ''}">
                                    <td><strong>${p.id}</strong></td>
                                    <td>${p.pesoActual} kg</td>
                                    <td>${pesoVenta} kg</td>
                                    <td>${Math.max(0, pesoVenta - p.pesoActual)} kg</td>
                                    <td>
                                        ${p.diasEstimados <= 0 ? 
                                            '<span class="badge badge-success">¡Listo!</span>' : 
                                            `<span class="badge badge-info">${p.diasEstimados} días</span>`}
                                    </td>
                                    <td>${DateUtils.format(p.fechaVenta)}</td>
                                    <td>${Formatters.currency(p.ingresoEstimado)}</td>
                                    <td style="color: ${p.margenEstimado >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
                                        ${Formatters.currency(p.margenEstimado)}
                                    </td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>

                <h4 style="margin-bottom: 15px;">Calendario de Ventas Estimado</h4>
                <div style="height: 250px; position: relative;">
                    <canvas id="proyeccionChart"></canvas>
                </div>
            </div>
        `;
    },
    
    cerrarReporte() {
        document.getElementById('reporteContainer').classList.add('hidden');
    },
    
    exportarExcel() {
        UI.showToast('Exportando a Excel... (simulado)');
        
        // Simulación de exportación
        setTimeout(() => {
            const contenido = document.getElementById('reporteContenido').innerText;
            const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `reporte_${this.reporteActual}_${DateUtils.today()}.csv`;
            link.click();
        }, 500);
    }
};
