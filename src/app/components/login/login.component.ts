import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.notificationService.warning('Por favor completá todos los campos correctamente');
      return;
    }

    this.loading.set(true);
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response: unknown) => {
        this.loading.set(false);
        if (response && typeof response === 'object' && 'success' in response && response.success) {
          this.notificationService.success('¡Bienvenido!');
          this.router.navigate(['/admin']);
        } else {
          this.notificationService.error('Credenciales incorrectas');
        }
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Error al conectar con el servidor');
      }
    });
  }

  // Getters para acceso fácil en el template
  get f() {
    return this.loginForm.controls;
  }

  // Verificar si un campo fue touched y es inválido
  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (control.errors['email']) return 'Email inválido';

    return 'Campo inválido';
  }
}