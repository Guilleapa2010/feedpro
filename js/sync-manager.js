/**
 * SYNC MANAGER - FeedPro
 * Capa híbrida: funciona offline (localStorage) 
 * pero puede sincronizar con Supabase cuando está configurado
 */

const SyncManager = {
    isOnline() {
        return !!supabaseClient;
    },

    // ============================================================
    // GUARDAR DATOS (Local primero, luego nube si está disponible)
    // ============================================================
    
    async save(table, data) {
        // 1. Siempre guardar en localStorage primero
        const localKey = `feedpro_${table}`;
        let items = JSON.parse(localStorage.getItem(localKey) || '[]');
        
        // Si tiene ID, actualizar. Si no, crear nuevo.
        if (data.id) {
            const idx = items.findIndex(i => i.id === data.id);
            if (idx >= 0) items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
            else items.push({ ...data, id: data.id || crypto.randomUUID(), createdAt: new Date().toISOString() });
        } else {
            data.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
            data.createdAt = new Date().toISOString();
            items.push(data);
        }
        
        localStorage.setItem(localKey, JSON.stringify(items));
        
        // 2. Si Supabase está activo, sincronizar
        if (this.isOnline()) {
            try {
                const { error } = await supabaseClient.from(table).upsert(data);
                if (error) console.warn(`[Sync] Error en ${table}:`, error);
                else console.log(`[Sync] ✅ ${table} guardado en Supabase`);
            } catch (e) {
                console.warn('[Sync] Falló sync a nube, quedó en local:', e);
            }
        }
        
        return data;
    },

    // ============================================================
    // OBTENER DATOS (Nube primero, fallback local)
    // ============================================================
    
    async getAll(table) {
        const localKey = `feedpro_${table}`;
        
        // Si hay Supabase, intentar traer de la nube
        if (this.isOnline()) {
            try {
                const { data, error } = await supabaseClient.from(table).select('*').order('createdAt', { ascending: false });
                if (!error && data) {
                    // Actualizar localStorage con datos frescos
                    localStorage.setItem(localKey, JSON.stringify(data));
                    console.log(`[Sync] ✅ ${table} cargado desde Supabase (${data.length} registros)`);
                    return data;
                }
            } catch (e) {
                console.warn('[Sync] No se pudo leer de Supabase, usando local:', e);
            }
        }
        
        // Fallback a localStorage
        return JSON.parse(localStorage.getItem(localKey) || '[]');
    },

    async getById(table, id) {
        const all = await this.getAll(table);
        return all.find(i => i.id === id);
    },

    // ============================================================
    // ELIMINAR
    // ============================================================
    
    async delete(table, id) {
        const localKey = `feedpro_${table}`;
        let items = JSON.parse(localStorage.getItem(localKey) || '[]');
        items = items.filter(i => i.id !== id);
        localStorage.setItem(localKey, JSON.stringify(items));
        
        if (this.isOnline()) {
            try {
                await supabaseClient.from(table).delete().eq('id', id);
                console.log(`[Sync] ✅ ${table} eliminado en Supabase`);
            } catch (e) {
                console.warn('[Sync] No se pudo eliminar en Supabase:', e);
            }
        }
        
        return true;
    },

    // ============================================================
    // SINCRONIZACIÓN MANUAL (Subir TODO lo local a la nube)
    // ============================================================
    
    async syncAllToCloud() {
        if (!this.isOnline()) {
            alert('No está configurado Supabase. Configuralo en js/config.js primero.');
            return;
        }
        
        const tables = ['animales', 'corrales', 'dietas', 'insumos', 'suministros', 
                       'sanidad', 'personal', 'gastos', 'compras', 'ventas', 'pesajes'];
        
        let uploaded = 0;
        let errors = 0;
        
        for (const table of tables) {
            const localKey = `feedpro_${table}`;
            const items = JSON.parse(localStorage.getItem(localKey) || '[]');
            
            if (items.length === 0) continue;
            
            try {
                const { error } = await supabaseClient.from(table).upsert(items);
                if (error) {
                    console.error(`[Sync] Error en ${table}:`, error);
                    errors++;
                } else {
                    console.log(`[Sync] ✅ ${table}: ${items.length} registros subidos`);
                    uploaded += items.length;
                }
            } catch (e) {
                console.error(`[Sync] Error en ${table}:`, e);
                errors++;
            }
        }
        
        alert(`Sincronización completa:\n✅ ${uploaded} registros subidos\n❌ ${errors} errores`);
        return { uploaded, errors };
    },

    // ============================================================
    // CREAR TABLAS EN SUPABASE (Ejecutar una sola vez)
    // ============================================================
    
    async setupDatabase() {
        if (!this.isOnline()) {
            alert('Supabase no está conectado. Revisá las credenciales en js/config.js');
            return;
        }
        
        console.log('%c[Setup] Para crear las tablas, andá al SQL Editor de Supabase y ejecutá este script:', 'color: blue; font-size: 14px');
        console.log(`
-- Copiá y pegá esto en Supabase → SQL Editor → New query → Run

CREATE TABLE IF NOT EXISTS animales (
    id UUID PRIMARY KEY,
    tag TEXT,
    raza TEXT,
    peso_inicial NUMERIC,
    peso_actual NUMERIC,
    fecha_ingreso DATE,
    corral TEXT,
    estado TEXT DEFAULT 'activo',
    etapa TEXT,
    createdAt TIMESTAMPTZ DEFAULT now(),
    updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS corrales (
    id UUID PRIMARY KEY,
    nombre TEXT,
    capacidad INTEGER,
    ocupacion INTEGER DEFAULT 0,
    createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dietas (
    id UUID PRIMARY KEY,
    nombre TEXT,
    etapa TEXT,
    ingredientes JSONB,
    createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insumos (
    id UUID PRIMARY KEY,
    nombre TEXT,
    categoria TEXT,
    stock NUMERIC,
    unidad TEXT,
    costo NUMERIC,
    createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suministros (
    id UUID PRIMARY KEY,
    corral TEXT,
    dieta TEXT,
    cantidad NUMERIC,
    fecha DATE,
    createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sanidad (
    id UUID PRIMARY KEY,
    animal_id TEXT,
    tipo TEXT,
    producto TEXT,
    dosis TEXT,
    fecha DATE,
    createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal (
    id UUID PRIMARY KEY,
    nombre TEXT,
    cargo TEXT,
    activo BOOLEAN DEFAULT true,
    createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gastos (
    id UUID PRIMARY KEY,
    concepto TEXT,
    categoria TEXT,
    monto NUMERIC,
    fecha DATE,
    createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compras (
    id UUID PRIMARY KEY,
    proveedor TEXT,
    cantidad INTEGER,
    peso_promedio NUMERIC,
    precio_kg NUMERIC,
    total NUMERIC,
    fecha DATE,
    createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY,
    comprador TEXT,
    cantidad INTEGER,
    peso_promedio NUMERIC,
    precio_kg NUMERIC,
    total NUMERIC,
    fecha DATE,
    createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pesajes (
    id UUID PRIMARY KEY,
    animal_id TEXT,
    peso NUMERIC,
    fecha DATE,
    createdAt TIMESTAMPTZ DEFAULT now()
);

-- Política de seguridad: Permitir todo (para empezar)
ALTER TABLE animales ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrales ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietas ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE suministros ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON animales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON corrales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON dietas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON insumos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON suministros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sanidad FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON personal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON compras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ventas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pesajes FOR ALL USING (true) WITH CHECK (true);
        `);
        
        alert('Abrí la consola del navegador (F12) y copiá el script SQL que aparece ahí. Pegalo en Supabase → SQL Editor.');
    }
};

// Hacer disponible globalmente
window.SyncManager = SyncManager;
