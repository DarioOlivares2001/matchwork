// src/app/services/trabajo-sugerido.model.ts
export interface TrabajoSugerido {
  id: number;
  titulo: string;
  descripcion: string;
  empresa: string;
  ubicacion: string;
  tipo: string;
  sueldo: number;
  fechaPublicacion: string;    // puedes convertirla a Date en el componente más adelante
  estado: string;
  puntajeAfinidad: number;
}
