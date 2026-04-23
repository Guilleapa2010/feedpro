/**
 * SECCIÓN DIETAS V2 - LABORATORIO NUTRICIONAL AVANZADO
 * Estilo Cattler - Formulación, análisis y biblioteca de ingredientes
 */

const DietasSection = {
    vistaActual: 'laboratorio', // laboratorio, biblioteca, comparador, historial
    dietaComparacion: null,
    
    // Requerimientos nutricionales por categoría (NRC 2000 para ganado de carne en feedlot)
    // Valores expresados en base seca (100% MS)
    REQUERIMIENTOS: {
        'inicio': { MS: 85, PB: 14.5, EM: 3.0, Ca: 0.65, P: 0.32, NDT: 72 },    // 250-350 kg, GDP 1.4-1.6
        'crecimiento': { MS: 87, PB: 13.5, EM: 3.15, Ca: 0.55, P: 0.28, NDT: 75 }, // 350-450 kg, GDP 1.3-1.5
        'engorde': { MS: 88, PB: 12.5, EM: 3.25, Ca: 0.48, P: 0.25, NDT: 78 },   // 450-550 kg, GDP 1.2-1.4
        'finalizacion': { MS: 90, PB: 11.5, EM: 3.35, Ca: 0.42, P: 0.22, NDT: 80 } // >550 kg, GDP 1.0-1.2
    },
    
    // TABLAS FEDNA - Base de datos de ingredientes con composición química
    // Cada ingrediente puede tener múltiples escalas de MS (Materia Seca)
    FEDNA: {
        // CEREALES Y GRANOS
        'maiz': {
            nombre: 'Maíz',
            categoria: 'grano',
            variedades: {
                'maiz_duro': { nombre: 'Maíz duro', MS: 88, PB: 8.5, EM: 3.35, Ca: 0.02, P: 0.28, NDT: 85, EE: 4.2, FB: 2.8 },
                'maiz_blando': { nombre: 'Maíz blando', MS: 86, PB: 8.2, EM: 3.30, Ca: 0.02, P: 0.27, NDT: 84, EE: 4.0, FB: 2.9 },
                'maiz_rolado': { nombre: 'Maíz rolado', MS: 87, PB: 8.4, EM: 3.32, Ca: 0.02, P: 0.28, NDT: 84, EE: 4.1, FB: 2.8 },
                'maiz_molido': { nombre: 'Maíz molido', MS: 88, PB: 8.5, EM: 3.35, Ca: 0.02, P: 0.28, NDT: 85, EE: 4.2, FB: 2.7 },
                'maiz_mazorca': { nombre: 'Mazorca de maíz', MS: 45, PB: 3.5, EM: 1.75, Ca: 0.01, P: 0.12, NDT: 42, EE: 2.0, FB: 1.8 },
                'maiz_expeller': { nombre: 'Expeller de maíz', MS: 90, PB: 10.5, EM: 3.10, Ca: 0.03, P: 0.45, NDT: 82, EE: 7.5, FB: 6.2 },
                'maiz_gluten': { nombre: 'Gluten de maíz 60%', MS: 90, PB: 60.0, EM: 3.45, Ca: 0.05, P: 0.45, NDT: 88, EE: 2.5, FB: 2.0 },
                'maiz_grano_humedo_25': { nombre: 'Maíz grano húmedo (25% humedad)', MS: 75, PB: 7.2, EM: 2.85, Ca: 0.02, P: 0.24, NDT: 72, EE: 3.6, FB: 2.4 },
                'maiz_grano_humedo_30': { nombre: 'Maíz grano húmedo (30% humedad)', MS: 70, PB: 6.7, EM: 2.65, Ca: 0.02, P: 0.22, NDT: 67, EE: 3.3, FB: 2.2 },
                'maiz_grano_humedo_35': { nombre: 'Maíz grano húmedo (35% humedad)', MS: 65, PB: 6.2, EM: 2.45, Ca: 0.01, P: 0.20, NDT: 62, EE: 3.0, FB: 2.0 }
            }
        },
        'sorgo': {
            nombre: 'Sorgo',
            categoria: 'grano',
            variedades: {
                'sorgo_duro': { nombre: 'Sorgo duro', MS: 89, PB: 9.0, EM: 3.25, Ca: 0.03, P: 0.29, NDT: 82, EE: 3.5, FB: 2.5 },
                'sorgo_blando': { nombre: 'Sorgo blando', MS: 88, PB: 9.2, EM: 3.20, Ca: 0.03, P: 0.30, NDT: 81, EE: 3.2, FB: 2.8 },
                'sorgo_rolado': { nombre: 'Sorgo rolado', MS: 88, PB: 9.0, EM: 3.22, Ca: 0.03, P: 0.29, NDT: 82, EE: 3.4, FB: 2.6 },
                'sorgo_molido': { nombre: 'Sorgo molido', MS: 89, PB: 9.0, EM: 3.25, Ca: 0.03, P: 0.29, NDT: 82, EE: 3.5, FB: 2.5 },
                'sorgo_grano_humedo_25': { nombre: 'Sorgo grano húmedo (25% humedad)', MS: 75, PB: 7.6, EM: 2.75, Ca: 0.03, P: 0.25, NDT: 76, EE: 3.0, FB: 2.3 },
                'sorgo_grano_humedo_30': { nombre: 'Sorgo grano húmedo (30% humedad)', MS: 70, PB: 7.0, EM: 2.55, Ca: 0.02, P: 0.23, NDT: 71, EE: 2.8, FB: 2.1 },
                'sorgo_grano_humedo_35': { nombre: 'Sorgo grano húmedo (35% humedad)', MS: 65, PB: 6.5, EM: 2.35, Ca: 0.02, P: 0.21, NDT: 65, EE: 2.5, FB: 1.9 }
            }
        },
        'cebada': {
            nombre: 'Cebada',
            categoria: 'grano',
            variedades: {
                'cebada_entera': { nombre: 'Cebada entera', MS: 88, PB: 11.0, EM: 3.05, Ca: 0.05, P: 0.35, NDT: 78, EE: 2.2, FB: 5.5 },
                'cebada_rolada': { nombre: 'Cebada rolada', MS: 87, PB: 10.8, EM: 3.02, Ca: 0.05, P: 0.34, NDT: 77, EE: 2.1, FB: 5.8 },
                'cebada_malteada': { nombre: 'Cebada malteada', MS: 92, PB: 11.5, EM: 3.10, Ca: 0.06, P: 0.38, NDT: 80, EE: 2.0, FB: 4.5 },
                'cebada_subproducto': { nombre: 'Subproducto cervecero', MS: 90, PB: 24.0, EM: 2.80, Ca: 0.15, P: 0.55, NDT: 70, EE: 6.5, FB: 14.0 }
            }
        },
        'trigo': {
            nombre: 'Trigo',
            categoria: 'grano',
            variedades: {
                'trigo_entero': { nombre: 'Trigo entero', MS: 89, PB: 13.0, EM: 3.20, Ca: 0.04, P: 0.40, NDT: 82, EE: 2.0, FB: 2.8 },
                'trigo_rolado': { nombre: 'Trigo rolado', MS: 88, PB: 12.8, EM: 3.18, Ca: 0.04, P: 0.39, NDT: 81, EE: 1.9, FB: 2.9 },
                'trigo_rechazado': { nombre: 'Trigo rechazado/comercial', MS: 88, PB: 12.5, EM: 3.15, Ca: 0.04, P: 0.38, NDT: 80, EE: 1.8, FB: 3.2 },
                'afrecho_trigo': { nombre: 'Afrechillo de trigo', MS: 88, PB: 15.0, EM: 2.80, Ca: 0.05, P: 0.40, NDT: 70, EE: 3.5, FB: 8.5 },
                'germen_trigo': { nombre: 'Germen de trigo', MS: 90, PB: 28.0, EM: 3.30, Ca: 0.08, P: 1.00, NDT: 82, EE: 10.5, FB: 3.2 },
                'salvado_trigo': { nombre: 'Salvado de trigo', MS: 89, PB: 15.5, EM: 2.75, Ca: 0.10, P: 1.15, NDT: 68, EE: 3.8, FB: 10.5 }
            }
        },
        'avena': {
            nombre: 'Avena',
            categoria: 'grano',
            variedades: {
                'avena_entera': { nombre: 'Avena entera', MS: 89, PB: 11.5, EM: 3.10, Ca: 0.07, P: 0.35, NDT: 75, EE: 5.0, FB: 10.5 },
                'avena_rolada': { nombre: 'Avena rolada', MS: 88, PB: 11.2, EM: 3.05, Ca: 0.07, P: 0.34, NDT: 74, EE: 4.8, FB: 10.8 },
                'afrecho_avena': { nombre: 'Afrecho de avena', MS: 89, PB: 6.5, EM: 2.85, Ca: 0.08, P: 0.23, NDT: 65, EE: 4.2, FB: 26.0 }
            }
        },
        'centeno': {
            nombre: 'Centeno',
            categoria: 'grano',
            variedades: {
                'centeno_entero': { nombre: 'Centeno entero', MS: 88, PB: 12.0, EM: 3.05, Ca: 0.06, P: 0.35, NDT: 78, EE: 2.0, FB: 2.5 },
                'centeno_rolado': { nombre: 'Centeno rolado', MS: 87, PB: 11.8, EM: 3.02, Ca: 0.06, P: 0.34, NDT: 77, EE: 1.9, FB: 2.6 }
            }
        },
        'triticale': {
            nombre: 'Triticale',
            categoria: 'grano',
            variedades: {
                'triticale_entero': { nombre: 'Triticale entero', MS: 88, PB: 12.5, EM: 3.10, Ca: 0.05, P: 0.38, NDT: 80, EE: 2.0, FB: 2.8 },
                'triticale_rolado': { nombre: 'Triticale rolado', MS: 87, PB: 12.3, EM: 3.08, Ca: 0.05, P: 0.37, NDT: 79, EE: 1.9, FB: 2.9 }
            }
        },
        // SILAJES
        'silaje_maiz': {
            nombre: 'Silaje de Maíz',
            categoria: 'forraje',
            variedades: {
                'silaje_maiz_temprano': { nombre: 'Silaje maíz cosecha temprana', MS: 28, PB: 2.4, EM: 1.08, Ca: 0.09, P: 0.07, NDT: 28, EE: 0.7, FB: 5.5 },
                'silaje_maiz_optimo': { nombre: 'Silaje maíz punto óptimo', MS: 32, PB: 2.8, EM: 1.25, Ca: 0.10, P: 0.08, NDT: 32, EE: 0.8, FB: 6.0 },
                'silaje_maiz_tardio': { nombre: 'Silaje maíz cosecha tardía', MS: 35, PB: 3.0, EM: 1.35, Ca: 0.10, P: 0.08, NDT: 35, EE: 0.9, FB: 6.5 },
                'silaje_maiz_chopo': { nombre: 'Silaje maíz con chopo', MS: 30, PB: 2.6, EM: 1.18, Ca: 0.09, P: 0.07, NDT: 30, EE: 0.8, FB: 5.8 },
                'silaje_maiz_mazorca': { nombre: 'Silaje de mazorca', MS: 40, PB: 3.5, EM: 1.55, Ca: 0.12, P: 0.10, NDT: 42, EE: 1.2, FB: 4.5 },
                'silaje_maiz_deshidratado': { nombre: 'Silaje deshidratado', MS: 88, PB: 8.0, EM: 3.40, Ca: 0.28, P: 0.22, NDT: 85, EE: 2.0, FB: 15.0 }
            }
        },
        'silaje_sorgo': {
            nombre: 'Silaje de Sorgo',
            categoria: 'forraje',
            variedades: {
                'silaje_sorgo_grano': { nombre: 'Silaje sorgo grano', MS: 30, PB: 2.2, EM: 1.12, Ca: 0.08, P: 0.07, NDT: 30, EE: 0.7, FB: 7.0 },
                'silaje_sorgo_forrajero': { nombre: 'Silaje sorgo forrajero', MS: 22, PB: 1.8, EM: 0.85, Ca: 0.06, P: 0.05, NDT: 22, EE: 0.5, FB: 8.5 },
                'silaje_sorgo_doble': { nombre: 'Silaje sorgo doble propósito', MS: 26, PB: 2.0, EM: 1.00, Ca: 0.07, P: 0.06, NDT: 26, EE: 0.6, FB: 7.8 },
                'silaje_sorgo_sudan': { nombre: 'Silaje sorgo sudan', MS: 20, PB: 1.6, EM: 0.78, Ca: 0.05, P: 0.05, NDT: 20, EE: 0.5, FB: 9.0 },
                'silaje_sorgo_dulce': { nombre: 'Silaje sorgo dulce', MS: 18, PB: 1.4, EM: 0.70, Ca: 0.05, P: 0.04, NDT: 18, EE: 0.4, FB: 7.5 }
            }
        },
        'silaje_cebada': {
            nombre: 'Silaje de Cebada',
            categoria: 'forraje',
            variedades: {
                'silaje_cebada_entera': { nombre: 'Silaje cebada entera', MS: 32, PB: 3.2, EM: 1.15, Ca: 0.09, P: 0.08, NDT: 32, EE: 1.0, FB: 8.5 },
                'silaje_cebada_cervecera': { nombre: 'Silaje cebada cervecera', MS: 30, PB: 3.0, EM: 1.10, Ca: 0.08, P: 0.07, NDT: 30, EE: 0.9, FB: 8.0 }
            }
        },
        'silaje_avena': {
            nombre: 'Silaje de Avena',
            categoria: 'forraje',
            variedades: {
                'silaje_avena_entera': { nombre: 'Silaje avena entera', MS: 28, PB: 2.6, EM: 1.05, Ca: 0.08, P: 0.07, NDT: 28, EE: 0.9, FB: 9.0 },
                'silaje_avena_vegetativo': { nombre: 'Silaje avena vegetativo', MS: 18, PB: 2.0, EM: 0.72, Ca: 0.06, P: 0.05, NDT: 20, EE: 0.6, FB: 10.5 }
            }
        },
        'silaje_triticale': {
            nombre: 'Silaje de Triticale',
            categoria: 'forraje',
            variedades: {
                'silaje_triticale_lechoso': { nombre: 'Silaje triticale estado lechoso', MS: 30, PB: 3.0, EM: 1.12, Ca: 0.09, P: 0.08, NDT: 30, EE: 0.9, FB: 8.0 },
                'silaje_triticale_pastoso': { nombre: 'Silaje triticale estado pastoso', MS: 35, PB: 3.4, EM: 1.28, Ca: 0.10, P: 0.09, NDT: 35, EE: 1.0, FB: 7.2 }
            }
        },
        'heno_silaje': {
            nombre: 'Heno-Silaje',
            categoria: 'forraje',
            variedades: {
                'henosilaje_alfalfa': { nombre: 'Heno-silaje de alfalfa', MS: 55, PB: 10.5, EM: 1.45, Ca: 0.90, P: 0.18, NDT: 55, EE: 1.8, FB: 22.0 },
                'henosilaje_trebol': { nombre: 'Heno-silaje de trébol', MS: 50, PB: 12.0, EM: 1.50, Ca: 1.00, P: 0.22, NDT: 58, EE: 2.0, FB: 20.0 },
                'henosilaje_ballica': { nombre: 'Heno-silaje de ballica', MS: 45, PB: 8.0, EM: 1.20, Ca: 0.35, P: 0.22, NDT: 48, EE: 1.5, FB: 26.0 },
                'henosilaje_pradera': { nombre: 'Heno-silaje de pradera', MS: 48, PB: 9.0, EM: 1.25, Ca: 0.50, P: 0.24, NDT: 50, EE: 1.6, FB: 28.0 }
            }
        },
        // FUENTES PROTEICAS
        'soja': {
            nombre: 'Soja',
            categoria: 'proteico',
            variedades: {
                'harina_soja_44': { nombre: 'Harina de soja 44% PB', MS: 90, PB: 44.0, EM: 3.15, Ca: 0.30, P: 0.65, NDT: 78, EE: 1.5, FB: 5.8 },
                'harina_soja_48': { nombre: 'Harina de soja 48% PB', MS: 90, PB: 48.0, EM: 3.25, Ca: 0.32, P: 0.70, NDT: 80, EE: 1.2, FB: 3.5 },
                'expeller_soja': { nombre: 'Expeller de soja', MS: 90, PB: 42.0, EM: 3.05, Ca: 0.25, P: 0.60, NDT: 76, EE: 7.5, FB: 6.0 },
                'soja_tostada': { nombre: 'Soja tostada', MS: 92, PB: 38.0, EM: 3.20, Ca: 0.28, P: 0.58, NDT: 78, EE: 19.0, FB: 5.5 },
                'soja_entera': { nombre: 'Soja entera', MS: 92, PB: 35.0, EM: 3.35, Ca: 0.25, P: 0.55, NDT: 85, EE: 18.5, FB: 5.2 },
                'torta_soja': { nombre: 'Torta de soja solvente', MS: 90, PB: 44.0, EM: 3.10, Ca: 0.30, P: 0.65, NDT: 78, EE: 1.0, FB: 6.0 }
            }
        },
        'girasol': {
            nombre: 'Girasol',
            categoria: 'proteico',
            variedades: {
                'torta_girasol_28': { nombre: 'Torta de girasol 28% PB', MS: 91, PB: 28.0, EM: 2.65, Ca: 0.45, P: 1.00, NDT: 68, EE: 1.5, FB: 22.0 },
                'torta_girasol_32': { nombre: 'Torta de girasol 32% PB', MS: 91, PB: 32.0, EM: 2.75, Ca: 0.40, P: 0.95, NDT: 72, EE: 1.2, FB: 18.0 },
                'torta_girasol_36': { nombre: 'Torta de girasol 36% PB', MS: 91, PB: 36.0, EM: 2.85, Ca: 0.38, P: 0.90, NDT: 75, EE: 1.0, FB: 14.0 },
                'expeller_girasol': { nombre: 'Expeller de girasol', MS: 93, PB: 26.0, EM: 2.80, Ca: 0.35, P: 0.85, NDT: 70, EE: 13.0, FB: 24.0 }
            }
        },
        'mani': {
            nombre: 'Maní',
            categoria: 'proteico',
            variedades: {
                'torta_mani': { nombre: 'Torta de maní descascarado', MS: 92, PB: 48.0, EM: 3.20, Ca: 0.15, P: 0.65, NDT: 78, EE: 1.0, FB: 6.5 },
                'expeller_mani': { nombre: 'Expeller de maní', MS: 94, PB: 45.0, EM: 3.35, Ca: 0.12, P: 0.60, NDT: 80, EE: 8.5, FB: 7.0 },
                'mani_entero': { nombre: 'Maní entero tostado', MS: 95, PB: 25.0, EM: 3.80, Ca: 0.07, P: 0.38, NDT: 88, EE: 48.0, FB: 8.5 }
            }
        },
        'algodon': {
            nombre: 'Algodón',
            categoria: 'proteico',
            variedades: {
                'torta_algodon_36': { nombre: 'Torta de algodón 36% PB', MS: 91, PB: 36.0, EM: 2.85, Ca: 0.20, P: 1.00, NDT: 72, EE: 1.0, FB: 14.0 },
                'torta_algodon_41': { nombre: 'Torta de algodón 41% PB', MS: 91, PB: 41.0, EM: 3.00, Ca: 0.18, P: 0.95, NDT: 76, EE: 0.8, FB: 10.0 },
                'torta_algodon_44': { nombre: 'Torta de algodón 44% PB', MS: 91, PB: 44.0, EM: 3.10, Ca: 0.16, P: 0.90, NDT: 78, EE: 0.5, FB: 7.0 },
                'semilla_algodon': { nombre: 'Semilla de algodón entera', MS: 92, PB: 22.0, EM: 3.55, Ca: 0.15, P: 0.75, NDT: 85, EE: 20.0, FB: 20.0 }
            }
        },
        'sesamo': {
            nombre: 'Sésamo',
            categoria: 'proteico',
            variedades: {
                'torta_sesamo': { nombre: 'Torta de sésamo', MS: 93, PB: 42.0, EM: 2.90, Ca: 2.20, P: 1.30, NDT: 75, EE: 1.5, FB: 6.0 }
            }
        },
        'linaza': {
            nombre: 'Linaza',
            categoria: 'proteico',
            variedades: {
                'torta_linaza': { nombre: 'Torta de linaza', MS: 91, PB: 33.0, EM: 2.70, Ca: 0.40, P: 0.85, NDT: 70, EE: 5.0, FB: 10.0 },
                'linaza_entera': { nombre: 'Linaza entera', MS: 93, PB: 22.0, EM: 3.65, Ca: 0.25, P: 0.55, NDT: 82, EE: 37.0, FB: 7.0 }
            }
        },
        'urea': {
            nombre: 'Urea',
            categoria: 'proteico',
            variedades: {
                'urea': { nombre: 'Urea (46% N)', MS: 99, PB: 287.5, EM: 0, Ca: 0, P: 0, NDT: 0, EE: 0, FB: 0 },
                'urea_pecuaria': { nombre: 'Urea pecuaria gránulos', MS: 99, PB: 287.5, EM: 0, Ca: 0, P: 0, NDT: 0, EE: 0, FB: 0 }
            }
        },
        // SUBPRODUCTOS INDUSTRIALES
        'subproductos_citricos': {
            nombre: 'Subproductos Cítricos',
            categoria: 'proteico',
            variedades: {
                'pulpa_citrica': { nombre: 'Pulpa cítrica deshidratada', MS: 92, PB: 6.5, EM: 2.65, Ca: 1.80, P: 0.12, NDT: 75, EE: 2.5, FB: 12.0 },
                'pulpa_citrica_pellet': { nombre: 'Pellet de pulpa cítrica', MS: 91, PB: 6.0, EM: 2.60, Ca: 1.75, P: 0.11, NDT: 74, EE: 2.3, FB: 12.5 },
                'bagazo_naranja': { nombre: 'Bagazo de naranja', MS: 10, PB: 0.9, EM: 0.28, Ca: 0.18, P: 0.02, NDT: 8, EE: 0.3, FB: 1.8 },
                'bagazo_naranja_deshidratado': { nombre: 'Bagazo naranja deshidratado', MS: 91, PB: 6.0, EM: 1.85, Ca: 1.50, P: 0.10, NDT: 50, EE: 2.2, FB: 22.0 },
                'pulpa_limon': { nombre: 'Pulpa de limón', MS: 15, PB: 1.2, EM: 0.38, Ca: 0.25, P: 0.03, NDT: 12, EE: 0.4, FB: 2.5 }
            }
        },
        'pulpa_remo': {
            nombre: 'Pulpa de Remolacha',
            categoria: 'proteico',
            variedades: {
                'pulpa_remo_deshidratada': { nombre: 'Pulpa de remolacha deshidratada', MS: 91, PB: 9.0, EM: 2.75, Ca: 0.65, P: 0.10, NDT: 72, EE: 0.5, FB: 18.0 },
                'pulpa_remo_pellet': { nombre: 'Pellet de pulpa remolacha', MS: 91, PB: 8.5, EM: 2.70, Ca: 0.62, P: 0.09, NDT: 71, EE: 0.5, FB: 19.0 },
                'pulpa_remo_ensilada': { nombre: 'Pulpa de remolacha ensilada', MS: 22, PB: 2.0, EM: 0.65, Ca: 0.15, P: 0.02, NDT: 16, EE: 0.1, FB: 4.0 }
            }
        },
        'melaza': {
            nombre: 'Melaza',
            categoria: 'energetico',
            variedades: {
                'melaza_cana': { nombre: 'Melaza de caña', MS: 75, PB: 3.0, EM: 2.50, Ca: 0.80, P: 0.08, NDT: 60, EE: 0, FB: 0 },
                'melaza_cana_mayor': { nombre: 'Melaza de caña (MS mayor)', MS: 82, PB: 3.5, EM: 2.75, Ca: 0.90, P: 0.10, NDT: 65, EE: 0, FB: 0 },
                'melaza_cana_proteica': { nombre: 'Melaza proteica (urea)', MS: 78, PB: 8.0, EM: 2.55, Ca: 0.82, P: 0.09, NDT: 62, EE: 0, FB: 0 },
                'melaza_betabel': { nombre: 'Melaza de betabel', MS: 78, PB: 6.0, EM: 2.60, Ca: 0.15, P: 0.02, NDT: 62, EE: 0, FB: 0 }
            }
        },
        'ddgs': {
            nombre: 'DDGS (Subproducto Etanol)',
            categoria: 'proteico',
            variedades: {
                'ddgs_maiz': { nombre: 'DDGS de maíz', MS: 90, PB: 27.0, EM: 3.35, Ca: 0.05, P: 0.75, NDT: 82, EE: 10.5, FB: 7.0 },
                'ddgs_maiz_alto': { nombre: 'DDGS maíz alto proteína', MS: 90, PB: 30.0, EM: 3.40, Ca: 0.06, P: 0.82, NDT: 84, EE: 9.5, FB: 6.5 },
                'ddgs_maiz_pellet': { nombre: 'DDGS maíz en pellet', MS: 91, PB: 27.5, EM: 3.38, Ca: 0.05, P: 0.77, NDT: 83, EE: 10.0, FB: 6.8 },
                'ddgs_sorgo': { nombre: 'DDGS de sorgo', MS: 90, PB: 28.0, EM: 3.20, Ca: 0.08, P: 0.65, NDT: 78, EE: 9.0, FB: 8.0 },
                'wdgs_maiz': { nombre: 'WDGS maíz (húmedo)', MS: 35, PB: 10.5, EM: 1.30, Ca: 0.02, P: 0.30, NDT: 32, EE: 4.0, FB: 2.8 },
                'dwgs_maiz': { nombre: 'DWGS maíz (semihúmedo)', MS: 50, PB: 15.0, EM: 1.85, Ca: 0.03, P: 0.42, NDT: 45, EE: 5.8, FB: 4.0 }
            }
        },
        'cebada_grano': {
            nombre: 'Cebada en Grano',
            categoria: 'grano',
            variedades: {
                'cebada_grano_dos_hileras': { nombre: 'Cebada grano 2 hileras', MS: 88, PB: 11.5, EM: 3.08, Ca: 0.05, P: 0.36, NDT: 78, EE: 2.3, FB: 5.2 },
                'cebada_grano_seis_hileras': { nombre: 'Cebada grano 6 hileras', MS: 88, PB: 11.0, EM: 3.05, Ca: 0.05, P: 0.35, NDT: 77, EE: 2.2, FB: 5.5 },
                'cebada_grano_malteado': { nombre: 'Cebada malteada grano', MS: 92, PB: 11.8, EM: 3.12, Ca: 0.06, P: 0.39, NDT: 81, EE: 2.0, FB: 4.2 }
            }
        },
        'subproductos_industriales': {
            nombre: 'Subproductos Industriales',
            categoria: 'proteico',
            variedades: {
                'levadura_cerveza': { nombre: 'Levadura de cerveza', MS: 93, PB: 45.0, EM: 2.85, Ca: 0.20, P: 1.40, NDT: 75, EE: 1.5, FB: 3.0 },
                'levadura_destileria': { nombre: 'Levadura de destilería', MS: 92, PB: 42.0, EM: 2.80, Ca: 0.18, P: 1.30, NDT: 73, EE: 1.8, FB: 4.0 },
                'residuos_cerveza': { nombre: 'Residuos de cerveza (barrillo)', MS: 25, PB: 5.0, EM: 0.65, Ca: 0.08, P: 0.20, NDT: 22, EE: 0.5, FB: 3.5 },
                'residuos_malta': { nombre: 'Residuos de malta', MS: 75, PB: 22.0, EM: 2.45, Ca: 0.25, P: 0.50, NDT: 65, EE: 6.0, FB: 14.0 },
                'residuos_citricos': { nombre: 'Residuos de fermentación cítrica', MS: 35, PB: 12.0, EM: 1.10, Ca: 0.35, P: 0.28, NDT: 35, EE: 2.5, FB: 10.0 },
                'posa_aceite': { nombre: 'Posa de aceite', MS: 95, PB: 0, EM: 7.80, Ca: 0.05, P: 0.02, NDT: 180, EE: 95.0, FB: 0 }
            }
        },
        'harinas_pescado': {
            nombre: 'Harinas de Pescado',
            categoria: 'proteico',
            variedades: {
                'harina_pescado_60': { nombre: 'Harina pescado 60% PB', MS: 92, PB: 60.0, EM: 3.20, Ca: 6.50, P: 3.50, NDT: 78, EE: 8.0, FB: 1.0 },
                'harina_pescado_65': { nombre: 'Harina pescado 65% PB', MS: 92, PB: 65.0, EM: 3.30, Ca: 7.00, P: 3.80, NDT: 80, EE: 7.5, FB: 0.8 },
                'harina_pescado_70': { nombre: 'Harina pescado 70% PB', MS: 92, PB: 70.0, EM: 3.40, Ca: 7.50, P: 4.00, NDT: 82, EE: 7.0, FB: 0.5 }
            }
        },
        'harinas_carne': {
            nombre: 'Harinas de Carne y Hueso',
            categoria: 'proteico',
            variedades: {
                'harina_carne_50': { nombre: 'Harina carne 50% PB', MS: 93, PB: 50.0, EM: 3.00, Ca: 8.50, P: 4.20, NDT: 70, EE: 10.0, FB: 2.0 },
                'harina_carne_55': { nombre: 'Harina carne 55% PB', MS: 93, PB: 55.0, EM: 3.10, Ca: 9.00, P: 4.50, NDT: 72, EE: 9.5, FB: 1.5 },
                'harina_hueso': { nombre: 'Harina de hueso', MS: 95, PB: 12.0, EM: 1.20, Ca: 28.0, P: 12.5, NDT: 20, EE: 4.0, FB: 3.0 },
                'harina_sangre': { nombre: 'Harina de sangre', MS: 92, PB: 82.0, EM: 3.25, Ca: 0.30, P: 0.25, NDT: 85, EE: 1.5, FB: 1.0 }
            }
        },
        'harinas_plumas': {
            nombre: 'Harinas de Plumas y Subproductos',
            categoria: 'proteico',
            variedades: {
                'harina_plumas_hidrolizada': { nombre: 'Harina plumas hidrolizada', MS: 92, PB: 80.0, EM: 3.80, Ca: 0.40, P: 0.30, NDT: 75, EE: 4.0, FB: 2.5 },
                'harina_pollos': { nombre: 'Harina de desecho de pollos', MS: 92, PB: 55.0, EM: 3.10, Ca: 4.50, P: 2.50, NDT: 72, EE: 12.0, FB: 3.0 }
            }
        },
        // FORRAJES Y PASTOS
        'alfalfa': {
            nombre: 'Alfalfa',
            categoria: 'forraje',
            variedades: {
                'alfalfa_heno': { nombre: 'Heno de alfalfa', MS: 89, PB: 17.0, EM: 2.20, Ca: 1.40, P: 0.25, NDT: 62, EE: 2.5, FB: 25.0 },
                'alfalfa_seno': { nombre: 'Alfalfa en seno', MS: 45, PB: 8.0, EM: 1.10, Ca: 0.70, P: 0.12, NDT: 30, EE: 1.2, FB: 12.5 },
                'alfalfa_pastoreo': { nombre: 'Alfalfa pastoreo', MS: 20, PB: 4.0, EM: 0.50, Ca: 0.35, P: 0.06, NDT: 14, EE: 0.6, FB: 6.0 },
                'alfalfa_pellet': { nombre: 'Pellet de alfalfa', MS: 91, PB: 16.5, EM: 2.15, Ca: 1.35, P: 0.24, NDT: 60, EE: 2.3, FB: 27.0 }
            }
        },
        'pasturas': {
            nombre: 'Pasturas',
            categoria: 'forraje',
            variedades: {
                'pastura_verde': { nombre: 'Pastura verde promedio', MS: 20, PB: 3.5, EM: 0.48, Ca: 0.25, P: 0.05, NDT: 13, EE: 0.5, FB: 6.5 },
                'ballica_heno': { nombre: 'Heno de ballica', MS: 88, PB: 10.0, EM: 1.95, Ca: 0.40, P: 0.28, NDT: 58, EE: 2.0, FB: 28.0 },
                'ballica_seno': { nombre: 'Ballica en seno', MS: 40, PB: 4.5, EM: 0.90, Ca: 0.18, P: 0.12, NDT: 26, EE: 0.9, FB: 12.5 },
                'avena_heno': { nombre: 'Heno de avena', MS: 88, PB: 8.5, EM: 1.85, Ca: 0.30, P: 0.25, NDT: 55, EE: 2.5, FB: 30.0 },
                'sorgo_sudan': { nombre: 'Sorgo sudan verde', MS: 20, PB: 3.0, EM: 0.45, Ca: 0.20, P: 0.04, NDT: 12, EE: 0.4, FB: 7.0 },
                'maiz_silaje': { nombre: 'Silaje de maíz', MS: 35, PB: 3.0, EM: 1.35, Ca: 0.10, P: 0.08, NDT: 35, EE: 0.8, FB: 7.0 },
                'sorgo_silaje': { nombre: 'Silaje de sorgo', MS: 30, PB: 2.5, EM: 1.20, Ca: 0.08, P: 0.07, NDT: 30, EE: 0.7, FB: 8.0 }
            }
        },
        'henos_varios': {
            nombre: 'Henos Varios',
            categoria: 'forraje',
            variedades: {
                'heno_trebol': { nombre: 'Heno de trébol', MS: 88, PB: 14.0, EM: 2.05, Ca: 1.20, P: 0.28, NDT: 60, EE: 2.8, FB: 22.0 },
                'heno_trebol_rojo': { nombre: 'Heno trébol rojo', MS: 87, PB: 15.0, EM: 2.10, Ca: 1.30, P: 0.30, NDT: 62, EE: 3.0, FB: 20.0 },
                'heno_mixed': { nombre: 'Heno mixto', MS: 88, PB: 11.0, EM: 1.90, Ca: 0.50, P: 0.25, NDT: 56, EE: 2.2, FB: 26.0 },
                'heno_pradera': { nombre: 'Heno de pradera', MS: 88, PB: 9.0, EM: 1.80, Ca: 0.45, P: 0.22, NDT: 52, EE: 2.0, FB: 30.0 },
                'heno_paja': { nombre: 'Paja de trigo', MS: 89, PB: 3.5, EM: 1.40, Ca: 0.25, P: 0.08, NDT: 38, EE: 1.2, FB: 42.0 },
                'heno_paja_cebada': { nombre: 'Paja de cebada', MS: 88, PB: 4.0, EM: 1.45, Ca: 0.30, P: 0.10, NDT: 40, EE: 1.5, FB: 38.0 },
                'heno_paja_arroz': { nombre: 'Paja de arroz', MS: 90, PB: 3.8, EM: 1.35, Ca: 0.35, P: 0.12, NDT: 35, EE: 1.3, FB: 36.0 }
            }
        },
        'pasturas_verdes': {
            nombre: 'Pasturas en Verde',
            categoria: 'forraje',
            variedades: {
                'pastura_alfalfa_vegetativo': { nombre: 'Alfalfa vegetativo', MS: 20, PB: 5.0, EM: 0.50, Ca: 0.45, P: 0.08, NDT: 18, EE: 0.8, FB: 7.0 },
                'pastura_alfalfa_boton': { nombre: 'Alfalfa botón floral', MS: 22, PB: 4.5, EM: 0.52, Ca: 0.42, P: 0.07, NDT: 19, EE: 0.7, FB: 7.5 },
                'pastura_alfalfa_flor': { nombre: 'Alfalfa floración', MS: 25, PB: 4.0, EM: 0.55, Ca: 0.38, P: 0.06, NDT: 20, EE: 0.6, FB: 8.0 },
                'pastura_ballica_vegetativo': { nombre: 'Ballica vegetativa', MS: 18, PB: 3.0, EM: 0.42, Ca: 0.22, P: 0.12, NDT: 15, EE: 0.6, FB: 8.5 },
                'pastura_ballica_espigazon': { nombre: 'Ballica espigazón', MS: 22, PB: 2.5, EM: 0.45, Ca: 0.20, P: 0.10, NDT: 16, EE: 0.5, FB: 9.0 },
                'pastura_cebada_forrajera': { nombre: 'Cebada forrajera', MS: 20, PB: 3.2, EM: 0.48, Ca: 0.25, P: 0.14, NDT: 17, EE: 0.7, FB: 8.0 },
                'pastura_raigras': { nombre: 'Raigrás anual', MS: 18, PB: 2.8, EM: 0.40, Ca: 0.20, P: 0.10, NDT: 14, EE: 0.5, FB: 9.0 }
            }
        },
        'alimentos_balanceados': {
            nombre: 'Alimentos Balanceados',
            categoria: 'proteico',
            variedades: {
                'concentrado_inicio': { nombre: 'Concentrado inicio 18% PB', MS: 88, PB: 18.0, EM: 3.15, Ca: 0.85, P: 0.45, NDT: 78, EE: 3.5, FB: 8.0 },
                'concentrado_crecimiento': { nombre: 'Concentrado crecimiento 16% PB', MS: 88, PB: 16.0, EM: 3.20, Ca: 0.75, P: 0.40, NDT: 80, EE: 3.2, FB: 7.5 },
                'concentrado_engorde': { nombre: 'Concentrado engorde 14% PB', MS: 88, PB: 14.0, EM: 3.25, Ca: 0.65, P: 0.35, NDT: 82, EE: 3.0, FB: 7.0 },
                'concentrado_finalizacion': { nombre: 'Concentrado finalización 12% PB', MS: 88, PB: 12.0, EM: 3.30, Ca: 0.55, P: 0.30, NDT: 84, EE: 2.8, FB: 6.5 },
                'premezcla_proteica': { nombre: 'Premezcla proteica 35% PB', MS: 90, PB: 35.0, EM: 3.00, Ca: 1.50, P: 0.80, NDT: 75, EE: 5.0, FB: 6.0 },
                'suplemento_mineral': { nombre: 'Suplemento mineral completo', MS: 96, PB: 0, EM: 0, Ca: 22.0, P: 12.0, NDT: 0, EE: 0, FB: 0 }
            }
        },
        // MINERALES Y PREMEZCLAS
        'sal': {
            nombre: 'Sal',
            categoria: 'mineral',
            variedades: {
                'sal_comun': { nombre: 'Sal común', MS: 99, PB: 0, EM: 0, Ca: 0, P: 0, NDT: 0, EE: 0, FB: 0 },
                'sal_yodada': { nombre: 'Sal yodada', MS: 99, PB: 0, EM: 0, Ca: 0, P: 0, NDT: 0, EE: 0, FB: 0 }
            }
        },
        'premezcla': {
            nombre: 'Premezcla Mineral',
            categoria: 'mineral',
            variedades: {
                'premezcla_engorde': { nombre: 'Premezcla engorde (15% Ca, 8% P)', MS: 95, PB: 0, EM: 0, Ca: 15.0, P: 8.0, NDT: 0, EE: 0, FB: 0 },
                'premezcla_cria': { nombre: 'Premezcla cría (18% Ca, 10% P)', MS: 95, PB: 0, EM: 0, Ca: 18.0, P: 10.0, NDT: 0, EE: 0, FB: 0 },
                'fosfato_bicalcico': { nombre: 'Fosfato bicálcico', MS: 99, PB: 0, EM: 0, Ca: 24.0, P: 18.0, NDT: 0, EE: 0, FB: 0 },
                'caliza': { nombre: 'Carbonato de calcio (caliza)', MS: 99, PB: 0, EM: 0, Ca: 38.0, P: 0, NDT: 0, EE: 0, FB: 0 },
                'oxido_magnesio': { nombre: 'Óxido de magnesio', MS: 99, PB: 0, EM: 0, Ca: 0, P: 0, NDT: 0, EE: 0, FB: 0 }
            }
        },
        // ADITIVOS
        'grasa': {
            nombre: 'Grasa/Sebo',
            categoria: 'aditivo',
            variedades: {
                'grasa_protegida': { nombre: 'Grasa protegida (calcio)', MS: 99, PB: 0, EM: 6.50, Ca: 9.0, P: 0, NDT: 180, EE: 99.0, FB: 0 },
                'sebo': { nombre: 'Sebo bovino', MS: 99, PB: 0, EM: 7.20, Ca: 0, P: 0, NDT: 200, EE: 99.0, FB: 0 },
                'aceite_soja': { nombre: 'Aceite de soja', MS: 99, PB: 0, EM: 8.80, Ca: 0, P: 0, NDT: 220, EE: 99.0, FB: 0 },
                'aceite_girasol': { nombre: 'Aceite de girasol', MS: 99, PB: 0, EM: 8.70, Ca: 0, P: 0, NDT: 218, EE: 99.0, FB: 0 }
            }
        },
        'subproductos_lecheria': {
            nombre: 'Subproductos Lácteos',
            categoria: 'proteico',
            variedades: {
                'suero_lacteo': { nombre: 'Suero de leche en polvo', MS: 97, PB: 13.0, EM: 3.00, Ca: 0.85, P: 0.75, NDT: 82, EE: 1.0, FB: 0 },
                'suero_lactosa': { nombre: 'Suero bajo lactosa', MS: 95, PB: 15.0, EM: 3.10, Ca: 0.90, P: 0.80, NDT: 84, EE: 1.5, FB: 0 },
                'leche_entera': { nombre: 'Leche entera en polvo', MS: 97, PB: 26.0, EM: 5.30, Ca: 0.95, P: 0.75, NDT: 95, EE: 27.0, FB: 0 }
            }
        }
    },
    
    render() {
        const section = document.getElementById('dietas');
        
        if (!section) {
            console.error('[DietasSection] ERROR: No se encontró el elemento #dietas');
            return;
        }
        
        if (!AppState.dietaActiva && AppData.dietas && AppData.dietas.length > 0) {
            AppState.dietaActiva = AppData.dietas[0];
        }
        
        section.innerHTML = `
            <!-- NAVEGACIÓN -->
            <div class="sanidad-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e9ecef;">
                <button class="tab-btn ${this.vistaActual === 'laboratorio' ? 'active' : ''}" onclick="DietasSection.cambiarVista('laboratorio')">
                    🧪 Formulación
                </button>
                <button class="tab-btn ${this.vistaActual === 'historial' ? 'active' : ''}" onclick="DietasSection.cambiarVista('historial')">
                    📊 Historial de Costos
                </button>
            </div>

            <!-- CONTENIDO -->
            <div id="dietasContent">
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
        try {
            switch(this.vistaActual) {
                case 'laboratorio':
                    return this.renderLaboratorio();
                case 'historial':
                    return this.renderHistorial();
                default:
                    return this.renderLaboratorio();
            }
        } catch (error) {
            console.error('[DietasSection] Error en renderContenidoVista:', error);
            return `<div class="card" style="padding: 40px; text-align: center; color: var(--danger);">
                <h3>⚠️ Error al cargar la vista</h3>
                <p>${error.message}</p>
            </div>`;
        }
    },

    // ============ VISTA LABORATORIO ============
    renderLaboratorio() {
        if (!AppData.dietas) AppData.dietas = [];
        
        return `
            <div class="grid-2">
                <!-- PANEL IZQUIERDO -->
                <div>
                    <!-- Selector de dieta -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">🥗 Mis Dietas</h3>
                            <button class="btn btn-primary btn-sm" onclick="DietasSection.nuevaDieta()">+ Nueva</button>
                        </div>
                        <div style="padding: 20px;">
                            <div class="form-group">
                                <label class="form-label">Dieta activa</label>
                                <select class="form-select" id="selectorDieta" onchange="DietasSection.cambiarDieta(this.value)">
                                    ${(AppData.dietas || []).length > 0 ? (AppData.dietas || []).map(d => `
                                        <option value="${d?.id || ''}" ${AppState.dietaActiva?.id === d?.id ? 'selected' : ''}>
                                            ${d?.nombre || 'Sin nombre'} (${d?.categoria || 'General'})
                                        </option>
                                    `).join('') : '<option value="">No hay dietas</option>'}
                                </select>
                            </div>
                            
                            ${AppState.dietaActiva ? `
                                <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                        <span style="color: #666;">Categoría:</span>
                                        <span class="badge badge-info">${AppState.dietaActiva.categoria || 'General'}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                        <span style="color: #666;">MS:</span>
                                        <strong>${AppState.dietaActiva.ms || 85}%</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                        <span style="color: #666;">Costo (tal cual):</span>
                                        <strong style="color: var(--primary);">${Formatters.currency((AppState.dietaActiva?.costo || 0) * 1000)}/ton</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: #666;">Costo (base seca):</span>
                                        <strong style="color: var(--success);">${Formatters.currency(this.calcularCostoDietaMS(AppState.dietaActiva) * 1000)}/ton MS</strong>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Composición -->
                    ${AppState.dietaActiva ? this.renderComposicionDieta() : ''}
                </div>

                <!-- PANEL DERECHO -->
                <div>
                    <!-- Análisis nutricional -->
                    ${AppState.dietaActiva ? this.renderAnalisisNutricional() : 
                        '<div class="card" style="padding: 40px; text-align: center;"><p>Seleccione o cree una dieta para comenzar</p></div>'}

                    <!-- Costo resumen -->
                    ${AppState.dietaActiva ? `
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">💰 Costo de la Dieta</h3>
                            </div>
                            <div style="padding: 20px; text-align: center;">
                                <div style="font-size: 32px; font-weight: 700; color: var(--primary);">
                                    ${Formatters.currency((AppState.dietaActiva?.costo || 0) * 1000)}/ton
                                </div>
                                <div style="font-size: 14px; color: #666; margin-top: 8px;">
                                    ${Formatters.currency(this.calcularCostoDietaMS(AppState.dietaActiva) * 1000)}/ton MS (base seca)
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderComposicionDieta() {
        if (!AppState.dietaActiva) {
            return '';
        }
        const ingredientes = AppState.dietaActiva.ingredientes || [];
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📝 Composición</h3>
                    <button class="btn btn-sm btn-secondary" onclick="DietasSection.editarComposicion()">✏️ Editar</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Ingrediente</th>
                                <th>%</th>
                                <th>kg/ton</th>
                                <th>Costo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ingredientes.map(ing => {
                                const porcentaje = parseFloat(ing.porcentaje) || 0;
                                let costoUnitario = parseFloat(ing.costo) || 0;
                                if (!costoUnitario && ing.nombre) {
                                    const ingDB = this.getIngredienteDB(ing.nombre);
                                    if (ingDB) costoUnitario = parseFloat(ingDB.costo) || 0;
                                }
                                // Costo en $/ton de este ingrediente en la dieta: precio $/ton * porcentaje
                                const costo = costoUnitario * (porcentaje / 100);
                                return `
                                    <tr>
                                        <td><strong>${ing.nombre || 'Sin nombre'}</strong></td>
                                        <td>${porcentaje.toFixed(1)}%</td>
                                        <td>${(porcentaje * 10).toFixed(1)} kg</td>
                                        <td>${Formatters.currency(costo)}/ton</td>
                                    </tr>
                                `;
                            }).join('')}
                            <tr style="background: #f8f9fa; font-weight: 700;">
                                <td>TOTAL</td>
                                <td>${ingredientes.reduce((sum, i) => sum + (parseFloat(i.porcentaje) || 0), 0).toFixed(1)}%</td>
                                <td>1000 kg</td>
                                <td>
                                    ${Formatters.currency((AppState.dietaActiva?.costo || 0) * 1000)}/ton
                                    <small style="display: block; color: var(--success); font-size: 11px;">
                                        (${Formatters.currency(this.calcularCostoDietaMS(AppState.dietaActiva) * 1000)} MS)
                                    </small>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderAnalisisNutricional() {
        if (!AppState.dietaActiva) {
            return '';
        }
        const nutricion = this.calcularNutricionTotal(AppState.dietaActiva);
        const req = this.calcularRequerimientosNRC(AppState.dietaActiva);
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🔬 Análisis Nutricional</h3>
                    <span class="badge badge-${this.validarDieta(nutricion, req) ? 'success' : 'warning'}">
                        ${this.validarDieta(nutricion, req) ? '✓ Balanceada' : '⚠ Revisar'}
                    </span>
                </div>
                <div style="padding: 20px;">
                    <div style="margin-bottom: 10px; font-size: 11px; color: #888; text-align: right;">
                        📋 Todos los valores nutricionales expresados en <strong>base seca</strong> (100% MS)
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        ${this.renderNutrienteCard('Proteína Bruta', nutricion.PB, req.PB, '%', 10, 16)}
                        ${this.renderNutrienteCard('Energía Metab.', nutricion.EM, req.EM, 'Mcal/kg', 2.5, 3.5)}
                        ${this.renderNutrienteCard('Calcio', nutricion.Ca, req.Ca, '%', 0.3, 0.8)}
                        ${this.renderNutrienteCard('Fósforo', nutricion.P, req.P, '%', 0.15, 0.4)}
                        ${this.renderNutrienteCard('NDT', nutricion.NDT, req.NDT, '%', 65, 80)}
                        ${this.renderNutrienteCard('Materia Seca', nutricion.MS || AppState.dietaActiva.ms, req.MS, '%', 75, 90)}
                    </div>
                    
                    <div style="margin-top: 20px; font-size: 13px; color: #666; font-weight: 600;">📊 Más información</div>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 10px;">
                        ${this.renderNutrienteCardSimple('Fibra Cruda', nutricion.FC, '%')}
                        ${this.renderNutrienteCardSimple('FDN (est.)', nutricion.FDN, '%')}
                        ${this.renderNutrienteCardSimple('Fibra Efectiva', nutricion.FibraEfectiva, '%')}
                        ${this.renderNutrienteCardSimple('Grasa', nutricion.Grasa, '%')}
                        ${this.renderNutrienteCardSimple('UFC', nutricion.UFC, '')}
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                        <strong>💡 Interpretación Nutricional:</strong>
                        <p style="margin: 5px 0 0 0; font-size: 13px;">
                            ${this.generarInterpretacion(nutricion, req)}
                        </p>
                    </div>
                    
                </div>
            </div>
        `;
    },

    renderNutrienteCard(nombre, valor, requerido, unidad, min, max) {
        // Asegurar valores numéricos válidos
        const valorNum = parseFloat(valor) || 0;
        const reqNum = parseFloat(requerido) || 0;
        const maxNum = parseFloat(max) || 1;
        
        // Rangos óptimos según nutriente (basado en valores RECOMENDADOS)
        // EM: ±5%, PB: ±10%, Minerales: ±15%
        let tolInferior, tolSuperior;
        if (nombre.toLowerCase().includes('energía') || nombre.toLowerCase().includes('em')) {
            tolInferior = 0.97; tolSuperior = 1.05;
        } else if (nombre.toLowerCase().includes('proteína') || nombre.toLowerCase().includes('pb')) {
            tolInferior = 0.95; tolSuperior = 1.10;
        } else if (nombre.toLowerCase().includes('calcio') || nombre.toLowerCase().includes('fósforo')) {
            tolInferior = 0.85; tolSuperior = 1.30;
        } else {
            tolInferior = 0.90; tolSuperior = 1.15;
        }
        
        const cumple = valorNum >= (reqNum * tolInferior) && valorNum <= (reqNum * tolSuperior);
        const exceso = valorNum > (reqNum * tolSuperior);
        const deficit = valorNum < (reqNum * tolInferior);
        
        let color = 'var(--success)';
        if (exceso) color = 'var(--warning)';
        if (deficit) color = 'var(--danger)';
        
        return `
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;
                        border: 2px solid ${cumple ? 'var(--success)' : exceso ? 'var(--warning)' : 'var(--danger)'};">
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${nombre}</div>
                <div style="font-size: 24px; font-weight: 700; color: ${color};">
                    ${valorNum.toFixed(2)}<span style="font-size: 14px;">${unidad}</span>
                </div>
                <div style="font-size: 11px; color: #666;">
                    Req: ${reqNum}${unidad}
                    ${exceso ? '⚠️ Alto' : deficit ? '⚠️ Bajo' : '✓ Óptimo'}
                </div>
                <div class="progress-bar" style="margin-top: 8px; height: 6px;">
                    <div class="progress-fill" style="width: ${Math.min((valorNum / maxNum) * 100, 100)}%; background: ${color};"></div>
                </div>
            </div>
        `;
    },
    
    renderNutrienteCardSimple(nombre, valor, unidad) {
        const valorNum = parseFloat(valor) || 0;
        return `
            <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center; border-left: 3px solid var(--primary);">
                <div style="font-size: 11px; color: #666; margin-bottom: 4px;">${nombre}</div>
                <div style="font-size: 18px; font-weight: 700; color: var(--primary);">
                    ${valorNum.toFixed(1)}<span style="font-size: 12px;">${unidad}</span>
                </div>
            </div>
        `;
    },

    // ============ VISTA BIBLIOTECA ============
    renderBiblioteca() {
        const ingredientes = this.getBibliotecaIngredientes();
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📚 Biblioteca de Ingredientes</h3>
                    <div style="display: flex; gap: 10px;">
                        <select class="form-select" id="filtroCategoriaIng" onchange="DietasSection.filtrarIngredientes()">
                            <option value="">Todas las categorías</option>
                            <option value="grano">Granos energéticos</option>
                            <option value="proteico">Fuentes proteicas</option>
                            <option value="forraje">Forrajes</option>
                            <option value="mineral">Minerales</option>
                            <option value="vitamina">Vitaminas</option>
                            <option value="aditivo">Aditivos</option>
                            <option value="nucleo">Núcleos minerales</option>
                        </select>
                        <button class="btn btn-primary" onclick="DietasSection.nuevoIngrediente()">+ Nuevo</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="tablaIngredientes">
                        <thead>
                            <tr>
                                <th>Ingrediente</th>
                                <th>Categoría</th>
                                <th>MS %</th>
                                <th>PB %</th>
                                <th>EM Mcal/kg</th>
                                <th>Costo $/ton</th>
                                <th>Relación PB/Costo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ingredientes.map(ing => {
                                const nutricion = ing?.nutricion || {};
                                const pb = parseFloat(nutricion.PB) || 0;
                                const costo = parseFloat(ing?.costo) || 0;
                                const relacion = costo > 0 ? pb / costo : 0;
                                const nombre = ing?.nombre || 'Sin nombre';
                                const categoria = ing?.categoria || 'Otro';
                                return `
                                    <tr>
                                        <td><strong>${nombre}</strong></td>
                                        <td><span class="badge badge-secondary">${categoria}</span></td>
                                        <td>${nutricion.MS || 90}%</td>
                                        <td>${pb}%</td>
                                        <td>${nutricion.EM || 0}</td>
                                        <td>${Formatters.currency(costo)}/ton</td>
                                        <td style="color: ${relacion > 30 ? 'var(--success)' : relacion > 20 ? 'var(--warning)' : 'var(--danger)'}; font-weight: 600;">
                                            ${(relacion || 0).toFixed(1)}
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-secondary" onclick="DietasSection.editarIngrediente('${nombre}')">✏️</button>
                                            <button class="btn btn-sm btn-info" onclick="DietasSection.verDetalleIngrediente('${nombre}')">👁️</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ANÁLISIS DE INGREDIENTES -->
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🏆 Mejores Fuentes de Proteína</h3>
                    </div>
                    <div style="padding: 20px;">
                        ${ingredientes
                            .filter(i => ((i.nutricion && i.nutricion.PB) || 0) > 15)
                            .sort((a, b) => {
                                const aPB = (a.nutricion && a.nutricion.PB) || 0;
                                const aCosto = a.costo || 1;
                                const bPB = (b.nutricion && b.nutricion.PB) || 0;
                                const bCosto = b.costo || 1;
                                return (bPB / bCosto) - (aPB / aCosto);
                            })
                            .slice(0, 5)
                            .map((ing, idx) => {
                                const pb = (ing?.nutricion && ing.nutricion.PB) || 0;
                                const costo = ing?.costo || 0;
                                const nombre = ing?.nombre || 'Sin nombre';
                                const relacion = costo > 0 ? pb / costo : 0;
                                return `
                                <div style="display: flex; align-items: center; gap: 10px; padding: 10px; 
                                            background: #f8f9fa; margin-bottom: 8px; border-radius: 6px;">
                                    <div style="width: 25px; height: 25px; background: ${idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#e9ecef'}; 
                                                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                                                font-size: 12px; font-weight: 700;">
                                        ${idx + 1}
                                    </div>
                                    <div style="flex: 1;">
                                        <strong>${nombre}</strong>
                                        <div style="font-size: 12px; color: #666;">${pb}% PB - ${Formatters.currency(costo)}/ton</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-weight: 700; color: var(--success);">${(relacion || 0).toFixed(1)}</div>
                                        <div style="font-size: 11px; color: #666;">PB/$</div>
                                    </div>
                                </div>
                            `}).join('')}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">⚡ Mejores Fuentes de Energía</h3>
                    </div>
                    <div style="padding: 20px;">
                        ${ingredientes
                            .filter(i => ((i.nutricion && i.nutricion.EM) || 0) > 3)
                            .sort((a, b) => {
                                const aEM = (a.nutricion && a.nutricion.EM) || 0;
                                const aCosto = a.costo || 1;
                                const bEM = (b.nutricion && b.nutricion.EM) || 0;
                                const bCosto = b.costo || 1;
                                return (bEM / bCosto) - (aEM / aCosto);
                            })
                            .slice(0, 5)
                            .map((ing, idx) => {
                                const em = (ing?.nutricion && ing.nutricion.EM) || 0;
                                const costo = ing?.costo || 0;
                                const nombre = ing?.nombre || 'Sin nombre';
                                const relacion = costo > 0 ? em / costo : 0;
                                return `
                                <div style="display: flex; align-items: center; gap: 10px; padding: 10px; 
                                            background: #f8f9fa; margin-bottom: 8px; border-radius: 6px;">
                                    <div style="width: 25px; height: 25px; background: ${idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#e9ecef'}; 
                                                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                                                font-size: 12px; font-weight: 700;">
                                        ${idx + 1}
                                    </div>
                                    <div style="flex: 1;">
                                        <strong>${nombre}</strong>
                                        <div style="font-size: 12px; color: #666;">${em} Mcal/kg - ${Formatters.currency(costo)}/ton</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-weight: 700; color: var(--info);">${(relacion || 0).toFixed(2)}</div>
                                        <div style="font-size: 11px; color: #666;">EM/$</div>
                                    </div>
                                </div>
                            `}).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // ============ VISTA NÚCLEOS MINERALES ============
    // ============ VISTA COMPARADOR ============
    // ============ VISTA HISTORIAL ============
    renderHistorial() {
        // Simulación de histórico de costos
        const historial = AppData.historialCostos || this.generarHistorialSimulado();
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📊 Evolución de Costos de Dietas</h3>
                    <select class="form-select" style="width: auto;" onchange="DietasSection.cambiarPeriodo(this.value)">
                        <option value="6m">Últimos 6 meses</option>
                        <option value="1y">Último año</option>
                        <option value="all">Todo el historial</option>
                    </select>
                </div>
                <div style="padding: 20px;">
                    <div style="height: 300px; position: relative; margin-bottom: 30px;">
                        <canvas id="historialCostosChart"></canvas>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Dieta</th>
                                <th>Costo/ton</th>
                                <th>Variación</th>
                                <th>Factor principal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historial.slice(-10).reverse().map((h, idx, arr) => {
                                const costoActual = parseFloat(h.costo) || 0;
                                const costoAnterior = idx < arr.length - 1 ? (parseFloat(arr[idx + 1].costo) || 0) : 0;
                                const variacion = (costoAnterior > 0) ? ((costoActual - costoAnterior) / costoAnterior) * 100 : 0;
                                return `
                                    <tr>
                                        <td>${DateUtils.format(h.fecha)}</td>
                                        <td>${h.dieta || 'Sin nombre'}</td>
                                        <td>${Formatters.currency(costoActual * 1000)}</td>
                                        <td style="color: ${variacion > 0 ? 'var(--danger)' : variacion < 0 ? 'var(--success)' : 'inherit'};">
                                            ${idx === arr.length - 1 ? '-' : (variacion > 0 ? '+' : '') + variacion.toFixed(1) + '%'}
                                        </td>
                                        <td>${h.factor || '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ============ FUNCIONES AUXILIARES ============
    getBibliotecaIngredientes() {
        // Combinar ingredientes de la base de datos con los personalizados y los de las dietas
        const base = [
            // Precios actualizados a $/ton
            { nombre: 'Maíz', categoria: 'grano', costo: 450, nutricion: { MS: 88, PB: 8.5, EM: 3.35, Ca: 0.02, P: 0.28, NDT: 85 } },
            { nombre: 'Sorgo', categoria: 'grano', costo: 380, nutricion: { MS: 89, PB: 9.0, EM: 3.25, Ca: 0.03, P: 0.29, NDT: 82 } },
            { nombre: 'Harina de Soja', categoria: 'proteico', costo: 850, nutricion: { MS: 90, PB: 44.0, EM: 3.15, Ca: 0.30, P: 0.65, NDT: 78 } },
            { nombre: 'Expeller de Soja', categoria: 'proteico', costo: 750, nutricion: { MS: 90, PB: 42.0, EM: 3.05, Ca: 0.25, P: 0.60, NDT: 76 } },
            { nombre: 'Afrechillo de Trigo', categoria: 'proteico', costo: 350, nutricion: { MS: 88, PB: 15.0, EM: 2.80, Ca: 0.05, P: 0.40, NDT: 70 } },
            { nombre: 'Sal', categoria: 'mineral', costo: 150, nutricion: { MS: 99, PB: 0, EM: 0, Ca: 0, P: 0, NDT: 0 } },
            { nombre: 'Premezcla Mineral', categoria: 'mineral', costo: 2500, nutricion: { MS: 95, PB: 0, EM: 0, Ca: 15.0, P: 8.0, NDT: 0 } },
            { nombre: 'Urea', categoria: 'proteico', costo: 950, nutricion: { MS: 99, PB: 280, EM: 0, Ca: 0, P: 0, NDT: 0 } },
            { nombre: 'Melaza', categoria: 'energetico', costo: 400, nutricion: { MS: 75, PB: 3.0, EM: 2.50, Ca: 0.80, P: 0.08, NDT: 60 } },
            { nombre: 'Avena', categoria: 'grano', costo: 550, nutricion: { MS: 89, PB: 11.5, EM: 3.10, Ca: 0.07, P: 0.35, NDT: 75 } }
        ];
        
        // Agregar ingredientes personalizados de AppData.ingredientes
        (AppData.ingredientes || []).forEach(ing => {
            if (ing && ing.nombre && !base.find(b => b.nombre === ing.nombre)) {
                base.push({
                    nombre: ing.nombre,
                    categoria: ing.categoria || 'otro',
                    costo: ing.costo || 0.50,
                    nutricion: ing.nutricion || { MS: 85, PB: 12, EM: 3.0, Ca: 0.1, P: 0.3, NDT: 70 }
                });
            }
        });
        
        // Agregar ingredientes de las dietas que no estén en la base
        (AppData.dietas || []).forEach(d => {
            (d.ingredientes || []).forEach(ing => {
                if (ing && ing.nombre && !base.find(b => b.nombre === ing.nombre)) {
                    base.push({
                        nombre: ing.nombre,
                        categoria: 'otro',
                        costo: ing.costo || 0.50,
                        nutricion: ing.nutricion || { MS: 85, PB: 12, EM: 3.0, Ca: 0.1, P: 0.3, NDT: 70 }
                    });
                }
            });
        });

        // Agregar insumos del stock que no estén en la base (con costo convertido a $/ton)
        (AppData.insumos || []).forEach(ins => {
            if (ins && ins.nombre && !base.find(b => b.nombre === ins.nombre)) {
                const nutricionDB = (typeof INGREDIENTES_DB !== 'undefined' && INGREDIENTES_DB[ins.nombre]) ? INGREDIENTES_DB[ins.nombre].nutricion : null;
                base.push({
                    nombre: ins.nombre,
                    categoria: ins.categoria || 'otro',
                    costo: (parseFloat(ins.costo) || 0), // Ya en $/ton
                    nutricion: nutricionDB || { MS: 85, PB: 12, EM: 3.0, Ca: 0.1, P: 0.3, NDT: 70 }
                });
            }
        });
        
        // Agregar núcleos minerales como ingredientes disponibles
        (AppData.nucleos || []).forEach(nucleo => {
            if (nucleo && nucleo.nombre && !base.find(b => b.nombre === nucleo.nombre)) {
                // Convertir costo de $/kg a $/ton
                const costoPorTon = (parseFloat(nucleo.costo) || 0) * 1000;
                
                // Calcular PB equivalente (urea 280% PB, solo fuentes de N proteico)
                const pbUrea = (nucleo.tieneUrea ? (nucleo.ureaPct || 0) * 2.8 : 0);
                const pbDirecta = nucleo.tienePB ? (nucleo.pbPct || 0) : 0;
                const pbTotalNucleo = pbUrea + pbDirecta;
                
                base.push({
                    nombre: nucleo.nombre,
                    categoria: 'nucleo',
                    costo: costoPorTon,
                    esNucleo: true,
                    nucleoId: nucleo.id,
                    inclusionMin: nucleo.inclusionMin,
                    inclusionMax: nucleo.inclusionMax,
                    // Nutrición del núcleo AL 100% (sin ajustar por inclusión)
                    // Cuando se usa en una dieta, el porcentaje de inclusión real se aplicará
                    nutricion: {
                        MS: 95, // Los núcleos suelen tener alta MS
                        PB: pbTotalNucleo, // PB del núcleo puro (100%)
                        EM: 0, // Sin valor energético significativo
                        Ca: parseFloat(nucleo.Ca) || 0,  // Ca del núcleo puro (ej: 18%)
                        P: parseFloat(nucleo.P) || 0,    // P del núcleo puro (ej: 8%)
                        Na: parseFloat(nucleo.Na) || 0,  // Na del núcleo puro (ej: 10%)
                        Mg: parseFloat(nucleo.Mg) || 0,  // Mg del núcleo puro
                        K: parseFloat(nucleo.K) || 0,    // K del núcleo puro
                        S: parseFloat(nucleo.S) || 0,    // S del núcleo puro
                        NDT: 0
                    },
                    // Información completa del núcleo para referencia
                    composicionNucleo: {
                        // Macrominerales
                        Ca: nucleo.Ca,
                        P: nucleo.P,
                        Na: nucleo.Na,
                        Mg: nucleo.Mg,
                        K: nucleo.K,
                        S: nucleo.S,
                        // Microminerales
                        Zn: nucleo.Zn,
                        ZnInorganico: nucleo.ZnInorganico,
                        ZnOrganico: nucleo.ZnOrganico,
                        Mn: nucleo.Mn,
                        Cu: nucleo.Cu,
                        Fe: nucleo.Fe,
                        Co: nucleo.Co,
                        I: nucleo.I,
                        Se: nucleo.Se,
                        Cr: nucleo.Cr,
                        // Vitaminas
                        vitA: nucleo.vitA,
                        vitD: nucleo.vitD,
                        vitE: nucleo.vitE,
                        // Fuentes de N
                        tieneUrea: nucleo.tieneUrea,
                        ureaPct: nucleo.ureaPct,
                        tienePB: nucleo.tienePB,
                        pbPct: nucleo.pbPct,
                        // Aditivos
                        tieneMonensin: nucleo.tieneMonensin,
                        monensin: nucleo.monensin,
                        tieneLasalocid: nucleo.tieneLasalocid,
                        lasalocid: nucleo.lasalocid,
                        tieneLevaduras: nucleo.tieneLevaduras,
                        levadurasUFC: nucleo.levadurasUFC
                    }
                });
            }
        });
        
        return base;
    },

    getIngredienteDB(nombre) {
        return this.getBibliotecaIngredientes().find(i => i.nombre === nombre);
    },

    calcularNutricionTotal(dieta) {
        const total = { MS: 0, PB: 0, EM: 0, Ca: 0, P: 0, NDT: 0, FC: 0, Grasa: 0, UFC: 0, FDN: 0, FibraEfectiva: 0 };
        
        if (!dieta || !dieta.ingredientes) return total;
        
        // Primero calcular MS total de la dieta (ponderada)
        let msTotal = 0;
        dieta.ingredientes.forEach(ing => {
            let nutricion = ing.nutricion;
            if (!nutricion && ing.nombre && typeof INGREDIENTES_DB !== 'undefined' && INGREDIENTES_DB[ing.nombre]) {
                nutricion = INGREDIENTES_DB[ing.nombre].nutricion;
            }
            if (!nutricion && ing.nombre && this.getBibliotecaIngredientes) {
                const bib = this.getBibliotecaIngredientes().find(i => i.nombre === ing.nombre);
                if (bib && bib.nutricion) nutricion = bib.nutricion;
            }
            if (nutricion) {
                const p = (parseFloat(ing.porcentaje) || 0) / 100;
                msTotal += (parseFloat(nutricion.MS) || 90) * p;
            }
        });
        
        dieta.ingredientes.forEach(ing => {
            let nutricion = ing.nutricion;
            // Fallback a INGREDIENTES_DB global (data.js)
            if (!nutricion && ing.nombre && typeof INGREDIENTES_DB !== 'undefined' && INGREDIENTES_DB[ing.nombre]) {
                nutricion = INGREDIENTES_DB[ing.nombre].nutricion;
            }
            // Fallback a biblioteca interna
            if (!nutricion && ing.nombre && this.getBibliotecaIngredientes) {
                const bib = this.getBibliotecaIngredientes().find(i => i.nombre === ing.nombre);
                if (bib && bib.nutricion) nutricion = bib.nutricion;
            }
            if (nutricion) {
                const p = (parseFloat(ing.porcentaje) || 0) / 100;
                const fc = (parseFloat(nutricion.FC) || 0);
                // Estimar FDN y Fibra Efectiva si no están en la base
                const fdn = (parseFloat(nutricion.FDN) || 0) || (fc * 2.5);
                const fibraEf = (parseFloat(nutricion.FibraEfectiva) || 0) || (fdn * 0.75);
                
                // Los valores en la tabla FEDNA ya están expresados en base seca
                // Solo ponderamos por el porcentaje del ingrediente en la dieta

                total.MS += (parseFloat(nutricion.MS) || 0) * p;
                total.PB += (parseFloat(nutricion.PB) || 0) * p;
                total.EM += (parseFloat(nutricion.EM) || 0) * p;
                total.Ca += (parseFloat(nutricion.Ca) || 0) * p;
                total.P += (parseFloat(nutricion.P) || 0) * p;
                total.NDT += (parseFloat(nutricion.NDT) || 0) * p;
                total.FC += fc * p;
                total.Grasa += (parseFloat(nutricion.Grasa) || 0) * p;
                total.UFC += (parseFloat(nutricion.UFC) || 0) * p;
                total.FDN += fdn * p;
                total.FibraEfectiva += fibraEf * p;
            }
        });
        
        // MS representa el % promedio de materia seca de la dieta
        // Los demás valores nutricionales ya están expresados en base seca (100% MS)
        
        return total;
    },

    validarDieta(nutricion, req) {
        if (!nutricion || !req) return false;
        const PB = parseFloat(nutricion.PB) || 0;
        const EM = parseFloat(nutricion.EM) || 0;
        const Ca = parseFloat(nutricion.Ca) || 0;
        const P = parseFloat(nutricion.P) || 0;
        const reqPB = parseFloat(req.PB) || 1;
        const reqEM = parseFloat(req.EM) || 1;
        const reqCa = parseFloat(req.Ca) || 1;
        const reqP = parseFloat(req.P) || 1;
        
        // Validación contra valores RECOMENDADOS (no mínimos)
        // Margen: ±10% para proteína, ±5% para energía, ±15% para minerales
        const pbOk = PB >= reqPB * 0.95 && PB <= reqPB * 1.10;
        const emOk = EM >= reqEM * 0.97 && EM <= reqEM * 1.05;
        const caOk = Ca >= reqCa * 0.85 && Ca <= reqCa * 1.30;
        const pOk = P >= reqP * 0.85 && P <= reqP * 1.30;
        
        return pbOk && emOk && caOk && pOk;
    },

    generarInterpretacion(nutricion, req) {
        if (!nutricion || !req) return 'Datos insuficientes para interpretación.';
        
        const msgs = [];
        const PB = parseFloat(nutricion.PB) || 0;
        const EM = parseFloat(nutricion.EM) || 0;
        const Ca = parseFloat(nutricion.Ca) || 0;
        const reqPB = parseFloat(req.PB) || 1;
        const reqEM = parseFloat(req.EM) || 1;
        const reqCa = parseFloat(req.Ca) || 1;
        
        // Interpretación basada en valores RECOMENDADOS
        if (PB < reqPB * 0.95) msgs.push('Aumentar fuentes proteicas');
        if (PB > reqPB * 1.10) msgs.push('Reducir proteína, exceso innecesario');
        if (EM < reqEM * 0.97) msgs.push('Aumentar concentrado energético');
        if (EM > reqEM * 1.05) msgs.push('Reducir energía, posible exceso');
        if (Ca < reqCa * 0.85) msgs.push('Revisar fuentes de calcio');
        
        return msgs.length > 0 ? msgs.join('. ') + '.' : 'La dieta está bien balanceada para la categoría.';
    },

    // ========== PREDICTOR DE PERFORMANCE ANIMAL ==========
    // Basado en NRC (2000) Beef Cattle con enfoque de NUTRIENTE LIMITANTE
    // Principio: El nutriente más deficiente (relativo a su requerimiento) 
    // determina el rendimiento máximo posible
    
    generarHistorialSimulado() {
        const historial = [];
        const hoy = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setMonth(fecha.getMonth() - i);
            
            historial.push({
                fecha: fecha.toISOString().split('T')[0],
                dieta: 'Base Engorde',
                costo: 0.45 + (Math.random() * 0.1 - 0.05),  // $/kg (será multiplicado por 1000 para mostrar $/ton)
                factor: ['Variación maíz', 'Suba soja', 'Estable', 'Baja melaza'][Math.floor(Math.random() * 4)]
            });
        }
        
        return historial;
    },

    // ============ ACCIONES ============
    nuevaDieta() {
        this.abrirModalNuevaDieta();
    },
    
    abrirModalNuevaDieta(dietaExistente = null) {
        const esEdicion = !!dietaExistente;
        const dieta = dietaExistente || {
            id: Date.now(),
            nombre: '',
            categoria: 'engorde',
            ms: 85,
            costo: 0,
            ingredientes: []
        };
        
        // Migrar dietas antiguas que solo tengan composicion
        if (!dieta.ingredientes && dieta.composicion) {
            dieta.ingredientes = dieta.composicion.map(c => {
                const ingDB = typeof INGREDIENTES_DB !== 'undefined' ? INGREDIENTES_DB[c.ingrediente] : null;
                const bib = this.getBibliotecaIngredientes ? this.getBibliotecaIngredientes().find(i => i.nombre === c.ingrediente) : null;
                const nutricion = ingDB ? ingDB.nutricion : (bib ? bib.nutricion : null);
                const costo = ingDB ? ingDB.costo : (bib ? bib.costo : 0);
                return {
                    nombre: c.ingrediente,
                    porcentaje: c.porcentaje,
                    kg: c.porcentaje * 10,
                    costo: costo,
                    nutricion: nutricion
                };
            });
        }
        if (!dieta.ingredientes) dieta.ingredientes = [];
        
        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'modalNuevaDieta';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: white; border-radius: 12px; width: 100%; max-width: 900px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 20px;">${esEdicion ? '✏️ Editar Dieta' : '🧪 Nueva Dieta'}</h3>
                    <button onclick="DietasSection.cerrarModalNuevaDieta()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <div class="modal-body" style="padding: 20px; overflow-y: auto; flex: 1;">
                    <div class="grid-2" style="gap: 20px;">
                        <!-- PANEL IZQUIERDO: Configuración básica y composición -->
                        <div>
                            <!-- Nombre -->
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label class="form-label">Nombre de la Dieta *</label>
                                <input type="text" class="form-input" id="dietaNombre" value="${dieta.nombre}" placeholder="Ej: Dieta Engorde Alto Rendimiento">
                            </div>
                            
                            <!-- Autocompletar de ingredientes -->
                            <div class="form-group" style="margin-bottom: 15px; position: relative;">
                                <label class="form-label">Buscar ingrediente</label>
                                <input type="text" class="form-input" id="buscarIngrediente" 
                                    placeholder="Escriba para buscar (ej: maíz, soja, silaje...)" 
                                    autocomplete="off"
                                    oninput="DietasSection.filtrarIngredientesAutocomplete(this.value)"
                                    onfocus="DietasSection.mostrarAutocomplete()"
                                    onkeydown="if(event.key==='Escape')DietasSection.ocultarAutocomplete()">
                                <div id="autocompleteIngredientes" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid var(--border); border-radius: 8px; max-height: 250px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                                </div>
                            </div>
                            
                            <!-- Lista de ingredientes en la dieta -->
                            <div id="listaIngredientesModal" style="margin-bottom: 15px;">
                                ${this.renderIngredientesModal(dieta.ingredientes)}
                            </div>
                            
                            <!-- Total -->
                            <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 8px; font-weight: 600;">
                                <span>Total:</span>
                                <span id="totalPorcentajeModal" style="color: ${this.calcularTotalPorcentaje(dieta.ingredientes) === 100 ? 'var(--success)' : 'var(--danger)'}">${(this.calcularTotalPorcentaje(dieta.ingredientes) || 0).toFixed(1)}%</span>
                            </div>
                            <div id="mensajeValidacionModal" style="margin-top: 10px; font-size: 13px; color: var(--danger); text-align: center;">
                                ${this.calcularTotalPorcentaje(dieta.ingredientes) !== 100 ? '⚠️ El total debe sumar exactamente 100%' : ''}
                            </div>
                        </div>
                        
                        <!-- PANEL DERECHO: Análisis en tiempo real -->
                        <div>
                            <!-- Costo -->
                            <div class="card" style="margin-bottom: 20px;">
                                <div class="card-header">
                                    <h4 class="card-title">💰 Costo de la Dieta</h4>
                                </div>
                                <div style="padding: 15px; text-align: center;">
                                    <div style="font-size: 28px; font-weight: 700; color: var(--primary);" id="costoKgModal">
                                        ${Formatters.currency((dieta.costo || 0) * 1000)}/ton
                                    </div>
                                    <div style="font-size: 14px; color: #666; margin-top: 8px;" id="costoMSModal">
                                        ${Formatters.currency(this.calcularCostoDietaMS(dieta) * 1000)}/ton MS
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Vista previa nutricional -->
                            <div class="card" style="margin-bottom: 20px;">
                                <div class="card-header">
                                    <h4 class="card-title">🔬 Análisis Nutricional</h4>
                                    <span id="badgeValidacionModal" class="badge ${this.validarDietaModal() ? 'badge-success' : 'badge-warning'}">
                                        ${this.validarDietaModal() ? '✓ Balanceada' : '⚠ Revisar'}
                                    </span>
                                </div>
                                <div style="padding: 15px;">
                                    <div id="analisisNutricionalModal" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                        ${this.renderAnalisisModal(dieta)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e9ecef; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="btn btn-secondary" onclick="DietasSection.cerrarModalNuevaDieta()">Cancelar</button>
                    <button class="btn btn-primary" id="btnGuardarDieta" onclick="DietasSection.guardarDietaModal(${dieta.id})" ${this.calcularTotalPorcentaje(dieta.ingredientes) !== 100 ? 'disabled' : ''}>
                        ${esEdicion ? '💾 Guardar Cambios' : '✅ Crear Dieta'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Guardar referencia global para acceder desde las funciones
        this.dietaEnEdicion = {...dieta};
        
        // Agregar event listeners para actualización en tiempo real
        this.setupEventListenersModal();
    },
    cerrarModalNuevaDieta() {
        const modal = document.getElementById('modalNuevaDieta');
        if (modal) {
            modal.remove();
        }
        this.dietaEnEdicion = null;
    },
    
    renderIngredientesModal(ingredientes) {
        if (!ingredientes || ingredientes.length === 0) {
            return '<div style="text-align: center; padding: 20px; color: #888;">No hay ingredientes agregados</div>';
        }
        
        return `
            <table style="width: 100%; font-size: 14px;">
                <thead>
                    <tr style="border-bottom: 1px solid #e9ecef;">
                        <th style="text-align: left; padding: 8px;">Ingrediente</th>
                        <th style="text-align: center; padding: 8px; width: 70px;">%</th>
                        <th style="text-align: center; padding: 8px; width: 110px;">Costo $/ton</th>
                        <th style="text-align: right; padding: 8px; width: 90px;">Subtotal</th>
                        <th style="text-align: center; padding: 8px; width: 50px;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${ingredientes.map((ing, idx) => {
                        const nombre = ing?.nombre || 'Sin nombre';
                        const porcentaje = parseFloat(ing?.porcentaje) || 0;
                        let costoUnitario = parseFloat(ing?.costo) || 0;
                        if (!costoUnitario && nombre) {
                            const ingDB = this.getIngredienteDB(nombre);
                            if (ingDB) costoUnitario = parseFloat(ingDB.costo) || 0;
                        }
                        const costoTotal = costoUnitario * (porcentaje / 100);
                        return `
                            <tr style="border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 8px;">${nombre}</td>
                                <td style="padding: 8px;">
                                    <input type="number" class="form-input" 
                                           value="${porcentaje}" 
                                           min="0" max="100" step="0.1"
                                           onchange="DietasSection.actualizarPorcentajeModal(${idx}, this.value)"
                                           style="width: 60px; text-align: center; padding: 4px;">
                                </td>
                                <td style="padding: 8px;">
                                    <input type="number" class="form-input" 
                                           value="${costoUnitario}" 
                                           min="0" step="1"
                                           onchange="DietasSection.actualizarCostoModal(${idx}, this.value)"
                                           style="width: 100px; text-align: right; padding: 4px;">
                                </td>
                                <td style="padding: 8px; text-align: right; font-size: 12px;">${Formatters.currency(costoTotal)}/ton</td>
                                <td style="padding: 8px; text-align: center;">
                                    <button class="btn btn-sm btn-danger" onclick="DietasSection.eliminarIngredienteModal(${idx})" style="padding: 2px 6px;">🗑️</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    },

    cambiarDieta(id) {
        const dieta = AppData.dietas.find(d => d.id == id);
        if (dieta) {
            // Migrar dietas antiguas que solo tengan composicion
            if (!dieta.ingredientes && dieta.composicion) {
                dieta.ingredientes = dieta.composicion.map(c => {
                    const ingDB = typeof INGREDIENTES_DB !== 'undefined' ? INGREDIENTES_DB[c.ingrediente] : null;
                    const bib = this.getBibliotecaIngredientes ? this.getBibliotecaIngredientes().find(i => i.nombre === c.ingrediente) : null;
                    const nutricion = ingDB ? ingDB.nutricion : (bib ? bib.nutricion : null);
                    const costo = ingDB ? ingDB.costo : (bib ? bib.costo : 0);
                    return {
                        nombre: c.ingrediente,
                        porcentaje: c.porcentaje,
                        kg: c.porcentaje * 10,
                        costo: costo,
                        nutricion: nutricion
                    };
                });
            }
            // Asegurar que dieta tenga costo calculado si no lo tiene
            if (dieta.ingredientes && (dieta.costo === undefined || dieta.costo === null)) {
                dieta.costo = this.calcularCostoDieta(dieta);
            }
            // Asegurar que dieta tenga nutricion calculada si no la tiene
            if (dieta.ingredientes && (!dieta.nutricion || !dieta.ms)) {
                const nutricion = this.calcularNutricionTotal(dieta);
                dieta.nutricion = nutricion;
                dieta.ms = Math.round(nutricion.MS || 85);
            }
        }
        AppState.dietaActiva = dieta;
        this.render();
    },

    editarComposicion() {
        if (AppState.dietaActiva) {
            this.abrirModalNuevaDieta(AppState.dietaActiva);
        }
    },
    
    // ============ FUNCIONES AUXILIARES DEL MODAL ============
    calcularTotalPorcentaje(ingredientes) {
        if (!ingredientes) return 0;
        return ingredientes.reduce((sum, i) => sum + (parseFloat(i.porcentaje) || 0), 0);
    },
    
    validarDietaModal() {
        if (!this.dietaEnEdicion || !this.dietaEnEdicion.ingredientes) return false;
        const total = this.calcularTotalPorcentaje(this.dietaEnEdicion.ingredientes);
        if (total !== 100) return false;
        
        const nutricion = this.calcularNutricionTotal(this.dietaEnEdicion);
        const req = this.calcularRequerimientosNRC(this.dietaEnEdicion);
        
        // Validación contra valores RECOMENDADOS
        const pbOk = nutricion.PB >= req.PB * 0.95 && nutricion.PB <= req.PB * 1.10;
        const emOk = nutricion.EM >= req.EM * 0.97 && nutricion.EM <= req.EM * 1.05;
        const caOk = nutricion.Ca >= req.Ca * 0.85 && nutricion.Ca <= req.Ca * 1.30;
        const pOk = nutricion.P >= req.P * 0.85 && nutricion.P <= req.P * 1.30;
        
        return pbOk && emOk && caOk && pOk;
    },
    
    renderAnalisisModal(dieta) {
        if (!dieta || !dieta.ingredientes || dieta.ingredientes.length === 0) {
            return '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">Agregue ingredientes para ver el análisis</div>';
        }
        
        const nutricion = this.calcularNutricionTotal(dieta);
        const req = this.calcularRequerimientosNRC(dieta);
        
        const nutrientes = [
            { nombre: 'Proteína Bruta', valor: parseFloat(nutricion.PB) || 0, req: parseFloat(req.PB) || 0, unidad: '%', min: 8, max: 20 },
            { nombre: 'Energía Metab.', valor: parseFloat(nutricion.EM) || 0, req: parseFloat(req.EM) || 0, unidad: 'Mcal', min: 2, max: 4 },
            { nombre: 'Calcio', valor: parseFloat(nutricion.Ca) || 0, req: parseFloat(req.Ca) || 0, unidad: '%', min: 0.2, max: 1 },
            { nombre: 'Fósforo', valor: parseFloat(nutricion.P) || 0, req: parseFloat(req.P) || 0, unidad: '%', min: 0.15, max: 0.5 },
            { nombre: 'NDT', valor: parseFloat(nutricion.NDT) || 0, req: parseFloat(req.NDT) || 0, unidad: '%', min: 60, max: 90 },
            { nombre: 'Materia Seca', valor: parseFloat(nutricion.MS || dieta.ms) || 85, req: parseFloat(req.MS) || 0, unidad: '%', min: 70, max: 95 }
        ];
        
        const extras = [
            { nombre: 'Fibra Cruda', valor: parseFloat(nutricion.FC) || 0, unidad: '%', req: null },
            { nombre: 'FDN (est.)', valor: parseFloat(nutricion.FDN) || 0, unidad: '%', req: null },
            { nombre: 'Fibra Efectiva', valor: parseFloat(nutricion.FibraEfectiva) || 0, unidad: '%', req: null },
            { nombre: 'Grasa', valor: parseFloat(nutricion.Grasa) || 0, unidad: '%', req: null },
            { nombre: 'UFC', valor: parseFloat(nutricion.UFC) || 0, unidad: '', req: null }
        ];
        
        const renderCard = (n, mostrarReq = true) => {
            const valor = parseFloat(n.valor) || 0;
            const reqVal = parseFloat(n.req) || 1;
            let color = 'var(--primary)';
            let icono = '';
            if (mostrarReq && n.req !== null) {
                // Rangos óptimos según nutriente
                let tolInf = 0.90, tolSup = 1.15;
                if (n.nombre.toLowerCase().includes('energía')) { tolInf = 0.97; tolSup = 1.05; }
                else if (n.nombre.toLowerCase().includes('proteína')) { tolInf = 0.95; tolSup = 1.10; }
                else if (n.nombre.toLowerCase().includes('calcio') || n.nombre.toLowerCase().includes('fósforo')) { tolInf = 0.85; tolSup = 1.30; }
                
                const cumple = valor >= reqVal * tolInf && valor <= reqVal * tolSup;
                const deficit = valor < reqVal * tolInf;
                const exceso = valor > reqVal * tolSup;
                color = cumple ? 'var(--success)' : deficit ? 'var(--danger)' : 'var(--warning)';
                icono = cumple ? ' ✓' : deficit ? ' ↓' : ' ↑';
            }
            const reqLine = mostrarReq && n.req !== null ? `<div style="font-size: 10px; color: #888;">Req: ${reqVal}${n.unidad}</div>` : '';
            return `
                <div style="padding: 10px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid ${color};">
                    <div style="font-size: 11px; color: #666;">${n.nombre}</div>
                    <div style="font-size: 18px; font-weight: 700; color: ${color};">
                        ${valor.toFixed(1)}${n.unidad}${icono}
                    </div>
                    ${reqLine}
                </div>
            `;
        };
        
        return `
            <div style="grid-column: 1/-1; margin-bottom: 5px; font-size: 11px; color: #888; text-align: right;">
                📋 Todos los valores nutricionales expresados en <strong>base seca</strong> (100% MS)
            </div>
            ${nutrientes.map(n => renderCard(n, true)).join('')}
            <div style="grid-column: 1/-1; margin-top: 10px; font-size: 12px; color: #666; font-weight: 600;">📊 Más información</div>
            ${extras.map(n => renderCard(n, false)).join('')}
        `;
    },
    
    calcularRequerimientosNRC(dieta) {
        const peso = parseFloat(dieta?.peso) || 350;
        const gdp = parseFloat(dieta?.gdpEsperada) || parseFloat(dieta?.gdp) || 1.2;
        const raza = dieta?.raza || 'Cruzado';
        const sexo = dieta?.sexo || 'macho';
        
        // Factor metabolismo según raza (tamaño maduro)
        const factorRaza = {
            'Angus': 1.0, 'Hereford': 1.0, 'Criollo': 0.95,
            'Cruzado': 1.05, 'Braford': 1.08, 'Brangus': 1.08, 'Brahman': 1.12
        }[raza] || 1.0;
        
        // Factor sexo
        const factorSexo = sexo === 'macho' ? 1.0 : 0.92;
        
        // Consumo de MS estimado (% del peso vivo) según peso
        const consumoPctPV = peso < 250 ? 0.028 : peso < 400 ? 0.025 : peso < 550 ? 0.022 : 0.020;
        const consumoMS = peso * consumoPctPV; // kg/día
        
        // EM requerida (Mcal/día) - NRC 2000 simplificado
        // NEm = 0.077 * PV^0.75 (Mcal/día) - energía neta para mantenimiento
        const emMantenimiento = 0.077 * Math.pow(peso, 0.75) * factorRaza;
        
        // NEg para ganancia - NRC: ~4.5-5.5 Mcal por kg de ganancia según composición
        const eficienciaGanancia = 5.0 + (peso < 300 ? 0.5 : peso < 450 ? 0.3 : 0.0); 
        const emCrecimiento = gdp * eficienciaGanancia * factorSexo;
        
        // Energía Neta Total requerida
        const netEnergyTotal = emMantenimiento + emCrecimiento;
        
        // Convertir NE a EM (Energía Metabolizable) 
        // La relación EM/NE para dietas de feedlot es ~1.4-1.5 (eficiencia de conversión)
        // También conocida como km (eficiencia de uso de EM para mantenimiento) y kg (para ganancia)
        const km = 0.66; // eficiencia mantenimiento
        const kg = 0.40; // eficiencia ganancia
        const emReq = (emMantenimiento / km + emCrecimiento / kg) / consumoMS;
        
        // PB requerida (%) - NRC 2000 para ganado de carne
        // Proteína metabolizable para mantenimiento (MPm) = 3.8 * PV^0.75 g/día (NRC 2000)
        const mpMant = 3.8 * Math.pow(peso, 0.75) * factorRaza;
        
        // Proteína metabolizable para ganancia (MPg) 
        // ~220-280 g/kg de ganancia según peso y composición de la ganancia
        // A mayor peso, menor contenido de proteína en la ganancia
        const mpPorKgGanancia = peso < 250 ? 280 : peso < 350 ? 250 : peso < 450 ? 220 : 200;
        const mpGanancia = mpPorKgGanancia * gdp * factorSexo;
        
        // Proteína metabolizable total requerida
        const mpTotal = mpMant + mpGanancia;
        
        // Convertir MP a Proteína Bruta (CP)
        // Eficiencia de uso de MP para mantenimiento (Kmp) ≈ 0.70
        // Eficiencia de uso de MP para ganancia (Kpg) ≈ 0.50
        // Proteína bruta = MP / (eficiencia promedio ~0.6 para dietas de feedlot)
        const eficienciaMP = 0.60; // Promedio ponderado mantenimiento/ganancia
        const pbTotal = mpTotal / eficienciaMP;
        
        // Convertir a % de la dieta
        const pbReq = (pbTotal / 1000) / consumoMS * 100;
        
        // Ca y P requeridos (%) - basado en NRC 2000
        // Ca (g/día) = 0.0154*PV + (0.071*PV^0.75 + 0.51)*GDP para novillos
        const caMant = 0.0154 * peso * factorRaza;
        const caCrec = (0.071 * Math.pow(peso, 0.75) + 0.34) * gdp;
        const caTotal = caMant + caCrec;
        const caReq = (caTotal / 1000) / consumoMS * 100;
        
        // P (g/día) = 0.011*PV + (0.038*PV^0.75 + 0.27)*GDP
        const pMant = 0.011 * peso * factorRaza;
        const pCrec = (0.038 * Math.pow(peso, 0.75) + 0.18) * gdp;
        const pTotal = pMant + pCrec;
        const pReq = (pTotal / 1000) / consumoMS * 100;
        
        // NDT requerido estimado (%) - relación con energía
        // NDT% ≈ (EM Mcal/kg - 0.5) * 30 (aproximación)
        const ndtReq = Math.min(85, Math.max(65, (emReq - 0.5) * 30));
        
        return {
            MS: 100, // base seca
            PB: Math.max(10, Math.min(16, pbReq)),  // Feedlot: 10-16% según etapa
            EM: Math.max(2.4, Math.min(3.4, emReq)), // Feedlot: 2.4-3.4 Mcal/kg
            Ca: Math.max(0.30, Math.min(0.8, caReq)), // Feedlot: 0.30-0.8%
            P: Math.max(0.18, Math.min(0.45, pReq)),  // Feedlot: 0.18-0.45%
            NDT: Math.max(65, Math.min(85, ndtReq)),  // Feedlot: 65-85%
            FC: { min: 8, max: 22 },
            _detalle: { 
                consumoMS: consumoMS.toFixed(1), 
                emTotal: netEnergyTotal.toFixed(2), 
                mpTotal: mpTotal.toFixed(0), // Proteína metabolizable total (g/día)
                pbTotal: pbTotal.toFixed(0),  // Proteína bruta total (g/día)
                emMant: emMantenimiento.toFixed(2),
                emGan: emCrecimiento.toFixed(2)
            }
        };
    },

    calcularCostoDieta(dieta) {
        if (!dieta || !dieta.ingredientes || !Array.isArray(dieta.ingredientes)) return 0;
        let costoTotal = 0;
        dieta.ingredientes.forEach(ing => {
            const porcentaje = parseFloat(ing.porcentaje) || 0;
            // Si el ingrediente ya tiene costo guardado, usarlo; si no, buscar en la biblioteca (compatibilidad con dietas antiguas)
            let costoUnitario = parseFloat(ing.costo) || 0;
            if (!costoUnitario && ing.nombre) {
                const ingDB = this.getIngredienteDB(ing.nombre);
                if (ingDB) costoUnitario = parseFloat(ingDB.costo) || 0;
            }
            // Los costos están en $/ton, dividimos por 1000 para obtener $/kg de dieta
            costoTotal += costoUnitario * (porcentaje / 100) / 1000;
        });
        return costoTotal;
    },

    calcularCostoDietaMS(dieta) {
        const costoFresco = this.calcularCostoDieta(dieta);
        const nutricion = this.calcularNutricionTotal(dieta);
        const msDieta = nutricion.MS || 85;
        if (msDieta <= 0) return 0;
        return costoFresco / (msDieta / 100);
    },
    
    setupEventListenersModal() {
        const nombre = document.getElementById('dietaNombre');
        if (nombre) nombre.addEventListener('input', () => this.actualizarVistaPreviaModal());
        
        // Cerrar autocomplete al hacer click fuera
        document.addEventListener('click', (e) => {
            const autocomplete = document.getElementById('autocompleteIngredientes');
            const buscador = document.getElementById('buscarIngrediente');
            if (autocomplete && !autocomplete.contains(e.target) && e.target !== buscador) {
                autocomplete.style.display = 'none';
            }
        });
    },
    
    actualizarVistaPreviaModal() {
        if (!this.dietaEnEdicion) return;
        
        // Actualizar nombre
        this.dietaEnEdicion.nombre = document.getElementById('dietaNombre')?.value || '';
        
        // Recalcular costo
        this.dietaEnEdicion.costo = this.calcularCostoDieta(this.dietaEnEdicion);
        
        // Actualizar vistas
        const total = this.calcularTotalPorcentaje(this.dietaEnEdicion.ingredientes);
        
        const totalEl = document.getElementById('totalPorcentajeModal');
        if (totalEl) {
            totalEl.textContent = total.toFixed(1) + '%';
            totalEl.style.color = total === 100 ? 'var(--success)' : 'var(--danger)';
        }
        
        const msgEl = document.getElementById('mensajeValidacionModal');
        if (msgEl) msgEl.textContent = total !== 100 ? '⚠️ El total debe sumar exactamente 100%' : '';
        
        // Actualizar costos
        const costoKgEl = document.getElementById('costoKgModal');
        if (costoKgEl) costoKgEl.textContent = Formatters.currency((this.dietaEnEdicion.costo || 0) * 1000) + '/ton';
        
        const costoMSEl = document.getElementById('costoMSModal');
        if (costoMSEl) costoMSEl.textContent = Formatters.currency(this.calcularCostoDietaMS(this.dietaEnEdicion) * 1000) + '/ton MS';
        
        const analisisEl = document.getElementById('analisisNutricionalModal');
        if (analisisEl) analisisEl.innerHTML = this.renderAnalisisModal(this.dietaEnEdicion);
        
        const badge = document.getElementById('badgeValidacionModal');
        if (badge) {
            const esValida = this.validarDietaModal();
            badge.className = 'badge ' + (esValida ? 'badge-success' : 'badge-warning');
            badge.textContent = esValida ? '✓ Balanceada' : '⚠ Revisar';
        }
        
        const btnGuardar = document.getElementById('btnGuardarDieta');
        if (btnGuardar) btnGuardar.disabled = total !== 100 || !this.dietaEnEdicion.nombre;
    },
    
    actualizarPorcentajeModal(idx, valor) {
        if (!this.dietaEnEdicion || !this.dietaEnEdicion.ingredientes || !this.dietaEnEdicion.ingredientes[idx]) return;
        
        const nuevoPorcentaje = parseFloat(valor) || 0;
        this.dietaEnEdicion.ingredientes[idx].porcentaje = nuevoPorcentaje;
        this.dietaEnEdicion.ingredientes[idx].kg = nuevoPorcentaje * 10;
        
        this.actualizarVistaPreviaModal();
    },
    
    actualizarCostoModal(idx, valor) {
        if (!this.dietaEnEdicion || !this.dietaEnEdicion.ingredientes || !this.dietaEnEdicion.ingredientes[idx]) return;
        
        this.dietaEnEdicion.ingredientes[idx].costo = parseFloat(valor) || 0;
        this.actualizarVistaPreviaModal();
    },
    
    eliminarIngredienteModal(idx) {
        if (!this.dietaEnEdicion || !this.dietaEnEdicion.ingredientes || !confirm('¿Eliminar este ingrediente?')) return;
        
        this.dietaEnEdicion.ingredientes.splice(idx, 1);
        const listaEl = document.getElementById('listaIngredientesModal');
        if (listaEl) listaEl.innerHTML = this.renderIngredientesModal(this.dietaEnEdicion.ingredientes);
        this.actualizarVistaPreviaModal();
    },
    
    guardarDietaModal(dietaId) {
        if (!this.dietaEnEdicion) return;
        
        // Validaciones
        if (!this.dietaEnEdicion.nombre.trim()) {
            UI.showToast('Ingrese un nombre para la dieta', 'error');
            return;
        }
        
        const total = this.calcularTotalPorcentaje(this.dietaEnEdicion.ingredientes);
        if (total !== 100) {
            UI.showToast('El total de porcentajes debe ser exactamente 100%', 'error');
            return;
        }
        
        if (this.dietaEnEdicion.ingredientes.length === 0) {
            UI.showToast('Agregue al menos un ingrediente', 'error');
            return;
        }
        
        // Congelar precios y nutrición de cada ingrediente al momento de guardar
        (this.dietaEnEdicion.ingredientes || []).forEach(ing => {
            if (!ing.costo || ing.costo === 0) {
                const ingDB = this.getIngredienteDB(ing.nombre);
                if (ingDB) ing.costo = parseFloat(ingDB.costo) || 0;
            }
            if (!ing.nutricion) {
                const ingDB = this.getIngredienteDB(ing.nombre);
                if (ingDB) ing.nutricion = ingDB.nutricion;
            }
        });
        
        // Calcular nutrición final y MS
        const nutricion = this.calcularNutricionTotal(this.dietaEnEdicion);
        this.dietaEnEdicion.nutricion = nutricion;
        this.dietaEnEdicion.ms = Math.round(nutricion.MS || 85);
        this.dietaEnEdicion.costo = this.calcularCostoDieta(this.dietaEnEdicion);
        
        // Compatibilidad: mantener composicion para charts/utils
        this.dietaEnEdicion.composicion = (this.dietaEnEdicion.ingredientes || []).map(ing => ({
            ingrediente: ing.nombre,
            porcentaje: ing.porcentaje
        }));
        
        // Guardar
        if (!AppData.dietas) AppData.dietas = [];
        
        const idxExistente = AppData.dietas.findIndex(d => d.id === dietaId);
        if (idxExistente >= 0) {
            // Actualizar existente
            AppData.dietas[idxExistente] = {...this.dietaEnEdicion};
        } else {
            // Nueva dieta
            AppData.dietas.push({...this.dietaEnEdicion});
        }
        
        AppState.dietaActiva = AppData.dietas.find(d => d.id === this.dietaEnEdicion.id);
        
        DataManager.save();
        this.cerrarModalNuevaDieta();
        this.render();
        
        UI.showToast(idxExistente >= 0 ? 'Dieta actualizada correctamente' : 'Dieta creada correctamente', 'success');
    },
    
    getFEDNAList() {
        // Obtener lista plana de ingredientes FEDNA para autocompletar
        const ingredientes = [];
        if (typeof INGREDIENTES_DB !== 'undefined') {
            Object.keys(INGREDIENTES_DB).forEach(nombre => {
                const item = INGREDIENTES_DB[nombre];
                ingredientes.push({
                    nombre: nombre,
                    costo: item.costo || 0,
                    nutricion: item.nutricion || null
                });
            });
        }
        // También incluir biblioteca interna
        if (this.getBibliotecaIngredientes) {
            this.getBibliotecaIngredientes().forEach(item => {
                if (!ingredientes.find(i => i.nombre === item.nombre)) {
                    ingredientes.push({
                        nombre: item.nombre,
                        costo: item.costo || 0,
                        nutricion: item.nutricion || null
                    });
                }
            });
        }
        return ingredientes.sort((a, b) => a.nombre.localeCompare(b.nombre));
    },
    
    mostrarAutocomplete() {
        const container = document.getElementById('autocompleteIngredientes');
        if (!container) return;
        const lista = this.getFEDNAList().slice(0, 20);
        this._renderAutocompleteList(lista);
        container.style.display = 'block';
    },
    
    filtrarIngredientesAutocomplete(query) {
        const container = document.getElementById('autocompleteIngredientes');
        if (!container) return;
        if (!query || query.length < 2) {
            container.style.display = 'none';
            return;
        }
        const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const todos = this.getFEDNAList();
        const filtrados = todos.filter(item => {
            const nombre = item.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return nombre.includes(q);
        }).slice(0, 15);
        this._renderAutocompleteList(filtrados);
        container.style.display = 'block';
    },
    
    _renderAutocompleteList(lista) {
        const container = document.getElementById('autocompleteIngredientes');
        if (!container) return;
        if (lista.length === 0) {
            container.innerHTML = '<div style="padding: 12px; color: #888; font-size: 13px;">Sin resultados</div>';
            return;
        }
        container.innerHTML = lista.map(item => `
            <div onclick="DietasSection.seleccionarIngredienteAutocomplete('${item.nombre.replace(/'/g, "\\'")}')" 
                 style="padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0; font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                <span>${item.nombre}</span>
                <span style="font-size: 11px; color: #888;">${Formatters.currency(item.costo)}/ton</span>
            </div>
        `).join('');
    },
    
    seleccionarIngredienteAutocomplete(nombre) {
        const ingredientes = this.dietaEnEdicion?.ingredientes || [];
        const existe = ingredientes.find(i => i?.nombre?.toLowerCase() === nombre.toLowerCase());
        if (existe) {
            UI.showToast('Este ingrediente ya está en la dieta', 'warning');
            this.ocultarAutocomplete();
            return;
        }
        
        // Buscar datos del ingrediente
        let datos = null;
        if (typeof INGREDIENTES_DB !== 'undefined' && INGREDIENTES_DB[nombre]) {
            datos = INGREDIENTES_DB[nombre];
        }
        if (!datos && this.getBibliotecaIngredientes) {
            datos = this.getBibliotecaIngredientes().find(i => i.nombre === nombre);
        }
        
        ingredientes.push({
            nombre: nombre,
            porcentaje: 0,
            kg: 0,
            costo: datos?.costo || 0,
            nutricion: datos?.nutricion || null
        });
        
        // Limpiar buscador
        const buscador = document.getElementById('buscarIngrediente');
        if (buscador) buscador.value = '';
        this.ocultarAutocomplete();
        
        // Actualizar lista
        const listaEl = document.getElementById('listaIngredientesModal');
        if (listaEl) listaEl.innerHTML = this.renderIngredientesModal(ingredientes);
        this.actualizarVistaPreviaModal();
        
        UI.showToast(`${nombre} agregado`, 'success');
    },
    
    ocultarAutocomplete() {
        const container = document.getElementById('autocompleteIngredientes');
        if (container) container.style.display = 'none';
    },
    

    // ============ FUNCIONES DE BIBLIOTECA DE INGREDIENTES ============
    
    nuevoIngrediente() {
        const modal = document.createElement('div');
        modal.id = 'modalNuevoIngrediente';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;';
        
        // Generar opciones del selector FEDNA
        const fednaOptions = this.generarOpcionesFEDNA();
        
        modal.innerHTML = `
            <div class="modal-content" style="background: white; border-radius: 12px; width: 100%; max-width: 700px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
                    <h3 style="margin: 0; font-size: 20px;">📦 Nuevo Ingrediente - Tablas FEDNA</h3>
                    <button onclick="DietasSection.cerrarModalNuevoIngrediente()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: white;">×</button>
                </div>
                
                <div class="modal-body" style="padding: 20px; overflow-y: auto; flex: 1;">
                    <!-- Selector de origen de datos -->
                    <div style="display: flex; gap: 10px; margin-bottom: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px;">
                        <button type="button" id="btnFedna" class="btn" onclick="DietasSection.toggleOrigenDatos('fedna')" 
                                style="flex: 1; background: #667eea; color: white; border: 2px solid #667eea;">
                            🗂️ Usar Tablas FEDNA
                        </button>
                        <button type="button" id="btnManual" class="btn" onclick="DietasSection.toggleOrigenDatos('manual')" 
                                style="flex: 1; background: white; color: #667eea; border: 2px solid #667eea;">
                            ✏️ Ingreso Manual
                        </button>
                    </div>
                    
                    <!-- Selector FEDNA -->
                    <div id="seccionFedna" style="display: block;">
                        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <div style="font-size: 13px; color: #2e7d32; margin-bottom: 10px;">
                                <strong>💡 Tablas FEDNA:</strong> Seleccione un ingrediente de la base de datos de la Federación Española de Nutrición Animal con valores nutricionales certificados.
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Familia de Ingredientes *</label>
                            <select class="form-select" id="fednaFamilia" onchange="DietasSection.cargarIngredientesFedna()" style="font-size: 15px; padding: 12px;">
                                <option value="">Seleccione una familia...</option>
                                ${fednaOptions.familias}
                            </select>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Ingrediente *</label>
                            <select class="form-select" id="fednaIngrediente" onchange="DietasSection.cargarEscalasFedna()" disabled style="font-size: 15px; padding: 12px;">
                                <option value="">Primero seleccione una familia...</option>
                            </select>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Escala de Materia Seca (%MS) *</label>
                            <select class="form-select" id="fednaEscala" onchange="DietasSection.aplicarEscalaFedna()" disabled style="font-size: 15px; padding: 12px;">
                                <option value="">Primero seleccione un ingrediente...</option>
                            </select>
                        </div>
                        
                        <!-- Ajuste de humedad personalizada -->
                        <div id="ajusteHumedad" style="display: none; background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ff9800;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <input type="checkbox" id="checkAjusteHumedad" onchange="DietasSection.toggleAjusteHumedad()" style="width: 18px; height: 18px;">
                                <label for="checkAjusteHumedad" style="margin: 0; font-weight: 600; color: #e65100; cursor: pointer;">
                                    Ajustar humedad personalizada
                                </label>
                            </div>
                            <div id="controlesHumedad" style="display: none;">
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label">Humedad deseada (%)</label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="range" id="sliderHumedad" min="0" max="80" value="12" 
                                               oninput="DietasSection.actualizarHumedad(this.value)" style="flex: 1;">
                                        <input type="number" id="inputHumedad" value="12" min="0" max="80" 
                                               onchange="DietasSection.actualizarHumedad(this.value)" 
                                               style="width: 80px; text-align: center;" class="form-input">
                                        <span style="font-weight: 600; color: #e65100;">%</span>
                                    </div>
                                    <div style="font-size: 12px; color: #666; margin-top: 5px;">
                                        MS resultante: <strong id="msResultante">88%</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Vista previa de la composición FEDNA -->
                        <div id="fednaVistaPrevia" style="display: none; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #667eea;">📊 Composición Química (base MS)</h4>
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
                                <div style="background: white; padding: 10px; border-radius: 6px;">
                                    <div style="font-size: 11px; color: #666;">MS</div>
                                    <div id="vpMS" style="font-size: 18px; font-weight: 700; color: #667eea;">-</div>
                                </div>
                                <div style="background: white; padding: 10px; border-radius: 6px;">
                                    <div style="font-size: 11px; color: #666;">PB</div>
                                    <div id="vpPB" style="font-size: 18px; font-weight: 700; color: #667eea;">-</div>
                                </div>
                                <div style="background: white; padding: 10px; border-radius: 6px;">
                                    <div style="font-size: 11px; color: #666;">EM</div>
                                    <div id="vpEM" style="font-size: 18px; font-weight: 700; color: #667eea;">-</div>
                                </div>
                                <div style="background: white; padding: 10px; border-radius: 6px;">
                                    <div style="font-size: 11px; color: #666;">NDT</div>
                                    <div id="vpNDT" style="font-size: 18px; font-weight: 700; color: #667eea;">-</div>
                                </div>
                                <div style="background: white; padding: 10px; border-radius: 6px;">
                                    <div style="font-size: 11px; color: #666;">Ca</div>
                                    <div id="vpCa" style="font-size: 18px; font-weight: 700; color: #667eea;">-</div>
                                </div>
                                <div style="background: white; padding: 10px; border-radius: 6px;">
                                    <div style="font-size: 11px; color: #666;">P</div>
                                    <div id="vpP" style="font-size: 18px; font-weight: 700; color: #667eea;">-</div>
                                </div>
                                <div style="background: white; padding: 10px; border-radius: 6px;">
                                    <div style="font-size: 11px; color: #666;">EE</div>
                                    <div id="vpEE" style="font-size: 18px; font-weight: 700; color: #667eea;">-</div>
                                </div>
                                <div style="background: white; padding: 10px; border-radius: 6px;">
                                    <div style="font-size: 11px; color: #666;">FB</div>
                                    <div id="vpFB" style="font-size: 18px; font-weight: 700; color: #667eea;">-</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Formulario manual (oculto inicialmente) -->
                    <div id="seccionManual" style="display: none;">
                        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <div style="font-size: 13px; color: #e65100;">
                                <strong>⚠️ Ingreso Manual:</strong> Complete manualmente los valores nutricionales del ingrediente.
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Nombre del Ingrediente *</label>
                            <input type="text" class="form-input" id="ingredienteNombre" placeholder="Ej: Ingrediente personalizado">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Categoría *</label>
                            <select class="form-select" id="ingredienteCategoria">
                                <option value="grano">Grano energético</option>
                                <option value="proteico">Fuente proteica</option>
                                <option value="forraje">Forraje</option>
                                <option value="mineral">Mineral</option>
                                <option value="vitamina">Vitamina</option>
                                <option value="aditivo">Aditivo</option>
                                <option value="energetico">Energético</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Campos comunes -->
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label class="form-label">Costo ($/ton) *</label>
                        <input type="number" class="form-input" id="ingredienteCosto" placeholder="450" min="0" step="1">
                    </div>
                    
                    <!-- Formulario nutricional manual (editable) -->
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;" id="nutricionManual">
                        <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Valores Nutricionales (base MS)</h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            <div class="form-group" style="margin: 0;">
                                <label class="form-label">Materia Seca (MS) %</label>
                                <input type="number" class="form-input" id="ingredienteMS" value="90" min="0" max="100" step="0.1">
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label class="form-label">Proteína Bruta (PB) %</label>
                                <input type="number" class="form-input" id="ingredientePB" value="0" min="0" max="100" step="0.1">
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label class="form-label">Energía Metab. (EM) Mcal/kg</label>
                                <input type="number" class="form-input" id="ingredienteEM" value="0" min="0" max="10" step="0.01">
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label class="form-label">NDT %</label>
                                <input type="number" class="form-input" id="ingredienteNDT" value="0" min="0" max="100" step="0.1">
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label class="form-label">Calcio (Ca) %</label>
                                <input type="number" class="form-input" id="ingredienteCa" value="0" min="0" max="100" step="0.01">
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label class="form-label">Fósforo (P) %</label>
                                <input type="number" class="form-input" id="ingredienteP" value="0" min="0" max="100" step="0.01">
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label class="form-label">Extracto Etéreo (EE) %</label>
                                <input type="number" class="form-input" id="ingredienteEE" value="0" min="0" max="100" step="0.1">
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label class="form-label">Fibra Bruta (FB) %</label>
                                <input type="number" class="form-input" id="ingredienteFB" value="0" min="0" max="100" step="0.1">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e9ecef; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="btn btn-secondary" onclick="DietasSection.cerrarModalNuevoIngrediente()">Cancelar</button>
                    <button class="btn btn-primary" onclick="DietasSection.guardarNuevoIngrediente()">💾 Guardar Ingrediente</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    cerrarModalNuevoIngrediente() {
        const modal = document.getElementById('modalNuevoIngrediente');
        if (modal) {
            modal.remove();
        }
    },
    
    // ============ FUNCIONES FEDNA ============
    
    generarOpcionesFEDNA() {
        const familias = [];
        for (const [key, familia] of Object.entries(this.FEDNA)) {
            familias.push(`<option value="${key}">${familia.nombre}</option>`);
        }
        return { familias: familias.join('') };
    },
    
    toggleOrigenDatos(origen) {
        const btnFedna = document.getElementById('btnFedna');
        const btnManual = document.getElementById('btnManual');
        const seccionFedna = document.getElementById('seccionFedna');
        const seccionManual = document.getElementById('seccionManual');
        
        if (origen === 'fedna') {
            btnFedna.style.cssText = 'flex: 1; background: #667eea; color: white; border: 2px solid #667eea;';
            btnManual.style.cssText = 'flex: 1; background: white; color: #667eea; border: 2px solid #667eea;';
            seccionFedna.style.display = 'block';
            seccionManual.style.display = 'none';
        } else {
            btnFedna.style.cssText = 'flex: 1; background: white; color: #667eea; border: 2px solid #667eea;';
            btnManual.style.cssText = 'flex: 1; background: #667eea; color: white; border: 2px solid #667eea;';
            seccionFedna.style.display = 'none';
            seccionManual.style.display = 'block';
        }
    },
    
    cargarIngredientesFedna() {
        const familiaKey = document.getElementById('fednaFamilia').value;
        const selectIngrediente = document.getElementById('fednaIngrediente');
        const selectEscala = document.getElementById('fednaEscala');
        const vistaPrevia = document.getElementById('fednaVistaPrevia');
        
        // Resetear selects dependientes
        selectEscala.innerHTML = '<option value="">Primero seleccione un ingrediente...</option>';
        selectEscala.disabled = true;
        vistaPrevia.style.display = 'none';
        
        if (!familiaKey || !this.FEDNA[familiaKey]) {
            selectIngrediente.innerHTML = '<option value="">Primero seleccione una familia...</option>';
            selectIngrediente.disabled = true;
            return;
        }
        
        const familia = this.FEDNA[familiaKey];
        const opciones = ['<option value="">Seleccione un ingrediente...</option>'];
        
        for (const [key, variedad] of Object.entries(familia.variedades)) {
            opciones.push(`<option value="${key}">${variedad.nombre} (MS: ${variedad.MS}%)</option>`);
        }
        
        selectIngrediente.innerHTML = opciones.join('');
        selectIngrediente.disabled = false;
        
        // Auto-completar nombre y categoría
        if (document.getElementById('ingredienteNombre')) {
            document.getElementById('ingredienteNombre').value = familia.nombre;
        }
        if (document.getElementById('ingredienteCategoria')) {
            document.getElementById('ingredienteCategoria').value = familia.categoria;
        }
    },
    
    cargarEscalasFedna() {
        const familiaKey = document.getElementById('fednaFamilia').value;
        const ingredienteKey = document.getElementById('fednaIngrediente').value;
        const selectEscala = document.getElementById('fednaEscala');
        const vistaPrevia = document.getElementById('fednaVistaPrevia');
        
        vistaPrevia.style.display = 'none';
        
        if (!familiaKey || !ingredienteKey || !this.FEDNA[familiaKey]?.variedades[ingredienteKey]) {
            selectEscala.innerHTML = '<option value="">Primero seleccione un ingrediente...</option>';
            selectEscala.disabled = true;
            return;
        }
        
        const variedad = this.FEDNA[familiaKey].variedades[ingredienteKey];
        
        // Cargar la escala seleccionada directamente
        selectEscala.innerHTML = `<option value="${ingredienteKey}" selected>${variedad.nombre} - MS: ${variedad.MS}%</option>`;
        selectEscala.disabled = false;
        
        // Aplicar automáticamente
        this.aplicarEscalaFedna();
        
        // Actualizar nombre
        if (document.getElementById('ingredienteNombre')) {
            document.getElementById('ingredienteNombre').value = variedad.nombre;
        }
    },
    
    aplicarEscalaFedna() {
        const familiaKey = document.getElementById('fednaFamilia').value;
        const escalaKey = document.getElementById('fednaEscala').value;
        const ajusteHumedad = document.getElementById('ajusteHumedad');
        
        if (!familiaKey || !escalaKey || !this.FEDNA[familiaKey]?.variedades[escalaKey]) {
            document.getElementById('fednaVistaPrevia').style.display = 'none';
            if (ajusteHumedad) ajusteHumedad.style.display = 'none';
            return;
        }
        
        const datos = this.FEDNA[familiaKey].variedades[escalaKey];
        this.datosFednaSeleccionados = { ...datos }; // Guardar referencia
        
        // Mostrar controles de ajuste de humedad
        if (ajusteHumedad) {
            ajusteHumedad.style.display = 'block';
            // Resetear checkbox
            const check = document.getElementById('checkAjusteHumedad');
            if (check) {
                check.checked = false;
                this.toggleAjusteHumedad();
            }
        }
        
        // Actualizar vista previa
        this.actualizarVistaPreviaFedna(datos);
        
        // Actualizar campos del formulario
        this.actualizarFormularioNutricional(datos);
    },
    
    toggleAjusteHumedad() {
        const check = document.getElementById('checkAjusteHumedad');
        const controles = document.getElementById('controlesHumedad');
        
        if (!check || !controles) return;
        
        controles.style.display = check.checked ? 'block' : 'none';
        
        if (check.checked && this.datosFednaSeleccionados) {
            // Inicializar con el valor original
            const humedadOriginal = 100 - this.datosFednaSeleccionados.MS;
            document.getElementById('sliderHumedad').value = humedadOriginal;
            document.getElementById('inputHumedad').value = humedadOriginal;
            document.getElementById('msResultante').textContent = this.datosFednaSeleccionados.MS + '%';
        } else if (this.datosFednaSeleccionados) {
            // Restaurar valores originales
            this.actualizarVistaPreviaFedna(this.datosFednaSeleccionados);
            this.actualizarFormularioNutricional(this.datosFednaSeleccionados);
        }
    },
    
    actualizarHumedad(humedad) {
        const humedadVal = parseFloat(humedad) || 0;
        const ms = 100 - humedadVal;
        
        // Sincronizar slider y input
        document.getElementById('sliderHumedad').value = humedadVal;
        document.getElementById('inputHumedad').value = humedadVal;
        document.getElementById('msResultante').textContent = ms + '%';
        
        if (!this.datosFednaSeleccionados) return;
        
        // Calcular valores ajustados a la nueva MS
        const datosOriginales = this.datosFednaSeleccionados;
        const msOriginal = datosOriginales.MS;
        const factor = ms / msOriginal; // Factor de corrección
        
        // Los nutrientes se expresan como % de la MS, por lo que se mantienen iguales
        // Solo cambia la cantidad total de materia seca
        const datosAjustados = {
            ...datosOriginales,
            MS: ms,
            PB: datosOriginales.PB,
            EM: datosOriginales.EM,
            NDT: datosOriginales.NDT,
            Ca: datosOriginales.Ca,
            P: datosOriginales.P,
            EE: datosOriginales.EE,
            FB: datosOriginales.FB
        };
        
        this.actualizarVistaPreviaFedna(datosAjustados);
        this.actualizarFormularioNutricional(datosAjustados);
    },
    
    actualizarVistaPreviaFedna(datos) {
        document.getElementById('vpMS').textContent = datos.MS.toFixed(1) + '%';
        document.getElementById('vpPB').textContent = datos.PB + '%';
        document.getElementById('vpEM').textContent = datos.EM;
        document.getElementById('vpNDT').textContent = datos.NDT + '%';
        document.getElementById('vpCa').textContent = datos.Ca + '%';
        document.getElementById('vpP').textContent = datos.P + '%';
        document.getElementById('vpEE').textContent = (datos.EE || 0) + '%';
        document.getElementById('vpFB').textContent = (datos.FB || 0) + '%';
        
        document.getElementById('fednaVistaPrevia').style.display = 'block';
    },
    
    actualizarFormularioNutricional(datos) {
        document.getElementById('ingredienteMS').value = datos.MS;
        document.getElementById('ingredientePB').value = datos.PB;
        document.getElementById('ingredienteEM').value = datos.EM;
        document.getElementById('ingredienteNDT').value = datos.NDT;
        document.getElementById('ingredienteCa').value = datos.Ca;
        document.getElementById('ingredienteP').value = datos.P;
        document.getElementById('ingredienteEE').value = datos.EE || 0;
        document.getElementById('ingredienteFB').value = datos.FB || 0;
    },
    
    guardarNuevoIngrediente() {
        // Determinar si viene de FEDNA o manual
        const seccionFedna = document.getElementById('seccionFedna');
        const usandoFedna = seccionFedna && seccionFedna.style.display !== 'none';
        
        let nombre, categoria;
        
        if (usandoFedna) {
            // Validar selección FEDNA
            const familiaKey = document.getElementById('fednaFamilia')?.value;
            const escalaKey = document.getElementById('fednaEscala')?.value;
            
            if (!familiaKey || !escalaKey) {
                UI.showToast('Seleccione un ingrediente de las tablas FEDNA', 'error');
                return;
            }
            
            const datosFedna = this.FEDNA[familiaKey]?.variedades[escalaKey];
            if (!datosFedna) {
                UI.showToast('Error al obtener datos FEDNA', 'error');
                return;
            }
            
            nombre = datosFedna.nombre;
            categoria = this.FEDNA[familiaKey].categoria;
        } else {
            // Modo manual
            nombre = document.getElementById('ingredienteNombre')?.value?.trim();
            categoria = document.getElementById('ingredienteCategoria')?.value;
            
            if (!nombre) {
                UI.showToast('Ingrese el nombre del ingrediente', 'error');
                return;
            }
        }
        
        const costo = parseFloat(document.getElementById('ingredienteCosto')?.value) || 0;
        
        if (costo <= 0) {
            UI.showToast('Ingrese un costo válido', 'error');
            return;
        }
        
        // Verificar si ya existe
        const biblioteca = this.getBibliotecaIngredientes();
        if (biblioteca.find(i => i.nombre.toLowerCase() === nombre.toLowerCase())) {
            UI.showToast('Ya existe un ingrediente con ese nombre', 'error');
            return;
        }
        
        const nuevoIngrediente = {
            nombre: nombre,
            categoria: categoria,
            costo: costo,
            origen: usandoFedna ? 'FEDNA' : 'manual',
            nutricion: {
                MS: parseFloat(document.getElementById('ingredienteMS')?.value) || 90,
                PB: parseFloat(document.getElementById('ingredientePB')?.value) || 0,
                EM: parseFloat(document.getElementById('ingredienteEM')?.value) || 0,
                Ca: parseFloat(document.getElementById('ingredienteCa')?.value) || 0,
                P: parseFloat(document.getElementById('ingredienteP')?.value) || 0,
                NDT: parseFloat(document.getElementById('ingredienteNDT')?.value) || 0,
                EE: parseFloat(document.getElementById('ingredienteEE')?.value) || 0,
                FB: parseFloat(document.getElementById('ingredienteFB')?.value) || 0
            }
        };
        
        // Guardar en AppData.ingredientes (array de ingredientes personalizados)
        if (!AppData.ingredientes) {
            AppData.ingredientes = [];
        }
        AppData.ingredientes.push(nuevoIngrediente);
        
        DataManager.save();
        this.cerrarModalNuevoIngrediente();
        this.render();
        
        const mensaje = usandoFedna 
            ? `Ingrediente "${nombre}" (FEDNA) agregado correctamente` 
            : `Ingrediente "${nombre}" agregado correctamente`;
        UI.showToast(mensaje, 'success');
    },
    
    editarIngrediente(nombre) {
        const biblioteca = this.getBibliotecaIngredientes();
        const ingrediente = biblioteca.find(i => i.nombre === nombre);
        
        if (!ingrediente) {
            UI.showToast('Ingrediente no encontrado', 'error');
            return;
        }
        
        const esFedna = ingrediente.origen === 'FEDNA';
        const badgeFedna = esFedna ? '<span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px;">FEDNA</span>' : '';
        
        const modal = document.createElement('div');
        modal.id = 'modalEditarIngrediente';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: white; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 20px;">✏️ Editar Ingrediente ${badgeFedna}</h3>
                    <button onclick="DietasSection.cerrarModalEditarIngrediente()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <div class="modal-body" style="padding: 20px; overflow-y: auto; flex: 1;">
                    <div style="display: grid; gap: 15px;">
                        <div class="form-group">
                            <label class="form-label">Nombre del Ingrediente</label>
                            <input type="text" class="form-input" id="editIngredienteNombre" value="${ingrediente.nombre}" readonly style="background: #f8f9fa;">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Categoría *</label>
                            <select class="form-select" id="editIngredienteCategoria">
                                <option value="grano" ${ingrediente.categoria === 'grano' ? 'selected' : ''}>Grano energético</option>
                                <option value="proteico" ${ingrediente.categoria === 'proteico' ? 'selected' : ''}>Fuente proteica</option>
                                <option value="forraje" ${ingrediente.categoria === 'forraje' ? 'selected' : ''}>Forraje</option>
                                <option value="mineral" ${ingrediente.categoria === 'mineral' ? 'selected' : ''}>Mineral</option>
                                <option value="vitamina" ${ingrediente.categoria === 'vitamina' ? 'selected' : ''}>Vitamina</option>
                                <option value="aditivo" ${ingrediente.categoria === 'aditivo' ? 'selected' : ''}>Aditivo</option>
                                <option value="energetico" ${ingrediente.categoria === 'energetico' ? 'selected' : ''}>Energético</option>
                                <option value="otro" ${ingrediente.categoria === 'otro' ? 'selected' : ''}>Otro</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Costo ($/ton) *</label>
                            <input type="number" class="form-input" id="editIngredienteCosto" value="${ingrediente.costo}" min="0" step="1">
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Valores Nutricionales (base MS)</h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label">Materia Seca (MS) %</label>
                                    <input type="number" class="form-input" id="editIngredienteMS" value="${ingrediente.nutricion?.MS || 90}" min="0" max="100" step="0.1">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label">Proteína Bruta (PB) %</label>
                                    <input type="number" class="form-input" id="editIngredientePB" value="${ingrediente.nutricion?.PB || 0}" min="0" max="100" step="0.1">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label">Energía Metab. (EM) Mcal/kg</label>
                                    <input type="number" class="form-input" id="editIngredienteEM" value="${ingrediente.nutricion?.EM || 0}" min="0" max="10" step="0.01">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label">NDT %</label>
                                    <input type="number" class="form-input" id="editIngredienteNDT" value="${ingrediente.nutricion?.NDT || 0}" min="0" max="100" step="0.1">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label">Calcio (Ca) %</label>
                                    <input type="number" class="form-input" id="editIngredienteCa" value="${ingrediente.nutricion?.Ca || 0}" min="0" max="100" step="0.01">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label">Fósforo (P) %</label>
                                    <input type="number" class="form-input" id="editIngredienteP" value="${ingrediente.nutricion?.P || 0}" min="0" max="100" step="0.01">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label">Extracto Etéreo (EE) %</label>
                                    <input type="number" class="form-input" id="editIngredienteEE" value="${ingrediente.nutricion?.EE || 0}" min="0" max="100" step="0.1">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label">Fibra Bruta (FB) %</label>
                                    <input type="number" class="form-input" id="editIngredienteFB" value="${ingrediente.nutricion?.FB || 0}" min="0" max="100" step="0.1">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e9ecef; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="btn btn-secondary" onclick="DietasSection.cerrarModalEditarIngrediente()">Cancelar</button>
                    <button class="btn btn-primary" onclick="DietasSection.guardarEditarIngrediente('${nombre}')">💾 Guardar Cambios</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    cerrarModalEditarIngrediente() {
        const modal = document.getElementById('modalEditarIngrediente');
        if (modal) {
            modal.remove();
        }
    },
    
    guardarEditarIngrediente(nombreOriginal) {
        const costo = parseFloat(document.getElementById('editIngredienteCosto')?.value) || 0;
        
        if (costo <= 0) {
            UI.showToast('Ingrese un costo válido', 'error');
            return;
        }
        
        const ingredienteActualizado = {
            nombre: nombreOriginal,
            categoria: document.getElementById('editIngredienteCategoria')?.value || 'otro',
            costo: costo,
            nutricion: {
                MS: parseFloat(document.getElementById('editIngredienteMS')?.value) || 90,
                PB: parseFloat(document.getElementById('editIngredientePB')?.value) || 0,
                EM: parseFloat(document.getElementById('editIngredienteEM')?.value) || 0,
                Ca: parseFloat(document.getElementById('editIngredienteCa')?.value) || 0,
                P: parseFloat(document.getElementById('editIngredienteP')?.value) || 0,
                NDT: parseFloat(document.getElementById('editIngredienteNDT')?.value) || 0,
                EE: parseFloat(document.getElementById('editIngredienteEE')?.value) || 0,
                FB: parseFloat(document.getElementById('editIngredienteFB')?.value) || 0
            }
        };
        
        // Actualizar en AppData.ingredientes
        if (!AppData.ingredientes) {
            AppData.ingredientes = [];
        }
        
        const idx = AppData.ingredientes.findIndex(i => i.nombre === nombreOriginal);
        if (idx >= 0) {
            AppData.ingredientes[idx] = ingredienteActualizado;
        } else {
            // Si es un ingrediente base, agregarlo como personalizado
            AppData.ingredientes.push(ingredienteActualizado);
        }
        
        DataManager.save();
        this.cerrarModalEditarIngrediente();
        this.render();
        
        UI.showToast(`Ingrediente "${nombreOriginal}" actualizado correctamente`, 'success');
    },
    
    verDetalleIngrediente(nombre) {
        const biblioteca = this.getBibliotecaIngredientes();
        const ingrediente = biblioteca.find(i => i.nombre === nombre);
        
        if (!ingrediente) {
            UI.showToast('Ingrediente no encontrado', 'error');
            return;
        }
        
        const nutricion = ingrediente.nutricion || {};
        const pb = parseFloat(nutricion.PB) || 0;
        const costo = parseFloat(ingrediente.costo) || 0;
        const relacion = costo > 0 ? pb / costo : 0;
        const esFedna = ingrediente.origen === 'FEDNA';
        
        const badgeFedna = esFedna 
            ? '<span style="background: #667eea; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; margin-left: 8px;">🗂️ FEDNA</span>' 
            : '';
        
        const modal = document.createElement('div');
        modal.id = 'modalDetalleIngrediente';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: white; border-radius: 12px; width: 100%; max-width: 550px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 20px;">👁️ Detalle del Ingrediente</h3>
                    <button onclick="DietasSection.cerrarModalDetalleIngrediente()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <div class="modal-body" style="padding: 20px; overflow-y: auto; flex: 1;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="margin: 0 0 10px 0; color: var(--primary);">${ingrediente.nombre}${badgeFedna}</h2>
                        <span class="badge badge-secondary">${ingrediente.categoria || 'Otro'}</span>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">Costo por tonelada</div>
                        <div style="font-size: 32px; font-weight: 700;">${Formatters.currency(costo)}/ton</div>
                        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">($${(costo/1000).toFixed(3)}/kg)</div>
                    </div>
                    
                    <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Composición Química (base MS)</h4>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
                        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                            <div style="font-size: 10px; color: #666;">MS</div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${nutricion.MS || 0}%</div>
                        </div>
                        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                            <div style="font-size: 10px; color: #666;">PB</div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${nutricion.PB || 0}%</div>
                        </div>
                        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                            <div style="font-size: 10px; color: #666;">EM</div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${nutricion.EM || 0}</div>
                        </div>
                        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                            <div style="font-size: 10px; color: #666;">NDT</div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${nutricion.NDT || 0}%</div>
                        </div>
                        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                            <div style="font-size: 10px; color: #666;">Ca</div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${nutricion.Ca || 0}%</div>
                        </div>
                        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                            <div style="font-size: 10px; color: #666;">P</div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${nutricion.P || 0}%</div>
                        </div>
                        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                            <div style="font-size: 10px; color: #666;">EE</div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${nutricion.EE || 0}%</div>
                        </div>
                        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                            <div style="font-size: 10px; color: #666;">FB</div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${nutricion.FB || 0}%</div>
                        </div>
                    </div>
                    
                    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600;">Relación PB/Costo:</span>
                            <span style="font-size: 24px; font-weight: 700; color: ${relacion > 30 ? 'var(--success)' : relacion > 20 ? 'var(--warning)' : 'var(--danger)'};">
                                ${relacion.toFixed(1)}
                            </span>
                        </div>
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">
                            ${relacion > 30 ? '✅ Excelente relación proteína/costo' : relacion > 20 ? '⚠️ Relación aceptable' : '❌ Baja relación proteína/costo'}
                        </div>
                    </div>
                    
                    ${esFedna ? `
                    <div style="margin-top: 15px; padding: 12px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #667eea;">
                        <div style="font-size: 12px; color: #667eea;">
                            <strong>🗂️ Origen:</strong> Ingrediente cargado desde Tablas FEDNA (Federación Española de Nutrición Animal)
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e9ecef; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="btn btn-secondary" onclick="DietasSection.cerrarModalDetalleIngrediente()">Cerrar</button>
                    <button class="btn btn-primary" onclick="DietasSection.cerrarModalDetalleIngrediente(); DietasSection.editarIngrediente('${nombre}')">✏️ Editar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    cerrarModalDetalleIngrediente() {
        const modal = document.getElementById('modalDetalleIngrediente');
        if (modal) {
            modal.remove();
        }
    },
    
    filtrarIngredientes() {
        const filtro = document.getElementById('filtroCategoriaIng')?.value;
        const tabla = document.getElementById('tablaIngredientes');
        if (!tabla) return;
        
        const filas = tabla.querySelectorAll('tbody tr');
        filas.forEach(fila => {
            const categoria = fila.querySelector('td:nth-child(2) .badge')?.textContent?.toLowerCase() || '';
            if (!filtro || categoria === filtro) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    },

    // ============ NÚCLEOS MINERALES ============
    
    nuevoNucleo() {
        this.abrirModalNucleo();
    },
    
    abrirModalNucleo(nucleoExistente = null) {
        const esEdicion = !!nucleoExistente;
        const nucleo = nucleoExistente || {
            id: Date.now(),
            nombre: '',
            descripcion: '',
            inclusionMin: 0.5,
            inclusionMax: 2.0,
            costo: 0,
            // Fuentes de Nitrógeno y Proteína
            tieneUrea: false,
            ureaPct: 0,
            tienePB: false,
            pbPct: 0,
            // Macrominerales (%)
            Ca: 18,
            P: 8,
            Na: 10,
            Mg: 4,
            K: 2,
            S: 1.5,
            Cl: 3,
            // Microminerales (ppm)
            Fe: 3000,
            Cu: 500,
            Zn: 3000,
            Mn: 2000,
            I: 50,
            Co: 20,
            Se: 10,
            Cr: 0,
            // Zinc específico
            ZnInorganico: 2500,
            ZnOrganico: 500,
            // Vitaminas
            vitA: 500000,
            vitD: 50000,
            vitE: 3000,
            // Aditivos
            tieneMonensin: false,
            monensin: 0,
            tieneLasalocid: false,
            lasalocid: 0,
            tieneLevaduras: false,
            levadurasUFC: 0,
        };
        
        const modal = document.createElement('div');
        modal.id = 'modalNucleo';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: white; border-radius: 12px; width: 100%; max-width: 700px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 20px;">${esEdicion ? '✏️ Editar Núcleo' : '🔬 Nuevo Núcleo Mineral'}</h3>
                    <button onclick="DietasSection.cerrarModalNucleo()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <div class="modal-body" style="padding: 20px; overflow-y: auto; flex: 1;">
                    <div class="grid-2" style="gap: 20px;">
                        <!-- Columna izquierda: Info general -->
                        <div>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label class="form-label">Nombre del Núcleo *</label>
                                <input type="text" class="form-input" id="nucleoNombre" value="${nucleo.nombre}" placeholder="Ej: Núcleo Engorde Premium">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label class="form-label">Descripción</label>
                                <textarea class="form-input" id="nucleoDescripcion" rows="2" placeholder="Breve descripción del núcleo">${nucleo.descripcion}</textarea>
                            </div>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                                <div style="font-size: 12px; font-weight: 600; color: #666; margin-bottom: 10px;">📊 Inclusión Recomendada (%)</div>
                                <div class="grid-2" style="gap: 10px;">
                                    <div class="form-group" style="margin: 0;">
                                        <label class="form-label" style="font-size: 11px;">Mínimo</label>
                                        <input type="number" class="form-input" id="nucleoInclusionMin" value="${nucleo.inclusionMin}" min="0.1" max="10" step="0.1">
                                    </div>
                                    <div class="form-group" style="margin: 0;">
                                        <label class="form-label" style="font-size: 11px;">Máximo</label>
                                        <input type="number" class="form-input" id="nucleoInclusionMax" value="${nucleo.inclusionMax}" min="0.1" max="10" step="0.1">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label class="form-label">Costo ($/kg)</label>
                                <input type="number" class="form-input" id="nucleoCosto" value="${nucleo.costo}" min="0" step="0.1" placeholder="Costo por kg de núcleo">
                            </div>
                        </div>
                        
                        <!-- Columna derecha: Composición -->
                        <div>
                            <div style="font-size: 12px; font-weight: 600; color: #666; margin-bottom: 12px; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">
                                🔬 Composición Química
                            </div>
                            
                            <!-- Fuentes de Nitrógeno -->
                            <div style="font-size: 11px; color: #888; margin: 10px 0 8px 0;">💊 Fuentes de Nitrógeno/Proteína</div>
                            <div style="background: #fff8e1; padding: 12px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #ffe082;">
                                <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                                    <!-- Urea -->
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <input type="checkbox" id="nucleoTieneUrea" ${nucleo.tieneUrea ? 'checked' : ''} style="width: 18px; height: 18px;" onchange="document.getElementById('nucleoUreaGroup').style.display = this.checked ? 'flex' : 'none'">
                                        <label for="nucleoTieneUrea" style="font-size: 12px; font-weight: 500; margin: 0; cursor: pointer;">Urea</label>
                                    </div>
                                    <div id="nucleoUreaGroup" style="display: ${nucleo.tieneUrea ? 'flex' : 'none'}; gap: 10px; margin-left: 28px;">
                                        <div class="form-group" style="margin: 0; flex: 1;">
                                            <label class="form-label" style="font-size: 10px;">% en núcleo</label>
                                            <input type="number" class="form-input" id="nucleoUreaPct" value="${nucleo.ureaPct}" min="0" max="50" step="0.5" style="padding: 5px; font-size: 13px;" oninput="DietasSection.actualizarEqPBUrea()">
                                        </div>
                                        <div id="nucleoUreaEqPB" style="font-size: 11px; color: #666; padding-top: 20px;">= ${((nucleo.ureaPct || 0) * 2.8).toFixed(1)}% eq. PB</div>
                                    </div>
                                    
                                    <!-- Proteína Bruta directa -->
                                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                                        <input type="checkbox" id="nucleoTienePB" ${nucleo.tienePB ? 'checked' : ''} style="width: 18px; height: 18px;" onchange="document.getElementById('nucleoPBGroup').style.display = this.checked ? 'flex' : 'none'">
                                        <label for="nucleoTienePB" style="font-size: 12px; font-weight: 500; margin: 0; cursor: pointer;">Proteína Bruta (PB)</label>
                                    </div>
                                    <div id="nucleoPBGroup" style="display: ${nucleo.tienePB ? 'flex' : 'none'}; gap: 10px; margin-left: 28px;">
                                        <div class="form-group" style="margin: 0; flex: 1;">
                                            <label class="form-label" style="font-size: 10px;">% PB en núcleo</label>
                                            <input type="number" class="form-input" id="nucleoPBPct" value="${nucleo.pbPct}" min="0" max="100" step="0.5" style="padding: 5px; font-size: 13px;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Macrominerales -->
                            <div style="font-size: 11px; color: #888; margin: 10px 0 8px 0;">📊 Macrominerales (%)</div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Ca %</label>
                                    <input type="number" class="form-input" id="nucleoCa" value="${nucleo.Ca}" min="0" max="50" step="0.1" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">P %</label>
                                    <input type="number" class="form-input" id="nucleoP" value="${nucleo.P}" min="0" max="30" step="0.1" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Na %</label>
                                    <input type="number" class="form-input" id="nucleoNa" value="${nucleo.Na}" min="0" max="30" step="0.1" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Mg %</label>
                                    <input type="number" class="form-input" id="nucleoMg" value="${nucleo.Mg}" min="0" max="20" step="0.1" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">K %</label>
                                    <input type="number" class="form-input" id="nucleoK" value="${nucleo.K}" min="0" max="20" step="0.1" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">S %</label>
                                    <input type="number" class="form-input" id="nucleoS" value="${nucleo.S}" min="0" max="10" step="0.1" style="padding: 5px; font-size: 13px;">
                                </div>
                            </div>
                            
                            <!-- Microminerales -->
                            <div style="font-size: 11px; color: #888; margin: 10px 0 8px 0;">🔹 Microminerales (ppm)</div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Zn Total</label>
                                    <input type="number" class="form-input" id="nucleoZn" value="${nucleo.Zn}" min="0" max="10000" step="100" style="padding: 5px; font-size: 13px; background: #e8f5e9;" readonly>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Zn Inorgánico</label>
                                    <input type="number" class="form-input" id="nucleoZnInorganico" value="${nucleo.ZnInorganico}" min="0" max="10000" step="100" style="padding: 5px; font-size: 13px;" onchange="document.getElementById('nucleoZn').value = parseFloat(this.value) + parseFloat(document.getElementById('nucleoZnOrganico').value || 0)">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Zn Orgánico</label>
                                    <input type="number" class="form-input" id="nucleoZnOrganico" value="${nucleo.ZnOrganico}" min="0" max="5000" step="50" style="padding: 5px; font-size: 13px;" onchange="document.getElementById('nucleoZn').value = parseFloat(document.getElementById('nucleoZnInorganico').value || 0) + parseFloat(this.value)">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Mn ppm</label>
                                    <input type="number" class="form-input" id="nucleoMn" value="${nucleo.Mn}" min="0" max="10000" step="100" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Cu ppm</label>
                                    <input type="number" class="form-input" id="nucleoCu" value="${nucleo.Cu}" min="0" max="5000" step="50" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Fe ppm</label>
                                    <input type="number" class="form-input" id="nucleoFe" value="${nucleo.Fe}" min="0" max="10000" step="100" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Co ppm</label>
                                    <input type="number" class="form-input" id="nucleoCo" value="${nucleo.Co}" min="0" max="200" step="1" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">I ppm</label>
                                    <input type="number" class="form-input" id="nucleoI" value="${nucleo.I}" min="0" max="200" step="5" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Se ppm</label>
                                    <input type="number" class="form-input" id="nucleoSe" value="${nucleo.Se}" min="0" max="50" step="1" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Cr ppm</label>
                                    <input type="number" class="form-input" id="nucleoCr" value="${nucleo.Cr}" min="0" max="500" step="5" style="padding: 5px; font-size: 13px;">
                                </div>
                            </div>
                            
                            <!-- Vitaminas -->
                            <div style="font-size: 11px; color: #888; margin: 10px 0 8px 0;">💊 Vitaminas (UI/kg)</div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Vit A</label>
                                    <input type="number" class="form-input" id="nucleoVitA" value="${nucleo.vitA}" min="0" max="2000000" step="10000" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Vit D</label>
                                    <input type="number" class="form-input" id="nucleoVitD" value="${nucleo.vitD}" min="0" max="200000" step="5000" style="padding: 5px; font-size: 13px;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 10px;">Vit E</label>
                                    <input type="number" class="form-input" id="nucleoVitE" value="${nucleo.vitE}" min="0" max="20000" step="100" style="padding: 5px; font-size: 13px;">
                                </div>
                            </div>
                            
                            <!-- Aditivos -->
                            <div style="font-size: 11px; color: #888; margin: 10px 0 8px 0;">💉 Aditivos</div>
                            <div style="background: #fce4ec; padding: 12px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #f8bbd9;">
                                <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                                    <!-- Monensina -->
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <input type="checkbox" id="nucleoTieneMonensin" ${nucleo.tieneMonensin ? 'checked' : ''} style="width: 18px; height: 18px;" onchange="document.getElementById('nucleoMonensinGroup').style.display = this.checked ? 'flex' : 'none'">
                                        <label for="nucleoTieneMonensin" style="font-size: 12px; font-weight: 500; margin: 0; cursor: pointer;">Monensina (ionóforo)</label>
                                    </div>
                                    <div id="nucleoMonensinGroup" style="display: ${nucleo.tieneMonensin ? 'flex' : 'none'}; gap: 10px; margin-left: 28px;">
                                        <div class="form-group" style="margin: 0; flex: 1;">
                                            <label class="form-label" style="font-size: 10px;">mg/kg núcleo</label>
                                            <input type="number" class="form-input" id="nucleoMonensin" value="${nucleo.monensin}" min="0" max="50000" step="100" style="padding: 5px; font-size: 13px;">
                                        </div>
                                        <div style="font-size: 11px; color: #666; padding-top: 20px;">≈ ${((nucleo.monensin || 0) * (nucleo.inclusionMax || 2) / 100).toFixed(0)} mg/kg dieta @ ${nucleo.inclusionMax || 2}%</div>
                                    </div>
                                    
                                    <!-- Lasalocid -->
                                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                                        <input type="checkbox" id="nucleoTieneLasalocid" ${nucleo.tieneLasalocid ? 'checked' : ''} style="width: 18px; height: 18px;" onchange="document.getElementById('nucleoLasalocidGroup').style.display = this.checked ? 'flex' : 'none'">
                                        <label for="nucleoTieneLasalocid" style="font-size: 12px; font-weight: 500; margin: 0; cursor: pointer;">Lasalocid (ionóforo)</label>
                                    </div>
                                    <div id="nucleoLasalocidGroup" style="display: ${nucleo.tieneLasalocid ? 'flex' : 'none'}; gap: 10px; margin-left: 28px;">
                                        <div class="form-group" style="margin: 0; flex: 1;">
                                            <label class="form-label" style="font-size: 10px;">mg/kg núcleo</label>
                                            <input type="number" class="form-input" id="nucleoLasalocid" value="${nucleo.lasalocid}" min="0" max="50000" step="100" style="padding: 5px; font-size: 13px;">
                                        </div>
                                    </div>
                                    
                                    <!-- Levaduras -->
                                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                                        <input type="checkbox" id="nucleoTieneLevaduras" ${nucleo.tieneLevaduras ? 'checked' : ''} style="width: 18px; height: 18px;" onchange="document.getElementById('nucleoLevadurasGroup').style.display = this.checked ? 'flex' : 'none'">
                                        <label for="nucleoTieneLevaduras" style="font-size: 12px; font-weight: 500; margin: 0; cursor: pointer;">Levaduras (S. cerevisiae)</label>
                                    </div>
                                    <div id="nucleoLevadurasGroup" style="display: ${nucleo.tieneLevaduras ? 'flex' : 'none'}; gap: 10px; margin-left: 28px;">
                                        <div class="form-group" style="margin: 0; flex: 1;">
                                            <label class="form-label" style="font-size: 10px;">UFC/g (millones)</label>
                                            <input type="number" class="form-input" id="nucleoLevadurasUFC" value="${nucleo.levadurasUFC}" min="0" max="100" step="1" style="padding: 5px; font-size: 13px;">
                                        </div>
                                        <div style="font-size: 11px; color: #666; padding-top: 20px;">× 10⁹ UFC/g</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e9ecef; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="btn btn-secondary" onclick="DietasSection.cerrarModalNucleo()">Cancelar</button>
                    <button class="btn btn-primary" onclick="DietasSection.guardarNucleo(${nucleo.id})">
                        ${esEdicion ? '💾 Guardar Cambios' : '✅ Crear Núcleo'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    cerrarModalNucleo() {
        const modal = document.getElementById('modalNucleo');
        if (modal) modal.remove();
    },
    
    guardarNucleo(nucleoId) {
        const nombre = document.getElementById('nucleoNombre')?.value?.trim();
        
        if (!nombre) {
            UI.showToast('Ingrese un nombre para el núcleo', 'error');
            return;
        }
        
        // Verificar si ya existe otro núcleo con ese nombre
        const existente = (AppData.nucleos || []).find(n => n.nombre.toLowerCase() === nombre.toLowerCase() && n.id !== nucleoId);
        if (existente) {
            UI.showToast('Ya existe un núcleo con ese nombre', 'error');
            return;
        }
        
        // Fuentes de N
        const tieneUrea = document.getElementById('nucleoTieneUrea')?.checked || false;
        const tienePB = document.getElementById('nucleoTienePB')?.checked || false;
        
        // Aditivos
        const tieneMonensin = document.getElementById('nucleoTieneMonensin')?.checked || false;
        const tieneLasalocid = document.getElementById('nucleoTieneLasalocid')?.checked || false;
        const tieneLevaduras = document.getElementById('nucleoTieneLevaduras')?.checked || false;
        
        const nucleo = {
            id: nucleoId,
            nombre: nombre,
            descripcion: document.getElementById('nucleoDescripcion')?.value || '',
            inclusionMin: parseFloat(document.getElementById('nucleoInclusionMin')?.value) || 0.5,
            inclusionMax: parseFloat(document.getElementById('nucleoInclusionMax')?.value) || 2.0,
            costo: parseFloat(document.getElementById('nucleoCosto')?.value) || 0,
            // Fuentes de Nitrógeno/Proteína
            tieneUrea: tieneUrea,
            ureaPct: tieneUrea ? (parseFloat(document.getElementById('nucleoUreaPct')?.value) || 0) : 0,
            tienePB: tienePB,
            pbPct: tienePB ? (parseFloat(document.getElementById('nucleoPBPct')?.value) || 0) : 0,
            // Macrominerales
            Ca: parseFloat(document.getElementById('nucleoCa')?.value) || 0,
            P: parseFloat(document.getElementById('nucleoP')?.value) || 0,
            Na: parseFloat(document.getElementById('nucleoNa')?.value) || 0,
            Mg: parseFloat(document.getElementById('nucleoMg')?.value) || 0,
            K: parseFloat(document.getElementById('nucleoK')?.value) || 0,
            S: parseFloat(document.getElementById('nucleoS')?.value) || 0,
            // Microminerales
            Zn: parseFloat(document.getElementById('nucleoZn')?.value) || 0,
            ZnInorganico: parseFloat(document.getElementById('nucleoZnInorganico')?.value) || 0,
            ZnOrganico: parseFloat(document.getElementById('nucleoZnOrganico')?.value) || 0,
            Mn: parseFloat(document.getElementById('nucleoMn')?.value) || 0,
            Cu: parseFloat(document.getElementById('nucleoCu')?.value) || 0,
            Fe: parseFloat(document.getElementById('nucleoFe')?.value) || 0,
            Co: parseFloat(document.getElementById('nucleoCo')?.value) || 0,
            I: parseFloat(document.getElementById('nucleoI')?.value) || 0,
            Se: parseFloat(document.getElementById('nucleoSe')?.value) || 0,
            Cr: parseFloat(document.getElementById('nucleoCr')?.value) || 0,
            // Vitaminas
            vitA: parseFloat(document.getElementById('nucleoVitA')?.value) || 0,
            vitD: parseFloat(document.getElementById('nucleoVitD')?.value) || 0,
            vitE: parseFloat(document.getElementById('nucleoVitE')?.value) || 0,
            // Aditivos
            tieneMonensin: tieneMonensin,
            monensin: tieneMonensin ? (parseFloat(document.getElementById('nucleoMonensin')?.value) || 0) : 0,
            tieneLasalocid: tieneLasalocid,
            lasalocid: tieneLasalocid ? (parseFloat(document.getElementById('nucleoLasalocid')?.value) || 0) : 0,
            tieneLevaduras: tieneLevaduras,
            levadurasUFC: tieneLevaduras ? (parseFloat(document.getElementById('nucleoLevadurasUFC')?.value) || 0) : 0
        };
        
        if (!AppData.nucleos) AppData.nucleos = [];
        
        const idxExistente = AppData.nucleos.findIndex(n => n.id === nucleoId);
        if (idxExistente >= 0) {
            AppData.nucleos[idxExistente] = nucleo;
        } else {
            AppData.nucleos.push(nucleo);
        }
        
        DataManager.save();
        this.cerrarModalNucleo();
        this.render();
        
        UI.showToast(idxExistente >= 0 ? 'Núcleo actualizado correctamente' : 'Núcleo creado correctamente', 'success');
    },
    
    editarNucleo(id) {
        const nucleo = (AppData.nucleos || []).find(n => n.id === id);
        if (!nucleo) {
            UI.showToast('Núcleo no encontrado', 'error');
            return;
        }
        this.abrirModalNucleo(nucleo);
    },
    
    eliminarNucleo(id) {
        const nucleo = (AppData.nucleos || []).find(n => n.id === id);
        if (!nucleo) return;
        
        if (!confirm(`¿Está seguro de eliminar el núcleo "${nucleo.nombre}"?`)) {
            return;
        }
        
        AppData.nucleos = (AppData.nucleos || []).filter(n => n.id !== id);
        DataManager.save();
        this.render();
        
        UI.showToast('Núcleo eliminado correctamente', 'success');
    },

    actualizarEqPBUrea() {
        const ureaPct = parseFloat(document.getElementById('nucleoUreaPct')?.value) || 0;
        const eqPB = (ureaPct * 2.8).toFixed(1);
        const displayEl = document.getElementById('nucleoUreaEqPB');
        if (displayEl) {
            displayEl.textContent = `= ${eqPB}% eq. PB`;
        }
    },

    addStyles() {
        if (document.getElementById('dietasStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'dietasStyles';
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
