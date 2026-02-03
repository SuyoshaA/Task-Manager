import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',  // Changed from templateUrl to template
  styleUrls: ['./app.scss'],
})
export class App {}