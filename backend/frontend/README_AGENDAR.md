# Agendar Citas – Frontend (drop-in)
**Archivos**
- `src/features/agendar/api.ts`
- `src/features/agendar/queries.ts`

**Uso rápido**
```ts
const { data: especialidades } = useEspecialidades(idest);
const { data: medicos } = useMedicos(idest, especialidadSeleccionada);
const { data: fechas } = useFechas({ idest, medicoId, especialidad });
const { data: horas } = useHoras({ idest, fecha, medicoId, consultorioId, especialidad });
const crear = useCrearCita();
```

**Requisitos**
- Cliente HTTP en `@/src/lib/api-client` que exponga `api.get` y `api.post`
- React Query Provider inicializado en tu `_layout.tsx`
