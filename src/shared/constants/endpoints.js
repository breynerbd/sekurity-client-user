import { Platform } from "react-native";

// Host que reemplaza a "localhost" cuando la app corre en el emulador de Android,
// ya que dentro del emulador "localhost" apunta al propio dispositivo, no a tu PC.
// 10.0.2.2 es la IP especial que Android Studio usa para llegar a tu máquina host.
function resolveHost(defaultHost) {
  if (Platform.OS === "android") return "10.0.2.2";
  return defaultHost; // web e iOS sí pueden usar localhost
}

// Si pruebas en un celular físico con Expo Go, ninguna de las dos opciones anteriores
// funciona: define EXPO_PUBLIC_LAN_IP con la IP de tu PC en la red WiFi (ipconfig)
// y se usará automáticamente en lugar de localhost/10.0.2.2.
const LAN_IP = process.env.EXPO_PUBLIC_LAN_IP;

function buildUrl(port, path, envOverride) {
  if (envOverride) return envOverride; // si defines la URL completa en .env, tiene prioridad
  const host = LAN_IP || resolveHost("localhost");
  return `http://${host}:${port}${path}`;
}

// URLs base de cada microservicio. Se resuelven automáticamente según la plataforma;
// puedes forzarlas definiendo EXPO_PUBLIC_AUTH_SERVICE_URL / EXPO_PUBLIC_SERVER_USER_URL en .env
export const AUTH_SERVICE_URL = buildUrl(
  5070,
  "/api/v1",
  process.env.EXPO_PUBLIC_AUTH_SERVICE_URL
);
export const SERVER_USER_URL = buildUrl(
  3006,
  "/sekurity/v1/user",   
  process.env.EXPO_PUBLIC_SERVER_USER_URL
);

// auth-service (AuthController.cs — confirmado)
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login", // devuelve { accessToken } — el usuario se pide aparte con ME
  REGISTER: "/auth/register", // body: { Name, Surname, Username, Email, Password, Role? }
  ME: "/auth/me", // requiere Authorization: Bearer <token>
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  RESEND_VERIFICATION: "/auth/resend-verification",
  // No existe /verify-email en el controller actual
};

// sekurity-server-user
export const USER_ENDPOINTS = {
  PROFILE: "/users/me",
  UPDATE_PROFILE: "/users/me",
};

export const ZONE_ENDPOINTS = {
  LIST: "/zones",
  DETAIL: (id) => `/zones/${id}`,
};

export const REPORT_ENDPOINTS = {
  LIST: "/reports",
  DETAIL: (id) => `/reports/${id}`,
  CREATE: "/reports",
};

export const RATING_ENDPOINTS = {
  BY_ZONE: (zoneId) => `/ratings/byZone/${zoneId}`,
  CREATE: (zoneId) => `/ratings/zone/${zoneId}`,
};

export const COMMENT_ENDPOINTS = {
  BY_REPORT: (reportId) => `/comments/byReport/${reportId}`,
  CREATE: () => `/comments`,
  DELETE: (commentId) => `/comments/${commentId}`,
};