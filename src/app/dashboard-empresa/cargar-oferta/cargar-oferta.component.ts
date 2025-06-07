// src/app/dashboard-empresa/cargar-oferta/cargar-oferta.component.ts
import { Component, OnInit }             from '@angular/core';
import { CommonModule }                   from '@angular/common';
import { FormsModule, NgForm }            from '@angular/forms';
import { RouterModule, Router }           from '@angular/router';
import { JobService, JobRequest, Job }    from '../../services/job.service';
import { AuthService }                    from '../../services/auth.service';

@Component({
  selector: 'app-cargar-oferta',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './cargar-oferta.component.html',
  styleUrls: ['./cargar-oferta.component.css'],
})
export class CargarOfertaComponent implements OnInit {
  /** Controla si estamos en modo “crear/editar” o en modo “resumen” */
  isEditing: boolean = true;

  /** Payload que se envía al backend */
  jobPayload: JobRequest = {
    titulo: '',
    descripcion: '',
    empresa: '',
    ubicacion: '',
    tipo: 'Full_Time',
    sueldo: 0,
    fechaLimitePostulacion: '',
    nivelExperiencia: '',
    categoria: '',
    departamento: '',
    vacantes: undefined,
    remoto: false,
    duracionContrato: '',
    requisitos: '',
    habilidadesRequeridas: '',
    beneficios: '',
    idiomas: '',
    companyWebsite: '',
    logoUrl: '',
    etiquetas: ''
  };

  /** Guarda el Job recién creado para mostrar el “hero resumen” */
  createdJob: Job | null = null;

  loading: boolean = false;
  errorMsg: string = '';

  constructor(
    private jobSvc: JobService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si quieres precargar algunos campos (por ejemplo empresa desde perfil),
    // puedes inyectar el AuthService y cargar datos del usuario logueado aquí.
  }

  /**
   * Se dispara cuando el usuario da “submit” al formulario.
   * Valida, llama a createJob() y muestra el hero de resumen.
   */
  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    this.jobSvc.createJob(this.jobPayload).subscribe({
      next: (resp: Job) => {
        this.createdJob = resp;
        this.isEditing = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al crear oferta:', err);
        this.errorMsg = err.error?.message || 'Ocurrió un error al guardar la oferta';
        this.loading = false;
      }
    });
  }

  /**
   * Si el usuario quiere “editar nuevamente” tras ver el resumen,
   * recarga los valores en el formulario para que los modifique.
   */
  editAgain() {
    if (!this.createdJob) return;

    this.jobPayload = {
      titulo: this.createdJob.titulo,
      descripcion: this.createdJob.descripcion,
      empresa: this.createdJob.empresa,
      ubicacion: this.createdJob.ubicacion,
      tipo: this.createdJob.tipo,
      sueldo: this.createdJob.sueldo,
      fechaLimitePostulacion: (this.createdJob as any).fechaLimitePostulacion || '',
      nivelExperiencia: (this.createdJob as any).nivelExperiencia || '',
      categoria: (this.createdJob as any).categoria || '',
      departamento: (this.createdJob as any).departamento || '',
      vacantes: (this.createdJob as any).vacantes || undefined,
      remoto: (this.createdJob as any).remoto || false,
      duracionContrato: (this.createdJob as any).duracionContrato || '',
      requisitos: (this.createdJob as any).requisitos || '',
      habilidadesRequeridas: (this.createdJob as any).habilidadesRequeridas || '',
      beneficios: (this.createdJob as any).beneficios || '',
      idiomas: (this.createdJob as any).idiomas || '',
      companyWebsite: (this.createdJob as any).companyWebsite || '',
      logoUrl: (this.createdJob as any).logoUrl || '',
      etiquetas: (this.createdJob as any).etiquetas || ''
    };

    this.isEditing = true;
  }

  /** Vuelve al dashboard de empresa */
  cancelCreate() {
    this.router.navigate(['/dashboard-empresa']);
  }
}
