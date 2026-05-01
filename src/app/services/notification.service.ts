import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom'
  };

  show(message: string, type: NotificationType = 'info'): void {
    const panelClass = this.getPanelClass(type);
    
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      panelClass: [panelClass]
    });
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  private getPanelClass(type: NotificationType): string {
    return `snackbar-${type}`;
  }
}