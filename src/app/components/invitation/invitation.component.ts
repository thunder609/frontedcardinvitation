import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InvitadoService, Invitado } from '../../services/invitado.service';
import { PdfService } from '../../services/pdf.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';

interface CountdownItem {
  value: string;
  label: string;
}

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeModule, RouterLink],
  templateUrl: './invitation.component.html',
  styleUrl: './invitation.component.scss'
})
export class InvitationComponent implements OnInit, OnDestroy {
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  
  // Signals para estado reactivo
  codigo = signal('');
  qrData = signal('');
  loading = signal(true);
  errorSignal = signal('');
  mensajeConfirmacion = signal('');
  cantidadPases = signal(1);
  
  // Signal para el invitado
  convidado = signal<Invitado | null>(null);
  
  // Countdown
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  readonly fechaBoda = new Date('2026-05-04T17:30:00');
  
  countdown = signal<CountdownItem[]>([
    { value: '000', label: 'Días' },
    { value: '00', label: 'Horas' },
    { value: '00', label: 'Min' },
    { value: '00', label: 'Seg' }
  ]);

  // Computed values
  tieneInvitado = computed(() => this.convidado() !== null && !this.loading());
  estaConfirmado = computed(() => this.convidado()?.confirmado ?? false);
  
  // Computed para los passes máximos permitidos (los que el admin asignó)
  passesMaximos = computed(() => {
    const passes = this.convidado()?.cantidadPases;
    return passes && passes > 0 ? passes : 1;
  });

  constructor(
    private route: ActivatedRoute,
    private invitadoService: InvitadoService,
    private pdfService: PdfService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const codigoRuta = this.route.snapshot.paramMap.get('codigo') || '';
    this.codigo.set(codigoRuta);
    this.qrData.set(window.location.href);

    if (codigoRuta) {
      this.cargarInvitado(codigoRuta);
    } else {
      this.errorSignal.set('Código de invitación no válido');
      this.loading.set(false);
    }
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

  private cargarInvitado(codigo: string): void {
    this.invitadoService.getInvitadoByCodigo(codigo).subscribe({
      next: (data) => {
        this.convidado.set(data);
        this.loading.set(false);
        this.iniciarCountdown();
      },
      error: () => {
        this.errorSignal.set('No se encontró una invitación con este código');
        this.loading.set(false);
      }
    });
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
      } else {
        this.countdown.set([
          { value: '000', label: 'Días' },
          { value: '00', label: 'Horas' },
          { value: '00', label: 'Min' },
          { value: '00', label: 'Seg' }
        ]);
      }
    }, 1000);
  }

  confirmarAsistencia(): void {
    const currentInvitado = this.convidado();
    if (!currentInvitado) return;

    this.invitadoService.confirmarAsistencia(this.codigo(), this.mensajeConfirmacion(), this.cantidadPases()).subscribe({
      next: (data) => {
        this.convidado.set(data);
        this.notificationService.success('¡Gracias por confirmar tu asistencia!');
      },
      error: () => this.notificationService.error('Error al confirmar. Intentá de nuevo.')
    });
  }

  getDashOffset(index: number): number {
    const maxValues = [365, 24, 60, 60];
    const val = parseInt(this.countdown()[index].value) || 0;
    const max = maxValues[index];
    const circumference = 408;
    return circumference - (circumference * val) / max;
  }

  descargarInvitacion(): void {
    if (!this.pdfContent) return;

    const element = this.pdfContent.nativeElement;
    const currentInvitado = this.convidado();
    const nombreArchivo = `Invitacion_${currentInvitado?.nombre || 'boda'}_${currentInvitado?.apellido || ''}.pdf`;

    this.pdfService.generarPdfDesdeElemento(element, nombreArchivo).subscribe({
      next: () => this.notificationService.success('PDF generado exitosamente'),
      error: (err) => {
        console.error('Error generating PDF:', err);
        this.notificationService.error('Error al generar el PDF. Intentá de nuevo.');
      }
    });
  }

  // Getters para el template (compatibilidad con el template existente)
  get loadingValue(): boolean {
    return this.loading();
  }

  get error(): string {
    return this.errorSignal();
  }

  get invitados(): Invitado | null {
    return this.convidado();
  }

  get qrDataValue(): string {
    return this.qrData();
  }

  get mensajeConfirmacionValue(): string {
    return this.mensajeConfirmacion();
  }

  set mensajeConfirmacionValue(value: string) {
    this.mensajeConfirmacion.set(value);
  }

  get cantidadPasesValue(): number {
    return this.cantidadPases();
  }

  set cantidadPasesValue(value: number) {
    this.cantidadPases.set(value);
  }

  // Get max passes allowed (set by admin)
  get passesMaximosValue(): number {
    return this.passesMaximos();
  }

  // Generate array of options for select
  get paseOptions(): number[] {
    const max = this.passesMaximos();
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  // Getter para el template (signals son iterables con .())
  get countdownItems(): CountdownItem[] {
    return this.countdown();
  }
}