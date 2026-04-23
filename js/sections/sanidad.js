/**
 * SECCIÓN SANIDAD - MEJORADO CON ESTILO CATTLER
 */

const SanidadSection = {
    vistaActual: 'resumen', // resumen, tratamientos, calendario, informes
    
    render() {
        const section = document.getElementById('sanidad');
        
        section.innerHTML = `
            <!-- NAVEGACIÓN TABS -->
            <div class="sanidad-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e9ecef;">
                <button class="tab-btn ${this.vistaActual === 'resumen' ? 'active' : ''}" onclick="SanidadSection.cambiarVista('resumen')">
                    📊 Resumen e Informes
                </button>
                <button class="tab-btn ${this.vistaActual === 'tratamientos' ? 'active' : ''}" onclick="SanidadSection.cambiarVista('tratamientos')">
                    💊 Tratamientos y Enfermos
                </button>
                <button class="tab-btn ${this.vistaActual === 'calendario' ? 'active' : ''}" onclick="SanidadSection.cambiarVista('calendario')">
                    📅 Calendario Sanitario
                </button>
            </div>

            <!-- CONTENIDO DINÁMICO -->
            <div id="sanidadContent">
                ${this.renderContenidoVista()}
            </div>
        `;

        // Agregar estilos
        this.addStyles();
    },

    cambiarVista(vista) {
        this.vistaActual = vista;
        this.render();
    },

    renderContenidoVista() {
        switch(this.vistaActual) {
            case 'resumen':
                return this.renderResumen();
            case 'tratamientos':
                return this.renderTratamientos();
            case 'calendario':
                return this.renderCalendarioVista();
            default:
                return this.renderResumen();
        }
    },

    renderResumen() {
        const animales = AppData.animales || [];
        const tratamientos = AppData.tratamientos || [];
        
        // Estadísticas
        const totalCabezas = animales.filter(a => a.estado !== 'vendido' && a.estado !== 'muerto').length;
        const enfermos = animales.filter(a => a.estado === 'enfermo').length;
        const enHospital = animales.filter(a => a.estado === 'hospital').length;
        const muertos = animales.filter(a => a.estado === 'muerto').length;
        const lotesRestringidos = new Set(animales.filter(a => a.estado === 'enfermo' || a.estado === 'hospital').map(a => a.lote)).size;
        
        // Morbilidad últimos 30 días
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        
        const tratamientos30 = tratamientos.filter(t => new Date(t.fechaInicio) >= hace30Dias);
        const diagnosticos = {};
        tratamientos30.forEach(t => {
            const diag = t.diagnostico || 'Sin diagnóstico';
            if (!diagnosticos[diag]) {
                diagnosticos[diag] = { total: 0, retiro1: 0, retiro2: 0, cronico: 0 };
            }
            diagnosticos[diag].total++;
            
            // Simular estado del tratamiento
            if (t.estado === 'finalizado') diagnosticos[diag].retiro1++;
            else if (t.estado === 'cronico') diagnosticos[diag].cronico++;
        });

        return `
            <!-- KPIs SANIDAD -->
            <div class="grid-3">
                <div class="card card-warning">
                    <div class="card-header">
                        <h3 class="card-title">🏥 Inventario de Ganado</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>${totalCabezas} Cabezas</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Lotes Activos</span>
                            <strong>${new Set(animales.filter(a => a.estado !== 'vendido' && a.estado !== 'muerto').map(a => a.lote)).size}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #666;">Lotes Restringidos</span>
                            <strong style="color: var(--warning);">${lotesRestringidos}</strong>
                        </div>
                    </div>
                </div>
                
                <div class="card card-danger">
                    <div class="card-header">
                        <h3 class="card-title">🤒 Enfermos</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>${enfermos} Enfermos (${((enfermos/totalCabezas)*100).toFixed(2)}%)</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">En Hospital</span>
                            <strong>${enHospital} (${((enHospital/totalCabezas)*100).toFixed(1)}%)</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #666;">Cabeza en Abstinencia</span>
                            <strong style="color: var(--danger);">0</strong>
                        </div>
                    </div>
                </div>
                
                <div class="card card-danger" style="border-color: var(--danger);">
                    <div class="card-header">
                        <h3 class="card-title">💀 Mortalidad</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>${muertos} Cabezas (${((muertos/totalCabezas)*100).toFixed(2)}%)</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Lotes de Alto Riesgo</span>
                            <strong>0</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #666;">Últimos 30 días</span>
                            <strong>${muertos}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MORBILIDAD Y MORTALIDAD -->
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📈 Morbilidad y Mortalidad</h3>
                        <span style="font-size: 12px; color: #666;">Últimos 30 días</span>
                    </div>
                    <div style="padding: 20px;">
                        <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
                            <div style="text-align: center;">
                                <div style="font-size: 32px; font-weight: 700; color: var(--info);">${tratamientos30.length}</div>
                                <div style="font-size: 12px; color: #666;">Pullouts</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 32px; font-weight: 700; color: var(--warning);">${tratamientos30.filter(t => t.estado === 'activo').length}</div>
                                <div style="font-size: 12px; color: #666;">En Tratamiento</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 32px; font-weight: 700; color: var(--success);">${tratamientos30.filter(t => t.estado === 'finalizado').length}</div>
                                <div style="font-size: 12px; color: #666;">Recuperados</div>
                            </div>
                        </div>
                        <div style="height: 180px;">
                            <canvas id="morbilidadChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🎯 Riesgo de Sanidad por Lotes</h3>
                    </div>
                    <div style="padding: 20px; text-align: center;">
                        <div style="height: 200px; position: relative;">
                            <canvas id="riesgoChart"></canvas>
                        </div>
                        <div style="margin-top: 15px;">
                            <span class="badge badge-success" style="margin: 0 5px;">Bajo Riesgo</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TASA DE MORBILIDAD POR DIAGNÓSTICO -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🔬 Tasa de Morbilidad por Diagnóstico y Retiro</h3>
                    <span style="font-size: 12px; color: #666;">Últimos 30 días</span>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Diagnóstico</th>
                                <th>1er Retiro</th>
                                <th>2do Retiro</th>
                                <th>Crónico</th>
                                <th>% Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(diagnosticos).length === 0 ? 
                                '<tr><td colspan="5" class="text-center">No hay datos de diagnóstico</td></tr>' :
                                Object.entries(diagnosticos).map(([diag, datos]) => {
                                    const pct = ((datos.total / totalCabezas) * 100).toFixed(2);
                                    return `
                                        <tr>
                                            <td><strong>${diag}</strong></td>
                                            <td>${datos.retiro1}</td>
                                            <td>${datos.retiro2}</td>
                                            <td>${datos.cronico}</td>
                                            <td>${pct}%</td>
                                        </tr>
                                    `;
                                }).join('')
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- LOTES MÁS AFECTADOS -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🏘️ Lotes Más Afectados</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-sm btn-secondary active">Morbilidad</button>
                        <button class="btn btn-sm btn-secondary">Mortalidad</button>
                    </div>
                </div>
                <div style="padding: 20px;">
                    ${this.renderLotesAfectados()}
                </div>
            </div>
        `;
    },

    renderTratamientos() {
        const tratamientos = AppData.tratamientos || [];
        const tratamientosActivos = tratamientos.filter(t => !t.fechaFin || new Date(t.fechaFin) > new Date());
        
        return `
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💊 Nuevo Tratamiento</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div class="form-group">
                            <label class="form-label">Fecha</label>
                            <input type="date" class="form-input" id="tratFecha" value="${DateUtils.today()}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Buscar Animal</label>
                            <input type="text" class="form-input" id="tratBuscar" placeholder="ID, Lote o Corral..." 
                                   onkeyup="SanidadSection.buscarAnimalTratamiento()">
                        </div>
                        <div id="resultadosBusquedaTrat" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px;">
                            <!-- Resultados de búsqueda -->
                        </div>
                        <div class="form-group">
                            <label class="form-label">Diagnóstico (Opcional)</label>
                            <select class="form-select" id="tratDiagnostico">
                                <option value="">Seleccionar...</option>
                                <option value="Neumonía">Neumonía</option>
                                <option value="Diarrea">Diarrea</option>
                                <option value="Mastitis">Mastitis</option>
                                <option value="Pododermatitis">Pododermatitis</option>
                                <option value="Problema respiratorio">Problema respiratorio</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Medicamento</label>
                            <input type="text" class="form-input" id="tratMedicamento" placeholder="Nombre del medicamento">
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Dosis</label>
                                <input type="text" class="form-input" id="tratDosis" placeholder="Ej: 10ml">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Vía</label>
                                <select class="form-select" id="tratVia">
                                    <option value="IM">IM</option>
                                    <option value="SC">SC</option>
                                    <option value="IV">IV</option>
                                    <option value="Oral">Oral</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Duración (días)</label>
                            <input type="number" class="form-input" id="tratDuracion" value="3" min="1">
                        </div>
                        <button class="btn btn-primary btn-block" onclick="SanidadSection.guardarTratamiento()">
                            💾 Guardar Tratamiento
                        </button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📋 Animales en Tratamiento</h3>
                        <span class="badge badge-warning">${tratamientosActivos.length} activos</span>
                    </div>
                    <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Animal</th>
                                    <th>Diagnóstico</th>
                                    <th>Medicamento</th>
                                    <th>Inicio</th>
                                    <th>Días Rest.</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tratamientosActivos.length === 0 ? 
                                    '<tr><td colspan="6" class="text-center">No hay tratamientos activos</td></tr>' :
                                    tratamientosActivos.map(t => {
                                        const diasRestantes = t.fechaFin ? 
                                            Math.ceil((new Date(t.fechaFin) - new Date()) / (1000 * 60 * 60 * 24)) : '-';
                                        const animal = (AppData.animales || []).find(a => a.id === t.idAnimal);
                                        return `
                                            <tr>
                                                <td>
                                                    <strong>${t.idAnimal}</strong>
                                                    ${animal ? `<br><small>${animal.lote || 'Sin lote'}</small>` : ''}
                                                </td>
                                                <td>${t.diagnostico || '-'}</td>
                                                <td>${t.medicamento}</td>
                                                <td>${DateUtils.format(t.fechaInicio)}</td>
                                                <td>
                                                    <span class="badge ${diasRestantes <= 1 ? 'badge-danger' : diasRestantes <= 3 ? 'badge-warning' : 'badge-success'}">
                                                        ${diasRestantes > 0 ? diasRestantes + ' días' : 'Hoy'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button class="btn btn-sm btn-success" onclick="SanidadSection.finalizarTratamiento(${t.id})">✓</button>
                                                    <button class="btn btn-sm btn-danger" onclick="SanidadSection.cancelarTratamiento(${t.id})">✕</button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    renderCalendarioVista() {
        // Generar calendario del mes actual
        const hoy = new Date();
        const mes = hoy.getMonth();
        const anio = hoy.getFullYear();
        const diasMes = new Date(anio, mes + 1, 0).getDate();
        const primerDia = new Date(anio, mes, 1).getDay();
        
        const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // Eventos programados (simulados o reales)
        const eventos = this.getEventosCalendario(mes, anio);
        
        let calendarioHTML = '';
        let dia = 1;
        
        for (let semana = 0; semana < 6; semana++) {
            calendarioHTML += '<tr>';
            for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
                if (semana === 0 && diaSemana < primerDia) {
                    calendarioHTML += '<td class="disabled"></td>';
                } else if (dia > diasMes) {
                    calendarioHTML += '<td class="disabled"></td>';
                } else {
                    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                    const eventosDia = eventos.filter(e => e.fecha === fecha);
                    const esHoy = dia === hoy.getDate();
                    
                    calendarioHTML += `
                        <td class="${esHoy ? 'hoy' : ''} ${eventosDia.length > 0 ? 'con-evento' : ''}">
                            <div class="dia-numero">${dia}</div>
                            ${eventosDia.map(e => `
                                <div class="evento-cal ${e.tipo}" onclick="SanidadSection.verEvento('${e.id}')">
                                    ${e.titulo}
                                </div>
                            `).join('')}
                        </td>
                    `;
                    dia++;
                }
            }
            calendarioHTML += '</tr>';
            if (dia > diasMes) break;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📅 Calendario Sanitario - ${nombresMeses[mes]} ${anio}</h3>
                    <button class="btn btn-primary btn-sm" onclick="SanidadSection.programarEvento()">+ Programar</button>
                </div>
                <div style="padding: 20px;">
                    <div style="display: flex; gap: 15px; margin-bottom: 15px; justify-content: center;">
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span style="width: 12px; height: 12px; background: #28a745; border-radius: 2px;"></span>
                            <span style="font-size: 12px;">Vacunación</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span style="width: 12px; height: 12px; background: #17a2b8; border-radius: 2px;"></span>
                            <span style="font-size: 12px;">Desparasitación</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span style="width: 12px; height: 12px; background: #ffc107; border-radius: 2px;"></span>
                            <span style="font-size: 12px;">Control</span>
                        </div>
                    </div>
                    
                    <table class="calendario-tabla">
                        <thead>
                            <tr>
                                <th>Dom</th>
                                <th>Lun</th>
                                <th>Mar</th>
                                <th>Mié</th>
                                <th>Jue</th>
                                <th>Vie</th>
                                <th>Sáb</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${calendarioHTML}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- PRÓXIMOS EVENTOS -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">⏰ Próximos Eventos</h3>
                </div>
                <div style="padding: 20px;">
                    ${eventos.slice(0, 5).map(e => {
                        const fecha = new Date(e.fecha);
                        const diasFaltan = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
                        return `
                            <div class="proximo-evento" style="display: flex; align-items: center; gap: 15px; 
                                        padding: 15px; border-left: 4px solid ${e.color}; 
                                        background: #f8f9fa; margin-bottom: 10px; border-radius: 8px;">
                                <div style="text-align: center; min-width: 50px;">
                                    <div style="font-size: 24px; font-weight: 700;">${fecha.getDate()}</div>
                                    <div style="font-size: 11px; text-transform: uppercase;">
                                        ${nombresMeses[fecha.getMonth()].substring(0, 3)}
                                    </div>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">${e.titulo}</div>
                                    <div style="font-size: 13px; color: #666;">${e.descripcion}</div>
                                </div>
                                <span class="badge ${diasFaltan <= 3 ? 'badge-danger' : 'badge-warning'}">
                                    ${diasFaltan <= 0 ? 'Hoy' : diasFaltan + ' días'}
                                </span>
                            </div>
                        `;
                    }).join('') || '<p class="text-center">No hay eventos programados</p>'}
                </div>
            </div>
        `;
    },

    getEventosCalendario(mes, anio) {
        // Combinar eventos simulados con tratamientos reales
        const eventos = [];
        
        // Tratamientos programados
        (AppData.tratamientos || []).forEach(t => {
            if (t.fechaInicio) {
                const fecha = new Date(t.fechaInicio);
                if (fecha.getMonth() === mes && fecha.getFullYear() === anio) {
                    eventos.push({
                        id: 't-' + t.id,
                        fecha: t.fechaInicio,
                        titulo: '💊 ' + t.idAnimal,
                        descripcion: t.diagnostico || 'Tratamiento',
                        tipo: 'tratamiento',
                        color: '#ffc107'
                    });
                }
            }
        });
        
        // Eventos simulados del sistema
        const eventosBase = [
            { dia: 5, titulo: 'Vacunación', tipo: 'vacuna', color: '#28a745' },
            { dia: 12, titulo: 'Desparasitación', tipo: 'desparasitacion', color: '#17a2b8' },
            { dia: 20, titulo: 'Control Sanitario', tipo: 'control', color: '#ffc107' },
            { dia: 28, titulo: 'Vacunación Refuerzo', tipo: 'vacuna', color: '#28a745' }
        ];
        
        eventosBase.forEach(e => {
            eventos.push({
                id: 'e-' + e.dia,
                fecha: `${anio}-${String(mes + 1).padStart(2, '0')}-${String(e.dia).padStart(2, '0')}`,
                titulo: e.titulo,
                descripcion: 'Evento programado',
                tipo: e.tipo,
                color: e.color
            });
        });
        
        return eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    },

    renderLotesAfectados() {
        const lotes = {};
        
        (AppData.animales || []).forEach(a => {
            if (a.estado === 'enfermo' || a.estado === 'hospital') {
                if (!lotes[a.lote]) lotes[a.lote] = { enfermos: 0, total: 0 };
                lotes[a.lote].enfermos++;
            }
            if (!lotes[a.lote]) lotes[a.lote] = { enfermos: 0, total: 0 };
            lotes[a.lote].total++;
        });
        
        const lotesAfectados = Object.entries(lotes)
            .filter(([_, datos]) => datos.enfermos > 0)
            .sort((a, b) => (b[1].enfermos / b[1].total) - (a[1].enfermos / a[1].total));
        
        if (lotesAfectados.length === 0) {
            return '<p class="text-center" style="padding: 20px;">No hay lotes con problemas de sanidad</p>';
        }
        
        return lotesAfectados.map(([lote, datos]) => {
            const pct = ((datos.enfermos / datos.total) * 100).toFixed(2);
            return `
                <div style="display: flex; align-items: center; gap: 15px; padding: 15px; 
                            border-bottom: 1px solid #eee;">
                    <div style="font-weight: 600; min-width: 100px;">${lote || 'Sin lote'}</div>
                    <div style="flex: 1;">
                        <div class="progress-bar" style="height: 8px;">
                            <div class="progress-fill" style="width: ${pct}%; 
                                        background: ${pct > 10 ? 'var(--danger)' : pct > 5 ? 'var(--warning)' : 'var(--info)'}"></div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700; color: var(--danger);">${pct}%</div>
                        <div style="font-size: 12px; color: #666;">${datos.enfermos}/${datos.total}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // FUNCIONES DE ACCIÓN
    buscarAnimalTratamiento() {
        const query = document.getElementById('tratBuscar').value.toLowerCase();
        const resultados = (AppData.animales || []).filter(a => 
            (a.id && a.id.toLowerCase().includes(query)) ||
            (a.lote && a.lote.toLowerCase().includes(query)) ||
            (a.corral && a.corral.toLowerCase().includes(query))
        ).slice(0, 10);
        
        const container = document.getElementById('resultadosBusquedaTrat');
        if (!container) return;
        
        if (query.length < 2) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = resultados.length === 0 ? 
            '<p class="text-center" style="padding: 10px;">No se encontraron animales</p>' :
            resultados.map(a => `
                <div class="animal-result" onclick="SanidadSection.seleccionarAnimal('${a.id}')" 
                     style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 5px;
                            cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${a.id}</strong>
                        <div style="font-size: 12px; color: #666;">${a.raza} - ${a.pesoActual}kg</div>
                    </div>
                    <span class="badge badge-${a.estado === 'enfermo' ? 'warning' : 'success'}">${a.estado}</span>
                </div>
            `).join('');
    },

    seleccionarAnimal(id) {
        document.getElementById('tratBuscar').value = id;
        document.getElementById('resultadosBusquedaTrat').innerHTML = `
            <div class="alert alert-success">
                <span>✓</span>
                <div>Animal seleccionado: <strong>${id}</strong></div>
            </div>
        `;
        this.animalSeleccionado = id;
    },

    guardarTratamiento() {
        const idAnimal = this.animalSeleccionado || document.getElementById('tratBuscar').value;
        const diagnostico = document.getElementById('tratDiagnostico').value;
        const medicamento = document.getElementById('tratMedicamento').value;
        const duracion = parseInt(document.getElementById('tratDuracion').value) || 3;
        const fecha = document.getElementById('tratFecha').value || DateUtils.today();
        
        if (!idAnimal) {
            UI.showToast('Debe seleccionar un animal', 'error');
            return;
        }
        if (!medicamento) {
            UI.showToast('Debe especificar el medicamento', 'error');
            return;
        }
        
        const tratamiento = {
            id: Date.now(),
            idAnimal: idAnimal,
            diagnostico: diagnostico,
            medicamento: medicamento,
            dosis: document.getElementById('tratDosis').value,
            via: document.getElementById('tratVia').value,
            fechaInicio: fecha,
            fechaFin: DateUtils.addDays(fecha, duracion),
            estado: 'activo'
        };
        
        if (!AppData.tratamientos) AppData.tratamientos = [];
        AppData.tratamientos.push(tratamiento);
        
        // Actualizar estado del animal
        const animal = AppData.animales.find(a => a.id === idAnimal);
        if (animal) {
            animal.estado = 'enfermo';
        }
        
        DataManager.save();
        this.animalSeleccionado = null;
        UI.showToast('Tratamiento registrado correctamente');
        this.render();
    },

    finalizarTratamiento(id) {
        const tratamiento = AppData.tratamientos.find(t => t.id === id);
        if (!tratamiento) return;
        
        if (!confirm('¿Marcar este tratamiento como finalizado?')) return;
        
        tratamiento.estado = 'finalizado';
        tratamiento.fechaFin = DateUtils.today();
        
        // Verificar si hay más tratamientos activos para este animal
        const tieneMasTratamientos = AppData.tratamientos.some(t => 
            t.idAnimal === tratamiento.idAnimal && 
            t.id !== id && 
            t.estado === 'activo'
        );
        
        if (!tieneMasTratamientos) {
            const animal = AppData.animales.find(a => a.id === tratamiento.idAnimal);
            if (animal) animal.estado = 'engorde';
        }
        
        DataManager.save();
        this.render();
        UI.showToast('Tratamiento finalizado');
    },

    cancelarTratamiento(id) {
        if (!confirm('¿Eliminar este tratamiento?')) return;
        
        AppData.tratamientos = AppData.tratamientos.filter(t => t.id !== id);
        DataManager.save();
        this.render();
        UI.showToast('Tratamiento eliminado');
    },

    verEvento(id) {
        UI.showToast(`Evento: ${id}`, 'info');
    },

    programarEvento() {
        const titulo = prompt('Título del evento:');
        if (!titulo) return;
        
        const fecha = prompt('Fecha (YYYY-MM-DD):', DateUtils.today());
        if (!fecha) return;
        
        UI.showToast('Evento programado (simulado)', 'success');
    },

    addStyles() {
        if (document.getElementById('sanidadStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'sanidadStyles';
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
            
            .card-warning {
                border-top: 4px solid var(--warning);
            }
            
            .card-danger {
                border-top: 4px solid var(--danger);
            }
            
            .calendario-tabla {
                width: 100%;
                border-collapse: collapse;
            }
            
            .calendario-tabla th {
                padding: 10px;
                background: #f8f9fa;
                font-size: 12px;
                text-transform: uppercase;
                color: #666;
            }
            
            .calendario-tabla td {
                width: 14.28%;
                height: 80px;
                border: 1px solid #e9ecef;
                vertical-align: top;
                padding: 8px;
                position: relative;
            }
            
            .calendario-tabla td.disabled {
                background: #f8f9fa;
            }
            
            .calendario-tabla td.hoy {
                background: #e3f2fd;
            }
            
            .calendario-tabla td.con-evento {
                background: #fff8e1;
            }
            
            .dia-numero {
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .evento-cal {
                font-size: 10px;
                padding: 2px 4px;
                border-radius: 3px;
                margin-bottom: 2px;
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .evento-cal.vacuna {
                background: #d4edda;
                color: #155724;
            }
            
            .evento-cal.desparasitacion {
                background: #d1ecf1;
                color: #0c5460;
            }
            
            .evento-cal.tratamiento {
                background: #fff3cd;
                color: #856404;
            }
            
            .evento-cal.control {
                background: #f8d7da;
                color: #721c24;
            }
            
            .animal-result:hover {
                background: #f8f9fa;
            }
        `;
        document.head.appendChild(style);
    }
};
