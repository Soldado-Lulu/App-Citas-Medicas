// 📁 src/modules/establecimientos/establecimientos.dto.ts
// DTOs de entrada/salida validados con Zod: validamos al borde del sistema (controller)
import { z } from 'zod';


// Reglas: nombre obligatorio, límites razonables, numéricos opcionales
export const EstablecimientoCreateDTO = z.object({
idempresa: z.number().int().nonnegative().nullable().optional(),
est_nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
est_codigo_snis: z.number().int().nonnegative().nullable().optional(),
idsucursal: z.number().int().nonnegative().nullable().optional(),
est_sigla: z.string().min(1).max(20).nullable().optional(),
}).strict();


export const EstablecimientoUpdateDTO = EstablecimientoCreateDTO.partial().extend({
// Permitimos actualizar cualquier campo, pero al menos uno debe llegar
}).refine((data) => Object.keys(data).length > 0, { message: 'No hay campos para actualizar' });


export type EstablecimientoCreateInput = z.infer<typeof EstablecimientoCreateDTO>;
export type EstablecimientoUpdateInput = z.infer<typeof EstablecimientoUpdateDTO>;