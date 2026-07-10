import { useState } from "react";
import { Text } from "react-native";
import Button from "../../../shared/components/Button";
import { Screen } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { colors, spacing, typography } from "../../../shared/constants/theme";
import { useAuth } from "../hooks/useAuth";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { forgotPassword, loading, error } = useAuth();

  const handleSend = async () => {
    const ok = await forgotPassword(email);
    if (ok) setSent(true);
  };

  return (
    <Screen style={{ justifyContent: "center" }}>
      <Text style={[typography.title, { marginBottom: spacing.lg }]}>
        Recuperar contraseña
      </Text>

      {sent ? (
        <Text style={typography.body}>
          Si el correo existe en nuestro sistema, recibirás instrucciones para
          restablecer tu contraseña.
        </Text>
      ) : (
        <>
          <Input
            label="Correo electrónico"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {error ? (
            <Text style={[typography.caption, { color: colors.danger, marginBottom: spacing.md }]}>
              {error}
            </Text>
          ) : null}
          <Button title="Enviar instrucciones" onPress={handleSend} loading={loading} />
        </>
      )}

      <Button
        title="Volver a iniciar sesión"
        variant="outline"
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: spacing.md }}
      />
    </Screen>
  );
}
