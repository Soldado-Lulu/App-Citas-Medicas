import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ScrollView, Alert } from "react-native";
import {
  getEspecialidades, crearEspecialidad,
  crearMedico, getMedicosAdmin, Especialidad
} from "../../../src/services/admin.service";

export default function GestionMedicosEspecialidades() {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [medicos, setMedicos] = useState<Array<{id:number;nombre:string;especialidad:string;duracion_min:number}>>([]);
  const [espNombre, setEspNombre] = useState("");
  const [medNombre, setMedNombre] = useState("");
  const [medEsp, setMedEsp] = useState("");
  const [medDur, setMedDur] = useState("20");

  async function cargarTodo() {
    const [esp, meds] = await Promise.all([getEspecialidades(), getMedicosAdmin()]);
    setEspecialidades(esp);
    setMedicos(meds);
  }

  useEffect(() => { cargarTodo(); }, []);

  async function addEspecialidad() {
    try {
      await crearEspecialidad(espNombre.trim());
      setEspNombre("");
      await cargarTodo();
      Alert.alert("Ok", "Especialidad creada.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo crear especialidad");
    }
  }

  async function addMedico() {
    try {
      await crearMedico({ nombre: medNombre.trim(), especialidad: medEsp.trim(), duracion_min: Number(medDur) || 20 });
      setMedNombre(""); setMedEsp(""); setMedDur("20");
      await cargarTodo();
      Alert.alert("Ok", "Médico creado.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo crear médico");
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Gestión de Médicos y Especialidades</Text>

      {/* Crear especialidad */}
      <View style={{ borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 }}>
        <Text style={{ fontWeight: "700" }}>Nueva especialidad</Text>
        <TextInput
          placeholder="Nombre de la especialidad"
          value={espNombre}
          onChangeText={setEspNombre}
          style={{ borderWidth: 1, borderRadius: 8, padding: 8 }}
        />
        <Button title="Agregar especialidad" onPress={addEspecialidad} disabled={!espNombre.trim()} />
      </View>

      {/* Crear médico */}
      <View style={{ borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 }}>
        <Text style={{ fontWeight: "700" }}>Nuevo médico</Text>
        <TextInput
          placeholder="Nombre del médico"
          value={medNombre}
          onChangeText={setMedNombre}
          style={{ borderWidth: 1, borderRadius: 8, padding: 8 }}
        />
        <TextInput
          placeholder="Especialidad (texto)"
          value={medEsp}
          onChangeText={setMedEsp}
          style={{ borderWidth: 1, borderRadius: 8, padding: 8 }}
        />
        <TextInput
          placeholder="Duración de turno (min)"
          keyboardType="numeric"
          value={medDur}
          onChangeText={setMedDur}
          style={{ borderWidth: 1, borderRadius: 8, padding: 8 }}
        />
        <Button title="Agregar médico" onPress={addMedico} disabled={!medNombre.trim() || !medEsp.trim()} />
      </View>

      {/* Listados */}
      <View style={{ borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 }}>
        <Text style={{ fontWeight: "700" }}>Especialidades</Text>
        {especialidades.length === 0 && <Text>No hay especialidades.</Text>}
        {especialidades.map(e => (<Text key={e.id}>• {e.nombre}</Text>))}
      </View>

      <View style={{ borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 }}>
        <Text style={{ fontWeight: "700" }}>Médicos</Text>
        {medicos.length === 0 && <Text>No hay médicos.</Text>}
        {medicos.map(m => (
          <Text key={m.id}>• {m.nombre} — {m.especialidad} ({m.duracion_min} min)</Text>
        ))}
      </View>
      
    </ScrollView>
  );
}
