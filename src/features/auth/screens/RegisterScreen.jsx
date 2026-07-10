import { useState } from "react";
import { Text } from "react-native";
import Button from "../../../shared/components/Button";
import { Screen } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { colors, spacing, typography } from "../../../shared/constants/theme";
import { useAuth } from "../hooks/useAuth";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading, error } = useAuth();

  const handleRegister = async () => {
    const ok = await register({ fullName, email, password });
    if (ok) navigation.navigate("Login");
  };

  return (
    <Screen style={{ justifyContent: "center" }}>
      <Text style={[typography.title, { marginBottom: spacing.lg }]}>Crear cuenta</Text>

      <Input label="Nombre completo" value={fullName} onChangeText={setFullName} />
      <Input
        label="Correo electrónico"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? (
        <Text style={[typography.caption, { color: colors.danger, marginBottom: spacing.md }]}>
          {error}
        </Text>
      ) : null}

      <Button title="Registrarme" onPress={handleRegister} loading={loading} />
      <Button
        title="Ya tengo una cuenta"
        variant="outline"
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}
