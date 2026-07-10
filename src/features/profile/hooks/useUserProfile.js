import { useCallback, useEffect, useState } from "react";
import { authClient } from "../../../shared/api/authClient";
import { userClient } from "../../../shared/api/userClient";
import { useAuthStore } from "../../../shared/store/authStore";

export function useUserProfile() {
  const storedUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fuente confiable de "quién soy": GET /api/v1/auth/me del auth-service (confirmado en AuthController.cs)
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authClient.getMe();
      updateUser(data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (payload) => {
    setLoading(true);
    try {
      const data = await userClient.updateProfile(payload);
      // Fusionamos: no perdemos username/email que vienen del auth-service
      updateUser({ ...storedUser, nombre: data.nombre, apellido: data.apellido, telefono: data.telefono });
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el perfil");
      return false;
    } finally {
      setLoading(false);
    }
};

  return { user: storedUser, loading, error, saveProfile, refetch: fetchProfile };
}
