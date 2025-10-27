import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fondo celeste</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#426b4aff", // celeste
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 20,
  },
});
