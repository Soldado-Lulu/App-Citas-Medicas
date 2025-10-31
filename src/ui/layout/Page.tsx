import { View } from "react-native";
import { ReactNode } from "react";
export function Page({ children }: { children: ReactNode }) {
  return (<View style={{ flex: 1, backgroundColor: "#f8fafc" }}><View style={{ padding: 16 }}>{children}</View></View>);
}
