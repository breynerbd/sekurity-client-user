import { useState } from "react";
import { Text } from "react-native";
import Button from "../../../shared/components/Button";
import { Screen } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { colors, spacing, typography } from "../../../shared/constants/theme";
import { useReports } from "../hooks/useReports";
import { useZones } from "../../zones/hooks/useZones";

export default function CreateReportScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { createReport } = useReports();
  const { zones } = useZones(); // para que el usuario elija una zona válida

  const handleCreate = async () => {
    if (!zoneId) {
      setError("Debes seleccionar una zona");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createReport({
        title,
        description,
        incident_type: incidentType,
        zone_id: Number(zoneId),
      });
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
      <Input label="Tipo de incidente" value={incidentType} onChangeText={setIncidentType} />
      <Input
        label={`ID de zona (disponibles: ${zones.map((z) => z.id).join(", ")})`}
        keyboardType="numeric"
        value={zoneId}
        onChangeText={setZoneId}
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