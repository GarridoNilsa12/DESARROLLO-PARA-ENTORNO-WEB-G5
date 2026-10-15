import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductoApi } from './comparador.service';

@Injectable({ providedIn: 'root' })
export class DeseosService {
  private http = inject(HttpClient);
  // Local en desarrollo, AWS en producción (ver src/environments)
  private apiUrl = environment.apiUrl;

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