import { useState } from "react";
import { authClient } from "../../../shared/api/authClient";
import { useAuthStore } from "../../../shared/store/authStore";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setSession = useAuthStore((s) => s.setSession);
  const logout = useAuthStore((s) => s.logout);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await authClient.login(email, password);
      // El login solo devuelve el token; guardamos el token primero para que
      // el interceptor de axios lo adjunte en la siguiente petición a /me
      setSession(accessToken, null);
      const me = await authClient.getMe();
      setSession(accessToken, me);
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data || "No se pudo iniciar sesión");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      await authClient.register(payload);
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo completar el registro");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await authClient.forgotPassword(email);
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo enviar el correo");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, forgotPassword, logout, loading, error };
}
