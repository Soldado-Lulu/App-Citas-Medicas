import { Pressable, Text, ActivityIndicator, ViewStyle } from "react-native";
type Props = { label: string; onPress?: () => void; loading?: boolean; disabled?: boolean; variant?: "primary" | "secondary" | "ghost"; style?: ViewStyle; };
export function Button({ label, onPress, loading, disabled, variant="primary", style }: Props) {
  const bg = variant === "primary" ? "#2563eb" : variant === "secondary" ? "#111827" : "transparent";
  const color = variant === "ghost" ? "#111827" : "#ffffff";
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => ({
      paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: bg,
      borderWidth: variant === "ghost" ? 1 : 0, borderColor: "#e5e7eb", opacity: pressed || disabled || loading ? 0.7 : 1, ...style,
    })} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}>
      {loading ? <ActivityIndicator /> : <Text style={{ color, fontWeight: "700" }}>{label}</Text>}
    </Pressable>
  );
}
