// 📁 src/modules/medicos/medicos.types.ts
export type Medicos = {
idcuaderno: number;
especialidad: number | null;
medico: string;
};

export type ListParams = {
q?: string; // búsqueda por nombre o sigla
idcuaderno?: number;
especialidad?: number;
medico?: number; // 1-based
page?: number; // 1-based
limit?: number; // filas por página
orderBy?: 'idcuarderno' | 'especialidad' | 'medico';
order?: 'ASC' | 'DESC';
};

export type ListResult = { total: number; page: number; limit: number; items: Medicos[] };