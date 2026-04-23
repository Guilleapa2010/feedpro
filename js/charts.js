/**
 * CHARTS.JS - Gestión Centralizada de Gráficos
 * FeedPro Enterprise v2.0
 */

const ChartManager = {
    // Almacén de instancias de gráficos
    instances: {},
    
    /**
     * Inicializa un gráfico de línea
     */
    createLineChart(canvasId, labels, datasets, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        // Destruir instancia previa si existe
        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }
        
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: options.showLegend !== false,
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: '#2C1810',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: options.beginAtZero !== false,
                    grid: { borderDash: [5, 5] }
                },
                x: { 
                    grid: { display: false }
                }
            }
        };
        
        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets.map((ds, index) => ({
                    label: ds.label || 'Dataset ' + (index + 1),
                    data: ds.data,
                    borderColor: ds.color || CONFIG.chartColors[index % CONFIG.chartColors.length],
                    backgroundColor: ds.fill ? (ds.backgroundColor || this.hexToRgba(CONFIG.chartColors[index % CONFIG.chartColors.length], 0.1)) : 'transparent',
                    borderWidth: ds.borderWidth || 2,
                    tension: ds.tension || 0.4,
                    fill: ds.fill || false,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: ds.color || CONFIG.chartColors[index % CONFIG.chartColors.length],
                    pointRadius: ds.pointRadius || 4
                }))
            },
            options: { ...defaultOptions, ...options }
        });
        
        return this.instances[canvasId];
    },
    
    /**
     * Inicializa un gráfico de barras
     */
    createBarChart(canvasId, labels, datasets, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }
        
        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets.map((ds, index) => ({
                    label: ds.label,
                    data: ds.data,
                    backgroundColor: ds.color || CONFIG.chartColors[index % CONFIG.chartColors.length],
                    borderRadius: 6,
                    borderSkipped: false
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: datasets.length > 1 }
                },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                    x: { grid: { display: false } }
                },
                ...options
            }
        });
        
        return this.instances[canvasId];
    },
    
    /**
     * Inicializa un gráfico circular/doughnut
     */
    createDoughnutChart(canvasId, labels, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }
        
        const colors = options.colors || CONFIG.chartColors.slice(0, data.length);
        
        this.instances[canvasId] = new Chart(ctx, {
            type: options.type || 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: options.cutout || '70%',
                plugins: {
                    legend: {
                        position: options.legendPosition || 'right',
                        labels: { 
                            boxWidth: 12, 
                            font: { size: 11 },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                ...options
            }
        });
        
        return this.instances[canvasId];
    },
    
    /**
     * Actualiza datos de un gráfico existente
     */
    updateChart(canvasId, newData) {
        const chart = this.instances[canvasId];
        if (!chart) return;
        
        if (newData.labels) chart.data.labels = newData.labels;
        if (newData.datasets) {
            newData.datasets.forEach((ds, index) => {
                if (chart.data.datasets[index]) {
                    chart.data.datasets[index].data = ds.data;
                }
            });
        }
        chart.update('active');
    },
    
    /**
     * Destruye un gráfico específico
     */
    destroy(canvasId) {
        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
            delete this.instances[canvasId];
        }
    },
    
    /**
     * Destruye todos los gráficos
     */
    destroyAll() {
        Object.keys(this.instances).forEach(id => this.destroy(id));
    },
    
    /**
     * Utilidad: Convierte hex a rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    /**
     * Genera datos para gráfico de consumo semanal
     */
    getConsumoSemanalData() {
        // Datos simulados - en producción vendrían de AppData.suministros
        return {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Consumo (kg)',
                data: this.generarDatosConsumo(),
                color: '#8B4513',
                fill: true
            }]
        };
    },
    
    /**
     * Genera datos de consumo simulados basados en cantidad de animales
     */
    generarDatosConsumo() {
        const totalAnimales = AppData.animales.filter(a => a.estado !== 'finalizado').length;
        const consumoBase = totalAnimales * 12; // 12 kg por animal aprox
        return Array.from({length: 7}, () => 
            Math.round(consumoBase + (Math.random() - 0.5) * consumoBase * 0.1)
        );
    },
    
    /**
     * Genera datos para gráfico de distribución por razas
     */
    getRazasDistributionData() {
        const conteo = {};
        AppData.animales.forEach(a => {
            if (a.estado !== 'finalizado') {
                conteo[a.raza] = (conteo[a.raza] || 0) + 1;
            }
        });
        
        if (Object.keys(conteo).length === 0) {
            return { labels: ['Sin datos'], data: [1] };
        }
        
        return {
            labels: Object.keys(conteo),
            data: Object.values(conteo)
        };
    },
    
    /**
     * Gráfico de evolución de peso de un animal
     */
    renderEvolucionPeso(canvasId, animalId) {
        const animal = AppData.animales.find(a => a.id === animalId);
        if (!animal) return null;
        
        // Simulación de historial de pesos - en producción sería AppData.pesajes
        const historial = this.simularHistorialPesos(animal);
        
        return this.createLineChart(canvasId, 
            historial.fechas,
            [{
                label: 'Peso (kg)',
                data: historial.pesos,
                color: '#228B22',
                fill: false
            }],
            { showLegend: false }
        );
    },
    
    /**
     * Simula historial de pesos para demo
     */
    simularHistorialPesos(animal) {
        const fechas = [];
        const pesos = [];
        const dias = DateUtils.daysBetween(animal.fechaIngreso, DateUtils.today());
        const intervalo = Math.max(7, Math.floor(Math.max(dias, 1) / 10));

        let pesoActual = animal.pesoEntrada;
        const gdp = dias > 0 ? (animal.pesoActual - animal.pesoEntrada) / dias : 0;
        
        for (let i = 0; i <= dias; i += intervalo) {
            const fecha = DateUtils.addDays(animal.fechaIngreso, i);
            fechas.push(new Date(fecha).toLocaleDateString('es-ES', {day: '2-digit', month: 'short'}));
            pesos.push(Math.round(pesoActual + gdp * i));
        }
        
        return { fechas, pesos };
    },
    
    /**
     * Gráfico comparativo de costos de dietas
     */
    renderComparacionDietas(canvasId, dietas) {
        const labels = dietas.map(d => d.nombre);
        const costos = dietas.map(d => DietasSection.calcularCostoDieta(d));
        const proteinas = dietas.map(d => DietasSection.calcularNutricionTotal(d).PB);
        
        return this.createBarChart(canvasId, labels, [
            { label: 'Costo ($/kg)', data: costos, color: '#8B4513' },
            { label: 'Proteína (%)', data: proteinas, color: '#CD853F' }
        ]);
    }
};

// Exponer globalmente para compatibilidad
window.ChartManager = ChartManager;
