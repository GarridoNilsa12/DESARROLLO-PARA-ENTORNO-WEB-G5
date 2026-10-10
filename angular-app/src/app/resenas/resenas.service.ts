import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import { AuthService } from '../core/auth.service';

/** Reseña tal como la entrega la API. */
export interface ResenaApi {
  id: number;
  nombre: string;
  calificacion: number;
  comentario: string;
  verificada: boolean;
  creadoEn: string;
}

export interface ResenasRespuesta {
  productoId: number;
  total: number;
  promedio: number;
  distribucion: Record<string, number>;
  resenas: ResenaApi[];
}

@Injectable({ providedIn: 'root' })
export class ResenasService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  /** true cuando ya hay una API configurada en api.config.ts */
  readonly disponible = API_BASE_URL !== '';

  listar(productoId: number): Observable<ResenasRespuesta> {
    return this.http.get<ResenasRespuesta>(`${API_BASE_URL}/productos/${productoId}/resenas`);
  }

  publicar(
    productoId: number,
    datos: { nombre: string; calificacion: number; comentario: string }
  ): Observable<ResenaApi> {
    const token = this.auth.token;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.post<ResenaApi>(
      `${API_BASE_URL}/productos/${productoId}/resenas`,
      datos,
      { headers }
    );
  }
}

/** Convierte una fecha ISO en el texto que ya mostraba la pantalla: "ahora", "hace 3 días", etc. */
export function fechaRelativa(iso: string, ahora: Date = new Date()): string {
  const minutos = Math.floor((ahora.getTime() - new Date(iso).getTime()) / 60000);

  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;

  const dias = Math.floor(horas / 24);
  if (dias < 7) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;

  const semanas = Math.floor(dias / 7);
  if (dias < 30) return `hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;

  const meses = Math.floor(dias / 30);
  if (dias < 365) return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;

  const anios = Math.floor(dias / 365);
  return `hace ${anios} ${anios === 1 ? 'año' : 'años'}`;
}
