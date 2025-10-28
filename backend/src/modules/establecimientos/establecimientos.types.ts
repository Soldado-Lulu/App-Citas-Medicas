// 📁 src/modules/establecimientos/establecimientos.types.ts
export type Establecimiento = {
idestablecimiento: number;
idempresa: number | null;
est_nombre: string;
est_codigo_snis: number | null;
idsucursal: number | null;
est_sigla: string | null;
};


export type ListParams = {
q?: string; // búsqueda por nombre o sigla
idempresa?: number;
idsucursal?: number;
page?: number; // 1-based
limit?: number; // filas por página
orderBy?: 'est_nombre' | 'idestablecimiento' | 'idempresa' | 'idsucursal';
order?: 'ASC' | 'DESC';
};


export type ListResult = { total: number; page: number; limit: number; items: Establecimiento[] };