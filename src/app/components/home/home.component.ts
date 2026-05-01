import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { InvitadoService, Invitado } from '../../services/invitado.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface CountdownItem {
  value: string;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  // Signals para estado reactivo
  codigoBusqueda = signal('');
  error = signal('');
  convidadoEncontrado = signal<Invitado | null>(null);
  
  // Countdown como señal
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  readonly fechaBoda = new Date('2026-05-04T17:30:00');
  
  // Signals para countdown (se calculan automáticamente)
  countdown = signal<CountdownItem[]>([
    { value: '000', label: 'Días' },
    { value: '00', label: 'Horas' },
    { value: '00', label: 'Min' },
    { value: '00', label: 'Seg' }
  ]);

  // Computed para saber si hay alguien encontrado
  tieneInvitado = computed(() => this.convidadoEncontrado() !== null);

  constructor(private invitadoService: InvitadoService) {}

  ngOnInit(): void {
    this.iniciarCountdown();
  }

  ngOnDestroy(): void {
    this.detenerCountdown();
  }

  private detenerCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  buscarInvitado(): void {
    const codigo = this.codigoBusqueda().trim();
    
    if (!codigo) {
      this.error.set('Por favor ingresá tu código de invitación');
      this.convidadoEncontrado.set(null);
      return;
    }

    this.error.set('');
    this.convidadoEncontrado.set(null);

    this.invitadoService.getInvitadoByCodigo(codigo).subscribe({
      next: (invitado) => {
        this.convidadoEncontrado.set(invitado);
        this.error.set('');
      },
      error: () => {
        this.error.set('Código no encontrado. Verificá tu código de invitación.');
        this.convidadoEncontrado.set(null);
      }
    });
  }

  irAInvitacion(codigo: string): void {
    window.location.href = `/invitacion/${codigo}`;
  }

  // Getters para el template
  get codigoBusquedaValue(): string {
    return this.codigoBusqueda();
  }

  set codigoBusquedaValue(value: string) {
    this.codigoBusqueda.set(value);
  }

  get invitadoEncontrado(): Invitado | null {
    return this.convidadoEncontrado();
  }

  get getError(): string {
    return this.error();
  }

  // Getter para el template (signals son iterables con .())
  get countdownItems(): CountdownItem[] {
    return this.countdown();
  }

  iniciarCountdown(): void {
    this.countdownInterval = setInterval(() => {
      const ahora = new Date();
      const diferencia = this.fechaBoda.getTime() - ahora.getTime();

      if (diferencia > 0) {
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        this.countdown.set([
          { value: dias.toString().padStart(3, '0'), label: 'Días' },
          { value: horas.toString().padStart(2, '0'), label: 'Horas' },
          { value: minutos.toString().padStart(2, '0'), label: 'Min' },
          { value: segundos.toString().padStart(2, '0'), label: 'Seg' }
        ]);
      }
    }, 1000);
  }

  // Calcular el stroke-dashoffset para el anillo animado
  getDashOffset(index: number): number {
    const maxValues = [365, 24, 60, 60];
    const val = parseInt(this.countdown()[index].value) || 0;
    const max = maxValues[index];
    const circumference = 408; // 2 * PI * 65
    return circumference - (circumference * val) / max;
  }
}