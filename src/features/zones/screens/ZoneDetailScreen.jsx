import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import Button from "../../../shared/components/Button";
import { EmptyState, ErrorState, LoadingState, Screen } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { spacing, typography } from "../../../shared/constants/theme";
import { useRatings } from "../../ratings/hooks/useRatings";
import { useZoneDetail } from "../hooks/useZones";

export default function ZoneDetailScreen({ route }) {
  const { zoneId } = route.params;
  const { zone, loading, error } = useZoneDetail(zoneId);
  const { ratings, submitRating, submitting } = useRatings(zoneId);
  const [score, setScore] = useState("5");
  const [comment, setComment] = useState("");

  if (loading) return <LoadingState label="Cargando zona..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <Screen>
      <Text style={typography.title}>{zone?.name}</Text>
      <Text style={[typography.caption, { marginBottom: spacing.lg }]}>{zone?.address}</Text>

      <Text style={[typography.subtitle, { marginBottom: spacing.sm }]}>Calificaciones</Text>
      <FlatList
        data={ratings}
        keyExtractor={(item) => String(item.id)}
        style={{ maxHeight: 220, marginBottom: spacing.md }}
        ListEmptyComponent={
          <EmptyState title="Sin calificaciones" description="Sé el primero en calificar esta zona" />
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: spacing.sm }}>
            <Text style={typography.body}>⭐ {item.score} — {item.comment}</Text>
          </View>
        )}
      />

      <Input label="Puntuación (1-5)" keyboardType="numeric" value={score} onChangeText={setScore} />
      <Input label="Comentario" value={comment} onChangeText={setComment} />
      <Button
        title="Calificar zona"
        loading={submitting}
        onPress={() => submitRating(Number(score), comment)}
      />
    </Screen>
  );
}
