import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

interface Sesion {
  usuario: Usuario;
  token: string;
}

const CLAVE_SESION = 'coolbox_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly sesion = signal<Sesion | null>(this.leerSesionGuardada());

  readonly usuario = computed(() => this.sesion()?.usuario ?? null);

  /** true cuando ya hay una API configurada en api.config.ts */
  readonly disponible = API_BASE_URL !== '';

  get token(): string | null {
    return this.sesion()?.token ?? null;
  }

  registrar(datos: { nombre: string; email: string; password: string }): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_BASE_URL}/auth/registro`, datos)
      .pipe(tap((sesion) => this.guardarSesion(sesion)));
  }

  iniciarSesion(datos: { email: string; password: string }): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_BASE_URL}/auth/login`, datos)
      .pipe(tap((sesion) => this.guardarSesion(sesion)));
  }

  cerrarSesion(): void {
    this.sesion.set(null);
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch {
      /* sin almacenamiento disponible: la sesión solo vive en memoria */
    }
  }

  private guardarSesion(sesion: Sesion): void {
    this.sesion.set(sesion);
    try {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {
      /* sin almacenamiento disponible: la sesión solo vive en memoria */
    }
  }

  private leerSesionGuardada(): Sesion | null {
    try {
      const texto = localStorage.getItem(CLAVE_SESION);
      return texto ? (JSON.parse(texto) as Sesion) : null;
    } catch {
      return null;
    }
  }
}
