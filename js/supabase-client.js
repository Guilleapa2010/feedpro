/**
 * CLIENTE SUPABASE - FeedPro
 * Se conecta solo si CONFIG.supabase está configurado
 */

let supabaseClient = null;

function initSupabase() {
    const { url, anonKey, enabled } = CONFIG.supabase;
    
    if (!enabled || !url || !anonKey) {
        console.log('[Supabase] Modo offline. Configurá tus credenciales en js/config.js');
        return null;
    }
    
    try {
        supabaseClient = supabase.createClient(url, anonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        console.log('[Supabase] ✅ Conectado a:', url);
        return supabaseClient;
    } catch (error) {
        console.error('[Supabase] ❌ Error al conectar:', error);
        return null;
    }
}

// Inicializar automáticamente al cargar
initSupabase();

// Hacer disponible globalmente
window.supabaseClient = supabaseClient;
window.initSupabase = initSupabase;
