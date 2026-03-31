# Revisión rápida del proyecto Geoportal AOSC

Fecha de revisión: 2026-03-18

## Panorama general

El proyecto está organizado como una aplicación web estática (HTML/CSS/JS) con arquitectura modular en `src/js/components`, buena separación por dominios funcionales y documentación en español/inglés dentro de `src/docs`.

## Fortalezas

- Estructura modular clara por componente (`sidebar`, `table`, `login`, `about`, etc.).
- Documentación funcional y de despliegue en dos idiomas.
- Uso consistente de Leaflet y plugins para capacidades GIS comunes.
- Recursos gráficos y estilos separados de la lógica principal.

## Riesgos y oportunidades de mejora

1. **Dependencias desde URLs de documentación (Bootstrap 3.3 en getbootstrap.com/docs)**  
   Recomendación: migrar a CDN de distribución estable o empaquetar assets locales para reducir riesgos de disponibilidad.

2. **Seguridad de autenticación en frontend**  
   El login compara credenciales en cliente leyendo `src/config/user.json`. Esto expone metadatos de usuarios y traslada confianza al navegador.  
   Recomendación: mover autenticación a backend (token/sesión httpOnly), dejando en frontend solo el flujo UI.

3. **Duplicación/consistencia de assets**  
   Hay referencias duplicadas y variedad de formatos/variantes de imágenes con nombres similares.  
   Recomendación: inventario de assets y política de naming para simplificar mantenimiento.

4. **Versionado de librerías**  
   Se usan librerías con versiones antiguas (ej. Bootstrap 3.x).  
   Recomendación: plan de actualización progresiva para seguridad y compatibilidad.

## Mejora aplicada en esta revisión

- Se corrigió una ruta CSS con separadores de Windows (`src\styles\css\main.css`) a formato web estándar (`src/styles/css/main.css`) en `index.html` para evitar inconsistencias de carga en entornos o herramientas estrictas.

## Próximos pasos sugeridos (prioridad)

1. Definir estrategia de autenticación segura con backend.
2. Normalizar origen de dependencias externas (CDN estable o self-hosted).
3. Crear checklist de release (paths, recursos, dependencias, smoke test manual).
4. Agregar validaciones automáticas mínimas (lint HTML/JS + chequeo de links locales).
