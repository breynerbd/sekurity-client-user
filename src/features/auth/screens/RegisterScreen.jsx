import { useState } from "react";
import { ScrollView, Text } from "react-native";
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
      Role: "USER",   // ← agregado
    });
    if (ok) navigation.navigate("Login");
};

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: spacing.md,
        backgroundColor: colors.background,
      }}
    >
      <Text style={[typography.title, { marginBottom: spacing.lg }]}>Crear cuenta</Text>

      <Input label="Nombre" value={name} onChangeText={setName} />
      <Input label="Apellido" value={surname} onChangeText={setSurname} />
      <Input label="Usuario" autoCapitalize="none" value={username} onChangeText={setUsername} />
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
          {typeof error === "string" ? error : JSON.stringify(error)}
        </Text>
      ) : null}

      <Button title="Registrarme" onPress={handleRegister} loading={loading} />
      <Button
        title="Ya tengo una cuenta"
        variant="outline"
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: spacing.sm }}
      />
    </ScrollView>
  );
}
