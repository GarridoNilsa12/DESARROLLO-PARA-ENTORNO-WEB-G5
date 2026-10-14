import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ComparadorService,
  ProductoApi,
  ResultadoComparacion,
} from '../services/comparador.service';

const MAX_PRODUCTOS = 3;

@Component({
  selector: 'app-comparador',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './comparador.html',
  styleUrl: './comparador.css'
})
export class Comparador implements OnInit {
  private comparadorService = inject(ComparadorService);

  readonly maxProductos = MAX_PRODUCTOS;

  products = signal<ProductoApi[]>([]);
  resultado = signal<ResultadoComparacion | null>(null);
  cargandoProductos = signal(true);
  comparando = signal(false);
  error = signal<string | null>(null);

  // La selección vive en el servidor (GET/POST/DELETE /api/comparador)
  chosenProducts = computed(() => this.resultado()?.productos ?? []);

  selected = computed(() => this.chosenProducts().map(p => p.id));

  // Solo se pueden comparar productos de la misma categoría que el primero elegido
  categoriaActiva = computed(() => this.chosenProducts()[0]?.idCategoria ?? null);

  emptySlots = computed(() =>
    Array(MAX_PRODUCTOS - this.chosenProducts().length).fill(0)
  );

  ngOnInit(): void {
    this.comparadorService.listarProductos().subscribe({
      next: productos => {
        this.products.set(productos);
        this.cargandoProductos.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.mensajeError(err, 'No se pudo cargar la lista de productos.'));
        this.cargandoProductos.set(false);
      },
    });

    this.ejecutar(this.comparadorService.obtenerComparador(), 'No se pudo cargar el comparador.');
  }

  isDisabled(product: ProductoApi): boolean {
    if (this.selected().includes(product.id)) {
      return false;
    }
    const categoria = this.categoriaActiva();
    const otraCategoria = categoria !== null && product.idCategoria !== categoria;
    return otraCategoria || this.selected().length >= MAX_PRODUCTOS;
  }

  toggleSelect(product: ProductoApi): void {
    if (this.selected().includes(product.id)) {
      this.removeFromCompare(product.id);
      return;
    }

    if (this.isDisabled(product)) {
      return;
    }

    this.ejecutar(this.comparadorService.agregar(product.id), 'No se pudo agregar el producto.');
  }

  removeFromCompare(id: number): void {
    this.ejecutar(this.comparadorService.quitar(id), 'No se pudo quitar el producto.');
  }

  // Envía la petición y reemplaza la comparación con la que responde el servidor
  private ejecutar(peticion: Observable<ResultadoComparacion>, mensaje: string): void {
    // Evita clics dobles mientras hay una petición en curso
    if (this.comparando()) {
      return;
    }

    this.comparando.set(true);
    this.error.set(null);

    peticion.subscribe({
      next: resultado => {
        this.resultado.set(resultado);
        this.comparando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.mensajeError(err, mensaje));
        this.comparando.set(false);
      },
    });
  }

  private mensajeError(err: HttpErrorResponse, porDefecto: string): string {
    // Mensaje de validación enviado por la API, ej: { error: 'Los productos deben ser...' }
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
