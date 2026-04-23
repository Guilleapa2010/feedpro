/**
 * MODAL DE ANIMALES
 */

const AnimalesModal = {
    // HTML del modal
    getHTML() {
        return `
            <div class="modal-overlay" id="animalModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Nuevo Ingreso de Animal</h3>
                        <button class="modal-close" onclick="closeModal('animalModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formAnimal">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">ID/Caravana *</label>
                                    <input type="text" class="form-input" name="idAnimal" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Raza *</label>
                                    <select class="form-select" name="raza" required>
                                        <option value="">Seleccionar...</option>
                                        <option value="Angus">Angus</option>
                                        <option value="Angus Cruzado">Angus Cruzado</option>
                                        <option value="Hereford">Hereford</option>
                                        <option value="Brahman">Brahman</option>
                                        <option value="Braford">Braford</option>
                                        <option value="Brangus">Brangus</option>
                                        <option value="Criollo">Criollo</option>
                                        <option value="Cruzado">Cruzado</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Sexo *</label>
                                    <select class="form-select" name="sexo" required>
                                        <option value="">Seleccionar...</option>
                                        <option value="macho">Macho</option>
                                        <option value="hembra">Hembra</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Peso Entrada (kg) *</label>
                                    <input type="number" class="form-input" name="pesoEntrada" step="0.1" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Fecha Ingreso *</label>
                                    <input type="date" class="form-input" name="fechaIngreso" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Proveedor *</label>
                                    <input type="text" class="form-input" name="proveedor" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Precio Compra ($/kg) *</label>
                                    <input type="number" class="form-input" name="precioCompra" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Corral *</label>
                                    <select class="form-select" name="corral" required>
                                        <option value="">Seleccionar...</option>
                                        <option value="corral1">Corral 1 - Adaptación</option>
                                        <option value="corral2">Corral 2 - Crecimiento</option>
                                        <option value="corral3">Corral 3 - Engorde</option>
                                        <option value="corral4">Corral 4 - Finalización</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeModal('animalModal')">Cancelar</button>
                        <button class="btn btn-primary" onclick="AnimalesModal.guardar()">Guardar Animal</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Guardar animal
    guardar() {
        const form = document.getElementById('formAnimal');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        
        const nuevoAnimal = {
            id: formData.get('idAnimal'),
            raza: formData.get('raza'),
            sexo: formData.get('sexo'),
            pesoEntrada: parseFloat(formData.get('pesoEntrada')),
            pesoActual: parseFloat(formData.get('pesoEntrada')),
            fechaIngreso: formData.get('fechaIngreso'),
            proveedor: formData.get('proveedor'),
            precioCompra: parseFloat(formData.get('precioCompra')),
            corral: formData.get('corral'),
            estado: 'engorde'
        };

        AppData.animales.push(nuevoAnimal);
        DataManager.save();
        
        closeModal('animalModal');
        AnimalesSection.render();
        DashboardSection.render();
        
        UI.showToast('Animal registrado correctamente');
        form.reset();
    },
    
    // HTML del modal de ficha completa
    getFichaHTML() {
        return `
            <div class="modal-overlay" id="fichaAnimalModal">
                <div class="modal modal-xl" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header" style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 40px;">🐂</div>
                            <div>
                                <h3 class="modal-title" style="color: white; margin: 0;">Ficha del Animal</h3>
                                <div style="font-size: 14px; opacity: 0.9;" id="fichaSubtitle">ID: --</div>
                            </div>
                        </div>
                        <button class="modal-close" onclick="AnimalesModal.cerrarFicha()" style="color: white; font-size: 28px;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 0;">
                        <!-- Tabs -->
                        <div style="display: flex; border-bottom: 1px solid var(--border-light); background: #f8f9fa;">
                            <button class="ficha-tab active" onclick="AnimalesModal.switchFichaTab('general')" data-tab="general">
                                📋 General
                            </button>
                            <button class="ficha-tab" onclick="AnimalesModal.switchFichaTab('evolucion')" data-tab="evolucion">
                                📈 Evolución
                            </button>
                            <button class="ficha-tab" onclick="AnimalesModal.switchFichaTab('sanidad')" data-tab="sanidad">
                                💉 Sanidad
                            </button>
                            <button class="ficha-tab" onclick="AnimalesModal.switchFichaTab('economico')" data-tab="economico">
                                💰 Económico
                            </button>
                        </div>
                        
                        <!-- Tab: General -->
                        <div id="ficha-tab-general" class="ficha-tab-content active">
                            <div style="padding: 25px;">
                                <div class="ficha-grid">
                                    <!-- Columna izquierda: Datos principales -->
                                    <div class="ficha-main-info">
                                        <div class="ficha-section-title">Información Principal</div>
                                        <div class="ficha-datos-grid">
                                            <div class="ficha-dato">
                                                <span class="ficha-label">Raza</span>
                                                <span class="ficha-value" id="fichaRaza">--</span>
                                            </div>
                                            <div class="ficha-dato">
                                                <span class="ficha-label">Sexo</span>
                                                <span class="ficha-value" id="fichaSexo">--</span>
                                            </div>
                                            <div class="ficha-dato">
                                                <span class="ficha-label">Estado</span>
                                                <span class="ficha-value" id="fichaEstado">--</span>
                                            </div>
                                            <div class="ficha-dato">
                                                <span class="ficha-label">Corral</span>
                                                <span class="ficha-value" id="fichaCorral">--</span>
                                            </div>
                                            <div class="ficha-dato">
                                                <span class="ficha-label">Fecha Ingreso</span>
                                                <span class="ficha-value" id="fichaFechaIngreso">--</span>
                                            </div>
                                            <div class="ficha-dato">
                                                <span class="ficha-label">Días en Feedlot</span>
                                                <span class="ficha-value" id="fichaDias">--</span>
                                            </div>
                                        </div>
                                        
                                        <div class="ficha-section-title" style="margin-top: 25px;">Proveedor</div>
                                        <div class="ficha-proveedor">
                                            <div style="font-size: 16px; font-weight: 600;" id="fichaProveedor">--</div>
                                            <div style="color: #666; font-size: 13px;" id="fichaPrecioCompra">--</div>
                                        </div>
                                    </div>
                                    
                                    <!-- Columna derecha: Métricas -->
                                    <div class="ficha-metrics">
                                        <div class="ficha-metric-card">
                                            <div class="ficha-metric-icon">⚖️</div>
                                            <div class="ficha-metric-content">
                                                <div class="ficha-metric-value" id="fichaPesoActual">--</div>
                                                <div class="ficha-metric-label">Peso Actual</div>
                                                <div class="ficha-metric-trend" id="fichaPesoTendencia">--</div>
                                            </div>
                                        </div>
                                        
                                        <div class="ficha-metric-card">
                                            <div class="ficha-metric-icon" style="background: #e3f2fd; color: #1976d2;">📊</div>
                                            <div class="ficha-metric-content">
                                                <div class="ficha-metric-value" id="fichaGDP">--</div>
                                                <div class="ficha-metric-label">Ganancia Diaria</div>
                                                <div class="ficha-metric-sub" id="fichaGP">--</div>
                                            </div>
                                        </div>
                                        
                                        <div class="ficha-metric-card">
                                            <div class="ficha-metric-icon" style="background: #e8f5e9; color: #388e3c;">🎯</div>
                                            <div class="ficha-metric-content">
                                                <div class="ficha-metric-value" id="fichaProyeccion">--</div>
                                                <div class="ficha-metric-label">Proyección Venta</div>
                                                <div class="ficha-metric-sub" id="fichaDiasRestantes">--</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab: Evolución -->
                        <div id="ficha-tab-evolucion" class="ficha-tab-content">
                            <div style="padding: 25px;">
                                <div style="height: 300px; margin-bottom: 25px;">
                                    <canvas id="fichaEvolucionChart"></canvas>
                                </div>
                                <div class="ficha-resumen-pesajes">
                                    <div class="ficha-resumen-item">
                                        <span>Peso Inicial</span>
                                        <strong id="fichaPesoInicial">--</strong>
                                    </div>
                                    <div class="ficha-resumen-item">
                                        <span>Peso Actual</span>
                                        <strong id="fichaPesoActual2">--</strong>
                                    </div>
                                    <div class="ficha-resumen-item">
                                        <span>Ganancia Total</span>
                                        <strong id="fichaGananciaTotal">--</strong>
                                    </div>
                                    <div class="ficha-resumen-item">
                                        <span>Último Pesaje</span>
                                        <strong id="fichaUltimoPesaje">--</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab: Sanidad -->
                        <div id="ficha-tab-sanidad" class="ficha-tab-content">
                            <div style="padding: 25px;">
                                <div id="fichaSanidadContent">
                                    <div class="empty-state" style="padding: 40px;">
                                        <div class="empty-state-icon">💉</div>
                                        <h3>Sin tratamientos registrados</h3>
                                        <p>Este animal no tiene historial de sanidad</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab: Económico -->
                        <div id="ficha-tab-economico" class="ficha-tab-content">
                            <div style="padding: 25px;">
                                <div class="ficha-economico-grid">
                                    <div class="ficha-econ-card">
                                        <div class="ficha-econ-label">Inversión Inicial</div>
                                        <div class="ficha-econ-value" id="fichaInversion">--</div>
                                        <div class="ficha-econ-detail" id="fichaInversionDetail">--</div>
                                    </div>
                                    <div class="ficha-econ-card">
                                        <div class="ficha-econ-label">Costo Alimentación (est.)</div>
                                        <div class="ficha-econ-value" id="fichaCostoAlim">--</div>
                                        <div class="ficha-econ-detail">Basado en consumo promedio</div>
                                    </div>
                                    <div class="ficha-econ-card">
                                        <div class="ficha-econ-label">Valor Actual Estimado</div>
                                        <div class="ficha-econ-value" id="fichaValorActual">--</div>
                                        <div class="ficha-econ-detail" id="fichaValorActualDetail">--</div>
                                    </div>
                                    <div class="ficha-econ-card highlight">
                                        <div class="ficha-econ-label">Margen Bruto Estimado</div>
                                        <div class="ficha-econ-value" id="fichaMargen">--</div>
                                        <div class="ficha-econ-detail" id="fichaMargenDetail">--</div>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 25px; padding: 20px; background: #f8f9fa; border-radius: 12px;">
                                    <div style="font-weight: 600; margin-bottom: 15px;">📊 Análisis de Rentabilidad</div>
                                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center;">
                                        <div>
                                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);" id="fichaRoi">--</div>
                                            <div style="font-size: 12px; color: #666;">ROI</div>
                                        </div>
                                        <div>
                                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);" id="fichaCostoKgGanancia">--</div>
                                            <div style="font-size: 12px; color: #666;">Costo/kg Ganancia</div>
                                        </div>
                                        <div>
                                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);" id="fichaConversion">--</div>
                                            <div style="font-size: 12px; color: #666;">Conversión Alimenticia</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer" style="background: #f8f9fa; border-top: 1px solid var(--border-light);">
                        <button class="btn btn-secondary" onclick="AnimalesModal.cerrarFicha()">Cerrar</button>
                        <button class="btn btn-primary" onclick="AnimalesModal.registrarPesajeDesdeFicha()">
                            ⚖️ Registrar Pesaje
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Abrir ficha de animal
    abrirFicha(animalId) {
        const animal = AppData.animales.find(a => a.id === animalId);
        if (!animal) return;
        
        this.currentAnimalId = animalId;
        
        // Crear modal si no existe
        if (!document.getElementById('fichaAnimalModal')) {
            const div = document.createElement('div');
            div.innerHTML = this.getFichaHTML();
            document.body.appendChild(div.firstElementChild);
            this.injectStyles();
        }
        
        this.poblarFicha(animal);
        ModalManager.open('fichaAnimalModal');
    },
    
    // Poblar datos de la ficha
    poblarFicha(animal) {
        const dias = DateUtils.daysBetween(animal.fechaIngreso, DateUtils.today());
        const gdp = parseFloat(Calculators.gdp(animal.pesoActual, animal.pesoEntrada, dias));
        const gananciaTotal = animal.pesoActual - animal.pesoEntrada;
        const pesoObjetivo = 500;
        const diasParaVenta = gdp > 0 ? Math.ceil((pesoObjetivo - animal.pesoActual) / gdp) : '--';
        
        // Info general
        document.getElementById('fichaSubtitle').textContent = `ID: ${animal.id}`;
        document.getElementById('fichaRaza').textContent = animal.raza;
        document.getElementById('fichaSexo').textContent = animal.sexo === 'macho' ? 'Macho' : 'Hembra';
        document.getElementById('fichaCorral').textContent = animal.corral;
        document.getElementById('fichaFechaIngreso').textContent = Formatters.date(animal.fechaIngreso);
        document.getElementById('fichaDias').textContent = `${dias} días`;
        document.getElementById('fichaProveedor').textContent = animal.proveedor;
        document.getElementById('fichaPrecioCompra').textContent = `$${animal.precioCompra.toFixed(2)}/kg de compra`;
        
        // Estado con badge
        const estadoColors = {
            'engorde': { text: 'En Engorde', class: 'badge-info' },
            'finalizado': { text: 'Finalizado', class: 'badge-success' },
            'enfermo': { text: 'En Tratamiento', class: 'badge-danger' },
            'cuarentena': { text: 'Cuarentena', class: 'badge-warning' }
        };
        const estado = estadoColors[animal.estado] || { text: animal.estado, class: 'badge-secondary' };
        document.getElementById('fichaEstado').innerHTML = `<span class="badge ${estado.class}">${estado.text}</span>`;
        
        // Métricas
        document.getElementById('fichaPesoActual').textContent = `${animal.pesoActual} kg`;
        const tendencia = gananciaTotal >= 0 ? '↑' : '↓';
        document.getElementById('fichaPesoTendencia').textContent = `${tendencia} ${Math.abs(gananciaTotal)} kg desde ingreso`;
        document.getElementById('fichaGDP').textContent = `${gdp} kg/día`;
        document.getElementById('fichaGP').textContent = `+${gananciaTotal} kg total`;
        document.getElementById('fichaProyeccion').textContent = `${pesoObjetivo} kg`;
        document.getElementById('fichaDiasRestantes').textContent = typeof diasParaVenta === 'number' 
            ? `~${diasParaVenta} días restantes` 
            : 'No calculable';
        
        // Tab evolución
        document.getElementById('fichaPesoInicial').textContent = `${animal.pesoEntrada} kg`;
        document.getElementById('fichaPesoActual2').textContent = `${animal.pesoActual} kg`;
        document.getElementById('fichaGananciaTotal').textContent = `+${gananciaTotal} kg`;
        document.getElementById('fichaUltimoPesaje').textContent = 'Hoy'; // Simulado
        
        // Renderizar gráfico de evolución
        setTimeout(() => {
            ChartManager.renderEvolucionPeso('fichaEvolucionChart', animal.id);
        }, 100);
        
        // Tab económico
        const inversion = animal.pesoEntrada * animal.precioCompra;
        const costoAlim = dias * 12 * 0.45; // 12kg/día * $0.45/kg (aprox)
        const precioVenta = 3.20; // Precio de venta estimado
        const valorActual = animal.pesoActual * precioVenta;
        const margen = valorActual - inversion - costoAlim;
        const roi = ((valorActual - inversion) / inversion * 100);
        
        document.getElementById('fichaInversion').textContent = Formatters.currency(inversion);
        document.getElementById('fichaInversionDetail').textContent = `${animal.pesoEntrada} kg × $${animal.precioCompra}/kg`;
        document.getElementById('fichaCostoAlim').textContent = Formatters.currency(costoAlim);
        document.getElementById('fichaValorActual').textContent = Formatters.currency(valorActual);
        document.getElementById('fichaValorActualDetail').textContent = `${animal.pesoActual} kg × $${precioVenta}/kg (est.)`;
        document.getElementById('fichaMargen').textContent = Formatters.currency(margen);
        document.getElementById('fichaMargen').style.color = margen >= 0 ? 'var(--success)' : 'var(--danger)';
        document.getElementById('fichaMargenDetail').textContent = margen >= 0 ? 'Rentable' : 'Pérdida estimada';
        
        document.getElementById('fichaRoi').textContent = `${roi.toFixed(1)}%`;
        document.getElementById('fichaRoi').style.color = roi >= 0 ? 'var(--success)' : 'var(--danger)';
        document.getElementById('fichaCostoKgGanancia').textContent = Formatters.currency(costoAlim / gananciaTotal);
        document.getElementById('fichaConversion').textContent = (dias * 12 / gananciaTotal).toFixed(1);
    },
    
    // Cambiar tab en la ficha
    switchFichaTab(tabName) {
        // Desactivar todas las tabs
        document.querySelectorAll('.ficha-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.ficha-tab-content').forEach(c => c.classList.remove('active'));
        
        // Activar tab seleccionada
        document.querySelector(`.ficha-tab[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`ficha-tab-${tabName}`).classList.add('active');
        
        // Si es evolución, asegurar que el gráfico se renderice
        if (tabName === 'evolucion') {
            setTimeout(() => {
                const animal = AppData.animales.find(a => a.id === this.currentAnimalId);
                if (animal) {
                    ChartManager.renderEvolucionPeso('fichaEvolucionChart', animal.id);
                }
            }, 50);
        }
    },
    
    // Registrar pesaje desde la ficha
    registrarPesajeDesdeFicha() {
        this.cerrarFicha();
        setTimeout(() => {
            AnimalesSection.registrarPesaje(this.currentAnimalId);
        }, 300);
    },
    
    // Cerrar ficha
    cerrarFicha() {
        ModalManager.close('fichaAnimalModal');
        ChartManager.destroy('fichaEvolucionChart');
    },
    
    // Inyectar estilos CSS
    injectStyles() {
        if (document.getElementById('ficha-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'ficha-styles';
        styles.textContent = `
            .modal-xl { max-width: 900px !important; }
            
            .ficha-tab {
                flex: 1;
                padding: 15px 20px;
                border: none;
                background: transparent;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #666;
                transition: all 0.2s;
                border-bottom: 3px solid transparent;
            }
            .ficha-tab:hover { background: rgba(139, 69, 19, 0.05); color: var(--primary); }
            .ficha-tab.active { 
                color: var(--primary); 
                border-bottom-color: var(--primary);
                background: white;
            }
            
            .ficha-tab-content { display: none; }
            .ficha-tab-content.active { display: block; }
            
            .ficha-grid {
                display: grid;
                grid-template-columns: 1.2fr 0.8fr;
                gap: 30px;
            }
            
            @media (max-width: 768px) {
                .ficha-grid { grid-template-columns: 1fr; }
            }
            
            .ficha-section-title {
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                color: #999;
                margin-bottom: 15px;
                letter-spacing: 0.5px;
            }
            
            .ficha-datos-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            
            .ficha-dato {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .ficha-label {
                font-size: 12px;
                color: #888;
            }
            
            .ficha-value {
                font-size: 15px;
                font-weight: 600;
                color: #333;
            }
            
            .ficha-proveedor {
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid var(--primary);
            }
            
            .ficha-metrics {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .ficha-metric-card {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                border: 1px solid var(--border-light);
            }
            
            .ficha-metric-icon {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                background: #fff3e0;
                color: var(--primary);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .ficha-metric-content { flex: 1; }
            
            .ficha-metric-value {
                font-size: 24px;
                font-weight: 700;
                color: #333;
            }
            
            .ficha-metric-label {
                font-size: 13px;
                color: #888;
            }
            
            .ficha-metric-trend {
                font-size: 12px;
                color: var(--success);
                font-weight: 500;
            }
            
            .ficha-metric-sub {
                font-size: 12px;
                color: #666;
            }
            
            .ficha-resumen-pesajes {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 12px;
            }
            
            .ficha-resumen-item {
                text-align: center;
            }
            .ficha-resumen-item span {
                display: block;
                font-size: 12px;
                color: #888;
                margin-bottom: 5px;
            }
            .ficha-resumen-item strong {
                font-size: 18px;
                color: #333;
            }
            
            .ficha-economico-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            
            .ficha-econ-card {
                padding: 20px;
                background: white;
                border-radius: 12px;
                border: 1px solid var(--border-light);
            }
            
            .ficha-econ-card.highlight {
                background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
                border-color: var(--primary);
            }
            
            .ficha-econ-label {
                font-size: 12px;
                color: #888;
                margin-bottom: 8px;
            }
            
            .ficha-econ-value {
                font-size: 22px;
                font-weight: 700;
                color: #333;
                margin-bottom: 5px;
            }
            
            .ficha-econ-detail {
                font-size: 12px;
                color: #999;
            }
        `;
        document.head.appendChild(styles);
    }
};