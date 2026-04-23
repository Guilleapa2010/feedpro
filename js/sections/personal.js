/**
 * SECCIÓN: PERSONAL / MANO DE OBRA
 * Gestión del equipo de trabajo del feedlot
 */

const PersonalSection = {
    // Categorías de personal
    CATEGORIAS: {
        'administrativo': { nombre: 'Administrativo', icono: '👔', costoMes: 150000 },
        'encargado': { nombre: 'Encargado/Capataz', icono: '👷', costoMes: 120000 },
        'vaquero': { nombre: 'Vaquero/Operario', icono: '🤠', costoMes: 80000 },
        'mecanico': { nombre: 'Mecánico/Mantenimiento', icono: '🔧', costoMes: 90000 },
        'profesional': { nombre: 'Profesional (Vet/Ing/Agr)', icono: '👨‍⚕️', costoMes: 180000 },
        'temporario': { nombre: 'Temporario/Destajero', icono: '⏱️', costoMes: 60000 }
    },
    
    // Porcentajes de cargas sociales (aproximados Uruguay)
    CARGAS_SOCIALES: {
        bps: 16.5,          // Aporte BPS patronal
        fonasa: 6,          // FONASA
        accidentes: 1,      // Seguro accidentes
        aguinaldo: 8.33,    // Aguinaldo (1/12)
        vacaciones: 8.33,   // Vacaciones proporcionales
        otros: 2            // Otros beneficios
    },
    
    render() {
        this.ensureData();
        
        const container = document.getElementById('personal');
        if (!container) return;
        
        const personal = AppData.personal || [];
        const totalNomina = this.calcularTotalNomina();
        const totalConCargas = this.calcularTotalConCargas();
        
        container.innerHTML = `
            <div class="section-header">
                <h2>👷 Personal y Mano de Obra</h2>
                <button class="btn btn-primary" onclick="PersonalSection.abrirModalNuevo()">
                    <span>➕</span> Agregar Personal
                </button>
            </div>
            
            <!-- RESUMEN DE NÓMINA -->
            <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e3f2fd;">👥</div>
                    <div class="stat-info">
                        <span class="stat-value">${personal.length}</span>
                        <span class="stat-label">Empleados</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e8f5e9;">💵</div>
                    <div class="stat-info">
                        <span class="stat-value">${Formatters.currency(totalNomina)}</span>
                        <span class="stat-label">Nómina Mensual</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fff3e0;">📊</div>
                    <div class="stat-info">
                        <span class="stat-value">${Formatters.currency(totalConCargas)}</span>
                        <span class="stat-label">Con Cargas Sociales</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fce4ec;">📅</div>
                    <div class="stat-info">
                        <span class="stat-value">${Formatters.currency(totalConCargas * 12)}</span>
                        <span class="stat-label">Costo Anual Est.</span>
                    </div>
                </div>
            </div>
            
            <!-- DISTRIBUCIÓN POR CATEGORÍA -->
            <div class="card" style="margin: 20px 0;">
                <h3 style="margin-bottom: 15px;">📊 Distribución por Categoría</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    ${this.renderDistribucionCategorias()}
                </div>
            </div>
            
            <!-- DETALLE DE CARGAS SOCIALES -->
            <div class="card" style="margin: 20px 0;">
                <h3 style="margin-bottom: 15px;">📋 Desglose de Cargas Sociales</h3>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div>
                            <h4 style="margin-bottom: 10px; color: #2e7d32;">💵 Salario Base Total</h4>
                            <div style="font-size: 24px; font-weight: 600;">${Formatters.currency(totalNomina)}</div>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 10px; color: #e65100;">📊 Cargas Sociales</h4>
                            <div style="font-size: 18px;">
                                ${Object.entries(this.CARGAS_SOCIALES).map(([key, pct]) => {
                                    const monto = totalNomina * (pct / 100);
                                    return `
                                        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                                            <span style="text-transform: uppercase; font-size: 12px;">${key}</span>
                                            <span><strong>${pct}%</strong> = ${Formatters.currency(monto)}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd; text-align: center;">
                        <span style="font-size: 14px; color: #666;">Total Cargas Sociales: </span>
                        <span style="font-size: 20px; font-weight: 700; color: #e65100;">
                            ${Object.values(this.CARGAS_SOCIALES).reduce((a, b) => a + b, 0).toFixed(2)}%
                        </span>
                        <span style="font-size: 14px; color: #666; margin-left: 10px;">
                            (${Formatters.currency(totalConCargas - totalNomina)})
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- LISTADO DE PERSONAL -->
            <div class="card">
                <h3 style="margin-bottom: 15px;">👥 Equipo de Trabajo</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Categoría</th>
                                <th>Ingreso</th>
                                <th>Salario Base</th>
                                <th>Con Cargas</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${personal.length === 0 ? `
                                <tr><td colspan="7" style="text-align: center; padding: 40px; color: #888;">
                                    No hay personal registrado. <a href="#" onclick="PersonalSection.abrirModalNuevo()">Agregar empleado</a>
                                </td></tr>
                            ` : personal.map(p => this.renderFilaPersonal(p)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    renderDistribucionCategorias() {
        const personal = AppData.personal || [];
        const porCategoria = {};
        
        personal.forEach(p => {
            if (!porCategoria[p.categoria]) {
                porCategoria[p.categoria] = { cantidad: 0, total: 0 };
            }
            porCategoria[p.categoria].cantidad++;
            porCategoria[p.categoria].total += parseFloat(p.salario) || 0;
        });
        
        return Object.entries(this.CATEGORIAS).map(([key, cat]) => {
            const datos = porCategoria[key] || { cantidad: 0, total: 0 };
            return `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 5px;">${cat.icono}</div>
                    <div style="font-weight: 600; font-size: 14px;">${cat.nombre}</div>
                    <div style="font-size: 24px; font-weight: 700; color: #2e7d32; margin: 10px 0;">
                        ${datos.cantidad}
                    </div>
                    <div style="font-size: 12px; color: #888;">empleados</div>
                    ${datos.cantidad > 0 ? `
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 14px;">
                            ${Formatters.currency(datos.total)}/mes
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },
    
    renderFilaPersonal(p) {
        const cat = this.CATEGORIAS[p.categoria] || { nombre: 'Desconocido', icono: '❓' };
        const conCargas = this.calcularConCargas(p.salario);
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: #e3f2fd; border-radius: 50%; 
                                    display: flex; align-items: center; justify-content: center; font-size: 18px;">
                            ${p.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${p.nombre}</div>
                            <div style="font-size: 12px; color: #666;">${p.documento || 'Sin CI'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span style="font-size: 16px; margin-right: 5px;">${cat.icono}</span>
                    ${cat.nombre}
                </td>
                <td>${DateUtils.format(p.fechaIngreso)}</td>
                <td style="font-weight: 600;">${Formatters.currency(p.salario)}</td>
                <td style="font-weight: 600; color: #e65100;">${Formatters.currency(conCargas)}</td>
                <td>
                    <span class="badge ${p.activo !== false ? 'badge-success' : 'badge-secondary'}">
                        ${p.activo !== false ? '✅ Activo' : '⏸️ Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="PersonalSection.editar(${p.id})" title="Editar">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="PersonalSection.eliminar(${p.id})" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    },
    
    calcularConCargas(salario) {
        const totalCargas = Object.values(this.CARGAS_SOCIALES).reduce((a, b) => a + b, 0);
        return parseFloat(salario) * (1 + totalCargas / 100);
    },
    
    calcularTotalNomina() {
        return (AppData.personal || [])
            .filter(p => p.activo !== false)
            .reduce((sum, p) => sum + (parseFloat(p.salario) || 0), 0);
    },
    
    calcularTotalConCargas() {
        const totalNomina = this.calcularTotalNomina();
        const totalCargas = Object.values(this.CARGAS_SOCIALES).reduce((a, b) => a + b, 0);
        return totalNomina * (1 + totalCargas / 100);
    },
    
    abrirModalNuevo() {
        const content = `
            <div style="padding: 25px; max-height: 85vh; overflow-y: auto;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                        👷
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 22px;">Nuevo Empleado</h3>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Agregar personal al feedlot</p>
                    </div>
                </div>
                
                <form id="formNuevoPersonal" onsubmit="PersonalSection.guardar(event)">
                    <div class="form-row">
                        <div class="form-group" style="flex: 2;">
                            <label>Nombre Completo *</label>
                            <input type="text" id="persNombre" class="form-input" required placeholder="Ej: Juan Pérez">
                        </div>
                        <div class="form-group">
                            <label>Documento (CI)</label>
                            <input type="text" id="persDocumento" class="form-input" placeholder="Ej: 1.234.567-8">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Categoría *</label>
                            <select id="persCategoria" class="form-select" required onchange="PersonalSection.actualizarSalarioSugerido()">
                                <option value="">Seleccione...</option>
                                ${Object.entries(this.CATEGORIAS).map(([key, cat]) => `
                                    <option value="${key}" data-sueldo="${cat.costoMes}">${cat.icono} ${cat.nombre}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fecha de Ingreso *</label>
                            <input type="date" id="persFechaIngreso" class="form-input" value="${DateUtils.today()}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Salario Base Mensual ($) *</label>
                            <input type="number" id="persSalario" class="form-input" min="0" step="1000" required>
                            <small style="color: #888; font-size: 11px;">Sugerencia según categoría</small>
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" id="persTelefono" class="form-input" placeholder="Ej: 099 123 456">
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label>Observaciones</label>
                        <textarea id="persObservaciones" class="form-input" rows="2" placeholder="Funciones específicas, horarios, etc."></textarea>
                    </div>
                    
                    <!-- Preview de costo total -->
                    <div style="background: #fff3e0; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 14px;">💰 Estimación de Costo Total</h4>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 12px; color: #666;">Salario Base</div>
                                <div style="font-size: 18px; font-weight: 600;">$<span id="previewSalario">0</span></div>
                            </div>
                            <div style="font-size: 24px; color: #888;">+</div>
                            <div>
                                <div style="font-size: 12px; color: #666;">Cargas Sociales (${Object.values(this.CARGAS_SOCIALES).reduce((a,b)=>a+b,0).toFixed(2)}%)</div>
                                <div style="font-size: 18px; font-weight: 600; color: #e65100;">$<span id="previewCargas">0</span></div>
                            </div>
                            <div style="font-size: 24px; color: #888;">=</div>
                            <div>
                                <div style="font-size: 12px; color: #666;">Costo Total Mensual</div>
                                <div style="font-size: 22px; font-weight: 700; color: #2e7d32;">$<span id="previewTotal">0</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="QuickActions.cerrarTodosLosModales()">Cancelar</button>
                        <button type="submit" class="btn btn-success">💾 Guardar Empleado</button>
                    </div>
                </form>
            </div>
        `;
        
        QuickActions.crearYAbrirModal('modalNuevoPersonal', content, '600px');
        
        // Actualizar preview en tiempo real
        setTimeout(() => {
            document.getElementById('persSalario')?.addEventListener('input', () => this.actualizarPreview());
        }, 100);
    },
    
    actualizarSalarioSugerido() {
        const select = document.getElementById('persCategoria');
        const salarioInput = document.getElementById('persSalario');
        
        if (select && salarioInput && select.value) {
            const cat = this.CATEGORIAS[select.value];
            salarioInput.value = cat.costoMes;
            this.actualizarPreview();
        }
    },
    
    actualizarPreview() {
        const salario = parseFloat(document.getElementById('persSalario')?.value) || 0;
        const totalCargas = Object.values(this.CARGAS_SOCIALES).reduce((a, b) => a + b, 0);
        const cargas = salario * (totalCargas / 100);
        const total = salario + cargas;
        
        const elSalario = document.getElementById('previewSalario');
        const elCargas = document.getElementById('previewCargas');
        const elTotal = document.getElementById('previewTotal');
        
        if (elSalario) elSalario.textContent = Formatters.currency(salario);
        if (elCargas) elCargas.textContent = Formatters.currency(cargas);
        if (elTotal) elTotal.textContent = Formatters.currency(total);
    },
    
    guardar(e) {
        e.preventDefault();
        
        const personal = {
            id: Date.now(),
            nombre: document.getElementById('persNombre').value,
            documento: document.getElementById('persDocumento').value,
            categoria: document.getElementById('persCategoria').value,
            fechaIngreso: document.getElementById('persFechaIngreso').value,
            salario: parseFloat(document.getElementById('persSalario').value) || 0,
            telefono: document.getElementById('persTelefono').value,
            observaciones: document.getElementById('persObservaciones').value,
            activo: true,
            fechaRegistro: new Date().toISOString()
        };
        
        if (!AppData.personal) AppData.personal = [];
        AppData.personal.push(personal);
        
        // Guardar
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('feedpro-data', JSON.stringify(AppData));
        }
        
        QuickActions.cerrarTodosLosModales();
        UI.showToast('✅ Empleado registrado correctamente', 'success');
        this.render();
    },
    
    editar(id) {
        UI.showToast('Función de edición en desarrollo', 'info');
    },
    
    eliminar(id) {
        if (!confirm('¿Eliminar este empleado?')) return;
        
        AppData.personal = (AppData.personal || []).filter(p => p.id !== id);
        
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('feedpro-data', JSON.stringify(AppData));
        }
        
        UI.showToast('Empleado eliminado', 'success');
        this.render();
    },
    
    ensureData() {
        if (!AppData.personal) AppData.personal = [];
    },
    
    // Obtener costo total de personal (para usar en gastos)
    getCostoMensual() {
        return this.calcularTotalConCargas();
    }
};

window.PersonalSection = PersonalSection;
