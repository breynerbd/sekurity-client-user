import { useState } from "react";
import { Image, Text, View } from "react-native";
import Button from "../../../shared/components/Button";
import { Screen } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { colors, spacing, typography } from "../../../shared/constants/theme";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    await login(email, password);
    // La navegación raíz (AppNavigator) reacciona automáticamente al token en el store
  };

  return (
    <Screen style={{ justifyContent: "center" }}>
      <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
        <Text style={[typography.title, { fontSize: 28 }]}>Sekurity</Text>
        <Text style={typography.caption}>Inicia sesión para continuar</Text>
      </View>

      <Input
        label="Correo electrónico"
        placeholder="tucorreo@sekurity.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? (
        <Text style={[typography.caption, { color: colors.danger, marginBottom: spacing.md }]}>
          {error}
        </Text>
      ) : null}

      <Button title="Iniciar sesión" onPress={handleLogin} loading={loading} />

      <Button
        title="¿Olvidaste tu contraseña?"
        variant="outline"
        onPress={() => navigation.navigate("ForgotPassword")}
        style={{ marginTop: spacing.md }}
      />
      <Button
        title="Crear una cuenta"
        variant="outline"
        onPress={() => navigation.navigate("Register")}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}
