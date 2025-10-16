// Helpers de fecha para formatear (si los necesitas en más lugares).
import dayjs from "dayjs";
export const fmt = (iso: string, f = "DD/MM/YYYY HH:mm") => dayjs(iso).format(f);
