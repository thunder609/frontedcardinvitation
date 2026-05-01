import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Mesa {
  id?: number;
  nombre: string;
  capacidad: number;
  descripcion?: string;
  invitadosAsignados?: number;
  asientosOcupados?: number;
  asientosDisponibles?: number;
  invitados?: Invitado[];
}

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
export class MesaService {

  private apiUrl = `${environment.apiUrl}/mesas`;

  constructor(private http: HttpClient) { }

  getAllMesas(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(this.apiUrl);
  }

  getMesaById(id: number): Observable<Mesa> {
    return this.http.get<Mesa>(`${this.apiUrl}/${id}`);
  }

  createMesa(mesa: Mesa): Observable<Mesa> {
    return this.http.post<Mesa>(this.apiUrl, mesa);
  }

  updateMesa(id: number, mesa: Mesa): Observable<Mesa> {
    return this.http.put<Mesa>(`${this.apiUrl}/${id}`, mesa);
  }

  deleteMesa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  asignarInvitado(mesaId: number, invitadoId: number): Observable<Invitado> {
    return this.http.put<Invitado>(`${this.apiUrl}/${mesaId}/invitados/${invitadoId}`, {});
  }

  desasignarInvitado(mesaId: number, invariadoId: number): Observable<Invitado> {
    return this.http.delete<Invitado>(`${this.apiUrl}/${mesaId}/invitados/${invariadoId}`);
  }
}