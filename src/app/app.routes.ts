import { Routes } from '@angular/router';
import { HomeComponent }                    from './home/home.component';
import { IngresoProfesionalComponent }      from './auth/ingreso-profesional/ingreso-profesional.component';
import { RegistroProfesionalComponent }     from './auth/registro-profesional/registro-profesional.component';
import { IngresoEmpresaComponent }          from './auth/ingreso-empresa/ingreso-empresa.component';
import { RegistroEmpresaComponent }         from './auth/registro-empresa/registro-empresa.component';
import { AllJobsComponent }                 from './all-jobs/all-jobs.component';
import { JobDetailComponent }               from './job-detail/job-detail.component';
import { DashboardProfesionalComponent }    from './dashboard-profesional/dashboard-profesional.component';
import { AuthGuard }                        from './auth/auth.guard';
import { OtrosTrabajosComponent }           from './dashboard-profesional/otros-trabajos/otros-trabajos.component';
import { PostulacionesComponent }           from './dashboard-profesional/postulaciones/postulaciones.component';
import { DashboardEmpresaComponent }        from './dashboard-empresa/dashboard-empresa.component';
import { CargarOfertaComponent }            from './dashboard-empresa/cargar-oferta/cargar-oferta.component';
import { VerMisOfertasComponent }           from './dashboard-empresa/ver-mis-ofertas/ver-mis-ofertas.component';
import { PerfilEmpresaComponent }           from './dashboard-empresa/perfil-empresa/perfil-empresa.component';
import { DetalleOfertaComponent }           from './dashboard-empresa/detalle-oferta/detalle-oferta.component';
import { VerpostulanteComponent }           from './dashboard-empresa/verpostulante/verpostulante.component';
import { ChatWindowComponent } from './shared/chat/chat-window/chat-window.component';



export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'jobs', component: AllJobsComponent },
  { path: 'jobs/:id', component: JobDetailComponent },
  { path: 'ingreso-profesional', component: IngresoProfesionalComponent },
  { path: 'registro-profesional', component: RegistroProfesionalComponent },
  { path: 'ingreso-empresa', component: IngresoEmpresaComponent },
  { path: 'registro-empresa', component: RegistroEmpresaComponent },

  {
    path: 'dashboard-profesional',       // ← toda la URL aquí
    component: DashboardProfesionalComponent,
    canActivate: [ AuthGuard ],
    children: [
      { path: '',            redirectTo: 'perfil', pathMatch: 'full' },
      {
        path: 'perfil',
        loadComponent: () => import(
          './dashboard-profesional/perfil/perfil.component'
        ).then(m => m.PerfilComponent)
      },
      {
        path: 'match',
        loadComponent: () => import(
          './dashboard-profesional/match/match.component'
        ).then(m => m.MatchComponent)
      },
      { path: 'otros-trabajos', component: OtrosTrabajosComponent },
      { path: 'postulaciones',  component: PostulacionesComponent },
      { path: 'jobs/:id',       component: JobDetailComponent },
      
    ]
  },

  {
    path: 'dashboard-empresa',
    component: DashboardEmpresaComponent,
    canActivate: [ AuthGuard ],
    children: [
      { path: '',             redirectTo: 'cargar-oferta', pathMatch: 'full' },
      { path: 'cargar-oferta', component: CargarOfertaComponent },
      { path: 'ver-mis-ofertas', component: VerMisOfertasComponent },
      { path: 'perfil-empresa', component: PerfilEmpresaComponent },
      { path: 'mis-ofertas/:id', component: DetalleOfertaComponent },
      { path: 'ver-postulante/:usuarioId', component: VerpostulanteComponent },
      
      
    ]
  },

  { path: '**', redirectTo: '' }
];
