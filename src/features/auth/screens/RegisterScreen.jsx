import { useState } from "react";
// Importamos Image junto a los demás componentes nativos 🌟
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import Button from "../../../shared/components/Button";
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

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Zona del Encabezado con el Logo Corporativo */}
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
        <View style={styles.inputWrapper}>
          <Text style={typography.formLabel}>Nombre</Text>
          <Input placeholder="Tu nombre" value={name} onChangeText={setName} />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={typography.formLabel}>Apellido</Text>
          <Input placeholder="Tu apellido" value={surname} onChangeText={setSurname} />
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
        </View>

        {error ? (
          <Text style={styles.errorText}>
            {typeof error === "string" ? error : JSON.stringify(error)}
          </Text>
        ) : null}

        <View style={{ marginTop: spacing.md }}>
          <Button 
            title={loading ? "Registrando..." : "Registrarme"} 
            onPress={handleRegister} 
            loading={loading}
            style={styles.mainButton}
          />
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    backgroundColor: "#FFFFFF",
  },
  headerZone: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    width: 90,        // Mismo tamaño que configuramos para el Login
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
    textAlign: "center"
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
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  }
});