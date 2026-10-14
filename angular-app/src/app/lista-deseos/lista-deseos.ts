import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoApi } from '../services/comparador.service';
import { DeseosService } from '../services/deseos.service';

@Component({
  selector: 'app-lista-deseos',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './lista-deseos.html',
  styleUrl: './lista-deseos.css'
})
export class ListaDeseos implements OnInit {
  private deseosService = inject(DeseosService);

  // La lista vive en el servidor (GET/POST/DELETE /api/deseos)
  wishlist = signal<ProductoApi[]>([]);
  catalogo = signal<ProductoApi[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal<string | null>(null);
  mensaje = signal<string | null>(null);

  // Productos del catálogo que todavía no están en la lista
  sugerencias = computed(() => {
    const guardados = this.wishlist().map(item => item.id);
    return this.catalogo().filter(producto => !guardados.includes(producto.id));
  });

  ngOnInit(): void {
    this.deseosService.listar().subscribe({
      next: lista => {
        this.wishlist.set(lista);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.mensajeError(err, 'No se pudo cargar tu lista de deseos.'));
        this.cargando.set(false);
      },
    });

    this.deseosService.listarProductos().subscribe({
      next: productos => this.catalogo.set(productos),
    });
  }

  addItem(id: number): void {
    this.ejecutar(this.deseosService.agregar(id), 'No se pudo guardar el producto.');
  }

  removeItem(id: number): void {
    this.ejecutar(this.deseosService.quitar(id), 'No se pudo quitar el producto.');
  }

  moveToCart(item: ProductoApi): void {
    // Todavía no hay carrito en el backend: solo se quita de la lista
    this.ejecutar(
      this.deseosService.quitar(item.id),
      'No se pudo mover el producto al carrito.',
      `"${item.nombre}" se agregó al carrito.`
    );
  }

  // Envía la petición y reemplaza la lista con la que responde el servidor
  private ejecutar(peticion: Observable<ProductoApi[]>, mensajeError: string, mensajeExito?: string): void {
    // Evita clics dobles mientras hay una petición en curso
    if (this.guardando()) {
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.mensaje.set(null);

    peticion.subscribe({
      next: lista => {
        this.wishlist.set(lista);
        this.mensaje.set(mensajeExito ?? null);
        this.guardando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.mensajeError(err, mensajeError));
        this.guardando.set(false);
      },
    });
  }

  private mensajeError(err: HttpErrorResponse, porDefecto: string): string {
    // Mensaje de validación enviado por la API, ej: { error: 'El producto ya está...' }
    if (typeof err.error?.error === 'string') {
      return err.error.error;
    }
    // 0: sin conexión; 5xx: el proxy no llega a la API; 200 con error: llegó HTML en vez de JSON (proxy no cargado)
    if (err.status === 0 || err.status >= 500 || err.status === 200) {
      return 'No hay conexión con la API. Verifica que esté corriendo (cd backend && npm start) ' +
        'y reinicia ng serve para que tome el proxy.';
    }
    return porDefecto;
  }
}
