# Revisión rápida del proyecto Geoportal AOSC

Fecha de revisión: 2026-08-12

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

- Se centralizó la creación, lectura y eliminación de la sesión del navegador en `src/js/auth-session.js`.
- `index.html` ahora valida la sesión antes de inicializar el mapa; cerrar sesión elimina las cookies y vuelve al login en vez de recargar una vista sin protección.
- El formulario de acceso usa un único evento `submit`, por lo que funciona tanto con el botón como con Enter, evita envíos duplicados e informa fallos de carga de usuarios o de bcrypt.
- “Recuérdame” ahora tiene una semántica real: sesión de navegador cuando no se selecciona y persistencia durante 30 días cuando se selecciona.

## Diagnóstico del login

La causa principal era un flujo incompleto: `login.html` creaba la cookie `isLogged`, pero `index.html` cargaba `app.js`, que no comprobaba esa cookie. La comprobación existía únicamente en `app2.js`, archivo que la página no incluye. Además, el logout borraba cookies y recargaba `index.html`, permitiendo que la aplicación continuara abierta.

La corrección aplicada hace coherentes entrada, validación y salida. No convierte este mecanismo en autenticación segura: cualquier cookie creada desde JavaScript puede ser modificada por el usuario y `user.json` es público por definición en una aplicación estática.

## Próximos pasos sugeridos (prioridad)

1. **Prioridad crítica:** implementar autenticación en backend; almacenar contraseñas solo allí, emitir una cookie de sesión `HttpOnly`, `Secure` y `SameSite`, y autorizar también las capas/servicios en el servidor. Después, retirar `src/config/user.json` del contenido publicado.
2. **Prioridad alta:** eliminar los dos sistemas de login superpuestos (`components/login/login.js` para GeoServer y `loginatic.js` para el portal), o documentar y renombrar claramente sus responsabilidades.
3. **Prioridad alta:** empaquetar bcrypt y los recursos críticos localmente. Actualmente, una caída o bloqueo del CDN impide iniciar sesión.
4. **Prioridad media:** normalizar las dependencias antiguas y sus orígenes (especialmente Bootstrap 3 servido desde un sitio de documentación).
5. **Prioridad media:** incorporar pruebas automatizadas del ciclo login/logout, lint de HTML/JS y chequeo de enlaces locales en integración continua.
6. **Prioridad media:** definir Content Security Policy y retirar handlers JavaScript inline para reducir la superficie de XSS.
