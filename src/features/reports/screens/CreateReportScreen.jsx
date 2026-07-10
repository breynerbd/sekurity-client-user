import { useState } from "react";
import { Text } from "react-native";
import Button from "../../../shared/components/Button";
import { Screen } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { colors, spacing, typography } from "../../../shared/constants/theme";
import { useReports } from "../hooks/useReports";

export default function CreateReportScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { createReport } = useReports();

  const handleCreate = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await createReport({ title, description });
      navigation.goBack();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el reporte");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Text style={[typography.title, { marginBottom: spacing.lg }]}>Nuevo reporte</Text>
      <Input label="Título" value={title} onChangeText={setTitle} />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={{ height: 100, textAlignVertical: "top" }}
      />
      {error ? (
        <Text style={[typography.caption, { color: colors.danger, marginBottom: spacing.md }]}>
          {error}
        </Text>
      ) : null}
      <Button title="Enviar reporte" onPress={handleCreate} loading={submitting} />
    </Screen>
  );
}
