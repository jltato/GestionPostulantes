export const ESTADOS_POSTULANTE = [
  { value: 0, label: 'Todos' },
  { value: 1, label: 'Pendientes' },
  { value: 2, label: 'En Proceso' },
  { value: 3, label: 'Aptos' },
  { value: 4, label: 'No Aptos' },
  { value: 5, label: 'Con Novedad' },
  { value: 6, label: 'No Avanza' },
  { value: 7, label: 'Reserva' },
  { value: 8, label: 'Desiste' },
  { value: 9, label: 'Baja de Servicio' },
  { value: 10, label: 'Personal Activo' },
] as const;

export type EstadoPostulante = typeof ESTADOS_POSTULANTE[number]['value'];
