/**
 * CONFIGURACIÓN GLOBAL DEL SISTEMA
 */

const CONFIG = {
    version: '2.0.0',
    
    // Supabase Configuration
    // 1. Creá tu proyecto en https://supabase.com
    // 2. Andá a Project Settings → API
    // 3. Copiá la URL y la anon key acá abajo
    supabase: {
        url: 'https://eceqvbogfmnsojututrr.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZXF2Ym9nZm1uc29qdXR1dHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTY1NjMsImV4cCI6MjA5MjQ3MjU2M30.Drl20jE2ZoXCpYZR5MNFB7j0g6SmMJ-r3uWxmfbVDhk',
        enabled: true
    },
    
    maxAnimales: 5000,
    paginacion: 20,
    capacidadMixer: 5000, // kg
    
    // Requerimientos nutricionales por etapa (NRC)
    requerimientos: {
        'inicio': { 
            PB: 13.0, 
            EM: 2.90, 
            Ca: 0.50, 
            P: 0.25, 
            FC: { min: 15, max: 25 } 
        },
        'crecimiento': { 
            PB: 12.5, 
            EM: 3.00, 
            Ca: 0.45, 
            P: 0.22, 
            FC: { min: 12, max: 20 } 
        },
        'engorde': { 
            PB: 11.5, 
            EM: 3.20, 
            Ca: 0.40, 
            P: 0.20, 
            FC: { min: 8, max: 15 } 
        },
        'finalizacion': { 
            PB: 10.5, 
            EM: 3.35, 
            Ca: 0.35, 
            P: 0.18, 
            FC: { min: 5, max: 12 } 
        },
        'recria': { 
            PB: 12.0, 
            EM: 2.80, 
            Ca: 0.45, 
            P: 0.25, 
            FC: { min: 18, max: 28 } 
        },
        'mantenimiento': { 
            PB: 8.0, 
            EM: 2.40, 
            Ca: 0.30, 
            P: 0.20, 
            FC: { min: 20, max: 35 } 
        }
    },
    
    // Colores para gráficos
    chartColors: [
        '#8B4513', '#D2691E', '#CD853F', '#DEB887', 
        '#F5DEB3', '#DAA520', '#B8860B', '#A0522D'
    ],
    
    // Etapas disponibles
    etapas: [
        { value: 'inicio', label: 'Inicio/Adaptación' },
        { value: 'crecimiento', label: 'Crecimiento' },
        { value: 'engorde', label: 'Engorde' },
        { value: 'finalizacion', label: 'Finalización' },
        { value: 'recria', label: 'Cría/Recría' },
        { value: 'mantenimiento', label: 'Mantenimiento' }
    ]
};