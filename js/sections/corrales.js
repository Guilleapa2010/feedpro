/**
 * SECCIÓN CORRALES - GESTIÓN DE CORRALES Y ANIMALES
 */

const CorralesSection = {
    // Definición de corrales disponibles por defecto
    CORRALES_DEF: [
        { id: 'corral1', nombre: 'Corral 1', largo: 35, ancho: 25, comederoLargo: 12, comederoAncho: 3 },
        { id: 'corral2', nombre: 'Corral 2', largo: 40, ancho: 30, comederoLargo: 15, comederoAncho: 3 },
        { id: 'corral3', nombre: 'Corral 3', largo: 45, ancho: 35, comederoLargo: 18, comederoAncho: 3.5 },
        { id: 'corral4', nombre: 'Corral 4', largo: 40, ancho: 30, comederoLargo: 15, comederoAncho: 3 },
        { id: 'corral5', nombre: 'Corral 5', largo: 35, ancho: 25, comederoLargo: 12, comederoAncho: 3 },
        { id: 'corral6', nombre: 'Corral 6', largo: 38, ancho: 28, comederoLargo: 14, comederoAncho: 3 }
    ],

    // Referencias de densidad para alertas (m² por animal)
    DENSIDAD_REF: {
        optima: 12,   // verde
        moderada: 10, // amarillo
        critica: 8    // rojo
    },

    render() {
        const section = document.getElementById('corrales');
        
        // Inicializar corrales si no existen
        if (!AppData.corrales || AppData.corrales.length === 0) {
            AppData.corrales = this.CORRALES_DEF.map(c => ({
                ...c,
                animales: [],
                nivelComedero: 85,
                ultimaRecarga: new Date().toISOString(),
                superficie: this.calcularSuperficie(c.largo, c.ancho),
                superficieComedero: this.calcularSuperficie(c.comederoLargo, c.comederoAncho)
            }));
        } else {
            // Asegurar que los corrales existentes tengan las nuevas propiedades
            AppData.corrales.forEach(c => {
                if (!c.superficie) c.superficie = this.calcularSuperficie(c.largo, c.ancho);
                if (!c.superficieComedero) c.superficieComedero = this.calcularSuperficie(c.comederoLargo, c.comederoAncho);
            });
        }
        
        // Asegurar que cada animal tenga asignado un corral
        this.sincronizarAnimalesConCorrales();
        
        section.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <div class="card-icon">🏘️</div>
                        Gestión de Corrales
                    </h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-success" onclick="CorralesSection.abrirModalCorral()">
                            ➕ Nuevo Corral
                        </button>
                        <button class="btn btn-primary" onclick="CorralesSection.moverAnimalesEntreCorrales()">
                            🔄 Mover Animales
                        </button>
                        <button class="btn btn-secondary" onclick="CorralesSection.verDistribucionGeneral()">
                            📊 Distribución General
                        </button>
                    </div>
                </div>
                
                <div class="grid-3" id="corralesGrid">
                    ${AppData.corrales.map(c => this.renderCorralCard(c)).join('')}
                </div>
            </div>
            
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📈 Indicadores por Corral</h3>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Corral</th>
                                    <th>Animales</th>
                                    <th>Superficie</th>
                                    <th>Comedero</th>
                                    <th>m² / Animal</th>
                                    <th>Peso Prom.</th>
                                    <th>GMD</th>
                                    <th>Cons./Día</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderIndicadoresCorrales()}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">⚠️ Alertas de Corrales</h3>
                    </div>
                    <div id="alertasCorrales">
                        ${this.renderAlertas()}
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📝 Historial de Movimientos</h3>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha/Hora</th>
                                <th>Animal</th>
                                <th>Origen</th>
                                <th>Destino</th>
                                <th>Motivo</th>
                                <th>Responsable</th>
                            </tr>
                        </thead>
                        <tbody id="tablaMovimientos">
                            ${this.renderHistorialMovimientos()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.initChart();
    },
    
    sincronizarAnimalesConCorrales() {
        // Limpiar animales de todos los corrales
        AppData.corrales.forEach(corral => {
            corral.animales = [];
        });
        
        // Asignar animales a corrales según su propiedad corral
        AppData.animales.forEach(animal => {
            if (animal.corral) {
                const corral = AppData.corrales.find(c => c.id === animal.corral);
                if (corral) {
                    corral.animales.push(animal.id);
                }
            }
        });
    },
    
    calcularSuperficie(largo, ancho) {
        const l = parseFloat(largo) || 0;
        const a = parseFloat(ancho) || 0;
        return l * a;
    },
    
    getColorPorDensidad(m2PorAnimal) {
        if (m2PorAnimal === 0 || m2PorAnimal === Infinity) return '#999';
        if (m2PorAnimal >= this.DENSIDAD_REF.optima) return 'var(--success)';
        if (m2PorAnimal >= this.DENSIDAD_REF.moderada) return 'var(--warning)';
        return 'var(--danger)';
    },
    
    renderCorralCard(corral) {
        const stats = this.calcularStatsCorral(corral);
        const m2PorAnimal = stats.cantidad > 0 ? (corral.superficie / stats.cantidad) : Infinity;
        const colorEstado = this.getColorPorDensidad(m2PorAnimal);
        const densidad = corral.superficie > 0 ? (stats.cantidad / corral.superficie) : 0;
        
        return `
            <div class="card" style="border-top: 4px solid ${colorEstado}; position: relative;" 
                 ondblclick="CorralesSection.verDetalleCorral('${corral.id}')">
                <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 6px;">
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); CorralesSection.abrirModalCorral('${corral.id}')" title="Editar">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); CorralesSection.eliminarCorral('${corral.id}')" title="Eliminar">🗑️</button>
                </div>
                <div style="cursor: pointer;" onclick="CorralesSection.verDetalleCorral('${corral.id}')">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-right: 70px;">
                        <h4 style="margin: 0;">${corral.nombre}</h4>
                        <span class="badge" style="background: ${colorEstado};">
                            ${stats.cantidad} animales
                        </span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-bottom: 12px;">
                        <div style="text-align: center; padding: 8px; background: #f8f9fa; border-radius: 6px;">
                            <div style="font-size: 20px; font-weight: 700; color: var(--primary);">${stats.cantidad}</div>
                            <div style="color: #666;">Animales</div>
                        </div>
                        <div style="text-align: center; padding: 8px; background: #f8f9fa; border-radius: 6px;">
                            <div style="font-size: 20px; font-weight: 700; color: var(--info);">${stats.pesoPromedio.toFixed(0)}</div>
                            <div style="color: #666;">Kg Prom.</div>
                        </div>
                        <div style="text-align: center; padding: 8px; background: #f8f9fa; border-radius: 6px;">
                            <div style="font-size: 20px; font-weight: 700; color: var(--success);">${stats.gmd.toFixed(2)}</div>
                            <div style="color: #666;">GMD</div>
                        </div>
                        <div style="text-align: center; padding: 8px; background: #f8f9fa; border-radius: 6px;">
                            <div style="font-size: 20px; font-weight: 700; color: var(--warning);">${stats.consumoPorAnimal.toFixed(1)}</div>
                            <div style="color: #666;">Kg/Animal</div>
                        </div>
                    </div>
                    
                    <div style="padding: 10px; background: #f0f7ff; border-radius: 6px; font-size: 12px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>📐 Superficie:</span>
                            <strong>${Formatters.number(corral.superficie)} m²</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>🍽️ Comedero:</span>
                            <strong>${Formatters.number(corral.superficieComedero || 0)} m²</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>📏 m² / animal:</span>
                            <strong style="color: ${colorEstado};">${stats.cantidad > 0 ? m2PorAnimal.toFixed(1) : '-'}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>🐄 Densidad:</span>
                            <strong>${densidad.toFixed(3)} an/m²</strong>
                        </div>
                    </div>
                    
                    <div style="padding-top: 12px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>Peso total:</span>
                            <strong>${Formatters.number(stats.pesoTotal)} kg</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                            <span>Biomasa:</span>
                            <strong>${(stats.pesoTotal / 1000).toFixed(2)} @</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    calcularStatsCorral(corral) {
        const animalesEnCorral = AppData.animales.filter(a => a.corral === corral.id && a.estado !== 'vendido');
        const cantidad = animalesEnCorral.length;
        
        if (cantidad === 0) {
            return {
                cantidad: 0,
                pesoTotal: 0,
                pesoPromedio: 0,
                gmd: 0,
                consumoPorAnimal: 0
            };
        }
        
        const pesoTotal = animalesEnCorral.reduce((sum, a) => sum + (a.pesoActual || 0), 0);
        const pesoPromedio = pesoTotal / cantidad;
        
        // Calcular GMD promedio del corral
        let gmdTotal = 0;
        let animalesConGMD = 0;
        
        animalesEnCorral.forEach(animal => {
            const gmd = this.calcularGMD(animal);
            if (gmd > 0) {
                gmdTotal += gmd;
                animalesConGMD++;
            }
        });
        
        const gmd = animalesConGMD > 0 ? gmdTotal / animalesConGMD : 0;
        
        // Consumo estimado por animal (2.5% del peso vivo)
        const consumoPorAnimal = pesoPromedio * 0.025;
        
        return {
            cantidad,
            pesoTotal,
            pesoPromedio,
            gmd,
            consumoPorAnimal
        };
    },
    
    calcularGMD(animal) {
        if (!animal.fechaIngreso || !animal.pesoEntrada || !animal.pesoActual) {
            return 0;
        }
        
        const fechaIngreso = new Date(animal.fechaIngreso);
        const hoy = new Date();
        const diasEnFeedlot = Math.max(1, Math.floor((hoy - fechaIngreso) / (1000 * 60 * 60 * 24)));
        
        const ganancia = animal.pesoActual - animal.pesoEntrada;
        return ganancia / diasEnFeedlot;
    },
    
    renderIndicadoresCorrales() {
        return AppData.corrales.map(corral => {
            const stats = this.calcularStatsCorral(corral);
            const m2PorAnimal = stats.cantidad > 0 ? (corral.superficie / stats.cantidad) : Infinity;
            const estado = m2PorAnimal >= this.DENSIDAD_REF.optima ? '🟢 Holgado' : 
                          m2PorAnimal >= this.DENSIDAD_REF.moderada ? '🔶 Medio' : 
                          stats.cantidad === 0 ? '⚪ Vacío' : '⚠️ Justo';
            
            return `
                <tr style="cursor: pointer;" onclick="CorralesSection.verDetalleCorral('${corral.id}')">
                    <td><strong>${corral.nombre}</strong></td>
                    <td>${stats.cantidad}</td>
                    <td>${Formatters.number(corral.superficie || 0)} m²</td>
                    <td>${Formatters.number(corral.superficieComedero || 0)} m²</td>
                    <td>${stats.cantidad > 0 ? m2PorAnimal.toFixed(1) : '-'}</td>
                    <td>${stats.pesoPromedio.toFixed(0)} kg</td>
                    <td>${stats.gmd.toFixed(2)} kg/día</td>
                    <td>${stats.consumoPorAnimal.toFixed(1)} kg</td>
                    <td><span class="badge">${estado}</span></td>
                </tr>
            `;
        }).join('');
    },
    
    renderAlertas() {
        let alertas = [];
        
        AppData.corrales.forEach(corral => {
            const stats = this.calcularStatsCorral(corral);
            const m2PorAnimal = stats.cantidad > 0 ? (corral.superficie / stats.cantidad) : Infinity;
            
            if (stats.cantidad > 0 && m2PorAnimal < this.DENSIDAD_REF.critica) {
                alertas.push({
                    tipo: 'danger',
                    mensaje: `<strong>${corral.nombre}</strong> tiene sólo ${m2PorAnimal.toFixed(1)} m² por animal (muy justo)`
                });
            } else if (stats.cantidad > 0 && m2PorAnimal < this.DENSIDAD_REF.moderada) {
                alertas.push({
                    tipo: 'warning',
                    mensaje: `<strong>${corral.nombre}</strong> tiene ${m2PorAnimal.toFixed(1)} m² por animal (densidad alta)`
                });
            }
            
            // Alerta por bajo GMD
            if (stats.gmd > 0 && stats.gmd < 0.8) {
                alertas.push({
                    tipo: 'warning',
                    mensaje: `<strong>${corral.nombre}</strong> tiene GMD bajo (${stats.gmd.toFixed(2)} kg/día)`
                });
            }
        });
        
        if (alertas.length === 0) {
            return '<div class="alert alert-success"><span>✅</span><div>Todos los corrales están en condiciones normales</div></div>';
        }
        
        return alertas.map(a => `
            <div class="alert alert-${a.tipo}" style="margin-bottom: 10px;">
                <span>${a.tipo === 'danger' ? '🔴' : '🟡'}</span>
                <div>${a.mensaje}</div>
            </div>
        `).join('');
    },
    
    renderHistorialMovimientos() {
        if (!AppData.movimientosCorrales || AppData.movimientosCorrales.length === 0) {
            return '<tr><td colspan="6" class="text-center">No hay movimientos registrados</td></tr>';
        }
        
        return AppData.movimientosCorrales.slice(0, 10).map(m => `
            <tr>
                <td>${new Date(m.fecha).toLocaleString()}</td>
                <td>${m.animalId}</td>
                <td>${this.getNombreCorral(m.corralOrigen)}</td>
                <td>${this.getNombreCorral(m.corralDestino)}</td>
                <td>${m.motivo || 'No especificado'}</td>
                <td>${m.responsable}</td>
            </tr>
        `).join('');
    },
    
    getNombreCorral(corralId) {
        const corral = AppData.corrales.find(c => c.id === corralId);
        return corral ? corral.nombre : corralId;
    },
    
    // ========== CRUD CORRALES ==========
    abrirModalCorral(corralId = null) {
        const corral = corralId ? AppData.corrales.find(c => c.id === corralId) : null;
        const esEditar = !!corral;
        
        const contenido = `
            <div class="modal-header">
                <h3 class="modal-title">${esEditar ? '✏️ Editar Corral' : '➕ Nuevo Corral'}</h3>
                <button class="modal-close" onclick="CorralesSection.cerrarModal('modalCorralForm')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Nombre del corral *</label>
                    <input type="text" class="form-input" id="corralNombre" value="${esEditar ? corral.nombre : ''}" placeholder="Ej: Corral 7 - Finalización">
                </div>
                
                <h4 style="margin: 20px 0 10px; font-size: 15px; color: var(--primary);">📐 Dimensiones del corral</h4>
                <div class="grid-2" style="gap: 15px;">
                    <div class="form-group">
                        <label class="form-label">Largo (metros)</label>
                        <input type="number" class="form-input" id="corralLargo" min="0" step="0.1" value="${esEditar ? (corral.largo || '') : ''}" oninput="CorralesSection.actualizarPreviewSuperficie()">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ancho (metros)</label>
                        <input type="number" class="form-input" id="corralAncho" min="0" step="0.1" value="${esEditar ? (corral.ancho || '') : ''}" oninput="CorralesSection.actualizarPreviewSuperficie()">
                    </div>
                </div>
                
                <div class="form-group" style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 14px;">
                        <span>Superficie calculada:</span>
                        <strong id="previewSuperficie" style="color: var(--primary); font-size: 18px;">-</strong>
                    </div>
                </div>
                
                <h4 style="margin: 20px 0 10px; font-size: 15px; color: var(--primary);">🍽️ Dimensiones del comedero</h4>
                <div class="grid-2" style="gap: 15px;">
                    <div class="form-group">
                        <label class="form-label">Largo comedero (metros)</label>
                        <input type="number" class="form-input" id="corralComederoLargo" min="0" step="0.1" value="${esEditar ? (corral.comederoLargo || '') : ''}" oninput="CorralesSection.actualizarPreviewComedero()">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ancho comedero (metros)</label>
                        <input type="number" class="form-input" id="corralComederoAncho" min="0" step="0.1" value="${esEditar ? (corral.comederoAncho || '') : ''}" oninput="CorralesSection.actualizarPreviewComedero()">
                    </div>
                </div>
                
                <div class="form-group" style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 14px;">
                        <span>Superficie comedero calculada:</span>
                        <strong id="previewComedero" style="color: var(--info); font-size: 18px;">-</strong>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="CorralesSection.cerrarModal('modalCorralForm')">Cancelar</button>
                <button class="btn btn-primary" onclick="CorralesSection.guardarCorral('${corralId || ''}')">
                    ${esEditar ? '💾 Guardar cambios' : '➕ Crear corral'}
                </button>
            </div>
        `;
        
        this.crearModal('modalCorralForm', contenido);
        
        // Calcular previews iniciales
        setTimeout(() => {
            this.actualizarPreviewSuperficie();
            this.actualizarPreviewComedero();
        }, 50);
    },
    
    actualizarPreviewSuperficie() {
        const largo = parseFloat(document.getElementById('corralLargo')?.value) || 0;
        const ancho = parseFloat(document.getElementById('corralAncho')?.value) || 0;
        const sup = largo * ancho;
        const el = document.getElementById('previewSuperficie');
        if (el) el.textContent = sup > 0 ? `${Formatters.number(sup)} m²` : '-';
    },
    
    actualizarPreviewComedero() {
        const largo = parseFloat(document.getElementById('corralComederoLargo')?.value) || 0;
        const ancho = parseFloat(document.getElementById('corralComederoAncho')?.value) || 0;
        const sup = largo * ancho;
        const el = document.getElementById('previewComedero');
        if (el) el.textContent = sup > 0 ? `${Formatters.number(sup)} m²` : '-';
    },
    
    guardarCorral(corralId) {
        const nombre = document.getElementById('corralNombre').value.trim();
        const largo = parseFloat(document.getElementById('corralLargo').value) || 0;
        const ancho = parseFloat(document.getElementById('corralAncho').value) || 0;
        const comederoLargo = parseFloat(document.getElementById('corralComederoLargo').value) || 0;
        const comederoAncho = parseFloat(document.getElementById('corralComederoAncho').value) || 0;
        
        if (!nombre) {
            UI.showToast('El nombre del corral es obligatorio', 'error');
            return;
        }
        
        const superficie = this.calcularSuperficie(largo, ancho);
        const superficieComedero = this.calcularSuperficie(comederoLargo, comederoAncho);
        
        if (corralId) {
            // Editar
            const idx = AppData.corrales.findIndex(c => c.id === corralId);
            if (idx >= 0) {
                AppData.corrales[idx] = {
                    ...AppData.corrales[idx],
                    nombre,
                    largo,
                    ancho,
                    superficie,
                    comederoLargo,
                    comederoAncho,
                    superficieComedero
                };
                UI.showToast('Corral actualizado correctamente', 'success');
            }
        } else {
            // Crear
            const nuevoId = 'corral_' + Date.now();
            AppData.corrales.push({
                id: nuevoId,
                nombre,
                largo,
                ancho,
                superficie,
                comederoLargo,
                comederoAncho,
                superficieComedero,
                animales: [],
                nivelComedero: 85,
                ultimaRecarga: new Date().toISOString()
            });
            UI.showToast('Nuevo corral creado correctamente', 'success');
        }
        
        DataManager.save();
        this.cerrarModal('modalCorralForm');
        this.render();
    },
    
    eliminarCorral(corralId) {
        const corral = AppData.corrales.find(c => c.id === corralId);
        if (!corral) return;
        
        const stats = this.calcularStatsCorral(corral);
        if (stats.cantidad > 0) {
            UI.showToast(`No se puede eliminar ${corral.nombre} porque tiene ${stats.cantidad} animales. Movélos primero.`, 'error');
            return;
        }
        
        if (!confirm(`¿Eliminar el corral "${corral.nombre}" permanentemente?`)) return;
        
        AppData.corrales = AppData.corrales.filter(c => c.id !== corralId);
        
        // Limpiar asignaciones de proyección si existen
        if (AppData.asignacionesProyeccion) {
            AppData.asignacionesProyeccion = AppData.asignacionesProyeccion.filter(a => a.corralId !== corralId);
        }
        
        DataManager.save();
        this.render();
        UI.showToast('Corral eliminado', 'success');
    },
    
    // Función helper para cerrar y eliminar modales
    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },
    
    // Función helper para crear modal con estructura correcta
    crearModal(modalId, contenidoHTML) {
        // Eliminar modal anterior si existe
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();
        
        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal">
                    ${contenidoHTML}
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Abrir el modal
        setTimeout(() => {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('active');
        }, 10);
    },
    
    verDetalleCorral(corralId) {
        const corral = AppData.corrales.find(c => c.id === corralId);
        if (!corral) return;
        
        const stats = this.calcularStatsCorral(corral);
        const animalesEnCorral = AppData.animales.filter(a => a.corral === corralId && a.estado !== 'vendido');
        const m2PorAnimal = stats.cantidad > 0 ? (corral.superficie / stats.cantidad) : 0;
        const densidad = corral.superficie > 0 ? (stats.cantidad / corral.superficie) : 0;
        
        const contenido = `
            <div class="modal-header">
                <h3 class="modal-title">${corral.nombre} - Detalle</h3>
                <button class="modal-close" onclick="CorralesSection.cerrarModal('modalDetalleCorral')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="grid-4" style="margin-bottom: 20px;">
                    <div class="stat-card">
                        <div class="stat-value">${stats.cantidad}</div>
                        <div class="stat-label">Animales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.pesoPromedio.toFixed(0)}</div>
                        <div class="stat-label">Kg Promedio</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.gmd.toFixed(2)}</div>
                        <div class="stat-label">GMD Prom.</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${(stats.pesoTotal / 1000).toFixed(2)}</div>
                        <div class="stat-label">@ Totales</div>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; font-size: 13px;">
                        <div>
                            <div style="color: #666; margin-bottom: 2px;">Superficie corral</div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${Formatters.number(corral.superficie || 0)} m²</div>
                            <div style="color: #999; font-size: 11px;">${corral.largo || 0}m × ${corral.ancho || 0}m</div>
                        </div>
                        <div>
                            <div style="color: #666; margin-bottom: 2px;">Superficie comedero</div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--info);">${Formatters.number(corral.superficieComedero || 0)} m²</div>
                            <div style="color: #999; font-size: 11px;">${corral.comederoLargo || 0}m × ${corral.comederoAncho || 0}m</div>
                        </div>
                        <div>
                            <div style="color: #666; margin-bottom: 2px;">m² por animal</div>
                            <div style="font-size: 18px; font-weight: 700; color: ${m2PorAnimal > 0 ? this.getColorPorDensidad(m2PorAnimal) : '#999'};">${stats.cantidad > 0 ? m2PorAnimal.toFixed(1) : '-'}</div>
                            <div style="color: #999; font-size: 11px;">densidad: ${densidad.toFixed(3)} an/m²</div>
                        </div>
                    </div>
                </div>
                
                <h4 style="margin-bottom: 15px;">Animales en este corral</h4>
                <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Raza</th>
                                <th>Sexo</th>
                                <th>Peso Actual</th>
                                <th>GMD</th>
                                <th>Días</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${animalesEnCorral.map(a => {
                                const dias = Math.floor((new Date() - new Date(a.fechaIngreso)) / (1000 * 60 * 60 * 24));
                                const gmd = this.calcularGMD(a);
                                return `
                                    <tr>
                                        <td><strong>${a.id}</strong></td>
                                        <td>${a.raza}</td>
                                        <td>${a.sexo === 'macho' ? '♂️ Macho' : '♀️ Hembra'}</td>
                                        <td>${a.pesoActual} kg</td>
                                        <td>${gmd.toFixed(2)} kg/día</td>
                                        <td>${dias}</td>
                                        <td><span class="badge">${a.estado}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="CorralesSection.moverAnimal('${a.id}')">
                                                Mover
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                ${animalesEnCorral.length === 0 ? '<p class="text-center" style="padding: 20px; color: #666;">No hay animales en este corral</p>' : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="CorralesSection.cerrarModal('modalDetalleCorral')">Cerrar</button>
                <button class="btn btn-success" onclick="CorralesSection.abrirModalCorral('${corral.id}')">✏️ Editar Corral</button>
                <button class="btn btn-primary" onclick="CorralesSection.abrirMoverDesdeDetalle('${corral.id}')">
                    Mover Múltiples Animales
                </button>
            </div>
        `;
        
        this.crearModal('modalDetalleCorral', contenido);
    },
    
    // Nueva función para mover desde el detalle sin abrir dos modales
    abrirMoverDesdeDetalle(corralId) {
        this.cerrarModal('modalDetalleCorral');
        setTimeout(() => {
            this.moverAnimalesEntreCorrales();
            const selectOrigen = document.getElementById('corralOrigenMultiple');
            if (selectOrigen) {
                selectOrigen.value = corralId;
                this.actualizarListaAnimales();
            }
        }, 300);
    },
    
    moverAnimal(animalId) {
        const animal = AppData.animales.find(a => a.id === animalId);
        if (!animal) return;
        
        const corralesDisponibles = AppData.corrales.filter(c => c.id !== animal.corral);
        
        const contenido = `
            <div class="modal-header">
                <h3 class="modal-title">Mover Animal ${animalId}</h3>
                <button class="modal-close" onclick="CorralesSection.cerrarModal('modalMoverAnimal')">&times;</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 15px;">
                    <strong>Animal:</strong> ${animal.raza} - ${animal.pesoActual} kg<br>
                    <strong>Corral actual:</strong> ${this.getNombreCorral(animal.corral)}
                </p>
                
                <div class="form-group">
                    <label class="form-label">Corral destino *</label>
                    <select class="form-select" id="selectCorralDestino">
                        <option value="">Seleccione corral...</option>
                        ${corralesDisponibles.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Motivo</label>
                    <select class="form-select" id="motivoMovimiento">
                        <option value="Reagrupamiento">Reagrupamiento</option>
                        <option value="Sanidad">Sanidad</option>
                        <option value="Engorde">Engorde</option>
                        <option value="Cuarentena">Cuarentena</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Observaciones</label>
                    <textarea class="form-textarea" id="observacionesMovimiento" rows="2"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="CorralesSection.cerrarModal('modalMoverAnimal')">Cancelar</button>
                <button class="btn btn-primary" onclick="CorralesSection.confirmarMovimiento('${animalId}')">
                    Confirmar Movimiento
                </button>
            </div>
        `;
        
        this.crearModal('modalMoverAnimal', contenido);
    },
    
    confirmarMovimiento(animalId) {
        const corralDestino = document.getElementById('selectCorralDestino').value;
        const motivo = document.getElementById('motivoMovimiento').value;
        const observaciones = document.getElementById('observacionesMovimiento').value;
        
        if (!corralDestino) {
            UI.showToast('Debe seleccionar un corral destino', 'error');
            return;
        }
        
        const animal = AppData.animales.find(a => a.id === animalId);
        const corralOrigen = animal.corral;
        
        // Actualizar el corral del animal
        animal.corral = corralDestino;
        
        // Registrar el movimiento
        if (!AppData.movimientosCorrales) AppData.movimientosCorrales = [];
        AppData.movimientosCorrales.unshift({
            fecha: new Date().toISOString(),
            animalId: animalId,
            corralOrigen: corralOrigen,
            corralDestino: corralDestino,
            motivo: motivo,
            observaciones: observaciones,
            responsable: AppState.usuario.nombre
        });
        
        DataManager.save();
        this.cerrarModal('modalMoverAnimal');
        this.render();
        UI.showToast(`Animal ${animalId} movido a ${this.getNombreCorral(corralDestino)}`, 'success');
    },
    
    moverAnimalesEntreCorrales() {
        const contenido = `
            <div class="modal-header">
                <h3 class="modal-title">Mover Animales entre Corrales</h3>
                <button class="modal-close" onclick="CorralesSection.cerrarModal('modalMoverMultiples')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="grid-2">
                    <div>
                        <label class="form-label">Corral Origen</label>
                        <select class="form-select" id="corralOrigenMultiple" onchange="CorralesSection.actualizarListaAnimales()">
                            <option value="">Seleccione...</option>
                            ${AppData.corrales.map(c => {
                                const stats = this.calcularStatsCorral(c);
                                return `<option value="${c.id}">${c.nombre} (${stats.cantidad} animales)</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Corral Destino</label>
                        <select class="form-select" id="corralDestinoMultiple">
                            <option value="">Seleccione...</option>
                            ${AppData.corrales.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div id="listaAnimalesAMover" style="margin-top: 20px; max-height: 300px; overflow-y: auto;">
                    <p class="text-center" style="padding: 20px; color: #666;">Seleccione un corral origen para ver los animales</p>
                </div>
                
                <div class="form-group" style="margin-top: 15px;">
                    <label class="form-label">Motivo</label>
                    <select class="form-select" id="motivoMovimientoMultiple">
                        <option value="Reagrupamiento">Reagrupamiento</option>
                        <option value="Sanidad">Sanidad</option>
                        <option value="Engorde">Engorde</option>
                        <option value="Cuarentena">Cuarentena</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="CorralesSection.cerrarModal('modalMoverMultiples')">Cancelar</button>
                <button class="btn btn-primary" onclick="CorralesSection.confirmarMovimientoMultiple()">
                    Mover Seleccionados
                </button>
            </div>
        `;
        
        this.crearModal('modalMoverMultiples', contenido);
    },
    
    actualizarListaAnimales() {
        const corralId = document.getElementById('corralOrigenMultiple').value;
        const container = document.getElementById('listaAnimalesAMover');
        
        if (!corralId) {
            container.innerHTML = '<p class="text-center" style="padding: 20px; color: #666;">Seleccione un corral origen</p>';
            return;
        }
        
        const animales = AppData.animales.filter(a => a.corral === corralId && a.estado !== 'vendido');
        
        if (animales.length === 0) {
            container.innerHTML = '<p class="text-center" style="padding: 20px; color: #666;">No hay animales en este corral</p>';
            return;
        }
        
        container.innerHTML = `
            <div style="margin-bottom: 10px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="seleccionarTodos" onchange="CorralesSection.toggleSeleccionarTodos(this)">
                    <span>Seleccionar todos (${animales.length} animales)</span>
                </label>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;"></th>
                            <th>ID</th>
                            <th>Raza</th>
                            <th>Peso</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${animales.map(a => `
                            <tr>
                                <td><input type="checkbox" class="checkbox-animal" value="${a.id}"></td>
                                <td>${a.id}</td>
                                <td>${a.raza}</td>
                                <td>${a.pesoActual} kg</td>
                                <td>${a.estado}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    toggleSeleccionarTodos(checkbox) {
        document.querySelectorAll('.checkbox-animal').forEach(cb => {
            cb.checked = checkbox.checked;
        });
    },
    
    confirmarMovimientoMultiple() {
        const corralOrigen = document.getElementById('corralOrigenMultiple').value;
        const corralDestino = document.getElementById('corralDestinoMultiple').value;
        const motivo = document.getElementById('motivoMovimientoMultiple').value;
        
        if (!corralOrigen || !corralDestino) {
            UI.showToast('Debe seleccionar corral origen y destino', 'error');
            return;
        }
        
        if (corralOrigen === corralDestino) {
            UI.showToast('El corral origen y destino deben ser diferentes', 'error');
            return;
        }
        
        const seleccionados = Array.from(document.querySelectorAll('.checkbox-animal:checked')).map(cb => cb.value);
        
        if (seleccionados.length === 0) {
            UI.showToast('Debe seleccionar al menos un animal', 'error');
            return;
        }
        
        if (!confirm(`¿Mover ${seleccionados.length} animales de ${this.getNombreCorral(corralOrigen)} a ${this.getNombreCorral(corralDestino)}?`)) {
            return;
        }
        
        if (!AppData.movimientosCorrales) AppData.movimientosCorrales = [];
        
        seleccionados.forEach(animalId => {
            const animal = AppData.animales.find(a => a.id === animalId);
            if (animal) {
                animal.corral = corralDestino;
                
                AppData.movimientosCorrales.unshift({
                    fecha: new Date().toISOString(),
                    animalId: animalId,
                    corralOrigen: corralOrigen,
                    corralDestino: corralDestino,
                    motivo: motivo,
                    responsable: AppState.usuario.nombre
                });
            }
        });
        
        DataManager.save();
        this.cerrarModal('modalMoverMultiples');
        this.render();
        UI.showToast(`${seleccionados.length} animales movidos exitosamente`, 'success');
    },
    
    // Función deprecada - usar abrirMoverDesdeDetalle
    moverAnimalesDelCorral(corralId) {
        this.abrirMoverDesdeDetalle(corralId);
    },
    
    verDistribucionGeneral() {
        const totalAnimales = AppData.animales.filter(a => a.estado !== 'vendido').length;
        const datosCorrales = AppData.corrales.map(c => ({
            nombre: c.nombre,
            cantidad: this.calcularStatsCorral(c).cantidad,
            superficie: c.superficie || 0
        }));
        
        const contenido = `
            <div class="modal-header">
                <h3 class="modal-title">Distribución General de Corrales</h3>
                <button class="modal-close" onclick="CorralesSection.cerrarModal('modalDistribucion')">&times;</button>
            </div>
            <div class="modal-body">
                <div style="height: 300px; position: relative; margin-bottom: 20px;">
                    <canvas id="distribucionChart"></canvas>
                </div>
                
                <div class="grid-3">
                    <div class="stat-card">
                        <div class="stat-value">${totalAnimales}</div>
                        <div class="stat-label">Total Animales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${AppData.corrales.length}</div>
                        <div class="stat-label">Corrales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${(totalAnimales / AppData.corrales.length).toFixed(0)}</div>
                        <div class="stat-label">Prom. por Corral</div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="CorralesSection.cerrarModal('modalDistribucion')">Cerrar</button>
            </div>
        `;
        
        this.crearModal('modalDistribucion', contenido);
        
        // Crear gráfico
        setTimeout(() => {
            new Chart(document.getElementById('distribucionChart'), {
                type: 'doughnut',
                data: {
                    labels: datosCorrales.map(d => d.nombre),
                    datasets: [{
                        data: datosCorrales.map(d => d.cantidad),
                        backgroundColor: CONFIG.chartColors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            });
        }, 100);
    },
    
    initChart() {
        // El gráfico se inicializa en el modal de distribución
    }
};
