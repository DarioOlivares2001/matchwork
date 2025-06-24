// src/app/dashboard-empresa/detalle-oferta/detalle-oferta.component.ts

import { Component, OnInit }                  from '@angular/core';
import { CommonModule }                       from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule }                        from '@angular/forms';

import { JobService, Job, JobRequest }        from '../../services/job.service';
import { PostulacionService, PostulanteConPerfil } from '../../services/postulacion.service';
import { AuthService }                        from '../../services/auth.service';

@Component({
  selector: 'app-detalle-oferta',
  standalone: true,
  imports: [ CommonModule, RouterModule, FormsModule ],
  templateUrl: './detalle-oferta.component.html',
  styleUrls: ['./detalle-oferta.component.css']
})
export class DetalleOfertaComponent implements OnInit {
  trabajoId!: number;
  oferta: Job | null = null;
  cargandoOferta = false;
  errorOferta = '';

  postulantes: PostulanteConPerfil[] = [];
  cargandoPostulantes = false;
  errorPostulantes = '';

  // Para modo edición
  isEditing = false;
  editPayload: JobRequest = {
    titulo: '',
    descripcion: '',
    empresa: '',
    ubicacion: '',
    tipo: 'Full_Time',
    sueldo: 0,

    fechaLimitePostulacion: undefined,
    nivelExperiencia: undefined,
    categoria: undefined,
    departamento: undefined,
    vacantes: undefined,
    remoto: false,
    duracionContrato: undefined,
    requisitos: undefined,
    habilidadesRequeridas: undefined,
    beneficios: undefined,
    idiomas: undefined,
    companyWebsite: undefined,
    logoUrl: undefined,
    etiquetas: undefined
  };
  loadingGuardar = false;
  errorGuardar = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private postulacionService: PostulacionService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
   
    this.trabajoId = Number(this.route.snapshot.paramMap.get('id'));


    this.cargarDetalleOferta();
    this.cargarPostulantes();
  }

  private cargarDetalleOferta() {
    this.cargandoOferta = true;
    this.errorOferta = '';

    this.jobService.getJobById(this.trabajoId).subscribe({
      next: jobData => {
        this.oferta = jobData;
        this.cargandoOferta = false;

        
        this.editPayload = {
          titulo: jobData.titulo,
          descripcion: jobData.descripcion,
          empresa: jobData.empresa,
          ubicacion: jobData.ubicacion,
          tipo: jobData.tipo,
          sueldo: jobData.sueldo,
          fechaLimitePostulacion: (jobData as any).fechaLimitePostulacion,
          nivelExperiencia: (jobData as any).nivelExperiencia,
          categoria: (jobData as any).categoria,
          departamento: (jobData as any).departamento,
          vacantes: (jobData as any).vacantes,
          remoto: (jobData as any).remoto ?? false,
          duracionContrato: (jobData as any).duracionContrato,
          requisitos: (jobData as any).requisitos,
          habilidadesRequeridas: (jobData as any).habilidadesRequeridas,
          beneficios: (jobData as any).beneficios,
          idiomas: (jobData as any).idiomas,
          companyWebsite: (jobData as any).companyWebsite,
          logoUrl: (jobData as any).logoUrl,
          etiquetas: (jobData as any).etiquetas
        };
      },
      error: err => {
        console.error('Error al cargar detalle de oferta:', err);
        this.errorOferta = 'No se pudo cargar la oferta. Intenta más tarde.';
        this.cargandoOferta = false;
      }
    });
  }

  private cargarPostulantes() {
    this.cargandoPostulantes = true;
    this.errorPostulantes = '';

    this.postulacionService.getPostulantesPorTrabajo(this.trabajoId).subscribe({
      next: lista => {
        this.postulantes = lista;
        this.cargandoPostulantes = false;
      },
      error: err => {
        console.error('Error al cargar postulantes:', err);
        this.errorPostulantes = 'No se pudieron cargar los postulantes.';
        this.cargandoPostulantes = false;
      }
    });
  }

  
  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.oferta) {
      this.editPayload = {
        titulo: this.oferta.titulo,
        descripcion: this.oferta.descripcion,
        empresa: this.oferta.empresa,
        ubicacion: this.oferta.ubicacion,
        tipo: this.oferta.tipo,
        sueldo: this.oferta.sueldo,
        fechaLimitePostulacion: (this.oferta as any).fechaLimitePostulacion,
        nivelExperiencia: (this.oferta as any).nivelExperiencia,
        categoria: (this.oferta as any).categoria,
        departamento: (this.oferta as any).departamento,
        vacantes: (this.oferta as any).vacantes,
        remoto: (this.oferta as any).remoto ?? false,
        duracionContrato: (this.oferta as any).duracionContrato,
        requisitos: (this.oferta as any).requisitos,
        habilidadesRequeridas: (this.oferta as any).habilidadesRequeridas,
        beneficios: (this.oferta as any).beneficios,
        idiomas: (this.oferta as any).idiomas,
        companyWebsite: (this.oferta as any).companyWebsite,
        logoUrl: (this.oferta as any).logoUrl,
        etiquetas: (this.oferta as any).etiquetas
      };
    }
  }

  guardarCambios() {
    if (!this.oferta) return;
    this.loadingGuardar = true;
    this.errorGuardar = '';

    this.jobService.updateJob(this.oferta.id, this.editPayload).subscribe({
      next: updated => {
        this.oferta = updated;
        this.isEditing = false;
        this.loadingGuardar = false;
      },
      error: err => {
        console.error('Error al guardar oferta:', err);
        this.errorGuardar = 'No se pudieron guardar los cambios.';
        this.loadingGuardar = false;
      }
    });
  }

  volverAMisOfertas() {
    this.router.navigate(['/dashboard-empresa/ver-mis-ofertas']);
  }

  verPerfilPostulante(usuarioId: number) {
     this.router.navigate(['/dashboard-empresa/ver-postulante', usuarioId]);
  }
}
