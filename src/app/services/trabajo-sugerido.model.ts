export interface TrabajoSugerido {
  id: number;
  creatorId: number;
  titulo: string;
  descripcion: string;
  empresa: string;
  ubicacion: string;
  tipo: string;
  sueldo: number;
  fechaPublicacion: string;
  estado: string;
  puntajeAfinidad: number;

  fechaLimitePostulacion?: string;
  nivelExperiencia?: string;
  categoria?: string;
  departamento?: string;
  vacantes?: number;
  remoto?: boolean;
  duracionContrato?: string;
  requisitos?: string;
  habilidadesRequeridas?: string;
  beneficios?: string;
  idiomas?: string;
  companyWebsite?: string;
  logoUrl?: string;
  etiquetas?: string;
}
