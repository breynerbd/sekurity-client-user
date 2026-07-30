import { useCallback, useEffect, useState } from "react";
import { authClient } from "../../../shared/api/authClient";
import { userClient } from "../../../shared/api/userClient";
import { useAuthStore } from "../../../shared/store/authStore";

export function useUserProfile() {
  const storedUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [myReports, setMyReports] = useState([]);
  const [myComments, setMyComments] = useState([]);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, reportsData, commentsData] = await Promise.all([
        authClient.getMe(),
        userClient.getMyReports().catch(() => []),
        userClient.getMyComments().catch(() => [])
      ]);

      updateUser(profileData);
      setMyReports(reportsData);
      setMyComments(commentsData);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar la información del perfil");
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const saveProfile = async (payload) => {
    setLoading(true);
    try {
      const data = await userClient.updateProfile(payload);
      updateUser({ ...storedUser, name: data.name, surname: data.surname, phone: data.phone });
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el perfil");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user: storedUser,
    myReports,
    myComments,
    loading,
    error,
    saveProfile,
    refetch: fetchProfileData,
  };
}