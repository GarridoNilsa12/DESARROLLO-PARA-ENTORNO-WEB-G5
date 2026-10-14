import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import { ProductoApi } from './comparador.service';

@Injectable({ providedIn: 'root' })
export class DeseosService {
  private http = inject(HttpClient);
  // Con API_BASE_URL configurada usa API Gateway (AWS); si está vacía usa '/api',
  // que `ng serve` redirige a http://localhost:3000 (ver proxy.conf.json)
  private apiUrl = API_BASE_URL || '/api';

  listarProductos(): Observable<ProductoApi[]> {
    return this.http.get<ProductoApi[]>(`${this.apiUrl}/productos`);
  }

  listar(): Observable<ProductoApi[]> {
    return this.http.get<ProductoApi[]>(`${this.apiUrl}/deseos`);
  }

  agregar(idProducto: number): Observable<ProductoApi[]> {
    return this.http.post<ProductoApi[]>(`${this.apiUrl}/deseos`, { idProducto });
  }

  quitar(idProducto: number): Observable<ProductoApi[]> {
    return this.http.delete<ProductoApi[]>(`${this.apiUrl}/deseos/${idProducto}`);
  }
}
