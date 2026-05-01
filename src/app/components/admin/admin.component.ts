import { Component, OnInit, inject, signal } from '@angular/core';
import { InvitadoService, Invitado } from '../../services/invitado.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, QRCodeModule, RouterLink, RouterLinkActive],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private ivService = inject(InvitadoService);
  
  nuevoInvitadoForm: FormGroup;
  loading = signal(false);
  
  listaInvitados: Invitado[] = [];
  mostrarCargaMasiva = false;
  jsonMasivo = '';
  seleccionado: Invitado | null = null;

  constructor() {
    this.nuevoInvitadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      telefono: [''],
      email: ['', [Validators.email]],
      cantidadPases: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  ngOnInit(): void {
    this.cargarInvitados();
  }

  get f() {
    return this.nuevoInvitadoForm.controls;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.nuevoInvitadoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.nuevoInvitadoForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['min']) return 'Valor mínimo es 1';
    if (control.errors['max']) return 'Máximo es 10';

    return 'Campo inválido';
  }

  cargarInvitados(): void {
    this.ivService.getAllInvitados().subscribe({
      next: (data: Invitado[]) => (this.listaInvitados = data),
      error: (err: Error) => {
        console.error('Error cargando invitados:', err);
        this.notificationService.error('Error al cargar invitados');
      }
    });
  }

  agregarInvitado(): void {
    if (this.nuevoInvitadoForm.invalid) {
      this.nuevoInvitadoForm.markAllAsTouched();
      this.notificationService.warning('Por favor completá todos los campos correctamente');
      return;
    }

    this.ivService.createInvitado(this.nuevoInvitadoForm.value).subscribe({
      next: () => {
        this.notificationService.success('Invitado agregado exitosamente');
        this.nuevoInvitadoForm.reset({ confirmado: false, cantidadPases: 1 });
        this.cargarInvitados();
      },
      error: (err: Error) => this.notificationService.error('Error al agregar: ' + err.message)
    });
  }

  cargarMasiva(): void {
    try {
      const data = JSON.parse(this.jsonMasivo);
      const lista = data.invitados || data;

      this.ivService.createInvitadosBulk(lista).subscribe({
        next: () => {
          this.notificationService.success(`${lista.length} invitados cargados exitosamente`);
          this.jsonMasivo = '';
          this.cargarInvitados();
        },
        error: (err: Error) => this.notificationService.error('Error en carga masiva: ' + err.message)
      });
    } catch (e) {
      this.notificationService.error('JSON inválido: ' + e);
    }
  }

  eliminarInvitado(id: number): void {
    if (confirm('¿Seguro que querés eliminar este invitado?')) {
      this.ivService.deleteInvitado(id).subscribe({
        next: () => {
          this.notificationService.success('Invitado eliminado');
          this.cargarInvitados();
        },
        error: (err: Error) => this.notificationService.error('Error al eliminar: ' + err.message)
      });
    }
  }

  verQR(inv: Invitado): void {
    this.seleccionado = inv;
  }

  cerrarModal(): void {
    this.seleccionado = null;
  }

  getQRData(inv: Invitado): string {
    return window.location.origin + '/invitacion/' + inv.codigoUnico;
  }

  getInvitacionUrl(inv: Invitado): string {
    return '/invitacion/' + inv.codigoUnico;
  }
}