import { useState } from "react";
import { Image, Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
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
    <Screen style={styles.container}>
      <View style={styles.headerZone}>
        <Image
          source={require('../../../../assets/sekurity_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>Sekurity</Text>
        <Text style={styles.subtitleText}>Recuperación de acceso</Text>
      </View>

      <View style={styles.formContainer}>
        {sent ? (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>¡Correo enviado!</Text>
            <Text style={styles.successText}>
              Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.inputWrapper}>
              <Text style={typography.formLabel}>Correo electrónico</Text>
              <Input
                placeholder="correo@ejemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>
                {error}
              </Text>
            ) : null}

            <View style={{ marginTop: spacing.md }}>
              <TouchableOpacity
                style={[styles.mainButton, loading && styles.buttonDisabled]}
                onPress={handleSend}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.mainButtonText}>Enviar instrucciones</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.footerZone}>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Volver a iniciar sesión</Text>
          </TouchableOpacity>
        </View>
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
    width: 90,
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
  errorText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.danger || "#EF4444",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  mainButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  successContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.brandDark || "#08316d",
    marginBottom: spacing.xs,
  },
  successText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  footerZone: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
});