import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-message-bubble',
   imports: [CommonModule, RouterModule],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.css'
})
export class MessageBubbleComponent {

}
