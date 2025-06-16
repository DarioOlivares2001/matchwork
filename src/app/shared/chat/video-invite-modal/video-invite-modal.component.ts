// src/app/shared/chat/video-invite-modal/video-invite-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-invite-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="invite-backdrop">
      <div class="invite-modal">
        <h3 class="title">📹 Invitación a videollamada</h3>
        <p class="message">
          El usuario <strong>#{{ userName }}</strong> te invita a una entrevista.
        </p>
        <div class="buttons">
          <button class="btn accept" (click)="accept.emit()">
            Aceptar
          </button>
          <button class="btn decline" (click)="decline.emit()">
            Rechazar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* FONDO SEMITRANSPARENTE */
    .invite-backdrop {
      position: fixed;
      top:0; left:0; right:0; bottom:0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    /* CAJA CENTRAL */
    .invite-modal {
      background: #1e2434;          /* tu color de fondo */
      color: #e0e0e0;               /* texto claro */
      border-radius: 8px;
      padding: 1.5rem 2rem;
      max-width: 320px;
      width: 100%;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      text-align: center;
    }

    .invite-modal .title {
      margin: 0 0 1rem;
      font-size: 1.25rem;
      color: #ffffff;
    }

    .invite-modal .message {
      margin: 0 0 1.5rem;
      font-size: 1rem;
    }

    .invite-modal .buttons {
      display: flex;
      gap: .5rem;
      justify-content: center;
    }

    .invite-modal .btn {
      flex: 1;
      padding: .5rem 1rem;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: background .2s;
    }

    /* TU BOTÓN PRINCIPAL */
    .invite-modal .btn.accept {
      background: #02c3b3;          /* tu color “aceptar” */
      color: #1e2434;
    }
    .invite-modal .btn.accept:hover {
      background: #02a89f;
    }

    /* BOTÓN SECUNDARIO */
    .invite-modal .btn.decline {
      background: #e74c3c;          /* tu color “rechazar” */
      color: #ffffff;
    }
    .invite-modal .btn.decline:hover {
      background: #c0392b;
    }
  `]
})
export class VideoInviteModalComponent {
  @Input() userName!: string;
  @Input() fromUser!: number;
  @Output() accept = new EventEmitter<void>();
  @Output() decline = new EventEmitter<void>();
}
