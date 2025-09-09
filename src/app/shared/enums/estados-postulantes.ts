export const ESTADOS_POSTULANTE = [
  { value: 0, label: 'Todos' },
  { value: 1, label: 'Pendientes' },
  { value: 2, label: 'En Proceso' },
  { value: 3, label: 'Aptos' },
  { value: 4, label: 'No Aptos' },
  { value: 5, label: 'En Reserva' },
  { value: 6, label: 'No Avanza' },
] as const;

export type EstadoPostulante = typeof ESTADOS_POSTULANTE[number]['value'];
