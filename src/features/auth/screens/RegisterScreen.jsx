import { useState } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import Input from "../../../shared/components/Input";
import { colors, spacing, typography } from "../../../shared/constants/theme";
import { useAuth } from "../hooks/useAuth";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading, error } = useAuth();

  const handleRegister = async () => {
    const ok = await register({
      Name: name,
      Surname: surname,
      Username: username,
      Email: email,
      Password: password,
      Role: "USER",
    });
    if (ok) navigation.navigate("Login");
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: "", color: "#E5E7EB" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&.*]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: "Débil", color: "#EF4444" };
    if (score <= 4) return { level: 2, label: "Media", color: "#F59E0B" };
    return { level: 3, label: "Fuerte", color: "#10B981" };
  };

  const strength = getPasswordStrength();

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerZone}>
        <Image
          source={require('../../../../assets/sekurity_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>Crear cuenta</Text>
        <Text style={styles.subtitleText}>Regístrate para empezar a usar Sekurity</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.rowContainer}>
          <View style={[styles.inputWrapper, styles.halfInput]}>
            <Text style={typography.formLabel}>Nombre</Text>
            <Input placeholder="Tu nombre" value={name} onChangeText={setName} />
          </View>

          <View style={[styles.inputWrapper, styles.halfInput]}>
            <Text style={typography.formLabel}>Apellido</Text>
            <Input placeholder="Tu apellido" value={surname} onChangeText={setSurname} />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={typography.formLabel}>Usuario</Text>
          <Input placeholder="nombreusuario" autoCapitalize="none" value={username} onChangeText={setUsername} />
        </View>

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

        <View style={styles.inputWrapper}>
          <Text style={typography.formLabel}>Contraseña</Text>
          <Input
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBarsRow}>
                <View style={[styles.strengthBar, { backgroundColor: strength.level >= 1 ? strength.color : "#E5E7EB" }]} />
                <View style={[styles.strengthBar, { backgroundColor: strength.level >= 2 ? strength.color : "#E5E7EB" }]} />
                <View style={[styles.strengthBar, { backgroundColor: strength.level >= 3 ? strength.color : "#E5E7EB" }]} />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                Seguridad: {strength.label}
              </Text>
            </View>
          )}
        </View>

        {error ? (
          <Text style={styles.errorText}>
            {typeof error === "string" ? error : JSON.stringify(error)}
          </Text>
        ) : null}

        <View style={{ marginTop: spacing.xs }}>
          <TouchableOpacity
            style={[styles.mainButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.mainButtonText}>Registrarme</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footerZone}>
        <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "#FFFFFF",
  },
  headerZone: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  logo: {
    width: 65,
    height: 65,
    marginBottom: 2,
  },
  brandText: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.brandDark || "#08316d",
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center"
  },
  formContainer: {
    width: "100%",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  inputWrapper: {
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.danger || "#EF4444",
    marginTop: 2,
    marginBottom: 2,
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
  footerZone: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: 13,
    color: "#6B7280",
  },
  loginLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  strengthContainer: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  strengthBarsRow: {
    flexDirection: "row",
    gap: 4,
    width: 170,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});