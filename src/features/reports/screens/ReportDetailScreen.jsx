import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import Button from "../../../shared/components/Button";
import { EmptyState, ErrorState, LoadingState, Screen } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { spacing, typography } from "../../../shared/constants/theme";
import { useComments } from "../../comments/hooks/useComments";
import { useReportDetail } from "../hooks/useReports";

export default function ReportDetailScreen({ route }) {
  const { reportId } = route.params;
  const { report, loading, error } = useReportDetail(reportId);
  const { comments, addComment, posting } = useComments(reportId);
  const [text, setText] = useState("");

  if (loading) return <LoadingState label="Cargando reporte..." />;
  if (error) return <ErrorState message={error} />;

  const handleSend = async () => {
    const ok = await addComment(text);
    if (ok) setText("");
  };

  return (
    <Screen>
      <Text style={typography.title}>{report?.title}</Text>
      <Text style={[typography.body, { marginBottom: spacing.lg }]}>{report?.description}</Text>

      <Text style={[typography.subtitle, { marginBottom: spacing.sm }]}>Comentarios</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => String(item.id)}
        style={{ maxHeight: 220, marginBottom: spacing.md }}
        ListEmptyComponent={<EmptyState title="Sin comentarios" />}
        renderItem={({ item }) => (
          <View style={{ marginBottom: spacing.sm }}>
            <Text style={typography.body}>{item.content}</Text>
          </View>
        )}
      />

      <Input label="Agregar comentario" value={text} onChangeText={setText} />
      <Button title="Comentar" onPress={handleSend} loading={posting} />
    </Screen>
  );
}
