import { useState, useEffect } from "react";
import { Text } from "react-native";
import Button from "../../../shared/components/Button";
import { LoadingState, Screen } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { colors, spacing, typography } from "../../../shared/constants/theme";
import { useAuthStore } from "../../../shared/store/authStore";
import { useUserProfile } from "../hooks/useUserProfile";

export default function ProfileScreen() {
  const { user, loading, error, saveProfile } = useUserProfile();
  const logout = useAuthStore((s) => s.logout);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  // Sincroniza los inputs cuando llega el usuario desde /auth/me
 useEffect(() => {
    if (user) {
      setName(user.nombre || "");
      setSurname(user.apellido || "");
    }
}, [user]);

  if (loading && !user) return <LoadingState label="Cargando perfil..." />;

  return (
    <Screen>
      <Text style={[typography.title, { marginBottom: spacing.lg }]}>Mi perfil</Text>

      <Input label="Usuario" value={user?.username} editable={false} />
      <Input label="Correo" value={user?.email} editable={false} />
      <Input label="Nombre" value={name} onChangeText={setName} />
      <Input label="Apellido" value={surname} onChangeText={setSurname} />

      {error ? (
        <Text style={[typography.caption, { color: colors.danger, marginBottom: spacing.md }]}>
          {error}
        </Text>
      ) : null}

     <Button
  title="Guardar cambios"
  onPress={() => saveProfile({ nombre: name, apellido: surname })}
  loading={loading}
/>
      <Button
        title="Cerrar sesión"
        variant="danger"
        onPress={logout}
        style={{ marginTop: spacing.md }}
      />
    </Screen>
  );
}
