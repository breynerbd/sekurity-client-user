# sekurity-client-user

App móvil (React Native + Expo) para el usuario final de **Sekurity**.
Sigue el mismo patrón de organización que `kinRural-client-user`: features por dominio,
cada uno con `hooks/` y `screens/`, más una capa `shared/` común.

## Microservicios consumidos

- **sekurity-auth-service** (.NET): login, registro, recuperación de contraseña, verificación de email.
- **sekurity-server-user** (Node/Express): zonas, reportes, comentarios, calificaciones, perfil de usuario.

## Estructura

```
src/
 ┣ features/
 ┃ ┣ auth/          → login, registro, recuperar contraseña
 ┃ ┣ zones/          → listado y detalle de zonas de seguridad
 ┃ ┣ reports/         → reportes de incidentes (listar, crear, detalle)
 ┃ ┣ comments/        → comentarios sobre reportes
 ┃ ┣ ratings/         → calificaciones de zonas
 ┃ ┗ profile/         → perfil del usuario autenticado
 ┣ navigation/        → AppNavigator, AuthStack, MainTabs
 ┗ shared/
   ┣ api/             → clientes axios por dominio (authClient, userClient, zoneClient...)
   ┣ components/       → Button, Input, ListItem, Common (loading/empty/error states)
   ┣ constants/        → endpoints.js, theme.js
   ┗ store/            → authStore.js (zustand + persistencia con AsyncStorage)
```

## Cómo correr

```bash
npm install
cp .env .env.local   # ajusta las URLs de tus microservicios
npm start
```

## Próximos pasos sugeridos

1. Ajustar los endpoints en `src/shared/constants/endpoints.js` a las rutas reales
   de `sekurity-server-user` (revisa `zone.routes.js`, `report.routes.js`, etc.).
2. Confirmar el shape exacto de las respuestas del `auth-service` (login/register)
   para adaptar `authClient.js` si los nombres de campos difieren.
3. Añadir manejo de refresh token si el auth-service lo soporta.
4. Agregar tests y validación de formularios (ej. con `react-hook-form` + `zod`,
   igual que podrías estar validando en client-admin).
