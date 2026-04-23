/**
 * SECCIÓN SUMINISTRO - SISTEMA DE LECTURA DE COMEDEROS Y MIXER
 * 
 * BASADO EN SISTEMA SDSU (South Dakota State University) DE BUNK SCORING:
 * 
 * Score 0  : Comedero vacío                        → Aumentar 5-10%
 * Score ½  : Comida dispersa (~5% sobrante)        → Aumentar 5%
 * Score 1  : Capa fina <5cm (5-10% sobrante)       → Mantener
 * Score 2  : Capa media 5-8cm (~25% sobrante)      → Disminuir 5%
 * Score 3  : Capa gruesa >8cm (~50% sobrante)      → Disminuir 10%
 * Score 4  : Comida intacta                        → Disminuir 10-15%
 * 
 * FLUJO DE TRABAJO:
 * 1. Operario inicia sesión de lectura
 * 2. Recorre corrales y registra lectura de cada comedero
 * 3. Sistema calcula ajustes necesarios
 * 4. Sistema arma "receta" del mixer con cantidades exactas
 * 5. Operario prepara en mixer y confirma
 * 6. Sistema indica cuanto suministrar a cada corral
 * 7. Se registra horas de inicio/fin y duración
 */

const SuministroSection = {
    // Sesión actual
    sesion: null,
    
    // Configuración de escala de lecturas (SDSU)
    ESCALA_LECTURA: {
        '0': { 
            nombre: 'Vacío', 
            descripcion: 'Sin alimento visible',
            ajuste: 1.10, // +10%
            color: '#dc3545',
            icono: '⚠️'
        },
        '0.5': { 
            nombre: 'Disperso', 
            descripcion: '~5% sobrante, disperso',
            ajuste: 1.05, // +5%
            color: '#ff9800',
            icono: '🔸'
        },
        '1': { 
            nombre: 'Óptimo', 
            descripcion: 'Capa fina <5cm (5-10% sobrante)',
            ajuste: 1.00, // Sin cambio
            color: '#28a745',
            icono: '✅'
        },
        '2': { 
            nombre: 'Sobrante', 
            descripcion: 'Capa media 5-8cm (~25% sobrante)',
            ajuste: 0.95, // -5%
            color: '#ffc107',
            icono: '⚡'
        },
        '3': { 
            nombre: 'Exceso', 
            descripcion: 'Capa gruesa >8cm (~50% sobrante)',
            ajuste: 0.90, // -10%
            color: '#fd7e14',
            icono: '⬇️'
        },
        '4': { 
            nombre: 'Intacto', 
            descripcion: 'Comida sin tocar',
            ajuste: 0.85, // -15%
            color: '#6f42c1',
            icono: '🚫'
        }
    },
    
    // ========== CÁLCULO DE CONSUMO HISTÓRICO ==========
    
    /**
     * Calcula el consumo histórico por animal para un corral
     * Basado en sesiones anteriores del mismo corral
     * @param {string} corralId - ID del corral
     * @returns {Object|null} { kgPorAnimal: number, sesiones: number, dias: number }
     */
    calcularConsumoHistorico(corralId) {
        if (!corralId || !AppData.sesionesSuministro) return null;
        
        // Buscar sesiones del último mes para este corral
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        
        const sesionesCorral = (AppData.sesionesSuministro || [])
            .filter(s => {
                if (!s?.lecturas) return false;
                const fecha = new Date(s.horaFin || s.horaInicio);
                return fecha >= hace30Dias && 
                       s.lecturas.some(l => l?.corralId === corralId && l?.entregado);
            })
            .slice(0, 10); // Últimas 10 sesiones
        
        if (sesionesCorral.length === 0) return null;
        
        // Calcular promedio de kg por animal
        const kgPorSesion = sesionesCorral.map(s => {
            const lectura = s.lecturas?.find(l => l?.corralId === corralId);
            if (!lectura) return null;
            
            const kgEntregados = parseFloat(lectura.kgAjustados) || 0;
            const cantidadAnimales = parseFloat(lectura.cantidadAnimales) || 1;
            
            return {
                kgPorAnimal: kgEntregados / cantidadAnimales,
                fecha: new Date(s.horaFin || s.horaInicio)
            };
        }).filter(Boolean);
        
        if (kgPorSesion.length === 0) return null;
        
        // Calcular promedio ponderado (más peso a sesiones recientes)
        const pesoTotal = kgPorSesion.reduce((sum, _, idx) => sum + (idx + 1), 0);
        const kgPromedio = kgPorSesion.reduce((sum, s, idx) => {
            const peso = idx + 1; // Peso lineal: sesión más reciente = mayor peso
            return sum + (s.kgPorAnimal * peso);
        }, 0) / pesoTotal;
        
        // Calcular días entre primera y última sesión
        const fechas = kgPorSesion.map(s => s.fecha.getTime()).sort((a, b) => a - b);
        const dias = fechas.length > 1 ? 
            Math.round((fechas[fechas.length - 1] - fechas[0]) / (1000 * 60 * 60 * 24)) : 
            1;
        
        return {
            kgPorAnimal: Math.round(kgPromedio * 100) / 100,
            sesiones: kgPorSesion.length,
            dias: Math.max(dias, 1),
            historial: kgPorSesion.slice(-5) // Últimas 5 mediciones
        };
    },
    
    /**
     * Obtiene el consumo estimado por animal (kg MS/animal/día)
     * Usa consumo histórico si existe, si no usa %PV del corral
     * @param {string} corralId - ID del corral
     * @param {Object} corral - Datos del corral (peso, cantidad, etc.)
     * @param {Object} dieta - Datos de la dieta
     * @returns {Object} { kgPorAnimal: number, metodo: string, fuente: string }
     */
    obtenerConsumoEstimado(corralId, corral, dieta) {
        // 1. Intentar usar consumo histórico
        const historico = this.calcularConsumoHistorico(corralId);
        
        if (historico && historico.sesiones >= 2) {
            return {
                kgPorAnimal: historico.kgPorAnimal,
                metodo: 'historico',
                fuente: `Promedio de ${historico.sesiones} suministros en ${historico.dias} días`,
                detalle: historico
            };
        }
        
        // 2. Si no hay histórico suficiente, usar % de peso vivo (consumoPV)
        const pesoPromedio = parseFloat(corral?.pesoPromedio) || 300;
        const consumoPV = parseFloat(dieta?.consumoPV || dieta?.ms) || 2.5;
        const kgPorAnimal = (pesoPromedio * consumoPV) / 100;
        
        return {
            kgPorAnimal: Math.round(kgPorAnimal * 100) / 100,
            metodo: 'estimado',
            fuente: `${consumoPV}% del peso vivo (${pesoPromedio} kg)`,
            detalle: { pesoPromedio, consumoPV }
        };
    },
    
    render() {
        const section = document.getElementById('suministro');
        
        if (this.sesion && this.sesion.activa) {
            section.innerHTML = this.renderWizard();
        } else {
            section.innerHTML = this.renderDashboard();
        }
    },
    
    // ========== VISTA PRINCIPAL/DASHBOARD ==========
    renderDashboard() {
        return `
            <div class="ordenes-telegram-section">
                <h3>📱 Órdenes desde Telegram</h3>
                <div id="ordenes-telegram">
                    <div class="telegram-empty">
                        <span>📱</span>
                        <p>Cargando órdenes...</p>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white;">
                    <h3 class="card-title" style="color: white;">
                        <div class="card-icon">🚜</div>
                        Sistema de Lectura de Comederos y Mixer
                    </h3>
                </div>
                <div style="padding: 40px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;">
                        <div style="text-align: center;">
                            <div style="font-size: 100px; margin-bottom: 20px;">🌾</div>
                            <h2 style="margin-bottom: 15px; color: var(--dark);">Nueva Sesión de Suministro</h2>
                            <p style="color: #666; margin-bottom: 30px;">
                                Registre las lecturas de comederos, el sistema calculará 
                                la receta del mixer y las cantidades por corral.
                            </p>
                            <button class="btn btn-primary btn-lg" onclick="SuministroSection.iniciarSesion()" 
                                style="padding: 20px 60px; font-size: 20px; box-shadow: 0 10px 30px rgba(139, 69, 19, 0.3);">
                                🚀 INICIAR SESIÓN
                            </button>
                        </div>
                        
                        <div style="background: #f8f9fa; border-radius: 16px; padding: 30px;">
                            <h4 style="margin-bottom: 20px; color: var(--dark);">📋 Guía de Lectura de Comederos</h4>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                ${Object.entries(this.ESCALA_LECTURA).map(([score, data]) => `
                                    <div style="display: flex; align-items: center; gap: 15px; padding: 12px; 
                                                background: white; border-radius: 10px; border-left: 4px solid ${data.color};">
                                        <div style="font-size: 24px;">${data.icono}</div>
                                        <div style="flex: 1;">
                                            <div style="font-weight: 600;">Score ${score} - ${data.nombre}</div>
                                            <div style="font-size: 12px; color: #888;">${data.descripcion}</div>
                                        </div>
                                        <div style="font-weight: 700; color: ${data.color};">
                                            ${data.ajuste > 1 ? '+' : ''}${Math.round((data.ajuste - 1) * 100)}%
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${this.renderHistorial()}
        `;
    },
    
    renderHistorial() {
        const sesiones = AppData.sesionesSuministro || [];
        
        return `
            <div class="card" style="margin-top: 25px;">
                <div class="card-header">
                    <h3 class="card-title">
                        <div class="card-icon">📜</div>
                        Historial de Sesiones
                    </h3>
                    <button class="btn btn-sm btn-secondary" onclick="SuministroSection.verEstadisticas()">
                        📊 Estadísticas
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Inicio</th>
                                <th>Fin</th>
                                <th>Duración</th>
                                <th>Corrales</th>
                                <th>Kg Mixer</th>
                                <th>Operario</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sesiones.length === 0 ? 
                                '<tr><td colspan="8" class="text-center">No hay sesiones registradas</td></tr>' :
                                sesiones.slice(0, 10).map(s => {
                                    const fecha = s?.fecha || '-';
                                    const horaInicio = s?.horaInicio ? new Date(s.horaInicio).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}) : '-';
                                    const horaFin = s?.horaFin ? new Date(s.horaFin).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}) : '-';
                                    const duracion = this.formatearDuracion(s?.duracionMinutos);
                                    const numLecturas = s?.lecturas?.length || 0;
                                    const kgMixer = parseFloat(s?.kgMixerTotal) || 0;
                                    const operario = s?.operario || '-';
                                    const estado = s?.estado || 'En progreso';
                                    return `
                                    <tr>
                                        <td>${fecha}</td>
                                        <td>${horaInicio}</td>
                                        <td>${horaFin}</td>
                                        <td><strong>${duracion}</strong></td>
                                        <td>${numLecturas}</td>
                                        <td><strong>${kgMixer.toFixed(1)} kg</strong></td>
                                        <td>${operario}</td>
                                        <td><span class="badge badge-${estado === 'Completada' ? 'success' : 'warning'}">${estado}</span></td>
                                    </tr>
                                `}).join('')
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    // ========== WIZARD DE 4 PASOS ==========
    renderWizard() {
        const pasos = [
            { num: 1, icon: '⚙️', titulo: 'Configurar' },
            { num: 2, icon: '📋', titulo: 'Lecturas' },
            { num: 3, icon: '🧮', titulo: 'Mixer' },
            { num: 4, icon: '✅', titulo: 'Distribuir' }
        ];
        
        const progreso = ((this.sesion.paso || 1) / 4) * 100;
        
        return `
            <div class="mixer-wizard">
                <!-- Header con timer -->
                <div class="wizard-header" style="background: white; border-radius: 16px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; color: var(--dark);">🚜 Sesión #${this.sesion.id.toString().slice(-4)}</h2>
                            <div style="color: #666; font-size: 14px; margin-top: 5px;">
                                ${this.sesion.fecha} | ${this.sesion.operario}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div id="timerSesion" style="font-size: 36px; font-weight: 700; color: var(--primary); font-family: monospace;">
                                00:00:00
                            </div>
                            <div style="font-size: 12px; color: #888;">Tiempo de sesión</div>
                        </div>
                    </div>
                    
                    <!-- Progress bar -->
                    <div style="margin-top: 25px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            ${pasos.map(p => `
                                <div style="text-align: center; flex: 1; ${p.num === (this.sesion.paso || 1) ? 'font-weight: 700; color: var(--primary);' : 'color: #888;'}">
                                    <div style="font-size: 20px; margin-bottom: 5px;">${p.icono}</div>
                                    <div style="font-size: 12px;">${p.titulo}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${progreso}%; background: linear-gradient(90deg, var(--primary), var(--secondary)); transition: width 0.3s;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Contenido del paso -->
                <div class="wizard-content card" style="min-height: 500px;">
                    ${this.renderPaso()}
                </div>
                
                <!-- Footer con navegación -->
                <div class="wizard-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <button class="btn btn-secondary" onclick="SuministroSection.pasoAnterior()" 
                        style="visibility: ${(this.sesion.paso || 1) > 1 ? 'visible' : 'hidden'};">
                        ← Anterior
                    </button>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-danger" onclick="SuministroSection.cancelarSesion()">
                            ✕ Cancelar
                        </button>
                        ${(this.sesion.paso || 1) < 4 ? `
                            <button class="btn btn-primary" onclick="SuministroSection.siguientePaso()">
                                Siguiente →
                            </button>
                        ` : `
                            <button class="btn btn-success" onclick="SuministroSection.finalizarSesion()">
                                ✅ Finalizar
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderPaso() {
        const paso = this.sesion.paso || 1;
        
        switch(paso) {
            case 1: return this.renderPaso1Configurar();
            case 2: return this.renderPaso2Lecturas();
            case 3: return this.renderPaso3Mixer();
            case 4: return this.renderPaso4Distribuir();
            default: return '';
        }
    },
    
    // ========== PASO 1: CONFIGURAR ==========
    renderPaso1Configurar() {
        return `
            <div style="padding: 40px;">
                <h3 style="margin-bottom: 10px; color: var(--dark);">⚙️ Configuración de la Sesión</h3>
                <p style="color: #666; margin-bottom: 30px;">Configure los parámetros generales antes de comenzar las lecturas.</p>
                
                <div style="max-width: 800px; margin: 0 auto;">
                    <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
                        <div class="form-group">
                            <label class="form-label">Fecha *</label>
                            <input type="date" class="form-input" id="confFecha" value="${this.sesion.fecha}" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Operario/Mixero *</label>
                            <input type="text" class="form-input" id="confOperario" value="${this.sesion.operario}" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Turno *</label>
                            <select class="form-select" id="confTurno" onchange="SuministroSection.onChangeTurno()">
                                <option value="">Seleccionar...</option>
                                <option value="mañana" ${this.sesion.turno === 'mañana' ? 'selected' : ''}>Mañana</option>
                                <option value="tarde" ${this.sesion.turno === 'tarde' ? 'selected' : ''}>Tarde</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Dieta Base *</label>
                            <select class="form-select" id="confDieta" onchange="SuministroSection.onChangeDietaConfig()">
                                <option value="">Seleccionar dieta...</option>
                                ${(AppData.dietas || []).length > 0 ? (AppData.dietas || []).map(d => `
                                    <option value="${d?.id || ''}" ${this.sesion?.dietaId == d?.id ? 'selected' : ''}>
                                        ${d?.nombre || 'Sin nombre'} (${d?.etapa || d?.categoria || 'General'})
                                    </option>
                                `).join('') : '<option value="">No hay dietas disponibles</option>'}
                            </select>
                        </div>
                    </div>
                    
                    <div id="infoDietaConfig" style="margin-top: 25px; ${this.sesion.dietaId ? '' : 'display: none;'}">
                        <div style="background: linear-gradient(135deg, #f8f9fa, #fff); border-radius: 16px; padding: 25px; border: 2px solid var(--border-medium);">
                            <h4 style="margin-bottom: 20px; color: var(--primary);">📋 Información de la Dieta</h4>
                            <div id="dietaConfigDetalle">
                                <!-- Se llena dinámicamente -->
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 12px; border-left: 4px solid #2196f3;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 40px;">💡</div>
                            <div>
                                <div style="font-weight: 600; margin-bottom: 5px;">Próximo paso: Lectura de Comederos</div>
                                <div style="font-size: 14px; color: #666;">
                                    Recorrerá todos los corrales activos y registrará el score de cada comedero 
                                    según los sobrantes observados.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    onChangeDietaConfig() {
        const dietaId = document.getElementById('confDieta')?.value;
        if (!dietaId) {
            const infoEl = document.getElementById('infoDietaConfig');
            if (infoEl) infoEl.style.display = 'none';
            return;
        }
        
        // Buscar la dieta (usar == para comparar string/number)
        const dieta = (AppData.dietas || []).find(d => d && (d.id == dietaId || d.id === dietaId));
        if (!dieta) {
            console.error('Dieta no encontrada:', dietaId);
            UI.showToast('Error: Dieta no encontrada', 'error');
            return;
        }
        
        console.log('Dieta seleccionada:', dieta.nombre, 'Ingredientes:', dieta.ingredientes?.length || 0);
        
        const costoKg = DietasSection.calcularCostoDieta(dieta);
        const nutricion = DietasSection.calcularNutricionTotal(dieta);
        const etapa = dieta?.categoria || 'General';
        const consumoPV = parseFloat(dieta?.ms) || 0;
        const PB = parseFloat(nutricion?.PB) || 0;
        
        const detalleEl = document.getElementById('dietaConfigDetalle');
        if (!detalleEl) return;
        
        detalleEl.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">
                    <div style="font-size: 12px; color: #888; margin-bottom: 5px;">Etapa</div>
                    <div style="font-size: 18px; font-weight: 700; color: var(--primary); text-transform: capitalize;">${etapa}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">
                    <div style="font-size: 12px; color: #888; margin-bottom: 5px;">Materia Seca</div>
                    <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${consumoPV}%</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">
                    <div style="font-size: 12px; color: #888; margin-bottom: 5px;">Proteína</div>
                    <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${PB.toFixed(1)}%</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">
                    <div style="font-size: 12px; color: #888; margin-bottom: 5px;">Costo/kg</div>
                    <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${Formatters.currency(costoKg)}</div>
                </div>
            </div>
            
            <h5 style="margin-bottom: 15px;">Composición de la Dieta</h5>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${(dieta?.ingredientes || []).length > 0 ? (dieta.ingredientes || []).map(ing => {
                    const nombre = ing?.nombre || 'Sin nombre';
                    const porcentaje = parseFloat(ing?.porcentaje) || 0;
                    const costoUnitarioKg = (parseFloat(ing?.costo) || 0) / 1000; // $/ton -> $/kg
                    return `
                        <div style="padding: 10px 15px; background: white; border-radius: 20px; font-size: 13px; border: 1px solid var(--border-light);">
                            <strong>${nombre}</strong>: ${porcentaje}%
                            <span style="color: #888;">(${Formatters.currency(costoUnitarioKg)}/kg)</span>
                        </div>
                    `;
                }).join('') : '<div style="color: #888;">Sin ingredientes definidos</div>'}
            </div>
        `;
        
        document.getElementById('infoDietaConfig').style.display = 'block';
        
        // Guardar en sesión
        this.sesion.dietaId = dietaId;
        this.sesion.dieta = dieta;
    },
    
    onChangeTurno() {
        this.sesion.turno = document.getElementById('confTurno').value;
    },
    
    // ========== PASO 2: LECTURAS DE COMEDEROS ==========
    renderPaso2Lecturas() {
        // Obtener corrales activos (con animales)
        const corralesActivos = this.getCorralesActivos();
        
        return `
            <div style="padding: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <div>
                        <h3 style="margin: 0; color: var(--dark);">📋 Lectura de Comederos</h3>
                        <p style="color: #666; margin: 5px 0 0;">Registre el score de cada comedero según los sobrantes observados</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 24px; font-weight: 700; color: var(--primary);" id="contadorLecturas">
                            ${this.sesion.lecturas ? this.sesion.lecturas.length : 0}/${corralesActivos.length}
                        </div>
                        <div style="font-size: 12px; color: #888;">Completados</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 25px;">
                    <!-- Lista de corrales -->
                    <div>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            ${corralesActivos.length > 0 ? corralesActivos.map(corral => {
                                const corralId = corral?.id || '';
                                const corralCodigo = corral?.codigo || 'C?';
                                const corralNombre = corral?.nombre || 'Sin nombre';
                                const cantidadAnimales = corral?.cantidadAnimales || 0;
                                const pesoPromedio = corral?.pesoPromedio || 0;
                                
                                const lectura = this.sesion?.lecturas?.find(l => l?.corralId === corralId);
                                const completado = !!lectura;
                                const score = lectura?.score;
                                const escalaData = score !== undefined ? this.ESCALA_LECTURA[score] : null;
                                
                                const consumoBase = parseFloat(lectura?.consumoBase) || 0;
                                const kgAjustados = parseFloat(lectura?.kgAjustados) || 0;
                                const ajuste = parseFloat(lectura?.ajuste) || 1;
                                
                                // Obtener consumo histórico para mostrar
                                const historico = !completado ? this.calcularConsumoHistorico(corralId) : null;
                                
                                return `
                                    <div class="corral-lectura-item ${completado ? 'completado' : ''}" 
                                         data-corral="${corralId}"
                                         style="padding: 20px; background: ${completado ? '#e8f5e9' : 'white'}; 
                                                border: 2px solid ${completado ? 'var(--success)' : 'var(--border-light)'}; 
                                                border-radius: 16px; transition: all 0.3s;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                            <div style="display: flex; align-items: center; gap: 15px;">
                                                <div style="width: 50px; height: 50px; background: ${completado ? 'var(--success)' : 'var(--primary)'}; 
                                                            color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center;
                                                            font-size: 20px; font-weight: 700;">
                                                    ${corralCodigo}
                                                </div>
                                                <div>
                                                    <div style="font-weight: 600; font-size: 16px;">${corralNombre}</div>
                                                    <div style="font-size: 13px; color: #888;">
                                                        ${cantidadAnimales} animales | Peso prom: ${pesoPromedio} kg
                                                    </div>
                                                    ${historico ? `
                                                        <div style="font-size: 11px; color: var(--success); margin-top: 3px;">
                                                            📊 Consumo histórico: ${historico.kgPorAnimal.toFixed(1)} kg/animal/día 
                                                            (${historico.sesiones} suministros)
                                                        </div>
                                                    ` : !completado ? `
                                                        <div style="font-size: 11px; color: #ff9800; margin-top: 3px;">
                                                            📐 Sin historial - se usará % del peso vivo
                                                        </div>
                                                    ` : ''}
                                                </div>
                                            </div>
                                            ${completado && escalaData ? `
                                                <div style="text-align: right;">
                                                    <div style="font-size: 28px;">${escalaData.icono}</div>
                                                    <div style="font-size: 12px; color: ${escalaData.color}; font-weight: 600;">
                                                        Score ${score}
                                                    </div>
                                                </div>
                                            ` : '<span class="badge badge-secondary">Pendiente</span>'}
                                        </div>
                                        
                                        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
                                            ${Object.entries(this.ESCALA_LECTURA).map(([scoreVal, data]) => `
                                                <button class="btn-score" data-score="${scoreVal}" data-corral="${corralId}"
                                                    onclick="SuministroSection.registrarLectura('${corralId}', '${scoreVal}')"
                                                    style="padding: 12px 8px; border: 2px solid ${score === scoreVal ? data.color : 'var(--border-light)'}; 
                                                           border-radius: 10px; background: ${score === scoreVal ? data.color + '20' : 'white'};
                                                           cursor: pointer; transition: all 0.2s; text-align: center;">
                                                    <div style="font-size: 20px; margin-bottom: 4px;">${data.icono}</div>
                                                    <div style="font-size: 11px; font-weight: 600; color: ${data.color};">${scoreVal}</div>
                                                </button>
                                            `).join('')}
                                        </div>
                                        
                                        ${completado && escalaData ? `
                                            <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 8px; 
                                                        border-left: 4px solid ${escalaData.color};">
                                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                                    <div>
                                                        <div style="font-size: 11px; color: #666; margin-bottom: 2px;">
                                                            ${lectura?.metodoConsumo === 'historico' 
                                                                ? '📊 Consumo histórico: ' + (lectura?.kgPorAnimal || 0).toFixed(1) + ' kg/animal'
                                                                : '📐 Estimado (%PV): ' + (lectura?.kgPorAnimal || 0).toFixed(1) + ' kg/animal'
                                                            }
                                                        </div>
                                                        <div style="font-size: 11px; color: #888;">Ajuste: ${ajuste > 1 ? '+' : ''}${Math.round((ajuste - 1) * 100)}%</div>
                                                    </div>
                                                    <div style="text-align: right;">
                                                        <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                                                            ${kgAjustados.toFixed(1)} kg
                                                        </div>
                                                        <div style="font-size: 11px; color: #888;">total a suministrar</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('') : '<div style="text-align: center; padding: 40px; color: #888;">No hay corrales activos con animales</div>'}
                        </div>
                    </div>
                    
                    <!-- Panel lateral de resumen -->
                    <div>
                        <div style="position: sticky; top: 20px;">
                            <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; 
                                        border-radius: 16px; padding: 25px; margin-bottom: 20px;">
                                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Total Mixer a Preparar</div>
                                <div style="font-size: 42px; font-weight: 700;" id="totalMixerPreview">
                                    ${(this.calcularTotalMixer() || 0).toFixed(1)} kg
                                </div>
                                <div style="margin-top: 15px; font-size: 13px; opacity: 0.9;">
                                    <div>Corrales: ${this.sesion?.lecturas?.length || 0}/${corralesActivos?.length || 0}</div>
                                    <div>Animales totales: ${corralesActivos?.reduce((sum, c) => sum + (c?.cantidadAnimales || 0), 0) || 0}</div>
                                </div>
                            </div>
                            
                            <div style="background: white; border-radius: 16px; padding: 20px; border: 2px solid var(--border-light);">
                                <h5 style="margin-bottom: 15px;">📊 Resumen por Score</h5>
                                ${Object.entries(this.ESCALA_LECTURA).map(([score, data]) => {
                                    const cantidad = this.sesion.lecturas?.filter(l => l.score === score).length || 0;
                                    if (cantidad === 0) return '';
                                    return `
                                        <div style="display: flex; justify-content: space-between; align-items: center; 
                                                    padding: 10px 0; border-bottom: 1px solid var(--border-light);">
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <span style="font-size: 18px;">${data.icono}</span>
                                                <span>Score ${score}</span>
                                            </div>
                                            <span style="font-weight: 700; color: ${data.color};">${cantidad}</span>
                                        </div>
                                    `;
                                }).join('') || '<div style="color: #888; text-align: center; padding: 20px;">Sin lecturas aún</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    getCorralesActivos() {
        // Definir corrales del sistema
        const corralesDefinidos = [
            { id: 'corral1', codigo: 'C1', nombre: 'Corral 1 - Adaptación', etapa: 'inicio' },
            { id: 'corral2', codigo: 'C2', nombre: 'Corral 2 - Crecimiento', etapa: 'crecimiento' },
            { id: 'corral3', codigo: 'C3', nombre: 'Corral 3 - Engorde', etapa: 'engorde' },
            { id: 'corral4', codigo: 'C4', nombre: 'Corral 4 - Finalización', etapa: 'finalizacion' }
        ];
        
        return corralesDefinidos.map(corral => {
            const animales = (AppData.animales || []).filter(a => 
                a?.corral === corral?.id && 
                a?.estado !== 'finalizado' && 
                a?.estado !== 'vendido'
            );
            
            const cantidadAnimales = animales.length;
            const pesoPromedio = cantidadAnimales > 0 
                ? animales.reduce((sum, a) => sum + (a?.pesoActual || 0), 0) / cantidadAnimales 
                : 0;
            
            return {
                ...corral,
                cantidadAnimales,
                pesoPromedio: Math.round(pesoPromedio)
            };
        }).filter(c => c?.cantidadAnimales > 0);
    },
    
    registrarLectura(corralId, score) {
        if (!this.sesion.lecturas) this.sesion.lecturas = [];
        
        const corral = this.getCorralesActivos().find(c => c.id === corralId);
        if (!corral) return;
        
        // Calcular consumo base
        const dieta = this.sesion?.dieta;
        if (!dieta) {
            UI.showToast('Seleccione una dieta primero', 'error');
            return;
        }
        
        const escala = this.ESCALA_LECTURA?.[score];
        if (!escala) {
            UI.showToast('Score inválido', 'error');
            return;
        }
        
        const cantidadAnimales = corral?.cantidadAnimales || 0;
        
        // OBTENER CONSUMO ESTIMADO: histórico si existe, o %PV si es nuevo
        const estimacion = this.obtenerConsumoEstimado(corralId, corral, dieta);
        const kgPorAnimal = estimacion.kgPorAnimal;
        
        // Consumo base = kg por animal × cantidad de animales
        const consumoBase = kgPorAnimal * cantidadAnimales;
        const ajuste = escala.ajuste || 1;
        const kgAjustados = consumoBase * ajuste;
        
        // Actualizar o agregar lectura
        if (!this.sesion.lecturas) this.sesion.lecturas = [];
        
        const idx = this.sesion.lecturas.findIndex(l => l?.corralId === corralId);
        const lectura = {
            corralId,
            corralNombre: corral?.nombre || 'Sin nombre',
            score,
            cantidadAnimales: cantidadAnimales,
            pesoPromedio: corral?.pesoPromedio || 0,
            consumoBase,
            kgPorAnimal, // Guardar kg por animal para referencia
            metodoConsumo: estimacion.metodo, // 'historico' o 'estimado'
            fuenteConsumo: estimacion.fuente,
            ajuste,
            kgAjustados,
            hora: new Date().toISOString()
        };
        
        if (idx >= 0) {
            this.sesion.lecturas[idx] = lectura;
        } else {
            this.sesion.lecturas.push(lectura);
        }
        
        this.render();
        
        // Mostrar mensaje según método usado
        const msgMetodo = estimacion.metodo === 'historico' 
            ? `📊 Consumo histórico: ${kgPorAnimal.toFixed(1)} kg/animal`
            : `📐 Estimado (%PV): ${kgPorAnimal.toFixed(1)} kg/animal`;
        UI.showToast(`${msgMetodo} - ${corral.nombre} - Score ${score}`, 'success');
    },
    
    calcularTotalMixer() {
        if (!this.sesion?.lecturas) return 0;
        return this.sesion.lecturas.reduce((sum, l) => sum + (parseFloat(l?.kgAjustados) || 0), 0);
    },
    
    // ========== PASO 3: MIXER - RECETA ==========
    renderPaso3Mixer() {
        if (!this.sesion.lecturas || this.sesion.lecturas.length === 0) {
            return `
                <div style="padding: 60px; text-align: center;">
                    <div style="font-size: 60px; margin-bottom: 20px;">⚠️</div>
                    <h3>No hay lecturas registradas</h3>
                    <p style="color: #666; margin-bottom: 25px;">Debe completar las lecturas de comederos antes de preparar el mixer.</p>
                    <button class="btn btn-secondary" onclick="SuministroSection.irAPaso(2)">
                        ← Volver a Lecturas
                    </button>
                </div>
            `;
        }
        
        const totalMixer = this.calcularTotalMixer();
        const dieta = this.sesion.dieta;
        
        // Las dietas guardan los ingredientes en la propiedad 'ingredientes' con 'nombre'
        if (!dieta || !dieta.ingredientes || !Array.isArray(dieta.ingredientes) || dieta.ingredientes.length === 0) {
            return `
                <div style="padding: 60px; text-align: center;">
                    <div style="font-size: 60px; margin-bottom: 20px;">⚠️</div>
                    <h3>Dieta sin ingredientes</h3>
                    <p style="color: #666; margin-bottom: 25px;">La dieta seleccionada no tiene ingredientes configurados.</p>
                </div>
            `;
        }
        
        // Calcular cantidad de cada ingrediente con acumulado para balanza
        let kgAcumulado = 0;
        const ingredientesMixer = (dieta?.ingredientes || []).map(item => {
            const porcentaje = parseFloat(item?.porcentaje) || 0;
            const kgNecesarios = (totalMixer * porcentaje) / 100;
            kgAcumulado += kgNecesarios;
            const nombreIngrediente = item?.nombre || 'Sin nombre';
            const insumo = (AppData.insumos || []).find(i => i?.nombre === nombreIngrediente);
            const costo = insumo ? (parseFloat(insumo.costo) || 0) * kgNecesarios / 1000 : 0;
            
            return {
                ingrediente: nombreIngrediente,
                porcentaje: porcentaje,
                kgNecesarios,
                kgAcumulado,
                costo,
                stockDisponible: insumo ? (parseFloat(insumo.stock) || 0) : 0
            };
        });
        
        const costoTotal = ingredientesMixer.reduce((sum, i) => sum + i.costo, 0);
        
        // Verificar stock
        const faltantes = ingredientesMixer.filter(i => i.kgNecesarios > i.stockDisponible);
        
        return `
            <div style="padding: 30px;">
                <h3 style="margin-bottom: 10px; color: var(--dark);">🧮 Receta del Mixer</h3>
                <p style="color: #666; margin-bottom: 25px;">Cantidades exactas de cada ingrediente para preparar en el mixer</p>
                
                ${faltantes?.length > 0 ? `
                    <div class="alert alert-danger" style="margin-bottom: 25px;">
                        <span>⚠️</span>
                        <div>
                            <strong>Stock insuficiente:</strong>
                            <ul style="margin: 10px 0 0 20px;">
                                ${faltantes.map(f => `<li>${f?.ingrediente || 'Ingrediente'}: necesita ${(parseFloat(f?.kgNecesarios) || 0).toFixed(1)} kg, hay ${(parseFloat(f?.stockDisponible) || 0).toFixed(1)} kg</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                ` : `
                    <div class="alert alert-success" style="margin-bottom: 25px;">
                        <span>✅</span>
                        <div><strong>Stock verificado:</strong> Todos los ingredientes disponibles para la preparación</div>
                    </div>
                `}
                
                <!-- Resumen general -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; 
                                border-radius: 16px; padding: 25px; text-align: center;">
                        <div style="font-size: 36px; font-weight: 700;">${totalMixer.toFixed(1)}</div>
                        <div style="font-size: 13px; opacity: 0.9;">Kg totales mixer</div>
                    </div>
                    <div style="background: white; border: 2px solid var(--primary); border-radius: 16px; padding: 25px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${this.sesion.lecturas.length}</div>
                        <div style="font-size: 13px; color: #888;">Corrales</div>
                    </div>
                    <div style="background: white; border: 2px solid var(--primary); border-radius: 16px; padding: 25px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">
                            ${(this.sesion?.lecturas || []).reduce((sum, l) => sum + (parseFloat(l?.cantidadAnimales) || 0), 0)}
                        </div>
                        <div style="font-size: 13px; color: #888;">Animales</div>
                    </div>
                    <div style="background: white; border: 2px solid var(--primary); border-radius: 16px; padding: 25px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 700; color: var(--success);">${Formatters.currency(costoTotal || 0)}</div>
                        <div style="font-size: 13px; color: #888;">Costo total</div>
                    </div>
                </div>
                
                <!-- Tabla de ingredientes -->
                <div style="background: white; border-radius: 16px; overflow: hidden; border: 2px solid var(--border-light); margin-bottom: 25px;">
                    <div style="background: var(--primary); color: white; padding: 20px;">
                        <h4 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                            <span>📋</span>
                            Orden de Carga de Ingredientes
                        </h4>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f8f9fa;">
                            <tr>
                                <th style="padding: 15px; text-align: left;">Orden</th>
                                <th style="padding: 15px; text-align: left;">Ingrediente</th>
                                <th style="padding: 15px; text-align: center;">%</th>
                                <th style="padding: 15px; text-align: right;">Cantidad (kg)</th>
                                <th style="padding: 15px; text-align: center; background: #e8f5e9;">⚖️ Indicar balanza</th>
                                <th style="padding: 15px; text-align: right;">Stock</th>
                                <th style="padding: 15px; text-align: right;">Costo</th>
                                <th style="padding: 15px; text-align: center;">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ingredientesMixer.length > 0 ? ingredientesMixer.map((item, index) => {
                                const kgNecesarios = parseFloat(item?.kgNecesarios) || 0;
                                const stockDisponible = parseFloat(item?.stockDisponible) || 0;
                                const stockOk = kgNecesarios <= stockDisponible;
                                const costo = parseFloat(item?.costo) || 0;
                                const porcentaje = parseFloat(item?.porcentaje) || 0;
                                const ingredienteNombre = item?.ingrediente || 'Sin nombre';
                                const ingDB = INGREDIENTES_DB?.[ingredienteNombre];
                                
                                return `
                                    <tr style="border-top: 1px solid var(--border-light); ${!stockOk ? 'background: #ffebee;' : ''}">
                                        <td style="padding: 15px; font-weight: 700; color: var(--primary);">${index + 1}</td>
                                        <td style="padding: 15px;">
                                            <div style="font-weight: 600;">${ingredienteNombre}</div>
                                            <div style="font-size: 12px; color: #888;">${ingDB?.categoria || ''}</div>
                                        </td>
                                        <td style="padding: 15px; text-align: center;">${porcentaje}%</td>
                                        <td style="padding: 15px; text-align: right; font-size: 18px; font-weight: 700; color: var(--primary);">
                                            ${kgNecesarios.toFixed(1)} kg
                                        </td>
                                        <td style="padding: 15px; text-align: center; background: ${!stockOk ? '#ffebee' : '#e8f5e9'}; font-size: 18px; font-weight: 700; color: var(--success);">
                                            ${item?.kgAcumulado?.toFixed(1) || kgNecesarios.toFixed(1)} kg
                                        </td>
                                        <td style="padding: 15px; text-align: right; ${!stockOk ? 'color: var(--danger); font-weight: 600;' : ''}">
                                            ${stockDisponible.toFixed(1)} kg
                                        </td>
                                        <td style="padding: 15px; text-align: right;">${Formatters.currency(costo)}</td>
                                        <td style="padding: 15px; text-align: center;">
                                            ${stockOk 
                                                ? '<span class="badge badge-success">✅ OK</span>' 
                                                : '<span class="badge badge-danger">❌ Falta</span>'
                                            }
                                        </td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #888;">Sin ingredientes</td></tr>'}
                        </tbody>
                        <tfoot style="background: #f8f9fa; font-weight: 700;">
                            <tr>
                                <td colspan="3" style="padding: 15px; text-align: right;">TOTAL MIXER</td>
                                <td style="padding: 15px; text-align: right; font-size: 20px; color: var(--primary);">
                                    ${totalMixer.toFixed(1)} kg
                                </td>
                                <td style="padding: 15px; text-align: center; background: #c8e6c9; font-size: 20px; color: var(--success); font-weight: 700;">
                                    ${totalMixer.toFixed(1)} kg
                                </td>
                                <td colspan="2" style="padding: 15px; text-align: right; font-size: 18px;">
                                    ${Formatters.currency(costoTotal || 0)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <!-- Checklist de preparación -->
                <div style="background: #f8f9fa; border-radius: 16px; padding: 25px;">
                    <h4 style="margin-bottom: 20px;">✅ Checklist de Preparación</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        ${ingredientesMixer.length > 0 ? ingredientesMixer.map((item, index) => {
                            const nombre = item?.ingrediente || 'Sin nombre';
                            const kg = parseFloat(item?.kgNecesarios) || 0;
                            return `
                            <label style="display: flex; align-items: center; gap: 12px; padding: 15px; background: white; 
                                          border-radius: 10px; cursor: pointer; border: 2px solid var(--border-light);">
                                <input type="checkbox" class="check-ingrediente" data-ingrediente="${nombre}"
                                       onchange="SuministroSection.actualizarCheckMixer()"
                                       style="width: 22px; height: 22px; accent-color: var(--primary);">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">${index + 1}. ${nombre}</div>
                                    <div style="font-size: 13px; color: #888;">${kg.toFixed(1)} kg</div>
                                    <div style="font-size: 14px; color: var(--success); font-weight: 700; margin-top: 4px;">
                                        ⚖️ Indicar balanza: ${item?.kgAcumulado?.toFixed(1) || kg.toFixed(1)} kg
                                    </div>
                                </div>
                            </label>
                        `}).join('') : '<div style="color: #888; text-align: center;">Sin ingredientes</div>'}
                    </div>
                </div>
                
                ${faltantes.length === 0 ? `
                    <div style="margin-top: 25px; text-align: center;">
                        <button class="btn btn-success btn-lg" onclick="SuministroSection.confirmarPreparacionMixer()"
                            style="padding: 18px 50px; font-size: 18px;">
                            ✅ CONFIRMAR PREPARACIÓN DEL MIXER
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    actualizarCheckMixer() {
        const checks = document.querySelectorAll('.check-ingrediente:checked');
        const total = document.querySelectorAll('.check-ingrediente').length;
        
        if (checks.length === total) {
            UI.showToast('¡Todos los ingredientes verificados!', 'success');
        }
    },
    
    confirmarPreparacionMixer() {
        const checks = document.querySelectorAll('.check-ingrediente:checked');
        const total = document.querySelectorAll('.check-ingrediente').length;
        
        if (checks.length < total) {
            if (!confirm('No ha marcado todos los ingredientes como cargados. ¿Desea continuar de todos modos?')) {
                return;
            }
        }
        
        this.sesion.mixerPreparado = true;
        this.sesion.horaMixerPreparado = new Date().toISOString();
        
        UI.showToast('Mixer preparado correctamente', 'success');
        this.siguientePaso();
    },
    
    // ========== PASO 4: DISTRIBUIR ==========
    renderPaso4Distribuir() {
        const totalMixer = this.calcularTotalMixer();
        
        // Calcular kg restantes en balanza después de cada corral
        let kgRestantes = totalMixer;
        const lecturasConBalance = (this.sesion?.lecturas || []).map(l => {
            const kg = parseFloat(l?.kgAjustados) || 0;
            kgRestantes -= kg;
            return { ...l, kgRestantes: Math.max(0, kgRestantes) };
        });
        
        return `
            <div style="padding: 30px;">
                <h3 style="margin-bottom: 10px; color: var(--dark);">✅ Distribución por Corral</h3>
                <p style="color: #666; margin-bottom: 25px;">Distribuya el alimento preparado según las cantidades indicadas para cada corral</p>
                
                <!-- Resumen del mixer -->
                <div style="background: linear-gradient(135deg, var(--success), #2e7d32); color: white; 
                            border-radius: 16px; padding: 25px; margin-bottom: 30px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center;">
                        <div>
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Mixer Preparado</div>
                            <div style="font-size: 36px; font-weight: 700;">${totalMixer.toFixed(1)} kg</div>
                        </div>
                        <div>
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Corrales a Suministrar</div>
                            <div style="font-size: 36px; font-weight: 700;">${this.sesion.lecturas.length}</div>
                        </div>
                        <div>
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Animales Totales</div>
                            <div style="font-size: 36px; font-weight: 700;">
                                ${this.sesion.lecturas.reduce((sum, l) => sum + l.cantidadAnimales, 0)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Lista de distribución -->
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${lecturasConBalance.length > 0 ? lecturasConBalance.map((lectura, index) => {
                        const corralId = lectura?.corralId || '';
                        const corralNombre = lectura?.corralNombre || 'Sin nombre';
                        const cantidadAnimales = parseFloat(lectura?.cantidadAnimales) || 0;
                        const consumoBase = parseFloat(lectura?.consumoBase) || 0;
                        const kgAjustados = parseFloat(lectura?.kgAjustados) || 0;
                        const ajuste = parseFloat(lectura?.ajuste) || 1;
                        const score = lectura?.score;
                        const entregado = lectura?.entregado || false;
                        const escalaData = score !== undefined ? this.ESCALA_LECTURA?.[score] : null;
                        
                        return `
                        <div class="distribucion-item" data-corral="${corralId}"
                             style="background: white; border: 2px solid var(--border-light); border-radius: 16px; padding: 20px;
                                    ${entregado ? 'background: #e8f5e9; border-color: var(--success);' : ''}">
                            <div style="display: flex; align-items: center; gap: 20px;">
                                <div style="width: 60px; height: 60px; background: ${entregado ? 'var(--success)' : 'var(--primary)'}; 
                                            color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center;
                                            font-size: 28px; font-weight: 700;">
                                    ${index + 1}
                                </div>
                                
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                        <span style="font-size: 18px; font-weight: 600;">${corralNombre}</span>
                                        ${escalaData ? `<span class="badge" style="background: ${escalaData.color}20; 
                                                                             color: ${escalaData.color}; 
                                                                             border: 1px solid ${escalaData.color};">
                                            ${escalaData.icono} Score ${score}
                                        </span>` : ''}
                                        ${lectura?.metodoConsumo === 'historico' 
                                            ? `<span class="badge badge-success" title="${lectura?.fuenteConsumo || ''}">📊 Histórico</span>` 
                                            : `<span class="badge badge-secondary" title="Basado en % del peso vivo">📐 Estimado</span>`
                                        }
                                    </div>
                                    <div style="font-size: 13px; color: #888;">
                                        ${cantidadAnimales} animales | 
                                        ${(lectura?.kgPorAnimal || 0).toFixed(1)} kg/animal |
                                        Ajuste: ${ajuste > 1 ? '+' : ''}${Math.round((ajuste - 1) * 100)}%
                                    </div>
                                </div>
                                
                                <div style="text-align: right; margin-right: 20px;">
                                    <div style="font-size: 32px; font-weight: 700; color: var(--primary);">
                                        ${kgAjustados.toFixed(1)} kg
                                    </div>
                                    <div style="font-size: 12px; color: #888;">a suministrar</div>
                                    <div style="font-size: 14px; font-weight: 700; color: var(--success); margin-top: 6px; padding: 4px 10px; background: #e8f5e9; border-radius: 8px; display: inline-block;">
                                        ⚖️ Quedan: ${(lectura?.kgRestantes !== undefined ? lectura.kgRestantes : 0).toFixed(1)} kg
                                    </div>
                                </div>
                                
                                <button class="btn btn-lg ${entregado ? 'btn-success' : 'btn-primary'}" 
                                        onclick="SuministroSection.marcarEntregado('${corralId}')"
                                        style="min-width: 160px;">
                                    ${entregado ? '✅ Entregado' : 'Marcar Entregado'}
                                </button>
                            </div>
                        </div>
                    `}).join('') : '<div style="text-align: center; padding: 40px; color: #888;">No hay lecturas registradas</div>'}
                </div>
                
                <!-- Progreso de entregas -->
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span style="font-weight: 600;">Progreso de Entregas</span>
                        <span style="font-weight: 700; color: var(--primary);">
                            ${(this.sesion?.lecturas || []).filter(l => l?.entregado).length}/${(this.sesion?.lecturas || []).length}
                        </span>
                    </div>
                    <div style="height: 12px; background: var(--border-light); border-radius: 6px; overflow: hidden;">
                        <div style="height: 100%; width: ${(this.sesion?.lecturas || []).length > 0 ? ((this.sesion.lecturas.filter(l => l?.entregado).length / this.sesion.lecturas.length) * 100) : 0}%; 
                                    background: linear-gradient(90deg, var(--success), #4caf50); transition: width 0.3s;"></div>
                    </div>
                </div>
                
                <!-- Botón finalizar -->
                <div style="margin-top: 30px; text-align: center;">
                    <button class="btn btn-success btn-lg" onclick="SuministroSection.finalizarSesion()"
                        style="padding: 20px 60px; font-size: 20px; ${this.sesion.lecturas.every(l => l.entregado) ? '' : 'opacity: 0.5;'}">
                        ✅ FINALIZAR SESIÓN DE SUMINISTRO
                    </button>
                    ${!this.sesion.lecturas.every(l => l.entregado) ? `
                        <div style="margin-top: 15px; color: #888; font-size: 14px;">
                            Complete todas las entregas para finalizar
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    marcarEntregado(corralId) {
        if (!this.sesion?.lecturas) return;
        const lectura = this.sesion.lecturas.find(l => l?.corralId === corralId);
        if (lectura) {
            lectura.entregado = !lectura.entregado;
            lectura.horaEntrega = lectura.entregado ? new Date().toISOString() : null;
            this.render();
        }
    },
    
    // ========== GESTIÓN DE SESIÓN ==========
    iniciarSesion() {
        this.sesion = {
            id: Date.now(),
            fecha: DateUtils.today(),
            horaInicio: new Date().toISOString(),
            horaFin: null,
            duracionMinutos: 0,
            operario: AppState.usuario?.nombre || 'Operario',
            turno: '',
            dietaId: null,
            dieta: null,
            lecturas: [],
            mixerPreparado: false,
            horaMixerPreparado: null,
            estado: 'En progreso',
            activa: true,
            paso: 1
        };
        
        this.iniciarTimer();
        this.render();
        UI.showToast('Sesión de lectura iniciada', 'success');
    },
    
    siguientePaso() {
        if (!this.sesion) return;
        
        // Validaciones por paso
        if (this.sesion.paso === 1) {
            if (!this.sesion.dietaId) {
                UI.showToast('Seleccione una dieta para continuar', 'error');
                return;
            }
        }
        
        if (this.sesion.paso === 2) {
            if (!this.sesion.lecturas || this.sesion.lecturas.length === 0) {
                UI.showToast('Registre al menos una lectura', 'error');
                return;
            }
        }
        
        if (this.sesion.paso === 3) {
            if (!this.sesion.mixerPreparado) {
                UI.showToast('Confirme la preparación del mixer', 'error');
                return;
            }
        }
        
        if (this.sesion.paso < 4) {
            this.sesion.paso++;
            this.render();
        }
    },
    
    pasoAnterior() {
        if (!this.sesion) return;
        if (this.sesion.paso > 1) {
            this.sesion.paso--;
            this.render();
        }
    },
    
    irAPaso(numero) {
        if (!this.sesion) return;
        this.sesion.paso = numero;
        this.render();
    },
    
    cancelarSesion() {
        if (!confirm('¿Cancelar la sesión? Los datos no guardados se perderán.')) return;
        
        this.detenerTimer();
        this.sesion = null;
        this.render();
        UI.showToast('Sesión cancelada', 'info');
    },
    
    finalizarSesion() {
        if (!(this.sesion?.lecturas || []).every(l => l?.entregado)) {
            if (!confirm('No ha marcado todas las entregas como completadas. ¿Desea finalizar de todos modos?')) {
                return;
            }
        }
        
        const horaFin = new Date();
        const horaInicio = new Date(this.sesion.horaInicio);
        const duracionMinutos = Math.round((horaFin - horaInicio) / 60000);
        
        // Calcular kg totales del mixer
        const kgMixerTotal = this.calcularTotalMixer();
        
        // Finalizar sesión
        this.sesion.horaFin = horaFin.toISOString();
        this.sesion.duracionMinutos = duracionMinutos;
        this.sesion.kgMixerTotal = kgMixerTotal;
        this.sesion.estado = 'Completada';
        this.sesion.activa = false;
        
        // Descontar stock
        if (this.sesion?.dieta?.ingredientes) {
            this.sesion.dieta.ingredientes.forEach(item => {
                const porcentaje = parseFloat(item?.porcentaje) || 0;
                const kgNecesarios = (kgMixerTotal * porcentaje) / 100;
                const nombreIngrediente = item?.nombre || '';
                const insumo = (AppData.insumos || []).find(i => i?.nombre === nombreIngrediente);
                if (insumo) {
                    insumo.stock = (parseFloat(insumo.stock) || 0) - kgNecesarios;
                }
            });
        }
        
        // Guardar
        if (!AppData.sesionesSuministro) AppData.sesionesSuministro = [];
        AppData.sesionesSuministro.unshift({...this.sesion});
        DataManager.save();
        
        this.detenerTimer();
        UI.showToast(`✅ Sesión finalizada. Duración: ${this.formatearDuracion(duracionMinutos)}`, 'success');
        
        this.sesion = null;
        this.render();
    },
    
    // ========== TIMER ==========
    iniciarTimer() {
        this.detenerTimer();
        this.timerInterval = setInterval(() => {
            if (!this.sesion || !this.sesion.horaInicio) return;
            
            const inicio = new Date(this.sesion.horaInicio);
            const ahora = new Date();
            const diff = ahora - inicio;
            
            const horas = Math.floor(diff / 3600000);
            const minutos = Math.floor((diff % 3600000) / 60000);
            const segundos = Math.floor((diff % 60000) / 1000);
            
            const timerEl = document.getElementById('timerSesion');
            if (timerEl) {
                timerEl.textContent = 
                    `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
            }
        }, 1000);
    },
    
    detenerTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    formatearDuracion(minutos) {
        if (!minutos || minutos === 0) return '-';
        if (minutos < 60) return `${minutos} min`;
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas}h ${mins}m`;
    },
    
    // ========== ESTADÍSTICAS ==========
    verEstadisticas() {
        const sesiones = AppData.sesionesSuministro || [];
        if (sesiones.length === 0) {
            UI.showToast('No hay sesiones registradas aún', 'warning');
            return;
        }
        
        const total = sesiones.length;
        const duracionPromedio = total > 0 ? sesiones.reduce((sum, s) => sum + (s?.duracionMinutos || 0), 0) / total : 0;
        const kgTotal = sesiones.reduce((sum, s) => sum + (s?.kgMixerTotal || 0), 0);
        
        // Contar scores más comunes
        const scoresCount = {};
        const totalLecturas = { corrales: 0, animales: 0 };
        
        sesiones.forEach(s => {
            totalLecturas.corrales += s?.lecturas?.length || 0;
            totalLecturas.animales += s?.lecturas?.reduce((sum, l) => sum + (l?.cantidadAnimales || 0), 0) || 0;
            if (s?.lecturas) {
                s.lecturas.forEach(l => {
                    const score = l?.score;
                    if (score !== undefined) {
                        scoresCount[score] = (scoresCount[score] || 0) + 1;
                    }
                });
            }
        });
        
        const scoreMasComun = Object.entries(scoresCount)
            .sort((a, b) => b[1] - a[1])[0];
        
        const scoreInfo = scoreMasComun 
            ? `<span style="color: ${this.ESCALA_LECTURA[scoreMasComun[0]]?.color || '#666'}; font-weight: 700;">
                 Score ${scoreMasComun[0]} (${scoreMasComun[1]} veces)
               </span>` 
            : '<span style="color: #888;">Sin datos</span>';
        
        // Consumo por corral
        const corralesIds = ['corral1', 'corral2', 'corral3', 'corral4'];
        const consumosPorCorral = corralesIds.map(id => {
            const historico = this.calcularConsumoHistorico(id);
            const corral = this.getCorralesActivos().find(c => c.id === id);
            return { id, nombre: corral?.nombre || id, historico };
        }).filter(c => c.historico);
        
        UI.createModal('modalEstadisticas', `
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
                <h2 style="margin: 0; color: var(--dark);">Estadísticas de Suministro</h2>
                <p style="color: #888; margin: 5px 0 0 0;">Análisis histórico de sesiones de alimentación</p>
            </div>
            
            <div class="grid-4" style="margin-bottom: 30px;">
                <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, var(--primary), var(--secondary)); 
                            color: white; border-radius: 16px;">
                    <div style="font-size: 36px; font-weight: 700;">${total}</div>
                    <div style="font-size: 13px; opacity: 0.9;">Sesiones totales</div>
                </div>
                <div style="text-align: center; padding: 25px; background: #f8f9fa; border-radius: 16px;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--info);">${this.formatearDuracion(Math.round(duracionPromedio))}</div>
                    <div style="font-size: 13px; color: #888;">Duración promedio</div>
                </div>
                <div style="text-align: center; padding: 25px; background: #f8f9fa; border-radius: 16px;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--success);">${((kgTotal/1000) || 0).toFixed(1)}</div>
                    <div style="font-size: 13px; color: #888;">Tn distribuidas</div>
                </div>
                <div style="text-align: center; padding: 25px; background: #f8f9fa; border-radius: 16px;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--warning);">${total > 0 ? ((kgTotal / total / 1000) || 0).toFixed(1) : '0.0'}</div>
                    <div style="font-size: 13px; color: #888;">Tn promedio/sesión</div>
                </div>
            </div>
            
            ${consumosPorCorral.length > 0 ? `
            <div style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); border-radius: 16px; padding: 25px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
                    <span>📊</span> Consumo Promedio por Corral
                    <span style="font-size: 12px; color: #666; font-weight: normal;">(últimos 30 días)</span>
                </h4>
                <div style="display: grid; grid-template-columns: repeat(${consumosPorCorral.length}, 1fr); gap: 15px;">
                    ${consumosPorCorral.map(c => `
                        <div style="text-align: center; padding: 20px; background: white; border-radius: 12px;">
                            <div style="font-size: 12px; color: #888; margin-bottom: 5px;">${c.nombre}</div>
                            <div style="font-size: 28px; font-weight: 700; color: var(--success);">${c.historico.kgPorAnimal.toFixed(1)}</div>
                            <div style="font-size: 11px; color: #888;">kg/animal/día</div>
                            <div style="font-size: 11px; color: #aaa; margin-top: 5px;">
                                ${c.historico.sesiones} suministros
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div style="background: #f8f9fa; border-radius: 16px; padding: 25px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
                    <span>📈</span> Distribución de Scores Bunk
                </h4>
                ${Object.entries(scoresCount).length > 0 ? Object.entries(scoresCount).sort((a, b) => b[1] - a[1]).map(([score, cantidad]) => {
                    const totalScores = Object.values(scoresCount).reduce((a,b) => a+b, 0) || 1;
                    const porcentaje = (cantidad / totalScores) * 100;
                    const escala = this.ESCALA_LECTURA?.[score];
                    return `
                        <div style="margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 20px;">${escala?.icono || '⚪'}</span>
                                    <span style="font-weight: 600;">${escala?.nombre || 'Score ' + score}</span>
                                    <span style="font-size: 13px; color: #888;">Score ${score}</span>
                                </div>
                                <strong>${cantidad} lecturas</strong>
                            </div>
                            <div style="height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
                                <div style="height: 100%; width: ${porcentaje}%; 
                                            background: ${escala?.color || '#666'};
                                            border-radius: 5px;"></div>
                            </div>
                        </div>
                    `;
                }).join('') : '<div style="color: #888; text-align: center;">Sin datos de scores</div>'}
            </div>
            
            <div style="text-align: center; padding: 20px; background: #e8f5e9; border-radius: 12px;">
                <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Score más frecuente</div>
                <div style="font-size: 24px;">${scoreInfo}</div>
            </div>
        `, '90%');
    }
};

// Inicializar estilos
const suministroStyles = document.createElement('style');
suministroStyles.textContent = `
    .mixer-wizard {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .wizard-header {
        animation: fadeIn 0.3s ease;
    }
    
    .wizard-content {
        animation: slideUp 0.3s ease;
    }
    
    .corral-lectura-item {
        animation: slideIn 0.3s ease;
    }
    
    .corral-lectura-item.completado {
        animation: pulse 0.5s ease;
    }
    
    .btn-score:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .distribucion-item {
        transition: all 0.3s ease;
    }
    
    .distribucion-item:hover {
        transform: translateX(5px);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(suministroStyles);
