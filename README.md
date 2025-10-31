# Pack: Agendar Cita (Paciente) – UI + Hooks

## Incluye
- Flujo `app/(protected)/agendar/index.tsx`: Especialidad → Médico → Fecha → Hora → Confirmar.
- `app/(protected)/citas/index.tsx`: listado de citas confirmadas.
- `src/features/fichas/*`: API + hooks con React Query.
- `src/ui/*`: UI base (Button, Page, EmptyState).
- `src/lib/api-client.ts`: cliente HTTP único.

## Endpoints esperados (ajusta a tu backend real)
- `GET /agenda/establecimientos/:idest/especialidades`
- `GET /agenda/establecimientos/:idest/especialidades/:idespecialidad/doctores`
- `GET /agenda/establecimientos/:idest/doctores/:idpersonalmedico/slots?fecha=YYYY-MM-DD`
- `POST /agenda/confirmar` `{ idfichaprogramada, idpoblacion, observacion? }`
- `GET /citas/grupo/:idpoblacionTitular`

### Recomendaciones backend para evitar errores de agendamiento
1. Validar que `idfichaprogramada` está **Libre** (`L`) al confirmar.
2. Usar **transacción** y `UPDATE ... WHERE idfichaprogramada = :id AND fip_estado='L'`.
3. Si `rowsAffected = 0`, responder **409 Conflict** (ya tomado).
4. Verificar que `idpoblacion` pertenece al **grupo del titular** autenticado.
5. Restringir por `idestablecimiento` del usuario; loguear intentos inválidos.
6. Normalizar fechas a **America/La_Paz**.

## Integración rápida
1. Copia las carpetas en tu proyecto.
2. Ajusta alias `@/src` y los endpoints reales en `src/features/fichas/api.ts`.
3. Conecta `AuthContext` para proveer `user.idestablecimiento`, `user.idpoblacion` y/o `idpoblacion_titular`.
4. Añade rutas `/agendar` y `/citas` en tu stack protegido.
