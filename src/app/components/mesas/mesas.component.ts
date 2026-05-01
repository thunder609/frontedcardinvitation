import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MesaService, Mesa } from '../../services/mesa.service';
import { InvitadoService, Invitado } from '../../services/invitado.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesas.component.html',
  styleUrl: './mesas.component.scss'
})
export class MesasComponent implements OnInit {
  private mesaService = inject(MesaService);
  private inviteService = inject(InvitadoService);
  private notificationService = inject(NotificationService);

  mesas = signal<Mesa[]>([]);
  nuevoMesa = signal({ nombre: '', capacidad: 8, descripcion: '' });
  loading = signal(false);
  todosLosInvitados = signal<Invitado[]>([]);
  mesaExpandida = signal<number | null>(null);
  invitadoSeleccionado = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarMesas();
    this.cargarInvitados();
  }

  cargarMesas(): void {
    this.mesaService.getAllMesas().subscribe({
      next: (data) => this.mesas.set(data),
      error: () => this.notificationService.error('Error al cargar mesas')
    });
  }

  cargarInvitados(): void {
    this.inviteService.getAllInvitados().subscribe({
      next: (data) => this.todosLosInvitados.set(data),
      error: () => this.notificationService.error('Error al cargar invitados')
    });
  }

  toggleMesaExpandida(mesaId: number): void {
    if (this.mesaExpandida() === mesaId) {
      this.mesaExpandida.set(null);
    } else {
      this.mesaExpandida.set(mesaId);
      this.invitadoSeleccionado.set(null);
    }
  }

  asignarInvitado(mesaId: number): void {
    const invitadoId = this.invitadoSeleccionado();
    if (!invitadoId) {
      this.notificationService.warning('Seleccioná un invitado');
      return;
    }

    this.mesaService.asignarInvitado(mesaId, invitadoId).subscribe({
      next: () => {
        this.notificationService.success('Invitado asignado');
        this.invitadoSeleccionado.set(null);
        this.mesaExpandida.set(null);
        this.cargarMesas();
      },
      error: (err) => {
        if (err.status === 400) {
          this.notificationService.error('La mesa no tiene capacidad suficiente');
        } else {
          this.notificationService.error('Error al asignar');
        }
      }
    });
  }

  desasignarInvitado(mesaId: number, invitadoId: number): void {
    this.mesaService.desasignarInvitado(mesaId, invitadoId).subscribe({
      next: () => {
        this.notificationService.success('Invitado desasignado');
        this.cargarMesas();
      },
      error: () => this.notificationService.error('Error al desasignar')
    });
  }

  getInvitadosSinMesa(): Invitado[] {
    return this.todosLosInvitados().filter(inv => !inv.mesaId);
  }

  getInvitadosEnMesa(mesaId: number): Invitado[] {
    const mesa = this.mesas().find(m => m.id === mesaId);
    return mesa?.invitados || [];
  }

  getProgresoClase(mesa: Mesa): string {
    if (!mesa.capacidad || mesa.capacidad === 0) return 'progress-verde';
    const porcentaje = ((mesa.asientosOcupados || 0) / mesa.capacidad) * 100;
    
    if (porcentaje >= 100) return 'progress-rojo';
    if (porcentaje >= 75) return 'progress-naranja';
    if (porcentaje >= 50) return 'progress-amarillo';
    return 'progress-verde';
  }

  agregarMesa(): void {
    const m = this.nuevoMesa();
    if (!m.nombre || m.capacidad < 1) {
      this.notificationService.warning('Nombre y capacidad son requeridos');
      return;
    }

    this.mesaService.createMesa(m as Mesa).subscribe({
      next: () => {
        this.notificationService.success('Mesa creada');
        this.nuevoMesa.set({ nombre: '', capacidad: 8, descripcion: '' });
        this.cargarMesas();
      },
      error: () => this.notificationService.error('Error al crear mesa')
    });
  }

  eliminarMesa(id: number): void {
    if (confirm('¿Eliminar esta mesa? Los invitados serán desasignados.')) {
      this.mesaService.deleteMesa(id).subscribe({
        next: () => {
          this.notificationService.success('Mesa eliminada');
          this.cargarMesas();
        },
        error: () => this.notificationService.error('Error al eliminar')
      });
    }
  }
}