// src/app/models/perfil-empresa.model.ts
export interface PerfilEmpresa {
  id: number;
  nombreFantasia: string;
  logoUrl?: string;
  descripcion?: string;
  industria?: string;
  ubicacion?: string;
  // <-- si necesites otros campos, agrégalos aquí
}
