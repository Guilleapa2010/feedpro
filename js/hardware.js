/**
 * MÓDULO DE HARDWARE - RFID Y BALANZA
 * 
 * Soporta:
 * - Lectores RFID para identificación de animales (caravanas electrónicas)
 * - Balanzas TruTest (conexión serial/bluetooth)
 * - Importación desde Excel (archivos .xlsx, .csv)
 */

const HardwareManager = {
    // Estado de conexiones
    estado: {
        rfid: { conectado: false, dispositivo: null, ultimaLectura: null },
        balanza: { conectado: false, dispositivo: null, puerto: null, pesoActual: 0, estable: false }
    },
    
    // Callbacks
    callbacks: {
        onRfidTag: null,
        onPeso: null,
        onError: null
    },
    
    // ========== RFID ==========
    
    /**
     * Solicita permiso y conecta lector RFID
     * Usa Web Serial API si está disponible
     */
    async conectarRFID() {
        try {
            // Verificar soporte de Web Serial API
            if (!('serial' in navigator)) {
                // Fallback: Simular modo de prueba o usar input manual
                UI.showToast('Web Serial API no soportada. Use modo manual o Chrome/Edge.', 'warning');
                this.iniciarModoManualRFID();
                return false;
            }
            
            // Solicitar puerto serial
            const puerto = await navigator.serial.requestPort({
                filters: [
                    { usbVendorId: 0x1234 }, // Ejemplo: adaptar según lector RFID
                    { usbVendorId: 0x067B }, // Prolific
                    { usbVendorId: 0x0403 }, // FTDI
                ]
            });
            
            await puerto.open({ baudRate: 9600 });
            
            this.estado.rfid.conectado = true;
            this.estado.rfid.puerto = puerto;
            
            UI.showToast('Lector RFID conectado', 'success');
            
            // Iniciar lectura
            this.leerRFIDLoop(puerto);
            
            return true;
            
        } catch (error) {
            console.error('Error conectando RFID:', error);
            UI.showToast('Error al conectar RFID: ' + error.message, 'error');
            return false;
        }
    },
    
    /**
     * Loop de lectura RFID
     */
    async leerRFIDLoop(puerto) {
        const reader = puerto.readable.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        try {
            while (this.estado.rfid.conectado) {
                const { value, done } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                
                // Procesar líneas completas (formato común RFID: EPC o ID numérico)
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Guardar última línea incompleta
                
                for (const line of lines) {
                    const tag = this.procesarTagRFID(line.trim());
                    if (tag && this.callbacks.onRfidTag) {
                        this.estado.rfid.ultimaLectura = tag;
                        this.callbacks.onRfidTag(tag);
                    }
                }
            }
        } catch (error) {
            console.error('Error en lectura RFID:', error);
            if (this.callbacks.onError) this.callbacks.onError('RFID', error);
        } finally {
            reader.releaseLock();
        }
    },
    
    /**
     * Procesa el tag leído del RFID
     * Soporta formatos: EPC (24 hex), FDX-B (15 digitos), etc.
     */
    procesarTagRFID(rawData) {
        if (!rawData) return null;
        
        // Limpiar caracteres no válidos
        const limpio = rawData.replace(/[^0-9A-Fa-f]/g, '');
        
        // Detectar formato
        if (limpio.length === 24) {
            // EPC Gen2 (24 caracteres hex)
            return {
                tipo: 'EPC',
                raw: rawData,
                id: limpio.toUpperCase(),
                formato: 'EPC-GEN2',
                timestamp: new Date().toISOString()
            };
        } else if (limpio.length >= 10 && limpio.length <= 16) {
            // FDX-B ISO 11784/11785 (15 dígitos típicamente)
            return {
                tipo: 'FDX-B',
                raw: rawData,
                id: limpio.padStart(15, '0'),
                formato: 'ISO11784',
                timestamp: new Date().toISOString()
            };
        } else if (/^\d+$/.test(rawData.trim())) {
            // ID numérico simple
            return {
                tipo: 'NUMERIC',
                raw: rawData,
                id: rawData.trim().padStart(10, '0'),
                formato: 'NUMERIC',
                timestamp: new Date().toISOString()
            };
        }
        
        return null;
    },
    
    /**
     * Modo manual para RFID (cuando no hay soporte Web Serial)
     */
    iniciarModoManualRFID() {
        this.estado.rfid.modoManual = true;
        UI.showToast('Modo manual RFID activado - Use el campo de entrada', 'info');
    },
    
    /**
     * Simula lectura RFID (para pruebas)
     */
    simularLecturaRFID(id = null) {
        const tagId = id || '840' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
        const tag = {
            tipo: 'FDX-B',
            raw: tagId,
            id: tagId,
            formato: 'ISO11784',
            timestamp: new Date().toISOString(),
            simulado: true
        };
        
        this.estado.rfid.ultimaLectura = tag;
        if (this.callbacks.onRfidTag) {
            this.callbacks.onRfidTag(tag);
        }
        
        return tag;
    },
    
    desconectarRFID() {
        this.estado.rfid.conectado = false;
        if (this.estado.rfid.puerto) {
            this.estado.rfid.puerto.close();
            this.estado.rfid.puerto = null;
        }
        UI.showToast('Lector RFID desconectado', 'info');
    },
    
    // ========== BALANZA TRUTEST ==========
    
    /**
     * Conecta balanza TruTest
     * TruTest típicamente usa protocolo serial con formato específico
     */
    async conectarBalanzaTruTest() {
        try {
            if (!('serial' in navigator)) {
                UI.showToast('Web Serial API no soportada. Use Chrome/Edge.', 'error');
                this.iniciarModoManualBalanza();
                return false;
            }
            
            // TruTest usualmente usa 9600 baudios, 8N1
            const puerto = await navigator.serial.requestPort({
                filters: [
                    { usbVendorId: 0x0403 }, // FTDI - común en TruTest
                    { usbVendorId: 0x067B }, // Prolific
                ]
            });
            
            await puerto.open({ 
                baudRate: 9600,
                dataBits: 8,
                stopBits: 1,
                parity: 'none'
            });
            
            this.estado.balanza.conectado = true;
            this.estado.balanza.puerto = puerto;
            this.estado.balanza.marca = 'TruTest';
            
            UI.showToast('Balanza TruTest conectada', 'success');
            
            // Iniciar lectura de peso
            this.leerBalanzaLoop(puerto);
            
            return true;
            
        } catch (error) {
            console.error('Error conectando balanza:', error);
            UI.showToast('Error al conectar balanza: ' + error.message, 'error');
            return false;
        }
    },
    
    /**
     * Loop de lectura de balanza
     * Protocolo TruTest típico: envía peso en formato ASCII
     */
    async leerBalanzaLoop(puerto) {
        const reader = puerto.readable.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        try {
            while (this.estado.balanza.conectado) {
                const { value, done } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                
                // Procesar líneas completas
                const lines = buffer.split('\r\n');
                buffer = lines.pop();
                
                for (const line of lines) {
                    const peso = this.procesarPesoTruTest(line.trim());
                    if (peso !== null) {
                        this.estado.balanza.pesoActual = peso.valor;
                        this.estado.balanza.estable = peso.estable;
                        
                        if (this.callbacks.onPeso) {
                            this.callbacks.onPeso(peso);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error en lectura balanza:', error);
            if (this.callbacks.onError) this.callbacks.onError('BALANZA', error);
        } finally {
            reader.releaseLock();
        }
    },
    
    /**
     * Procesa el peso del formato TruTest
     * Formatos comunes:
     * - "ST,GS,   450.5 kg" (estable)
     * - "US,GS,   450.5 kg" (inestable)
     * - "  450.5" (solo peso)
     */
    procesarPesoTruTest(rawData) {
        if (!rawData) return null;
        
        // Limpiar
        const linea = rawData.trim();
        
        // Formato con prefijo ST (estable) o US (inestable)
        const matchTruTest = linea.match(/^(ST|US),GS,\s*([\d.]+)\s*(kg|lb)?/i);
        if (matchTruTest) {
            return {
                estable: matchTruTest[1] === 'ST',
                valor: parseFloat(matchTruTest[2]),
                unidad: (matchTruTest[3] || 'kg').toLowerCase(),
                raw: rawData,
                timestamp: new Date().toISOString()
            };
        }
        
        // Formato simple numérico
        const matchNumero = linea.match(/^\s*([\d.]+)\s*$/);
        if (matchNumero) {
            return {
                estable: true,
                valor: parseFloat(matchNumero[1]),
                unidad: 'kg',
                raw: rawData,
                timestamp: new Date().toISOString()
            };
        }
        
        return null;
    },
    
    /**
     * Captura el peso estable actual
     */
    capturarPeso() {
        if (!this.estado.balanza.conectado && !this.estado.balanza.modoManual) {
            UI.showToast('Balanza no conectada', 'error');
            return null;
        }
        
        return {
            valor: this.estado.balanza.pesoActual,
            estable: this.estado.balanza.estable,
            timestamp: new Date().toISOString()
        };
    },
    
    /**
     * Simula lectura de balanza (para pruebas)
     */
    simularPeso(valor = null) {
        const peso = valor || (Math.random() * 200 + 300); // 300-500 kg
        
        this.estado.balanza.pesoActual = Math.round(peso * 10) / 10;
        this.estado.balanza.estable = true;
        
        const resultado = {
            valor: this.estado.balanza.pesoActual,
            estable: true,
            unidad: 'kg',
            simulado: true,
            timestamp: new Date().toISOString()
        };
        
        if (this.callbacks.onPeso) {
            this.callbacks.onPeso(resultado);
        }
        
        return resultado;
    },
    
    iniciarModoManualBalanza() {
        this.estado.balanza.modoManual = true;
        UI.showToast('Modo manual de balanza activado', 'info');
    },
    
    desconectarBalanza() {
        this.estado.balanza.conectado = false;
        if (this.estado.balanza.puerto) {
            this.estado.balanza.puerto.close();
            this.estado.balanza.puerto = null;
        }
        UI.showToast('Balanza desconectada', 'info');
    },
    
    // ========== EXCEL IMPORT ==========
    
    /**
     * Lee archivo Excel y retorna datos parseados
     * Soporta: .xlsx, .xls, .csv
     */
    async importarExcel(archivo, opciones = {}) {
        // Verificar que XLSX esté disponible
        if (typeof XLSX === 'undefined') {
            throw new Error('Librería XLSX no cargada. Recargue la página.');
        }
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Tomar primera hoja
                    const primeraHoja = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[primeraHoja];
                    
                    // Convertir a JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                        header: 1,
                        raw: false,
                        defval: ''
                    });
                    
                    if (jsonData.length === 0) {
                        reject(new Error('El archivo está vacío'));
                        return;
                    }
                    
                    // Detectar o usar headers proporcionados
                    const headers = opciones.headers || jsonData[0].map(h => String(h).toLowerCase().trim());
                    const filas = opciones.skipHeader !== false ? jsonData.slice(1) : jsonData;
                    
                    // Mapear a objetos
                    const registros = filas
                        .filter(fila => fila.some(celda => celda !== ''))
                        .map(fila => {
                            const obj = {};
                            headers.forEach((header, index) => {
                                obj[header] = fila[index] || '';
                            });
                            return obj;
                        });
                    
                    resolve({
                        headers,
                        registros,
                        totalFilas: filas.length,
                        hoja: primeraHoja,
                        archivo: archivo.name
                    });
                    
                } catch (error) {
                    console.error('Error procesando Excel:', error);
                    reject(new Error('Error al procesar archivo: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer archivo'));
            reader.readAsArrayBuffer(archivo);
        });
    },
    
    /**
     * Valida registros de animales desde Excel
     */
    validarRegistrosAnimales(registros, mapeoCampos = {}) {
        const mapeo = {
            caravana: mapeoCampos.caravana || 'caravana',
            rfid: mapeoCampos.rfid || 'rfid',
            peso: mapeoCampos.peso || 'peso',
            raza: mapeoCampos.raza || 'raza',
            origen: mapeoCampos.origen || 'origen',
            proveedor: mapeoCampos.proveedor || 'proveedor',
            ...mapeoCampos
        };
        
        const validados = [];
        const errores = [];
        
        registros.forEach((reg, index) => {
            const fila = index + 2; // +2 por header y 0-index
            const erroresFila = [];
            
            // Identificador obligatorio (caravana o RFID)
            const caravana = reg[mapeo.caravana];
            const rfid = reg[mapeo.rfid];
            
            if (!caravana && !rfid) {
                erroresFila.push('Debe tener caravana o RFID');
            }
            
            // Validar peso
            const peso = parseFloat(reg[mapeo.peso]);
            if (isNaN(peso) || peso <= 0) {
                erroresFila.push('Peso inválido');
            }
            
            if (erroresFila.length > 0) {
                errores.push({ fila, errores: erroresFila, datos: reg });
            } else {
                validados.push({
                    caravana: caravana || '',
                    rfid: rfid || '',
                    pesoInicial: peso,
                    raza: reg[mapeo.raza] || 'Cruzado',
                    origen: reg[mapeo.origen] || 'Compra',
                    proveedor: reg[mapeo.proveedor] || '',
                    filaOriginal: fila,
                    ...reg // Incluir campos extras
                });
            }
        });
        
        return { validados, errores, total: registros.length };
    },
    
    /**
     * Genera archivo Excel de ejemplo para importación
     */
    descargarPlantillaExcel(tipo = 'animales') {
        let data = [];
        let headers = [];
        let nombreArchivo = '';
        
        if (tipo === 'animales' || tipo === 'compra') {
            headers = ['caravana', 'rfid', 'peso', 'raza', 'origen', 'proveedor', 'corral'];
            data = [
                ['CAR001', '840123456789012', 320.5, 'Angus', 'Remate', 'Proveedor A', 'corral1'],
                ['CAR002', '840123456789013', 285.0, 'Hereford', 'Particular', 'Proveedor B', 'corral1'],
                ['CAR003', '', 310.2, 'Cruzado', 'Remate', 'Proveedor A', 'corral2'],
            ];
            nombreArchivo = 'plantilla_animales.xlsx';
        } else if (tipo === 'pesaje') {
            headers = ['caravana', 'rfid', 'peso_anterior', 'peso_actual', 'corral'];
            data = [
                ['CAR001', '840123456789012', 320.5, 345.2, 'corral1'],
                ['CAR002', '840123456789013', 285.0, 310.5, 'corral1'],
            ];
            nombreArchivo = 'plantilla_pesaje.xlsx';
        }
        
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');
        XLSX.writeFile(wb, nombreArchivo);
    },
    
    // ========== UTILIDADES ==========
    
    setCallback(evento, callback) {
        if (this.callbacks.hasOwnProperty(evento)) {
            this.callbacks[evento] = callback;
        }
    },
    
    getEstado() {
        return { ...this.estado };
    },
    
    /**
     * Verifica soporte de Web Serial API
     */
    soportaWebSerial() {
        return 'serial' in navigator;
    }
};

// Hacer disponible globalmente
window.HardwareManager = HardwareManager;
