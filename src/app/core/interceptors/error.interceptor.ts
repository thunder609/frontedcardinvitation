import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.status === 401) {
        // No mostrar snackbar para 401, el guard maneja la redirección
        localStorage.removeItem('admin_token');
        router.navigate(['/login']);
        return throwError(() => error);
      } else if (error.status === 403) {
        errorMessage = 'No tenés permisos para realizar esta acción';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status >= 500) {
        errorMessage = 'Error del servidor. Intentá más tarde';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      notificationService.error(errorMessage);
      return throwError(() => error);
    })
  );
};