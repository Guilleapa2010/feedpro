// ─── Integración Supabase para FeedPro ───

class TelegramOrdenes {
    constructor() {
        this.supabaseUrl = 'https://eceqvbogfmnsojututrr.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZXF2Ym9nZm1uc29qdXR1dHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTY1NjMsImV4cCI6MjA5MjQ3MjU2M30.Drl20jE2ZoXCpYZR5MNFB7j0g6SmMJ-r3uWxmfbVDhk';
        this.supabase = null;
        this.ordenes = [];
        this.intervalId = null;
    }

    init() {
        if (typeof supabase === 'undefined') {
            console.warn('Supabase no cargado. Agregá el CDN en index.html');
            return;
        }
        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        this.cargarOrdenes();
        this.intervalId = setInterval(() => this.cargarOrdenes(), 10000);
    }

    async cargarOrdenes() {
        if (!this.supabase) return;

        const { data, error } = await this.supabase
            .from('ordenes_alimentacion')
            .select('*')
            .eq('estado', 'pendiente')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error cargando órdenes:', error);
            return;
        }

        this.ordenes = data || [];
        this.renderizarOrdenes();
    }

    async completarOrden(id) {
        const { error } = await this.supabase
            .from('ordenes_alimentacion')
            .update({ estado: 'completado' })
            .eq('id', id);

        if (error) {
            console.error('Error completando orden:', error);
            return false;
        }

        this.cargarOrdenes();
        return true;
    }

    async cancelarOrden(id) {
        const { error } = await this.supabase
            .from('ordenes_alimentacion')
            .update({ estado: 'cancelado' })
            .eq('id', id);

        if (error) {
            console.error('Error cancelando orden:', error);
            return false;
        }

        this.cargarOrdenes();
        return true;
    }

    renderizarOrdenes() {
        const contenedor = document.getElementById('ordenes-telegram');
        if (!contenedor) return;

        if (this.ordenes.length === 0) {
            contenedor.innerHTML = `
                <div class="telegram-empty">
                    <span>📱</span>
                    <p>No hay órdenes de Telegram pendientes</p>
                    <small>El mixer puede enviar: /alimentar C1 500</small>
                </div>
            `;
            return;
        }

        let html = `
            <div class="telegram-header">
                <span>🔔</span>
                <strong>${this.ordenes.length} orden${this.ordenes.length > 1 ? 'es' : ''} de Telegram</strong>
                <span class="telegram-live">●</span>
            </div>
            <div class="telegram-ordenes-list">
        `;

        this.ordenes.forEach(orden => {
            const hora = new Date(orden.created_at).toLocaleTimeString('es-UY', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            html += `
                <div class="telegram-orden" data-id="${orden.id}">
                    <div class="telegram-orden-info">
                        <strong>📍 ${orden.corral}</strong>
                        <span>⚖️ ${orden.kilos} kg</span>
                        <small>👤 ${orden.operador} — ${hora}</small>
                    </div>
                    <div class="telegram-orden-actions">
                        <button class="btn-telegram btn-telegram-done" onclick="TelegramOrdenesApp.completarOrden('${orden.id}')">
                            ✓ Hecho
                        </button>
                        <button class="btn-telegram btn-telegram-cancel" onclick="TelegramOrdenesApp.cancelarOrden('${orden.id}')">
                            ✕
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        contenedor.innerHTML = html;
    }
}

window.TelegramOrdenesApp = new TelegramOrdenes();
