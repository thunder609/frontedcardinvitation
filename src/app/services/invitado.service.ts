import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Invitado {
  id?: number;
  nombre: string;
  apellido: string;
  codigoUnico: string;
  telefono?: string;
  email?: string;
  confirmado: boolean;
  fechaConfirmacion?: string;
  mensaje?: string;
  cantidadPases?: number;
  mesaId?: number;
  mesaNombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvitadoService {

  private apiUrl = `${environment.apiUrl}/invitados`;

  constructor(private http: HttpClient) { }

  getAllInvitados(): Observable<Invitado[]> {
    return this.http.get<Invitado[]>(this.apiUrl);
  }

  getInvitadoByCodigo(codigo: string): Observable<Invitado> {
    return this.http.get<Invitado>(`${this.apiUrl}/${codigo}`);
  }

  buscarInvitados(termino: string): Observable<Invitado[]> {
    return this.http.get<Invitado[]>(`${this.apiUrl}/buscar/${termino}`);
  }

  createInvitado(invitado: Invitado): Observable<Invitado> {
    return this.http.post<Invitado>(this.apiUrl, invitado);
  }

  createInvitadosBulk(invitados: Invitado[]): Observable<Invitado[]> {
    return this.http.post<Invitado[]>(`${this.apiUrl}/bulk`, invitados);
  }

  confirmarAsistencia(codigo: string, mensaje: string, cantidadPases?: number): Observable<Invitado> {
    return this.http.post<Invitado>(`${this.apiUrl}/${codigo}/confirmar`, { 
      codigoUnico: codigo, 
      mensaje,
      cantidadPases 
    });
  }

  updateInvitado(id: number, invitado: Invitado): Observable<Invitado> {
    return this.http.put<Invitado>(`${this.apiUrl}/${id}`, invitado);
  }

  deleteInvitado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
