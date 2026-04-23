/**
 * SECCIÓN ADMINISTRACIÓN - Configuración del establecimiento
 * Estilo Cattler - Gestión de empresa, usuarios y parámetros
 */

const AdministracionSection = {
    vistaActual: 'general', // general, usuarios, parametros, backups
    
    render() {
        const section = document.getElementById('administracion');
        
        // Datos del establecimiento
        const config = AppData.config || {};
        
        section.innerHTML = `
            <!-- NAVEGACIÓN -->
            <div class="sanidad-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e9ecef;">
                <button class="tab-btn ${this.vistaActual === 'general' ? 'active' : ''}" onclick="AdministracionSection.cambiarVista('general')">
                    🏢 General
                </button>
                <button class="tab-btn ${this.vistaActual === 'parametros' ? 'active' : ''}" onclick="AdministracionSection.cambiarVista('parametros')">
                    ⚙️ Parámetros
                </button>
                <button class="tab-btn ${this.vistaActual === 'datos' ? 'active' : ''}" onclick="AdministracionSection.cambiarVista('datos')">
                    💾 Datos
                </button>
                <button class="tab-btn ${this.vistaActual === 'acerca' ? 'active' : ''}" onclick="AdministracionSection.cambiarVista('acerca')">
                    ℹ️ Acerca de
                </button>
            </div>

            <!-- CONTENIDO -->
            <div id="administracionContent">
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
            case 'general':
                return this.renderGeneral();
            case 'parametros':
                return this.renderParametros();
            case 'datos':
                return this.renderDatos();
            case 'acerca':
                return this.renderAcerca();
            default:
                return this.renderGeneral();
        }
    },

    // ============ VISTA GENERAL ============
    renderGeneral() {
        const config = AppData.config || {};
        
        return `
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🏢 Información del Establecimiento</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div class="form-group">
                            <label class="form-label">Nombre del Establecimiento</label>
                            <input type="text" class="form-input" id="confNombre" value="${config.nombreEstablecimiento || 'La Esperanza'}">
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Razón Social</label>
                                <input type="text" class="form-input" id="confRazon" value="${config.razonSocial || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">CUIT</label>
                                <input type="text" class="form-input" id="confCuit" value="${config.cuit || ''}" placeholder="00-00000000-0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Dirección</label>
                            <input type="text" class="form-input" id="confDireccion" value="${config.direccion || ''}">
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Localidad</label>
                                <input type="text" class="form-input" id="confLocalidad" value="${config.localidad || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Provincia</label>
                                <input type="text" class="form-input" id="confProvincia" value="${config.provincia || ''}">
                            </div>
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Teléfono</label>
                                <input type="text" class="form-input" id="confTelefono" value="${config.telefono || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" id="confEmail" value="${config.email || ''}">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📊 Características del Feedlot</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Capacidad Total (cabezas)</label>
                                <input type="number" class="form-input" id="confCapacidad" value="${config.capacidad || 5000}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Superficie Total (hectáreas)</label>
                                <input type="number" class="form-input" id="confSuperficie" value="${config.superficie || ''}">
                            </div>
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Cantidad de Corrales</label>
                                <input type="number" class="form-input" id="confCorrales" value="${config.cantidadCorrales || 4}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Capacidad Molino (tn/hora)</label>
                                <input type="number" class="form-input" id="confMolino" value="${config.capacidadMolino || 10}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tipo de Operación</label>
                            <select class="form-select" id="confTipo">
                                <option value="propios" ${config.tipoOperacion === 'propios' ? 'selected' : ''}>Animales propios</option>
                                <option value="consignacion" ${config.tipoOperacion === 'consignacion' ? 'selected' : ''}>En consignación</option>
                                <option value="mixto" ${config.tipoOperacion === 'mixto' ? 'selected' : ''}>Mixto</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Responsable Técnico</label>
                            <input type="text" class="form-input" id="confResponsable" value="${config.responsable || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Matrícula (si aplica)</label>
                            <input type="text" class="form-input" id="confMatricula" value="${config.matricula || ''}">
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🎨 Personalización</h3>
                </div>
                <div style="padding: 20px;">
                    <div class="grid-3">
                        <div class="form-group">
                            <label class="form-label">Color Principal</label>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <input type="color" class="form-input" id="confColor" value="${config.colorPrincipal || '#4a6fa5'}" style="width: 60px; height: 40px; padding: 2px;">
                                <span id="colorValue">${config.colorPrincipal || '#4a6fa5'}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Logo del Establecimiento</label>
                            <input type="file" class="form-input" id="confLogo" accept="image/*">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Moneda</label>
                            <select class="form-select" id="confMoneda">
                                <option value="ARS" ${config.moneda === 'ARS' ? 'selected' : ''}>Peso Argentino ($)</option>
                                <option value="USD" ${config.moneda === 'USD' ? 'selected' : ''}>Dólar Estadounidense (U$S)</option>
                                <option value="BRL" ${config.moneda === 'BRL' ? 'selected' : ''}>Real Brasileño (R$)</option>
                                <option value="UYU" ${config.moneda === 'UYU' ? 'selected' : ''}>Peso Uruguayo ($U)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                <button class="btn btn-secondary" onclick="AdministracionSection.restablecerDefaults()">Restablecer</button>
                <button class="btn btn-primary" onclick="AdministracionSection.guardarConfiguracion()">💾 Guardar Configuración</button>
            </div>
        `;
    },

    // ============ VISTA PARÁMETROS ============
    renderParametros() {
        const config = AppData.config || {};
        
        return `
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🐄 Parámetros Animales</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Peso mínimo de entrada (kg)</label>
                                <input type="number" class="form-input" id="paramPesoMin" value="${config.pesoMinEntrada || 180}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Peso de venta objetivo (kg)</label>
                                <input type="number" class="form-input" id="paramPesoVenta" value="${config.pesoVenta || 500}">
                            </div>
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">GMD esperado (kg/día)</label>
                                <input type="number" class="form-input" id="paramGMD" value="${config.gmdEsperado || 1.4}" step="0.1">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Días en cuarentena</label>
                                <input type="number" class="form-input" id="paramCuarentena" value="${config.diasCuarentena || 7}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">% Mortalidad máxima aceptable</label>
                            <input type="number" class="form-input" id="paramMortalidad" value="${config.mortalidadMax || 2}" step="0.1">
                            <small style="color: #666;">Se generará alerta si se supera este porcentaje</small>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🌾 Parámetros de Alimentación</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">% Consumo MS del peso vivo</label>
                                <input type="number" class="form-input" id="paramConsumoMS" value="${config.porcentajeMS || 2.5}" step="0.1">
                            </div>
                            <div class="form-group">
                                <label class="form-label">% Materia Seca de la dieta</label>
                                <input type="number" class="form-input" id="paramMS" value="${config.msDieta || 80}" step="0.5">
                            </div>
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Sobrante diario permitido (%)</label>
                                <input type="number" class="form-input" id="paramSobrante" value="${config.sobrantePermitido || 3}" step="0.5">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Comidas por día</label>
                                <input type="number" class="form-input" id="paramComidas" value="${config.comidasPorDia || 2}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Horarios de alimentación</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="time" class="form-input" id="paramHora1" value="${config.horaAlimentacion1 || '08:00'}">
                                <input type="time" class="form-input" id="paramHora2" value="${config.horaAlimentacion2 || '16:00'}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">⚠️ Alertas y Notificaciones</h3>
                </div>
                <div style="padding: 20px;">
                    <div class="grid-3">
                        <div class="form-group">
                            <label class="form-label">Stock bajo - días de cobertura</label>
                            <input type="number" class="form-input" id="alertStock" value="${config.alertaStockDias || 7}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tratamientos por vencer (días)</label>
                            <input type="number" class="form-input" id="alertTratamiento" value="${config.alertaTratamiento || 2}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Ocupación máxima corral (%)</label>
                            <input type="number" class="form-input" id="alertOcupacion" value="${config.alertaOcupacion || 90}">
                        </div>
                    </div>
                    <div style="margin-top: 15px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="alertSonido" ${config.alertaSonido !== false ? 'checked' : ''}>
                            <span>Habilitar sonido de alertas</span>
                        </label>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                <button class="btn btn-primary" onclick="AdministracionSection.guardarParametros()">💾 Guardar Parámetros</button>
            </div>
        `;
    },

    // ============ VISTA DATOS ============
    renderDatos() {
        const size = this.calcularTamanoDatos();
        
        return `
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💾 Respaldo y Restauración</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h4 style="margin-bottom: 10px;">Información del Sistema</h4>
                            <p><strong>Animales registrados:</strong> ${(AppData.animales || []).length}</p>
                            <p><strong>Insumos:</strong> ${(AppData.insumos || []).length}</p>
                            <p><strong>Total de datos:</strong> ${size}</p>
                            <p><strong>Último backup:</strong> ${AppData.ultimoBackup || 'Nunca'}</p>
                        </div>

                        <h4 style="margin-bottom: 15px;">Exportar Datos</h4>
                        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                            <button class="btn btn-secondary" onclick="AdministracionSection.exportarJSON()">
                                📄 Exportar todos los datos (JSON)
                            </button>
                            <button class="btn btn-secondary" onclick="AdministracionSection.exportarCSV()">
                                📊 Exportar animales (CSV)
                            </button>
                        </div>

                        <h4 style="margin-bottom: 15px;">Importar Datos</h4>
                        <div class="form-group">
                            <label class="form-label">Seleccione archivo JSON de respaldo:</label>
                            <input type="file" class="form-input" id="importFile" accept=".json">
                        </div>
                        <button class="btn btn-warning" onclick="AdministracionSection.importarJSON()">
                            📥 Importar Datos
                        </button>
                        <p style="color: #666; font-size: 12px; margin-top: 10px;">
                            ⚠️ La importación reemplazará todos los datos actuales. Asegúrese de hacer un respaldo primero.
                        </p>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🗑️ Mantenimiento</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid var(--warning);">
                            <strong>⚠️ Zona de peligro</strong>
                            <p style="margin: 5px 0 0 0; font-size: 13px;">Estas acciones no se pueden deshacer.</p>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button class="btn btn-secondary" onclick="AdministracionSection.limpiarCache()">
                                🧹 Limpiar caché temporal
                            </button>
                            <button class="btn btn-danger" onclick="AdministracionSection.borrarTodosDatos()">
                                🗑️ Borrar TODOS los datos
                            </button>
                        </div>

                        <hr style="margin: 20px 0;">

                        <h4 style="margin-bottom: 15px;">Datos de ejemplo</h4>
                        <button class="btn btn-info" onclick="AdministracionSection.cargarDatosEjemplo()">
                            📦 Cargar datos de ejemplo
                        </button>
                        <p style="color: #666; font-size: 12px; margin-top: 10px;">
                            Carga animales, insumos y tratamientos de prueba para probar el sistema.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    // ============ VISTA ACERCA DE ============
    renderAcerca() {
        return `
            <div class="card" style="max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🐄</div>
                    <h2 style="margin-bottom: 10px;">FeedPro Enterprise</h2>
                    <p style="color: #666; font-size: 18px; margin-bottom: 30px;">Sistema Integral de Gestión de Feedlot</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p><strong>Versión:</strong> 2.0.0 Enterprise</p>
                        <p><strong>Fecha de compilación:</strong> 2024-02-15</p>
                        <p><strong>Licencia:</strong> Comercial</p>
                    </div>

                    <h4 style="margin-bottom: 15px;">Módulos incluidos</h4>
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 30px;">
                        <span class="badge badge-primary">Dashboard</span>
                        <span class="badge badge-primary">Animales</span>
                        <span class="badge badge-primary">Sanidad</span>
                        <span class="badge badge-primary">Insumos</span>
                        <span class="badge badge-primary">Dietas</span>
                        <span class="badge badge-primary">Reparto</span>
                        <span class="badge badge-primary">Reportes</span>
                    </div>

                    <p style="color: #666; font-size: 13px;">
                        © 2024 FeedPro Systems. Todos los derechos reservados.
                    </p>
                    <p style="color: #666; font-size: 12px;">
                        Desarrollado con ❤️ para el sector ganadero
                    </p>
                </div>
            </div>
        `;
    },

    // ============ FUNCIONES DE ACCIÓN ============
    guardarConfiguracion() {
        if (!AppData.config) AppData.config = {};
        
        AppData.config.nombreEstablecimiento = document.getElementById('confNombre').value;
        AppData.config.razonSocial = document.getElementById('confRazon').value;
        AppData.config.cuit = document.getElementById('confCuit').value;
        AppData.config.direccion = document.getElementById('confDireccion').value;
        AppData.config.localidad = document.getElementById('confLocalidad').value;
        AppData.config.provincia = document.getElementById('confProvincia').value;
        AppData.config.telefono = document.getElementById('confTelefono').value;
        AppData.config.email = document.getElementById('confEmail').value;
        AppData.config.capacidad = parseInt(document.getElementById('confCapacidad').value) || 5000;
        AppData.config.superficie = parseFloat(document.getElementById('confSuperficie').value);
        AppData.config.cantidadCorrales = parseInt(document.getElementById('confCorrales').value) || 4;
        AppData.config.capacidadMolino = parseFloat(document.getElementById('confMolino').value) || 10;
        AppData.config.tipoOperacion = document.getElementById('confTipo').value;
        AppData.config.responsable = document.getElementById('confResponsable').value;
        AppData.config.matricula = document.getElementById('confMatricula').value;
        AppData.config.colorPrincipal = document.getElementById('confColor').value;
        AppData.config.moneda = document.getElementById('confMoneda').value;
        
        DataManager.save();
        UI.showToast('Configuración guardada correctamente', 'success');
        
        // Actualizar sidebar
        this.actualizarSidebar();
    },

    guardarParametros() {
        if (!AppData.config) AppData.config = {};
        
        AppData.config.pesoMinEntrada = parseInt(document.getElementById('paramPesoMin').value) || 180;
        AppData.config.pesoVenta = parseInt(document.getElementById('paramPesoVenta').value) || 500;
        AppData.config.gmdEsperado = parseFloat(document.getElementById('paramGMD').value) || 1.4;
        AppData.config.diasCuarentena = parseInt(document.getElementById('paramCuarentena').value) || 7;
        AppData.config.mortalidadMax = parseFloat(document.getElementById('paramMortalidad').value) || 2;
        AppData.config.porcentajeMS = parseFloat(document.getElementById('paramConsumoMS').value) || 2.5;
        AppData.config.msDieta = parseFloat(document.getElementById('paramMS').value) || 80;
        AppData.config.sobrantePermitido = parseFloat(document.getElementById('paramSobrante').value) || 3;
        AppData.config.comidasPorDia = parseInt(document.getElementById('paramComidas').value) || 2;
        AppData.config.horaAlimentacion1 = document.getElementById('paramHora1').value;
        AppData.config.horaAlimentacion2 = document.getElementById('paramHora2').value;
        AppData.config.alertaStockDias = parseInt(document.getElementById('alertStock').value) || 7;
        AppData.config.alertaTratamiento = parseInt(document.getElementById('alertTratamiento').value) || 2;
        AppData.config.alertaOcupacion = parseInt(document.getElementById('alertOcupacion').value) || 90;
        AppData.config.alertaSonido = document.getElementById('alertSonido').checked;
        
        DataManager.save();
        UI.showToast('Parámetros guardados correctamente', 'success');
    },

    actualizarSidebar() {
        const nombreEst = document.querySelector('.establecimiento-info .nombre');
        if (nombreEst) {
            nombreEst.textContent = AppData.config?.nombreEstablecimiento || 'La Esperanza';
        }
        
        const capacidadEst = document.querySelector('.establecimiento-info .capacidad');
        if (capacidadEst) {
            capacidadEst.textContent = `Capacidad: ${AppData.config?.capacidad || 5000} cabezas`;
        }
    },

    restablecerDefaults() {
        if (!confirm('¿Restablecer configuración a valores por defecto?')) return;
        
        AppData.config = {};
        DataManager.save();
        this.render();
        UI.showToast('Configuración restablecida');
    },

    calcularTamanoDatos() {
        const dataStr = JSON.stringify(AppData);
        const bytes = new Blob([dataStr]).size;
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    },

    exportarJSON() {
        const dataStr = JSON.stringify(AppData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedpro_backup_${DateUtils.today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        AppData.ultimoBackup = DateUtils.today();
        DataManager.save();
        UI.showToast('Backup exportado correctamente', 'success');
    },

    exportarCSV() {
        const datos = AppData.animales.map(a => ({
            ID: a.id,
            Raza: a.raza,
            Sexo: a.sexo,
            Peso_Entrada: a.pesoEntrada,
            Peso_Actual: a.pesoActual,
            Fecha_Ingreso: a.fechaIngreso,
            Estado: a.estado,
            Corral: a.corral,
            Proveedor: a.proveedor
        }));
        
        if (datos.length === 0) {
            UI.showToast('No hay animales para exportar', 'error');
            return;
        }
        
        const encabezados = Object.keys(datos[0]).join(';');
        const filas = datos.map(obj => Object.values(obj).join(';')).join('\n');
        const csv = encabezados + '\n' + filas;
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `animales_${DateUtils.today()}.csv`;
        link.click();
    },

    importarJSON() {
        const fileInput = document.getElementById('importFile');
        if (!fileInput.files.length) {
            UI.showToast('Seleccione un archivo', 'error');
            return;
        }
        
        if (!confirm('⚠️ Esto reemplazará TODOS los datos actuales. ¿Continuar?')) return;
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validar estructura básica
                if (!data.animales || !Array.isArray(data.animales)) {
                    throw new Error('Estructura de datos inválida');
                }
                
                // Reemplazar datos
                Object.keys(AppData).forEach(key => delete AppData[key]);
                Object.assign(AppData, data);
                
                DataManager.save();
                UI.showToast('Datos importados correctamente', 'success');
                DashboardSection.render();
            } catch (err) {
                UI.showToast('Error al importar: ' + err.message, 'error');
            }
        };
        
        reader.readAsText(file);
    },

    limpiarCache() {
        localStorage.removeItem('appCache');
        UI.showToast('Caché limpiada');
    },

    borrarTodosDatos() {
        if (!confirm('⚠️ ¿ESTÁ SEGURO? Esta acción eliminará TODOS los datos permanentemente.')) return;
        if (!confirm('¿Realmente desea borrar TODO? Esta acción no se puede deshacer.')) return;
        
        const clave = prompt('Escriba "BORRAR" para confirmar:');
        if (clave !== 'BORRAR') {
            UI.showToast('Operación cancelada', 'error');
            return;
        }
        
        Object.keys(AppData).forEach(key => delete AppData[key]);
        DataManager.save();
        UI.showToast('Todos los datos han sido eliminados', 'success');
        DashboardSection.render();
    },

    cargarDatosEjemplo() {
        if (!confirm('Esto agregará datos de ejemplo. ¿Continuar?')) return;
        
        if (!AppData.animales) AppData.animales = [];
        if (!AppData.insumos) AppData.insumos = [];
        if (!AppData.tratamientos) AppData.tratamientos = [];
        
        // Animales de ejemplo
        for (let i = 1; i <= 10; i++) {
            AppData.animales.push({
                id: `EJ-${String(i).padStart(4, '0')}`,
                raza: ['Angus', 'Hereford', 'Braford'][Math.floor(Math.random() * 3)],
                sexo: Math.random() > 0.5 ? 'Macho' : 'Hembra',
                pesoEntrada: 250 + Math.floor(Math.random() * 100),
                pesoActual: 350 + Math.floor(Math.random() * 100),
                fechaIngreso: DateUtils.addDays(DateUtils.today(), -60 - Math.floor(Math.random() * 60)),
                estado: 'engorde',
                corral: `corral${Math.floor(Math.random() * 4) + 1}`,
                lote: 'Lote-Ejemplo',
                proveedor: 'Proveedor Demo'
            });
        }
        
        // Insumos de ejemplo
        const insumosEjemplo = [
            { nombre: 'Maíz', categoria: 'grano', stock: 50000, costo: 0.45 },
            { nombre: 'Sorgo', categoria: 'grano', stock: 30000, costo: 0.38 },
            { nombre: 'Harina de Soja', categoria: 'proteico', stock: 15000, costo: 0.85 },
            { nombre: 'Sal', categoria: 'mineral', stock: 2000, costo: 0.15 }
        ];
        
        insumosEjemplo.forEach(ie => {
            if (!AppData.insumos.find(i => i.nombre === ie.nombre)) {
                AppData.insumos.push({...ie, unidad: 'kg', stockMinimo: 5000});
            }
        });
        
        DataManager.save();
        this.render();
        DashboardSection.render();
        UI.showToast('Datos de ejemplo cargados', 'success');
    },

    addStyles() {
        if (document.getElementById('adminStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'adminStyles';
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
