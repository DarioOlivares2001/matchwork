import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contacts-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './contacts-sidebar.component.html',
  styleUrl: './contacts-sidebar.component.css'
})
export class ContactsSidebarComponent {

}
