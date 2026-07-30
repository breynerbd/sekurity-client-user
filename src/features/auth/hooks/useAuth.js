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
      setSession(accessToken, null);
      const me = await authClient.getMe();
      setSession(accessToken, me);
      return true;
    } catch (err) {
      const errorData = err?.response?.data;
      let errorMessage = "Ocurrió un error al iniciar sesión";

      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData?.errors) {
        const validationErrors = Object.values(errorData.errors).flat();
        errorMessage = validationErrors.length > 0 ? validationErrors[0] : errorData.title;
      } else if (errorData?.title) {
        errorMessage = errorData.title;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      if (errorMessage.includes("The Email field is not a valid e-mail address.")) {
        errorMessage = "El campo de correo electrónico no es una dirección válida.";
      } else if (errorMessage.includes("must be a string or array type with a minimum length of")) {
        errorMessage = "La contraseña debe tener al menos 8 caracteres.";
      } else if (errorMessage.includes("One or more validation errors occurred.")) {
        errorMessage = "Por favor, verifica los datos ingresados.";
      } else if (errorMessage.includes("Invalid credentials") || errorMessage.includes("Unauthorized")) {
        errorMessage = "Correo o contraseña incorrectos.";
      }

      setError(errorMessage);
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
      const errorData = err?.response?.data;
      let errorMessage = "No se pudo completar el registro";

      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData?.errors) {
        const validationErrors = Object.values(errorData.errors).flat();
        errorMessage = validationErrors.length > 0 ? validationErrors[0] : errorData.title;
      } else if (errorData?.title) {
        errorMessage = errorData.title;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      const lowerMsg = errorMessage.toLowerCase();

      if (lowerMsg.includes("email") && (lowerMsg.includes("not a valid") || lowerMsg.includes("invalid"))) {
        errorMessage = "El campo de correo electrónico no es una dirección válida.";
      } else if (lowerMsg.includes("email") || lowerMsg.includes("correo")) {
        errorMessage = "Este correo electrónico ya está registrado.";
      } else if (lowerMsg.includes("username") || lowerMsg.includes("usuario")) {
        errorMessage = "Este nombre de usuario ya está en uso.";
      } else if (lowerMsg.includes("must be a string or array type with a minimum length of")) {
        errorMessage = "La contraseña debe tener al menos 8 caracteres.";
      } else if (lowerMsg.includes("one or more validation errors occurred")) {
        errorMessage = "Por favor, verifica los datos ingresados.";
      }

      setError(errorMessage);
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
