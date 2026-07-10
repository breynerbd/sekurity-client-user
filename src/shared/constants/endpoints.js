
export const AUTH_SERVICE_URL =
  process.env.EXPO_PUBLIC_AUTH_SERVICE_URL || "http://localhost:5000/api";
export const SERVER_USER_URL =
  process.env.EXPO_PUBLIC_SERVER_USER_URL || "http://localhost:4000/api";

export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
  RESEND_VERIFICATION: "/auth/resend-verification",
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

export const COMMENT_ENDPOINTS = {
  BY_REPORT: (reportId) => `/reports/${reportId}/comments`,
  CREATE: (reportId) => `/reports/${reportId}/comments`,
  DELETE: (commentId) => `/comments/${commentId}`,
};

export const RATING_ENDPOINTS = {
  BY_ZONE: (zoneId) => `/zones/${zoneId}/ratings`,
  CREATE: (zoneId) => `/zones/${zoneId}/ratings`,
};
