import { authApi } from "./api";
import { AUTH_ENDPOINTS } from "../constants/endpoints";

export const authClient = {
  login: (email, password) =>
    authApi.post(AUTH_ENDPOINTS.LOGIN, { email, password }).then((r) => r.data),

  register: (payload) =>
    authApi.post(AUTH_ENDPOINTS.REGISTER, payload).then((r) => r.data),

  forgotPassword: (email) =>
    authApi.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email }).then((r) => r.data),

  resetPassword: (payload) =>
    authApi.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload).then((r) => r.data),

  verifyEmail: (token) =>
    authApi.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token }).then((r) => r.data),

  resendVerification: (email) =>
    authApi.post(AUTH_ENDPOINTS.RESEND_VERIFICATION, { email }).then((r) => r.data),
};
