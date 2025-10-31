// src/hooks/useAgendaEspecialidad.ts
import { useEffect, useState } from 'react';
import { listarEspecialidades, disponibilidadPorDia, slotsLibres, reservarFicha } from '../services/especialidades.service';

export function useEspecialidades(idest: number) {
  const [buscar, setBuscar] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!idest) return;
    setLoading(true); setError(null);
    try {
      const raw = await listarEspecialidades(idest, buscar);
      const filtered = raw.filter((e) => {
        const n = (e.nombre || '').toUpperCase();
        return n.startsWith('MEDICINA FAMILIAR') || n.startsWith('MEDICINA GENERAL');
      });
      setData(filtered);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [idest, buscar]);
  return { data, loading, error, buscar, setBuscar, reload: load };
}

export function useDisponibilidad(idcuaderno: number, idest: number, desde: string, hasta?: string) {
  const [data, setData] = useState<{ fecha: string; libres: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!idcuaderno || !idest || !desde) return;
    setLoading(true); setError(null);
    try {
      setData(await disponibilidadPorDia(idcuaderno, idest, desde, hasta));
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [idcuaderno, idest, desde, hasta]);
  return { data, loading, error, reload: load };
}

export function useSlots(idcuaderno: number, idest: number, fecha: string) {
  const [slots, setSlots] = useState<{ idfichaprogramada: number; hora_inicio: string; hora_fin: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!idcuaderno || !idest || !fecha) return;
    setLoading(true); setError(null);
    try {
      setSlots(await slotsLibres(idcuaderno, idest, fecha));
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [idcuaderno, idest, fecha]);
  return { slots, loading, error, reload: load };
}

export async function reservar(idcuaderno: number, idfichaprogramada: number) {
  return reservarFicha(idcuaderno, idfichaprogramada);
}
