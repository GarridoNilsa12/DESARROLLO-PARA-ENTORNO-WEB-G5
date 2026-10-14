import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoApi } from './comparador.service';

@Injectable({ providedIn: 'root' })
export class DeseosService {
  private http = inject(HttpClient);
  // Relativa: en desarrollo `ng serve` la redirige a http://localhost:3000 (ver proxy.conf.json)
  private apiUrl = '/api';

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
