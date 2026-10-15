import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductoApi {
  id: number;
  nombre: string;
  precio: number;
  idCategoria: number;
  categoria: string;
  icono: string;
}

export interface FilaComparacion {
  nombre: string;
  valores: (string | null)[];
  esDiferente: boolean;
}

export interface ResultadoComparacion {
  categoria: string | null;
  productos: (ProductoApi & { specs: Record<string, string> })[];
  caracteristicas: FilaComparacion[];
}

@Injectable({ providedIn: 'root' })
export class ComparadorService {
  private http = inject(HttpClient);
  // Local en desarrollo, AWS en producción (ver src/environments)
  private apiUrl = environment.apiUrl;

  listarProductos(): Observable<ProductoApi[]> {
    return this.http.get<ProductoApi[]>(`${this.apiUrl}/productos`);
  }

  obtenerComparador(): Observable<ResultadoComparacion> {
    return this.http.get<ResultadoComparacion>(`${this.apiUrl}/comparador`);
  }

  agregar(idProducto: number): Observable<ResultadoComparacion> {
    return this.http.post<ResultadoComparacion>(`${this.apiUrl}/comparador`, { idProducto });
  }

  quitar(idProducto: number): Observable<ResultadoComparacion> {
    return this.http.delete<ResultadoComparacion>(`${this.apiUrl}/comparador/${idProducto}`);
  }
}