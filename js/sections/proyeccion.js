/**
 * SECCIÓN PROYECCIÓN - PLANIFICADOR DE OCUPACIÓN DEL FEEDLOT
 * Basado en planilla "OCUPACION FEEDLOT 2025.xlsx"
 */

const ProyeccionSection = {
    // Colores para lotes en el calendario
    COLORES_LOTE: [
        '#8B4513', '#D2691E', '#CD853F', '#DEB887',
        '#2E7D32', '#1565C0', '#6A1B9A', '#C62828',
        '#00695C', '#455A64', '#EF6C00', '#AD1457'
    ],

    // Estado del editor
    editandoId: null,

    render() {
        const section = document.getElementById('proyeccion');
        if (!section) return;

        // Inicializar corrales si no existen (copia lógica de CorralesSection)
        let corralesInicializados = false;
        if (!AppData.corrales || AppData.corrales.length === 0) {
            const corralesDef = [
                { id: 'corral1', nombre: 'Corral 1', largo: 35, ancho: 25, comederoLargo: 12, comederoAncho: 3 },
                { id: 'corral2', nombre: 'Corral 2', largo: 40, ancho: 30, comederoLargo: 15, comederoAncho: 3 },
                { id: 'corral3', nombre: 'Corral 3', largo: 45, ancho: 35, comederoLargo: 18, comederoAncho: 3.5 },
                { id: 'corral4', nombre: 'Corral 4', largo: 40, ancho: 30, comederoLargo: 15, comederoAncho: 3 },
                { id: 'corral5', nombre: 'Corral 5', largo: 35, ancho: 25, comederoLargo: 12, comederoAncho: 3 },
                { id: 'corral6', nombre: 'Corral 6', largo: 38, ancho: 28, comederoLargo: 14, comederoAncho: 3 }
            ];
            AppData.corrales = corralesDef.map(c => ({
                ...c,
                animales: [],
                superficie: (c.largo || 0) * (c.ancho || 0),
                superficieComedero: (c.comederoLargo || 0) * (c.comederoAncho || 0),
                nivelComedero: 85,
                ultimaRecarga: new Date().toISOString()
            }));
            corralesInicializados = true;
        }

        // Inicializar datos si no existen
        if (!AppData.proyecciones) AppData.proyecciones = [];
        if (!AppData.asignacionesProyeccion) AppData.asignacionesProyeccion = [];

        // Asegurar superficie en corrales
        AppData.corrales.forEach(c => {
            if (!c.superficie && c.largo && c.ancho) c.superficie = c.largo * c.ancho;
            if (!c.superficieComedero && c.comederoLargo && c.comederoAncho) c.superficieComedero = c.comederoLargo * c.comederoAncho;
        });

        if (corralesInicializados && typeof DataManager !== 'undefined') {
            DataManager.save();
        }

        section.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <div class="card-icon">📅</div>
                        Planificador de Ocupación del Feedlot
                    </h3>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span class="badge badge-info" id="proySuperficieTotal">${Formatters.number(this.calcularSuperficieTotal())} m² totales</span>
                        <span class="badge badge-secondary" id="proyCorralesTotal">${AppData.corrales.length} corrales</span>
                    </div>
                </div>

                <div class="tabs">
                    <div class="tab active" data-tab="lotes" data-group="proyeccion" onclick="Navigation.switchTab('lotes','proyeccion'); ProyeccionSection.renderTabLotes()">📝 Lotes Proyectados</div>
                    <div class="tab" data-tab="calendario" data-group="proyeccion" onclick="Navigation.switchTab('calendario','proyeccion'); ProyeccionSection.renderTabCalendario()">📆 Calendario de Ocupación</div>
                    <div class="tab" data-tab="resumen" data-group="proyeccion" onclick="Navigation.switchTab('resumen','proyeccion'); ProyeccionSection.renderTabResumen()">📊 Resumen</div>
                </div>

                <div class="tab-content active" data-group="proyeccion" id="proyeccion-tab-lotes">
                    ${this.getHTMLLotes()}
                </div>
                <div class="tab-content" data-group="proyeccion" id="proyeccion-tab-calendario">
                    ${this.getHTMLCalendario()}
                </div>
                <div class="tab-content" data-group="proyeccion" id="proyeccion-tab-resumen">
                    ${this.getHTMLResumen()}
                </div>
            </div>
        `;

        // Renderizar contenido inicial del tab activo
        this.renderTabLotes();
    },

    // ========== TAB LOTES ==========
    getHTMLLotes() {
        return `
            <div class="grid-2" style="align-items: start;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4>Lotes disponibles</h4>
                        <button class="btn btn-primary btn-sm" onclick="ProyeccionSection.abrirFormularioLote()">➕ Nuevo Lote</button>
                    </div>
                    <div class="table-container">
                        <table class="proyeccion-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Descripción</th>
                                    <th>Cabezas</th>
                                    <th>m²/An.</th>
                                    <th>Corrales Nec.</th>
                                    <th>Entrada</th>
                                    <th>Salida</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tablaLotesProyeccion"></tbody>
                        </table>
                    </div>
                    ${AppData.proyecciones.length === 0 ? `
                        <div class="empty-state" style="padding: 30px;">
                            <div class="empty-state-icon">📋</div>
                            <p>No hay lotes proyectados. Creá el primero para empezar a planificar.</p>
                        </div>
                    ` : ''}
                </div>
                <div>
                    <div id="formularioLoteContainer" style="display: none;">
                        <h4 style="margin-bottom: 15px;">${this.editandoId ? '✏️ Editar Lote' : '➕ Nuevo Lote Proyectado'}</h4>
                        <div class="proyeccion-form">
                            <div class="form-group">
                                <label class="form-label">Código del lote *</label>
                                <input type="text" class="form-input" id="proyCodigo" placeholder="Ej: TERN, VAC-P, VAQUI">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Descripción</label>
                                <input type="text" class="form-input" id="proyDescripcion" placeholder="Ej: Terneros hasta ingreso a verdeos">
                            </div>
                            <div class="grid-2" style="gap: 12px;">
                                <div class="form-group">
                                    <label class="form-label">Cantidad de cabezas *</label>
                                    <input type="number" class="form-input" id="proyCabezas" min="1" onchange="ProyeccionSection.actualizarPreview()">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">m² por animal *</label>
                                    <input type="number" class="form-input" id="proyM2Animal" min="1" step="0.5" value="10" onchange="ProyeccionSection.actualizarPreview()">
                                </div>
                            </div>
                            <div class="grid-2" style="gap: 12px;">
                                <div class="form-group">
                                    <label class="form-label">Fecha entrada estimada *</label>
                                    <input type="date" class="form-input" id="proyFechaEntrada">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Fecha salida estimada *</label>
                                    <input type="date" class="form-input" id="proyFechaSalida">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Notas</label>
                                <textarea class="form-textarea" id="proyNotas" rows="2"></textarea>
                            </div>
                            <div class="proyeccion-preview" id="proyeccionPreview" style="display: none;">
                                <div class="preview-row">
                                    <span>Corrales necesarios:</span>
                                    <strong id="previewCorralesNec">-</strong>
                                </div>
                                <div class="preview-row">
                                    <span>Animales por corral:</span>
                                    <strong id="previewAnimalesCorral">-</strong>
                                </div>
                                <div class="preview-row">
                                    <span>m² efectivo / animal:</span>
                                    <strong id="previewM2Efectivo">-</strong>
                                </div>
                                <div class="preview-row">
                                    <span>Días de estadía:</span>
                                    <strong id="previewDiasEstadia">-</strong>
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px; margin-top: 15px;">
                                <button class="btn btn-primary" onclick="ProyeccionSection.guardarLote()">💾 Guardar</button>
                                <button class="btn btn-secondary" onclick="ProyeccionSection.cerrarFormulario()">Cancelar</button>
                            </div>
                        </div>
                    </div>
                    <div id="infoLotesPanel">
                        <div class="alert alert-info">
                            <span>💡</span>
                            <div>Los lotes proyectados te permiten planificar la ocupación futura del feedlot. Cada lote se asigna automáticamente a los corrales disponibles.</div>
                        </div>
                        <div style="margin-top: 15px;">
                            <h5 style="margin-bottom: 10px;">Referencia de densidades</h5>
                            <div style="font-size: 13px; color: #666;">
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
                                    <span>Terneros/novillitos</span><strong>8-10 m²/animal</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
                                    <span>Vaquillonas</span><strong>10-12 m²/animal</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
                                    <span>Vacas (engorde)</span><strong>12-15 m²/animal</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                                    <span>Vacas (invernada)</span><strong>15-20 m²/animal</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderTabLotes() {
        const tbody = document.getElementById('tablaLotesProyeccion');
        if (!tbody) return;

        if (AppData.proyecciones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding: 20px; color: #999;">No hay lotes proyectados. Creá uno nuevo para comenzar.</td></tr>';
            return;
        }

        tbody.innerHTML = AppData.proyecciones.map(p => {
            const corralesNec = this.calcularCorralesNecesarios(p);
            const dias = this.calcularDiasEstadia(p.fechaEntrada, p.fechaSalida);
            const conflictos = this.detectarConflictos(p);
            return `
                <tr>
                    <td><strong style="color: ${p.color || '#333'};">${p.codigo}</strong></td>
                    <td>${p.descripcion || '-'}</td>
                    <td>${Formatters.number(p.cabezas)}</td>
                    <td>${p.m2PorAnimal}</td>
                    <td><span class="badge ${corralesNec > AppData.corrales.length ? 'badge-danger' : 'badge-info'}">${corralesNec}</span></td>
                    <td>${DateUtils.format(p.fechaEntrada)}</td>
                    <td>${DateUtils.format(p.fechaSalida)}</td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-sm btn-secondary" onclick="ProyeccionSection.editarLote('${p.id}')" title="Editar">✏️</button>
                            <button class="btn btn-sm btn-secondary" onclick="ProyeccionSection.duplicarLote('${p.id}')" title="Duplicar">📋</button>
                            <button class="btn btn-sm btn-danger" onclick="ProyeccionSection.eliminarLote('${p.id}')" title="Eliminar">🗑️</button>
                        </div>
                        ${conflictos.length > 0 ? `<div style="margin-top: 4px; font-size: 11px; color: var(--danger);">⚠️ ${conflictos.length} conflicto(s)</div>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    abrirFormularioLote() {
        this.editandoId = null;
        document.getElementById('formularioLoteContainer').style.display = 'block';
        document.getElementById('infoLotesPanel').style.display = 'none';
        document.getElementById('proyeccionPreview').style.display = 'none';

        // Limpiar campos
        document.getElementById('proyCodigo').value = '';
        document.getElementById('proyDescripcion').value = '';
        document.getElementById('proyCabezas').value = '';
        document.getElementById('proyM2Animal').value = '10';
        document.getElementById('proyFechaEntrada').value = DateUtils.today();
        document.getElementById('proyFechaSalida').value = '';
        document.getElementById('proyNotas').value = '';
    },

    cerrarFormulario() {
        document.getElementById('formularioLoteContainer').style.display = 'none';
        document.getElementById('infoLotesPanel').style.display = 'block';
        this.editandoId = null;
    },

    actualizarPreview() {
        const cabezas = parseInt(document.getElementById('proyCabezas').value) || 0;
        const m2 = parseFloat(document.getElementById('proyM2Animal').value) || 0;
        const fechaEntrada = document.getElementById('proyFechaEntrada').value;
        const fechaSalida = document.getElementById('proyFechaSalida').value;

        if (cabezas > 0 && m2 > 0) {
            const supProm = this.calcularSuperficiePromedioCorral() || 1;
            const corralesNec = Math.ceil((cabezas * m2) / supProm);
            const animalesPorCorral = Math.ceil(cabezas / corralesNec);
            const m2Efectivo = (supProm / animalesPorCorral).toFixed(1);

            document.getElementById('previewCorralesNec').textContent = corralesNec;
            document.getElementById('previewAnimalesCorral').textContent = animalesPorCorral;
            document.getElementById('previewM2Efectivo').textContent = m2Efectivo + ' m²';
            document.getElementById('proyeccionPreview').style.display = 'block';
        }

        if (fechaEntrada && fechaSalida) {
            const dias = this.calcularDiasEstadia(fechaEntrada, fechaSalida);
            document.getElementById('previewDiasEstadia').textContent = dias + ' días';
        }
    },

    guardarLote() {
        const codigo = document.getElementById('proyCodigo').value.trim().toUpperCase();
        const descripcion = document.getElementById('proyDescripcion').value.trim();
        const cabezas = parseInt(document.getElementById('proyCabezas').value);
        const m2PorAnimal = parseFloat(document.getElementById('proyM2Animal').value);
        const fechaEntrada = document.getElementById('proyFechaEntrada').value;
        const fechaSalida = document.getElementById('proyFechaSalida').value;
        const notas = document.getElementById('proyNotas').value.trim();

        if (!codigo) { UI.showToast('El código del lote es obligatorio', 'error'); return; }
        if (!cabezas || cabezas < 1) { UI.showToast('La cantidad de cabezas es inválida', 'error'); return; }
        if (!m2PorAnimal || m2PorAnimal < 1) { UI.showToast('Los m² por animal son inválidos', 'error'); return; }
        if (!fechaEntrada) { UI.showToast('La fecha de entrada es obligatoria', 'error'); return; }
        if (!fechaSalida) { UI.showToast('La fecha de salida es obligatoria', 'error'); return; }
        if (fechaSalida <= fechaEntrada) { UI.showToast('La fecha de salida debe ser posterior a la entrada', 'error'); return; }

        const lote = {
            id: this.editandoId || 'proj_' + Date.now(),
            codigo,
            descripcion,
            cabezas,
            m2PorAnimal,
            fechaEntrada,
            fechaSalida,
            notas,
            color: this.asignarColorLote(codigo)
        };

        if (this.editandoId) {
            const idx = AppData.proyecciones.findIndex(p => p.id === this.editandoId);
            if (idx >= 0) AppData.proyecciones[idx] = lote;
        } else {
            AppData.proyecciones.push(lote);
        }

        // Auto-asignar corrales si es nuevo
        if (!this.editandoId) {
            this.autoAsignarCorrales(lote);
        } else {
            // Actualizar asignaciones existentes para este lote
            this.actualizarAsignacionesLote(lote);
        }

        DataManager.save();
        this.cerrarFormulario();
        this.renderTabLotes();
        UI.showToast(`Lote ${codigo} guardado correctamente`, 'success');
    },

    editarLote(id) {
        const p = AppData.proyecciones.find(x => x.id === id);
        if (!p) return;

        this.editandoId = id;
        document.getElementById('formularioLoteContainer').style.display = 'block';
        document.getElementById('infoLotesPanel').style.display = 'none';

        document.getElementById('proyCodigo').value = p.codigo;
        document.getElementById('proyDescripcion').value = p.descripcion || '';
        document.getElementById('proyCabezas').value = p.cabezas;
        document.getElementById('proyM2Animal').value = p.m2PorAnimal;
        document.getElementById('proyFechaEntrada').value = p.fechaEntrada;
        document.getElementById('proyFechaSalida').value = p.fechaSalida;
        document.getElementById('proyNotas').value = p.notas || '';
        this.actualizarPreview();
    },

    duplicarLote(id) {
        const p = AppData.proyecciones.find(x => x.id === id);
        if (!p) return;
        const nuevo = { ...p, id: 'proj_' + Date.now() };
        AppData.proyecciones.push(nuevo);
        this.autoAsignarCorrales(nuevo);
        DataManager.save();
        this.renderTabLotes();
        UI.showToast(`Lote ${p.codigo} duplicado`, 'success');
    },

    eliminarLote(id) {
        const p = AppData.proyecciones.find(x => x.id === id);
        if (!p) return;
        if (!confirm(`¿Eliminar el lote proyectado ${p.codigo}?`)) return;

        AppData.proyecciones = AppData.proyecciones.filter(x => x.id !== id);
        AppData.asignacionesProyeccion = AppData.asignacionesProyeccion.filter(a => a.proyeccionId !== id);
        DataManager.save();
        this.renderTabLotes();
        UI.showToast('Lote eliminado', 'success');
    },

    // ========== ASIGNACIÓN AUTOMÁTICA DE CORRALES ==========
    autoAsignarCorrales(lote) {
        const corralesNec = this.calcularCorralesNecesarios(lote);
        const corralesDisponibles = this.obtenerCorralesDisponibles(lote.fechaEntrada, lote.fechaSalida);

        if (corralesDisponibles.length < corralesNec) {
            UI.showToast(`⚠️ No hay ${corralesNec} corrales disponibles para ${lote.codigo}. Asignación parcial.`, 'warning');
        }

        // Asignar los primeros corrales disponibles
        const asignados = corralesDisponibles.slice(0, corralesNec);
        asignados.forEach(corral => {
            AppData.asignacionesProyeccion.push({
                id: 'asig_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                proyeccionId: lote.id,
                corralId: corral.id,
                fechaInicio: lote.fechaEntrada,
                fechaFin: lote.fechaSalida
            });
        });
    },

    actualizarAsignacionesLote(lote) {
        // Eliminar asignaciones viejas
        AppData.asignacionesProyeccion = AppData.asignacionesProyeccion.filter(a => a.proyeccionId !== lote.id);
        // Re-asignar
        this.autoAsignarCorrales(lote);
    },

    obtenerCorralesDisponibles(fechaInicio, fechaFin) {
        return AppData.corrales.filter(c => {
            return !this.estaCorralOcupado(c.id, fechaInicio, fechaFin);
        });
    },

    estaCorralOcupado(corralId, fechaInicio, fechaFin, excluirProyeccionId = null) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return AppData.asignacionesProyeccion.some(a => {
            if (a.corralId !== corralId) return false;
            if (excluirProyeccionId && a.proyeccionId === excluirProyeccionId) return false;
            const aInicio = new Date(a.fechaInicio);
            const aFin = new Date(a.fechaFin);
            return inicio <= aFin && fin >= aInicio;
        });
    },

    // ========== TAB CALENDARIO ==========
    getHTMLCalendario() {
        return `
            <div id="calendarioContainer">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4>📆 Ocupación de Corrales</h4>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <label style="font-size: 13px; color: #666;">Desde:</label>
                        <input type="month" class="form-input" id="calMesInicio" value="${this.getMesActual()}" onchange="ProyeccionSection.renderCalendario()" style="width: 160px;">
                        <label style="font-size: 13px; color: #666;">Meses:</label>
                        <select class="form-select" id="calCantMeses" onchange="ProyeccionSection.renderCalendario()" style="width: 80px;">
                            <option value="3">3</option>
                            <option value="6" selected>6</option>
                            <option value="9">9</option>
                            <option value="12">12</option>
                        </select>
                    </div>
                </div>
                <div class="proyeccion-leyenda" id="calendarioLeyenda"></div>
                <div class="proyeccion-calendario-wrapper">
                    <div id="proyeccionCalendarioGrid" class="proyeccion-calendario"></div>
                </div>
                <div id="calendarioConflictos" style="margin-top: 15px;"></div>
            </div>
        `;
    },

    renderTabCalendario() {
        this.renderCalendario();
    },

    renderCalendario() {
        const container = document.getElementById('proyeccionCalendarioGrid');
        const leyenda = document.getElementById('calendarioLeyenda');
        const conflictosDiv = document.getElementById('calendarioConflictos');
        if (!container) return;

        const mesInicio = document.getElementById('calMesInicio').value;
        const cantMeses = parseInt(document.getElementById('calCantMeses').value) || 6;
        const periodos = this.generarPeriodos(mesInicio, cantMeses);

        // Generar leyenda
        if (leyenda) {
            leyenda.innerHTML = AppData.proyecciones.map(p => `
                <div class="leyenda-item">
                    <div class="leyenda-color" style="background: ${p.color};"></div>
                    <span>${p.codigo}</span>
                </div>
            `).join('');
        }

        // Set grid columns dynamically
        container.style.gridTemplateColumns = `140px repeat(${periodos.length}, minmax(100px, 1fr))`;

        // Header
        let html = `
            <div class="cal-header cal-corner">Corral / Período</div>
            ${periodos.map(per => `<div class="cal-header">${per.label}</div>`).join('')}
        `;

        // Filas por corral
        AppData.corrales.forEach(corral => {
            html += `<div class="cal-row-header">${corral.nombre}<br><small>${corral.superficie || 0} m²</small></div>`;

            periodos.forEach(per => {
                const lotesEnCelda = this.obtenerLotesEnPeriodo(corral.id, per.inicio, per.fin);
                if (lotesEnCelda.length === 0) {
                    html += `<div class="cal-cell cal-vacio">-</div>`;
                } else if (lotesEnCelda.length === 1) {
                    const lote = lotesEnCelda[0];
                    html += `<div class="cal-cell cal-ocupado" style="background: ${lote.color}20; border-left: 4px solid ${lote.color};">
                        <strong style="color: ${lote.color};">${lote.codigo}</strong>
                    </div>`;
                } else {
                    // Conflicto
                    html += `<div class="cal-cell cal-conflicto" title="Conflicto: ${lotesEnCelda.map(l => l.codigo).join(', ')}">
                        ⚠️ ${lotesEnCelda.length} lotes
                    </div>`;
                }
            });
        });

        container.innerHTML = html;

        // Mostrar conflictos globales
        const todosConflictos = this.detectarTodosConflictos();
        if (conflictosDiv) {
            if (todosConflictos.length > 0) {
                conflictosDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <span>⚠️</span>
                        <div>
                            <strong>Conflictos detectados:</strong>
                            <ul style="margin: 5px 0 0 15px;">
                                ${todosConflictos.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            } else {
                conflictosDiv.innerHTML = `
                    <div class="alert alert-success">
                        <span>✅</span>
                        <div>No hay conflictos de ocupación en el período visualizado.</div>
                    </div>
                `;
            }
        }
    },

    // ========== TAB RESUMEN ==========
    getHTMLResumen() {
        return `
            <div id="resumenProyeccionContainer">
                <div class="grid-4" style="margin-bottom: 20px;">
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Lotes Proyectados</div>
                        </div>
                        <div class="kpi-value" id="resTotalLotes">0</div>
                        <div class="kpi-subtitle">Total cabezas: <strong id="resTotalCabezas">0</strong></div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Corrales Requeridos</div>
                        </div>
                        <div class="kpi-value" id="resCorralesReq">0</div>
                        <div class="kpi-subtitle">De ${AppData.corrales.length} disponibles</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Pico de Ocupación</div>
                        </div>
                        <div class="kpi-value" id="resPicoOcupacion">0</div>
                        <div class="kpi-subtitle">Cabezas máximas simultáneas</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Conflicto Mayor</div>
                        </div>
                        <div class="kpi-value" id="resMaxConflicto" style="font-size: var(--font-size-2xl);">-</div>
                        <div class="kpi-subtitle" id="resMaxConflictoSub">Sin conflictos</div>
                    </div>
                </div>
                <div class="grid-2">
                    <div class="card">
                        <div class="card-header">
                            <h4 class="card-title">📈 Evolución de Ocupación</h4>
                        </div>
                        <div style="height: 300px;">
                            <canvas id="proyeccionChartOcupacion"></canvas>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h4 class="card-title">📋 Detalle por Lote</h4>
                        </div>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Lote</th>
                                        <th>Cabezas</th>
                                        <th>Corrales</th>
                                        <th>Entrada</th>
                                        <th>Salida</th>
                                        <th>Días</th>
                                    </tr>
                                </thead>
                                <tbody id="resumenTablaLotes"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderTabResumen() {
        const container = document.getElementById('resumenProyeccionContainer');
        if (!container) return;

        const totalLotes = AppData.proyecciones.length;
        const totalCabezas = AppData.proyecciones.reduce((s, p) => s + (p.cabezas || 0), 0);
        const corralesReq = AppData.proyecciones.reduce((s, p) => s + this.calcularCorralesNecesarios(p), 0);

        document.getElementById('resTotalLotes').textContent = totalLotes;
        document.getElementById('resTotalCabezas').textContent = Formatters.number(totalCabezas);
        document.getElementById('resCorralesReq').textContent = corralesReq;

        // Calcular pico de ocupación
        const pico = this.calcularPicoOcupacion();
        document.getElementById('resPicoOcupacion').textContent = Formatters.number(pico.max);

        // Conflictos
        const conflictos = this.detectarTodosConflictos();
        const elConflicto = document.getElementById('resMaxConflicto');
        const elConflictoSub = document.getElementById('resMaxConflictoSub');
        if (conflictos.length > 0) {
            elConflicto.textContent = '⚠️';
            elConflicto.style.color = 'var(--danger)';
            elConflictoSub.textContent = `${conflictos.length} conflicto(s) detectado(s)`;
        } else {
            elConflicto.textContent = '✅';
            elConflicto.style.color = 'var(--success)';
            elConflictoSub.textContent = 'Sin conflictos';
        }

        // Tabla detalle
        const tbody = document.getElementById('resumenTablaLotes');
        if (tbody) {
            if (AppData.proyecciones.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Sin lotes proyectados</td></tr>';
            } else {
                tbody.innerHTML = AppData.proyecciones.map(p => {
                    const dias = this.calcularDiasEstadia(p.fechaEntrada, p.fechaSalida);
                    const corralesNec = this.calcularCorralesNecesarios(p);
                    return `
                        <tr>
                            <td><strong style="color: ${p.color};">${p.codigo}</strong></td>
                            <td>${Formatters.number(p.cabezas)}</td>
                            <td>${corralesNec}</td>
                            <td>${DateUtils.format(p.fechaEntrada)}</td>
                            <td>${DateUtils.format(p.fechaSalida)}</td>
                            <td>${dias}</td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // Gráfico de ocupación
        this.renderChartOcupacion();
    },

    renderChartOcupacion() {
        const canvas = document.getElementById('proyeccionChartOcupacion');
        if (!canvas) return;

        const datos = this.calcularEvolucionOcupacion();
        if (datos.labels.length === 0) {
            canvas.parentElement.innerHTML = '<div class="empty-state" style="padding: 40px;"><div class="empty-state-icon">📊</div><p>Agregá lotes proyectados para ver la evolución de ocupación.</p></div>';
            return;
        }

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: datos.labels,
                datasets: [{
                    label: 'Cabezas en feedlot',
                    data: datos.valores,
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#8B4513'
                }, {
                    label: 'Capacidad total',
                    data: datos.labels.map(() => this.calcularCapacidadTotal()),
                    borderColor: '#999',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    },

    // ========== CÁLCULOS ==========
    calcularCorralesNecesarios(lote) {
        if (!lote || !lote.cabezas || !lote.m2PorAnimal) return 0;
        const supProm = this.calcularSuperficiePromedioCorral() || 1;
        return Math.ceil((lote.cabezas * lote.m2PorAnimal) / supProm);
    },

    calcularSuperficiePromedioCorral() {
        if (!AppData.corrales || AppData.corrales.length === 0) return 0;
        const total = AppData.corrales.reduce((s, c) => s + (c.superficie || 0), 0);
        return total / AppData.corrales.length;
    },

    calcularSuperficieTotal() {
        return AppData.corrales.reduce((s, c) => s + (c.superficie || 0), 0);
    },

    calcularDiasEstadia(fechaEntrada, fechaSalida) {
        const inicio = new Date(fechaEntrada);
        const fin = new Date(fechaSalida);
        return Math.max(0, Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)));
    },

    calcularPicoOcupacion() {
        if (AppData.proyecciones.length === 0) return { max: 0, fecha: null };

        // Generar puntos de cambio (entradas y salidas)
        const eventos = [];
        AppData.proyecciones.forEach(p => {
            eventos.push({ fecha: p.fechaEntrada, delta: p.cabezas });
            eventos.push({ fecha: p.fechaSalida, delta: -p.cabezas });
        });
        eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        let max = 0;
        let actual = 0;
        let fechaMax = null;
        eventos.forEach(e => {
            actual += e.delta;
            if (actual > max) {
                max = actual;
                fechaMax = e.fecha;
            }
        });
        return { max, fecha: fechaMax };
    },

    calcularCapacidadTotal() {
        const supTotal = this.calcularSuperficieTotal();
        const m2Prom = AppData.proyecciones.length > 0
            ? (AppData.proyecciones.reduce((s, p) => s + (p.m2PorAnimal || 10), 0) / AppData.proyecciones.length)
            : 10;
        return Math.floor(supTotal / m2Prom);
    },

    calcularEvolucionOcupacion() {
        if (AppData.proyecciones.length === 0) return { labels: [], valores: [] };

        const eventos = [];
        AppData.proyecciones.forEach(p => {
            eventos.push({ fecha: p.fechaEntrada, delta: p.cabezas });
            eventos.push({ fecha: p.fechaSalida, delta: -p.cabezas });
        });
        eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        const labels = [];
        const valores = [];
        let actual = 0;
        eventos.forEach(e => {
            actual += e.delta;
            labels.push(DateUtils.format(e.fecha));
            valores.push(actual);
        });
        return { labels, valores };
    },

    detectarConflictos(lote) {
        const conflictos = [];
        const asignacionesLote = AppData.asignacionesProyeccion.filter(a => a.proyeccionId === lote.id);

        asignacionesLote.forEach(a => {
            const conflicto = AppData.asignacionesProyeccion.some(otra => {
                if (otra.id === a.id) return false;
                if (otra.corralId !== a.corralId) return false;
                const aInicio = new Date(a.fechaInicio);
                const aFin = new Date(a.fechaFin);
                const oInicio = new Date(otra.fechaInicio);
                const oFin = new Date(otra.fechaFin);
                return aInicio <= oFin && aFin >= oInicio;
            });
            if (conflicto) {
                const corral = AppData.corrales.find(c => c.id === a.corralId);
                conflictos.push(corral ? corral.nombre : a.corralId);
            }
        });

        return [...new Set(conflictos)];
    },

    detectarTodosConflictos() {
        const conflictos = [];
        const asignaciones = AppData.asignacionesProyeccion;

        for (let i = 0; i < asignaciones.length; i++) {
            for (let j = i + 1; j < asignaciones.length; j++) {
                const a = asignaciones[i];
                const b = asignaciones[j];
                if (a.corralId !== b.corralId) continue;

                const aInicio = new Date(a.fechaInicio);
                const aFin = new Date(a.fechaFin);
                const bInicio = new Date(b.fechaInicio);
                const bFin = new Date(b.fechaFin);

                if (aInicio <= bFin && aFin >= bInicio) {
                    const loteA = AppData.proyecciones.find(p => p.id === a.proyeccionId);
                    const loteB = AppData.proyecciones.find(p => p.id === b.proyeccionId);
                    const corral = AppData.corrales.find(c => c.id === a.corralId);
                    const desc = `${loteA?.codigo || '?'} y ${loteB?.codigo || '?'} en ${corral?.nombre || a.corralId}`;
                    if (!conflictos.includes(desc)) conflictos.push(desc);
                }
            }
        }
        return conflictos;
    },

    obtenerLotesEnPeriodo(corralId, inicio, fin) {
        const asignaciones = AppData.asignacionesProyeccion.filter(a => {
            if (a.corralId !== corralId) return false;
            const aInicio = new Date(a.fechaInicio);
            const aFin = new Date(a.fechaFin);
            return new Date(inicio) <= aFin && new Date(fin) >= aInicio;
        });

        return asignaciones.map(a => AppData.proyecciones.find(p => p.id === a.proyeccionId)).filter(Boolean);
    },

    generarPeriodos(mesInicioStr, cantMeses) {
        const periodos = [];
        const [anio, mes] = mesInicioStr.split('-').map(Number);
        for (let i = 0; i < cantMeses; i++) {
            const m = mes + i;
            const a = anio + Math.floor((m - 1) / 12);
            const mesReal = ((m - 1) % 12) + 1;
            const inicio = new Date(a, mesReal - 1, 1);
            const fin = new Date(a, mesReal, 0);
            const nombresMes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            periodos.push({
                label: `${nombresMes[mesReal - 1]} ${a}`,
                inicio: inicio.toISOString().split('T')[0],
                fin: fin.toISOString().split('T')[0]
            });
        }
        return periodos;
    },

    getMesActual() {
        const hoy = new Date();
        return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    },

    asignarColorLote(codigo) {
        // Reutilizar color si ya existe el código
        const existente = AppData.proyecciones.find(p => p.codigo === codigo);
        if (existente) return existente.color;
        // Asignar siguiente color disponible
        const idx = AppData.proyecciones.length % this.COLORES_LOTE.length;
        return this.COLORES_LOTE[idx];
    }
};
