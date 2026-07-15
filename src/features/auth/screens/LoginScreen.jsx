import { useState } from "react";
import { Image, Text, View, StyleSheet, TouchableOpacity } from "react-native";
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
  };

  return (
    <Screen style={styles.container}>
      {/* Zona del Logotipo Corporativo */}
      <View style={styles.headerZone}>
        {/* Cargamos tu logo desde la carpeta assets */}
        <Image
          source={require('../../../../assets/sekurity_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>Sekurity</Text>
        <Text style={styles.subtitleText}>Inicia sesión para continuar</Text>
      </View>

      {/* Bloque de Formulario */}
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <Text style={typography.formLabel}>Email o Usuario</Text>
          <Input
            placeholder="correo@ejemplo.com o usuario"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputWrapper}>
          {/* Esta es la fila corregida para separar los textos en los extremos 🌟 */}
          <View style={styles.passwordLabelRow}>
            <Text style={typography.formLabel}>Contraseña</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
          <Input
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <View style={{ marginTop: spacing.md }}>
          <Button
            title={loading ? "Cargando..." : "Iniciar Sesión"}
            onPress={handleLogin}
            loading={loading}
          />
        </View>
      </View>

      {/* Footer / Alternativa de cuenta */}
      <View style={styles.footerZone}>
        <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    backgroundColor: "#FFFFFF",
  },
  headerZone: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    width: 90,        // Ajusta el tamaño de tu logo aquí si lo requieres
    height: 90,
    marginBottom: spacing.xs,
  },
  brandText: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.brandDark || "#08316d",
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: spacing.xs,
  },
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between", // El truco que los empuja a los extremos opuestos 🚀
    alignItems: "center",
    width: "100%",
  },
  forgotPasswordText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    textTransform: "uppercase",
    letterSpacing: -0.2,
    marginBottom: 8, // Sincronizado con el margen inferior de typography.formLabel
  },
  errorText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.danger || "#EF4444",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  footerZone: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  }
});