/**
 * DATOS DE DEMOSTRACIÓN - FeedPro
 * Genera datos de ejemplo para visualizar el sistema completo
 */

const DemoData = {
    
    cargar() {
        if (!confirm('¿Cargar datos de demostración? Esto agregará información de ejemplo al sistema.')) {
            return;
        }
        
        console.log('[Demo] Cargando datos de ejemplo...');
        
        // Asegurar estructura de datos
        this.inicializarEstructura();
        
        // Cargar datos en orden
        this.cargarCorrales();
        this.cargarInsumos();
        this.cargarProveedores();
        this.cargarPersonal();
        this.cargarDietas();
        this.cargarAnimales();
        this.cargarCompras();
        this.cargarVentas();
        this.cargarTratamientos();
        this.cargarMovimientosInsumos();
        this.cargarProyecciones();
        
        // Guardar
        this.guardar();
        
        UI.showToast('✅ Datos de demostración cargados correctamente', 'success');
        console.log('[Demo] Datos cargados');
        
        // Recargar vista actual
        if (typeof Navigation !== 'undefined' && Navigation.renderSection) {
            Navigation.renderSection(AppState.currentSection);
        }
    },
    
    inicializarEstructura() {
        if (!AppData.corrales) AppData.corrales = [];
        if (!AppData.insumos) AppData.insumos = [];
        if (!AppData.proveedores) AppData.proveedores = [];
        if (!AppData.personal) AppData.personal = [];
        if (!AppData.dietas) AppData.dietas = [];
        if (!AppData.animales) AppData.animales = [];
        if (!AppData.compras) AppData.compras = [];
        if (!AppData.ventas) AppData.ventas = [];
        if (!AppData.tratamientos) AppData.tratamientos = [];
        if (!AppData.movimientosInsumos) AppData.movimientosInsumos = [];
        if (!AppData.ordenesCompra) AppData.ordenesCompra = [];
    },
    
    cargarCorrales() {
        const corralesBase = [
            { id: 'corral1', nombre: 'Corral 1 - Adaptación', largo: 35, ancho: 25, comederoLargo: 12, comederoAncho: 3 },
            { id: 'corral2', nombre: 'Corral 2 - Crecimiento', largo: 40, ancho: 30, comederoLargo: 15, comederoAncho: 3 },
            { id: 'corral3', nombre: 'Corral 3 - Engorde', largo: 45, ancho: 35, comederoLargo: 18, comederoAncho: 3.5 },
            { id: 'corral4', nombre: 'Corral 4 - Finalización', largo: 40, ancho: 30, comederoLargo: 15, comederoAncho: 3 }
        ];
        
        corralesBase.forEach(c => {
            if (!AppData.corrales.find(ex => ex.id === c.id)) {
                AppData.corrales.push({
                    ...c,
                    superficie: (c.largo || 0) * (c.ancho || 0),
                    superficieComedero: (c.comederoLargo || 0) * (c.comederoAncho || 0),
                    animales: [],
                    nivelComedero: 85,
                    ultimaRecarga: new Date().toISOString()
                });
            }
        });
    },
    
    cargarInsumos() {
        const insumosBase = [
            { id: 'INS1', nombre: 'Maíz', categoria: 'alimento', stock: 15000, unidad: 'kg', stockMinimo: 5000, costo: 28 },
            { id: 'INS2', nombre: 'Sorgo', categoria: 'alimento', stock: 8000, unidad: 'kg', stockMinimo: 3000, costo: 24 },
            { id: 'INS3', nombre: 'Harina de Soja', categoria: 'alimento', stock: 6000, unidad: 'kg', stockMinimo: 2000, costo: 65 },
            { id: 'INS4', nombre: 'Expeller de Soja', categoria: 'alimento', stock: 4000, unidad: 'kg', stockMinimo: 1500, costo: 45 },
            { id: 'INS5', nombre: 'Sal Mineral', categoria: 'suplemento', stock: 1200, unidad: 'kg', stockMinimo: 500, costo: 35 },
            { id: 'INS6', nombre: 'Premezcla Vitaminica', categoria: 'suplemento', stock: 800, unidad: 'kg', stockMinimo: 300, costo: 180 },
            { id: 'INS7', nombre: 'Diesel', categoria: 'combustible', stock: 2500, unidad: 'litros', stockMinimo: 1000, costo: 58 },
            { id: 'INS8', nombre: 'Repuestos Vehículos', categoria: 'mantenimiento', stock: 50, unidad: 'un', stockMinimo: 20, costo: 2500 },
            { id: 'INS9', nombre: 'Herramientas', categoria: 'mantenimiento', stock: 30, unidad: 'un', stockMinimo: 10, costo: 3500 },
            { id: 'INS10', nombre: 'Vacuna Clostridial', categoria: 'salud', stock: 200, unidad: 'dosis', stockMinimo: 100, costo: 120 },
            { id: 'INS11', nombre: 'Antibiótico Genérico', categoria: 'salud', stock: 150, unidad: 'ml', stockMinimo: 50, costo: 85 }
        ];
        
        insumosBase.forEach(ins => {
            if (!AppData.insumos.find(ex => ex.nombre === ins.nombre)) {
                AppData.insumos.push(ins);
            }
        });
    },
    
    cargarProveedores() {
        const proveedoresBase = [
            { id: 1, nombre: 'NutriFeed SA', contacto: 'Juan Rodriguez', telefono: '099 123 456', email: 'ventas@nutrifeed.com', activo: true },
            { id: 2, nombre: 'AgroServicios del Este', contacto: 'Maria Gonzalez', telefono: '098 765 432', email: 'info@agroeste.com', activo: true },
            { id: 3, nombre: 'Veterinaria Los Prados', contacto: 'Dr. Carlos Martinez', telefono: '097 111 222', email: 'vet@losprados.com', activo: true },
            { id: 4, nombre: 'Shell Station 245', contacto: 'Pedro Silva', telefono: '096 333 444', email: '', activo: true },
            { id: 5, nombre: 'Ferretería Industrial', contacto: 'Ana Pereira', telefono: '095 555 666', email: 'ferretera@industrial.com', activo: true }
        ];
        
        proveedoresBase.forEach(prov => {
            if (!AppData.proveedores.find(ex => ex.nombre === prov.nombre)) {
                AppData.proveedores.push(prov);
            }
        });
    },
    
    cargarPersonal() {
        const personalBase = [
            { id: 1, nombre: 'Carlos Rodriguez', documento: '2.456.789-0', categoria: 'encargado', fechaIngreso: '2023-01-15', salario: 125000, activo: true },
            { id: 2, nombre: 'Juan Perez', documento: '3.123.456-7', categoria: 'vaquero', fechaIngreso: '2023-02-01', salario: 85000, activo: true },
            { id: 3, nombre: 'Pedro Gonzalez', documento: '2.987.654-3', categoria: 'vaquero', fechaIngreso: '2023-03-10', salario: 85000, activo: true },
            { id: 4, nombre: 'Maria Silva', documento: '4.567.890-1', categoria: 'administrativo', fechaIngreso: '2023-01-05', salario: 155000, activo: true },
            { id: 5, nombre: 'Luis Martinez', documento: '3.789.012-5', categoria: 'mecanico', fechaIngreso: '2023-04-20', salario: 95000, activo: true },
            { id: 6, nombre: 'Ana Rodriguez', documento: '5.012.345-6', categoria: 'profesional', fechaIngreso: '2023-06-01', salario: 185000, activo: true }
        ];
        
        personalBase.forEach(emp => {
            if (!AppData.personal.find(ex => ex.documento === emp.documento)) {
                AppData.personal.push(emp);
            }
        });
    },
    
    cargarDietas() {
        const dietasBase = [
            {
                id: 'DIETA1',
                nombre: 'Dieta Inicio',
                categoria: 'inicio',
                ms: 82,
                costo: 0.42,
                ingredientes: [
                    { nombre: 'Maíz Rolado', porcentaje: 45, kg: 450 },
                    { nombre: 'Sorgo', porcentaje: 25, kg: 250 },
                    { nombre: 'Harina de Soja', porcentaje: 15, kg: 150 },
                    { nombre: 'Silo de Maíz', porcentaje: 10, kg: 100 },
                    { nombre: 'Sal Mineral', porcentaje: 3, kg: 30 },
                    { nombre: 'Premezcla Mineral', porcentaje: 2, kg: 20 }
                ],
                nutricion: { PB: 14.5, EM: 3.05, FC: 4.2, Ca: 0.45, P: 0.32, NDT: 72 }
            },
            {
                id: 'DIETA2',
                nombre: 'Dieta Crecimiento',
                categoria: 'crecimiento',
                ms: 85,
                costo: 0.48,
                ingredientes: [
                    { nombre: 'Maíz Rolado', porcentaje: 55, kg: 550 },
                    { nombre: 'Harina de Soja', porcentaje: 20, kg: 200 },
                    { nombre: 'Sorgo', porcentaje: 15, kg: 150 },
                    { nombre: 'Sal Mineral', porcentaje: 2.5, kg: 25 },
                    { nombre: 'Melaza', porcentaje: 5, kg: 50 },
                    { nombre: 'Premezcla Mineral', porcentaje: 2.5, kg: 25 }
                ],
                nutricion: { PB: 13.2, EM: 3.25, FC: 3.8, Ca: 0.42, P: 0.30, NDT: 75 }
            },
            {
                id: 'DIETA3',
                nombre: 'Dieta Engorde',
                categoria: 'engorde',
                ms: 88,
                costo: 0.52,
                ingredientes: [
                    { nombre: 'Maíz Rolado', porcentaje: 65, kg: 650 },
                    { nombre: 'Harina de Soja', porcentaje: 18, kg: 180 },
                    { nombre: 'Expeller de Soja', porcentaje: 8, kg: 80 },
                    { nombre: 'Sal Mineral', porcentaje: 2, kg: 20 },
                    { nombre: 'Grasa Protegida', porcentaje: 3, kg: 30 },
                    { nombre: 'Premezcla Mineral', porcentaje: 4, kg: 40 }
                ],
                nutricion: { PB: 12.5, EM: 3.45, FC: 3.2, Ca: 0.40, P: 0.28, NDT: 78 }
            },
            {
                id: 'DIETA4',
                nombre: 'Dieta Finalización',
                categoria: 'finalizacion',
                ms: 90,
                costo: 0.58,
                ingredientes: [
                    { nombre: 'Maíz Rolado', porcentaje: 72, kg: 720 },
                    { nombre: 'Harina de Soja', porcentaje: 15, kg: 150 },
                    { nombre: 'Grasa Protegida', porcentaje: 5, kg: 50 },
                    { nombre: 'Sal Mineral', porcentaje: 2, kg: 20 },
                    { nombre: 'Bicarbonato de Sodio', porcentaje: 1, kg: 10 },
                    { nombre: 'Premezcla Mineral', porcentaje: 5, kg: 50 }
                ],
                nutricion: { PB: 11.8, EM: 3.65, FC: 2.8, Ca: 0.38, P: 0.25, NDT: 82 }
            }
        ];
        
        dietasBase.forEach(dieta => {
            if (!AppData.dietas.find(d => d.id === dieta.id)) {
                AppData.dietas.push(dieta);
            }
        });
        
        // Establecer dieta activa
        if (!AppState.dietaActiva && AppData.dietas.length > 0) {
            AppState.dietaActiva = AppData.dietas[0];
        }
    },
    
    cargarAnimales() {
        const corrales = ['corral1', 'corral2', 'corral3', 'corral4'];
        const estados = ['engorde', 'engorde', 'engorde', 'vendido'];
        
        // Generar 50 animales
        for (let i = 1; i <= 50; i++) {
            const id = `AN${1000 + i}`;
            if (AppData.animales.find(a => a.id === id)) continue;
            
            const fechaIngreso = this.fechaAleatoria('2024-01-01', '2024-11-01');
            const pesoEntrada = 280 + Math.floor(Math.random() * 100); // 280-380 kg
            const diasEngorde = Math.floor((new Date() - new Date(fechaIngreso)) / (1000 * 60 * 60 * 24));
            const gmd = 1.2 + Math.random() * 0.6; // 1.2 - 1.8 kg/día
            const pesoActual = Math.floor(pesoEntrada + (diasEngorde * gmd));
            
            const estado = i > 45 ? 'vendido' : 'engorde';
            const fechaSalida = estado === 'vendido' ? this.fechaAleatoria('2024-12-01', '2025-01-20') : null;
            
            AppData.animales.push({
                id: id,
                rfid: `RF${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                fechaIngreso: fechaIngreso,
                fechaSalida: fechaSalida,
                pesoEntrada: pesoEntrada,
                pesoActual: estado === 'vendido' ? Math.floor(pesoActual * 0.95) : pesoActual,
                pesoSalida: estado === 'vendido' ? pesoActual : null,
                corral: corrales[Math.floor(Math.random() * corrales.length)],
                estado: estado,
                proveedor: `Proveedor ${Math.floor(Math.random() * 5) + 1}`,
                costoInicial: 45000 + Math.floor(Math.random() * 15000),
                gmd: gmd.toFixed(2)
            });
        }
    },
    
    cargarCompras() {
        const comprasBase = [
            { fecha: '2024-01-15', proveedor: 'Cabaña Las Flores', cantidad: 25, pesoTotal: 8125, precioKg: 145, comision: 3, flete: 45000, iva: 10.5, iibb: 1 },
            { fecha: '2024-02-20', proveedor: 'Estancia San José', cantidad: 30, pesoTotal: 9900, precioKg: 148, comision: 3, flete: 52000, iva: 10.5, iibb: 1 },
            { fecha: '2024-03-10', proveedor: 'Invernada Norte', cantidad: 20, pesoTotal: 6400, precioKg: 142, comision: 3.5, flete: 38000, iva: 10.5, iibb: 1 },
            { fecha: '2024-04-05', proveedor: 'Cabaña El Toro', cantidad: 35, pesoTotal: 11550, precioKg: 150, comision: 3, flete: 60000, iva: 10.5, iibb: 1 },
            { fecha: '2024-05-12', proveedor: 'Estancia La Esperanza', cantidad: 28, pesoTotal: 8680, precioKg: 147, comision: 3, flete: 48000, iva: 10.5, iibb: 1 },
            { fecha: '2024-06-18', proveedor: 'Cabaña Los Alamos', cantidad: 32, pesoTotal: 10240, precioKg: 149, comision: 3, flete: 55000, iva: 10.5, iibb: 1 },
            { fecha: '2024-07-22', proveedor: 'Invernada Sur', cantidad: 22, pesoTotal: 7040, precioKg: 146, comision: 3.5, flete: 42000, iva: 10.5, iibb: 1 },
            { fecha: '2024-08-30', proveedor: 'Estancia El Parque', cantidad: 26, pesoTotal: 8320, precioKg: 151, comision: 3, flete: 46000, iva: 10.5, iibb: 1 }
        ];
        
        comprasBase.forEach((comp, idx) => {
            const subtotal = comp.pesoTotal * comp.precioKg;
            const comisionMonto = subtotal * (comp.comision / 100);
            const baseImpuesto = subtotal + comisionMonto + comp.flete;
            const ivaMonto = baseImpuesto * (comp.iva / 100);
            const iibbMonto = baseImpuesto * (comp.iibb / 100);
            const total = baseImpuesto + ivaMonto + iibbMonto;
            
            AppData.compras.push({
                id: Date.now() + idx,
                tipo: 'compra',
                fecha: comp.fecha,
                proveedor: comp.proveedor,
                cantidad: comp.cantidad,
                pesoTotal: comp.pesoTotal,
                pesoPromedio: comp.pesoTotal / comp.cantidad,
                precioKg: comp.precioKg,
                subtotal: subtotal,
                comisionPorcentaje: comp.comision,
                comisionMonto: comisionMonto,
                flete: comp.flete,
                ivaPorcentaje: comp.iva,
                ivaMonto: ivaMonto,
                iibbPorcentaje: comp.iibb,
                iibbMonto: iibbMonto,
                total: total,
                precioKgFinal: total / comp.pesoTotal,
                corralDestino: 'corral1',
                observaciones: 'Compra de demostración'
            });
        });
    },
    
    cargarVentas() {
        const ventasBase = [
            { fecha: '2024-12-10', cliente: 'Frigorífico SIRSIL SA', tipo: 'faena', cantidad: 10, pesoTotal: 2517, precioKg: 4.99, comision: 1 },
            { fecha: '2024-12-15', cliente: 'Frigorífico Carrasco', tipo: 'faena', cantidad: 12, pesoTotal: 3100, precioKg: 5.05, comision: 1 },
            { fecha: '2024-12-20', cliente: 'Feedlot La Esperanza', tipo: 'pie', cantidad: 8, pesoTotal: 2160, precioKg: 4.85, comision: 0, flete: 25000 },
            { fecha: '2025-01-05', cliente: 'Frigorífico Pando', tipo: 'faena', cantidad: 15, pesoTotal: 4125, precioKg: 5.15, comision: 1 }
        ];
        
        ventasBase.forEach((vent, idx) => {
            const subtotal = vent.pesoTotal * vent.precioKg;
            const comisionMonto = subtotal * (vent.comision / 100);
            
            // Gastos de faena según porcentajes fijos
            const cse = subtotal * 0.005;
            const imeba = subtotal * 0.025;
            const inia = subtotal * 0.005;
            const mevir = subtotal * 0.0025;
            const tcb = subtotal * 0.003;
            const totalGastosFaena = cse + imeba + inia + mevir + tcb;
            
            const flete = vent.flete || 0;
            const total = subtotal - comisionMonto - totalGastosFaena - flete;
            
            AppData.ventas.push({
                id: Date.now() + idx + 100,
                tipo: 'venta',
                tipoVenta: vent.tipo,
                fecha: vent.fecha,
                cliente: vent.cliente,
                animales: [],
                cantidad: vent.cantidad,
                pesoTotal: vent.pesoTotal,
                precioKg: vent.precioKg,
                subtotal: subtotal,
                comisionPorcentaje: vent.comision,
                comisionMonto: comisionMonto,
                gastos: vent.tipo === 'faena' ? {
                    cse: cse,
                    imeba: imeba,
                    inia: inia,
                    mevir: mevir,
                    tcb: tcb,
                    otros: 0,
                    totalGastosFaena: totalGastosFaena
                } : { flete: flete, otros: 0, totalGastos: flete },
                flete: flete,
                total: total,
                precioKgFinal: total / vent.pesoTotal,
                observaciones: 'Venta de demostración'
            });
        });
    },
    
    cargarTratamientos() {
        const tratamientosBase = [
            { fecha: '2024-02-15', tipo: 'vacuna', producto: 'Vacuna Clostridial', animalesAfectados: 25, costo: 3000 },
            { fecha: '2024-03-20', tipo: 'antibiotico', producto: 'Antibiótico Genérico', animalesAfectados: 8, costo: 1200 },
            { fecha: '2024-04-10', tipo: 'antiparasitario', producto: 'Ivermectina', animalesAfectados: 30, costo: 2500 },
            { fecha: '2024-05-15', tipo: 'vacuna', producto: 'Vacuna Brucelosis', animalesAfectados: 22, costo: 2200 },
            { fecha: '2024-06-20', tipo: 'antibiotico', producto: 'Penicilina', animalesAfectados: 5, costo: 800 },
            { fecha: '2024-07-25', tipo: 'antiparasitario', producto: 'Moxidectina', animalesAfectados: 35, costo: 4200 },
            { fecha: '2024-08-30', tipo: 'vacuna', producto: 'Vacuna Carbunco', animalesAfectados: 28, costo: 2800 },
            { fecha: '2024-09-15', tipo: 'antibiotico', producto: 'Oxitetraciclina', animalesAfectados: 12, costo: 1800 },
            { fecha: '2024-10-20', tipo: 'suplemento', producto: 'Complejo B', animalesAfectados: 40, costo: 3500 },
            { fecha: '2024-11-10', tipo: 'vacuna', producto: 'Vacuna Clostridial', animalesAfectados: 45, costo: 5400 },
            { fecha: '2024-12-05', tipo: 'antibiotico', producto: 'Enrofloxacina', animalesAfectados: 6, costo: 1500 }
        ];
        
        tratamientosBase.forEach((trat, idx) => {
            AppData.tratamientos.push({
                id: Date.now() + idx + 200,
                fecha: trat.fecha,
                tipo: trat.tipo,
                producto: trat.producto,
                animalesAfectados: trat.animalesAfectados,
                costo: trat.costo,
                observaciones: 'Tratamiento de demostración'
            });
        });
    },
    
    cargarMovimientosInsumos() {
        const movimientosBase = [
            { fecha: '2024-01-10', insumo: 'Maíz', cantidad: 10000, costoTotal: 280000, proveedor: 'NutriFeed SA' },
            { fecha: '2024-02-15', insumo: 'Sorgo', cantidad: 8000, costoTotal: 192000, proveedor: 'AgroServicios del Este' },
            { fecha: '2024-03-05', insumo: 'Harina de Soja', cantidad: 5000, costoTotal: 325000, proveedor: 'NutriFeed SA' },
            { fecha: '2024-04-12', insumo: 'Maíz', cantidad: 12000, costoTotal: 336000, proveedor: 'NutriFeed SA' },
            { fecha: '2024-05-20', insumo: 'Expeller de Soja', cantidad: 4000, costoTotal: 180000, proveedor: 'AgroServicios del Este' },
            { fecha: '2024-06-08', insumo: 'Diesel', cantidad: 2000, costoTotal: 116000, proveedor: 'Shell Station 245' },
            { fecha: '2024-07-15', insumo: 'Sal Mineral', cantidad: 1000, costoTotal: 35000, proveedor: 'NutriFeed SA' },
            { fecha: '2024-08-22', insumo: 'Premezcla Vitaminica', cantidad: 500, costoTotal: 90000, proveedor: 'AgroServicios del Este' },
            { fecha: '2024-09-10', insumo: 'Repuestos Vehículos', cantidad: 20, costoTotal: 50000, proveedor: 'Ferretería Industrial' },
            { fecha: '2024-10-05', insumo: 'Herramientas', cantidad: 10, costoTotal: 35000, proveedor: 'Ferretería Industrial' },
            { fecha: '2024-11-18', insumo: 'Maíz', cantidad: 8000, costoTotal: 224000, proveedor: 'NutriFeed SA' },
            { fecha: '2024-12-12', insumo: 'Diesel', cantidad: 1500, costoTotal: 87000, proveedor: 'Shell Station 245' }
        ];
        
        movimientosBase.forEach((mov, idx) => {
            const insumo = AppData.insumos.find(i => i.nombre === mov.insumo);
            
            AppData.movimientosInsumos.push({
                id: Date.now() + idx + 300,
                fecha: mov.fecha,
                insumo: mov.insumo,
                insumoId: insumo?.id,
                tipo: 'entrada',
                cantidad: mov.cantidad,
                stockAnterior: 0,
                stockNuevo: mov.cantidad,
                costoTotal: mov.costoTotal,
                origen: `Compra - ${mov.proveedor}`,
                usuario: 'Demo'
            });
        });
    },
    
    fechaAleatoria(desde, hasta) {
        const inicio = new Date(desde);
        const fin = new Date(hasta);
        const fecha = new Date(inicio.getTime() + Math.random() * (fin.getTime() - inicio.getTime()));
        return fecha.toISOString().split('T')[0];
    },
    
    cargarProyecciones() {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaBase = `${yyyy}-${mm}-${dd}`;

        const proyeccionesBase = [
            {
                id: 'proj_1',
                codigo: 'TERN',
                descripcion: 'Terneros - hasta ingreso a verdeos',
                cabezas: 500,
                m2PorAnimal: 8,
                fechaEntrada: fechaBase,
                fechaSalida: null,
                notas: 'Salen a verdeos ~1/jun. Chequear disponibilidad',
                color: '#8B4513'
            },
            {
                id: 'proj_2',
                codigo: 'VAQUI',
                descripcion: 'Vaquillonas - carga para inseminación 1/jul',
                cabezas: 220,
                m2PorAnimal: 10,
                fechaEntrada: `${yyyy}-06-01`,
                fechaSalida: `${yyyy}-06-30`,
                notas: 'Salen a inseminación el 1/jul. FECHA FIJA',
                color: '#1565C0'
            },
            {
                id: 'proj_3',
                codigo: 'VAC-P',
                descripcion: 'Vacas propias - invernada/engorde',
                cabezas: 80,
                m2PorAnimal: 15,
                fechaEntrada: `${yyyy}-07-01`,
                fechaSalida: `${yyyy}-10-30`,
                notas: 'Fecha ingreso estimada ~22 abr',
                color: '#2E7D32'
            },
            {
                id: 'proj_4',
                codigo: 'VAC-C',
                descripcion: 'Vacas capitalización - invernada/engorde',
                cabezas: 200,
                m2PorAnimal: 15,
                fechaEntrada: `${yyyy}-07-01`,
                fechaSalida: `${yyyy}-10-30`,
                notas: 'Capitalización. Fecha ingreso estimada ~22 abr',
                color: '#6A1B9A'
            }
        ];

        // Arreglar fechas que dependen de funciones no disponibles aquí
        const finTern = new Date(hoy);
        finTern.setDate(finTern.getDate() + 60);
        proyeccionesBase[0].fechaSalida = finTern.toISOString().split('T')[0];

        proyeccionesBase.forEach(p => {
            if (!AppData.proyecciones.find(ex => ex.codigo === p.codigo)) {
                AppData.proyecciones.push(p);
            }
        });

        // Auto-asignar corrales si ProyeccionSection está disponible
        if (typeof ProyeccionSection !== 'undefined') {
            AppData.asignacionesProyeccion = [];
            AppData.proyecciones.forEach(p => {
                ProyeccionSection.autoAsignarCorrales(p);
            });
        }
    },

    guardar() {
        if (typeof DataManager !== 'undefined' && DataManager.save) {
            DataManager.save();
        } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('feedpro-data', JSON.stringify(AppData));
        }
    }
};

// Exponer globalmente
window.DemoData = DemoData;
