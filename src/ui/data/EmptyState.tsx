import { View, Text } from "react-native";
import { Button } from "@/src/ui/primitives/Button";
export function EmptyState({ title="Sin resultados", subtitle="Intenta ajustar filtros o recargar.", onRetry }:{ title?: string; subtitle?: string; onRetry?: () => void; }) {
  return (<View style={{ padding: 24, alignItems: "center" }}>
    <Text style={{ fontSize: 18, fontWeight: "700" }}>{title}</Text>
    <Text style={{ color: "#6b7280", marginTop: 6, textAlign: "center" }}>{subtitle}</Text>
    {onRetry ? <Button label="Reintentar" onPress={onRetry} style={{ marginTop: 12 }} /> : null}
  </View>);
}
