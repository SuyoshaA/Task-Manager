import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  // ✅ UPDATE THESE - All users now use 'password123'
  email: string = 'admin@techcorp.com';  // Changed from owner@example.com
  password: string = 'password123';      // Changed from owner123

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onLogin(): void {
    // Optional: Add trim() to avoid whitespace issues
    const trimmedEmail = this.email.trim().toLowerCase();
    const trimmedPassword = this.password.trim();
    
    this.authService.login(trimmedEmail, trimmedPassword).subscribe({
      next: (response: any) => {
        if (response?.accessToken) {
          this.authService.setToken(response.accessToken);
          localStorage.setItem('task-user', JSON.stringify(response.user));
          this.router.navigate(['/tasks']);
        } else {
          console.error('No accessToken in response', response);
          alert('Login failed: no token returned');
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        // Show specific error message if available
        const errorMsg = error.error?.message || 'Login failed. Check console.';
        alert(`Login failed: ${errorMsg}`);
      },
    });
  }
}