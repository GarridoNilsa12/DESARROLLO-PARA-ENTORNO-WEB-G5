import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../core/auth.service';
import { Resenas } from './resenas';
import { ResenasService, fechaRelativa } from './resenas.service';

describe('fechaRelativa', () => {
  const ahora = new Date('2026-10-10T12:00:00Z');
  const hace = (ms: number) => new Date(ahora.getTime() - ms).toISOString();
  const MIN = 60_000;
  const DIA = 24 * 60 * MIN;

  it('muestra "ahora" para fechas recién creadas', () => {
    expect(fechaRelativa(hace(10_000), ahora)).toBe('ahora');
  });

  it('usa minutos, horas, días, semanas, meses y años en singular y plural', () => {
    expect(fechaRelativa(hace(MIN), ahora)).toBe('hace 1 minuto');
    expect(fechaRelativa(hace(5 * MIN), ahora)).toBe('hace 5 minutos');
    expect(fechaRelativa(hace(60 * MIN), ahora)).toBe('hace 1 hora');
    expect(fechaRelativa(hace(3 * DIA), ahora)).toBe('hace 3 días');
    expect(fechaRelativa(hace(7 * DIA), ahora)).toBe('hace 1 semana');
    expect(fechaRelativa(hace(14 * DIA), ahora)).toBe('hace 2 semanas');
    expect(fechaRelativa(hace(60 * DIA), ahora)).toBe('hace 2 meses');
    expect(fechaRelativa(hace(400 * DIA), ahora)).toBe('hace 1 año');
  });
});

describe('ResenasService', () => {
  function crear(token: string | null) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token } }
      ]
    });
    return {
      servicio: TestBed.inject(ResenasService),
      http: TestBed.inject(HttpTestingController)
    };
  }

  it('lista las reseñas de un producto con GET', () => {
    const { servicio, http } = crear(null);
    servicio.listar(1).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/productos/1/resenas'));
    expect(req.request.method).toBe('GET');
    req.flush({ productoId: 1, total: 0, promedio: 0, distribucion: {}, resenas: [] });
    http.verify();
  });

  it('publica con POST y envía el token cuando hay sesión', () => {
    const { servicio, http } = crear('abc123');
    servicio.publicar(1, { nombre: 'Luis', calificacion: 5, comentario: 'Excelente' }).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/productos/1/resenas'));
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    expect(req.request.body).toEqual({ nombre: 'Luis', calificacion: 5, comentario: 'Excelente' });
    req.flush({});
    http.verify();
  });

  it('publica sin encabezado Authorization cuando no hay sesión', () => {
    const { servicio, http } = crear(null);
    servicio.publicar(1, { nombre: 'Ana', calificacion: 4, comentario: 'Bien' }).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/productos/1/resenas'));
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    http.verify();
  });
});

describe('Resenas (componente)', () => {
  function crear(servicio: object) {
    const auth = { cerrarSesion: vi.fn(), token: null };
    TestBed.configureTestingModule({
      providers: [
        { provide: ResenasService, useValue: servicio },
        { provide: AuthService, useValue: auth }
      ]
    });
    return { componente: TestBed.createComponent(Resenas).componentInstance, auth };
  }

  it('sin API configurada mantiene las 3 reseñas de ejemplo y publica en local', () => {
    const { componente } = crear({ disponible: false });
    componente.ngOnInit();
    expect(componente.reviews.length).toBe(3);

    componente.selectedStars = 5;
    componente.reviewText = 'Muy buen producto';
    componente.submitReview();

    expect(componente.reviews.length).toBe(4);
    expect(componente.reviews[0].text).toBe('Muy buen producto');
    expect(componente.reviews[0].date).toBe('ahora');
  });

  it('con API configurada carga las reseñas de la base de datos', () => {
    const { componente } = crear({
      disponible: true,
      listar: () =>
        of({
          productoId: 1,
          total: 1,
          promedio: 4,
          distribucion: {},
          resenas: [
            { id: 1, nombre: 'Marta', calificacion: 4, comentario: 'Bien', verificada: true,
              creadoEn: new Date().toISOString() }
          ]
        })
    });
    componente.ngOnInit();

    expect(componente.reviews.length).toBe(1);
    expect(componente.reviews[0]).toMatchObject({ name: 'Marta', rating: 4, verified: true, text: 'Bien' });
    expect(componente.averageRating).toBe('4.0');
  });

  it('si la API falla al cargar, se conservan las reseñas de ejemplo', () => {
    const { componente } = crear({ disponible: true, listar: () => throwError(() => new Error('sin red')) });
    componente.ngOnInit();
    expect(componente.reviews.length).toBe(3);
  });

  it('con API configurada publica en el servidor y agrega la reseña devuelta', () => {
    const publicar = vi.fn(() =>
      of({ id: 9, nombre: 'Luis', calificacion: 5, comentario: 'Genial', verificada: false,
           creadoEn: new Date().toISOString() })
    );
    const { componente } = crear({ disponible: true, listar: () => of({ resenas: [] }), publicar });
    componente.ngOnInit();

    componente.reviewerName = 'Luis';
    componente.selectedStars = 5;
    componente.reviewText = 'Genial';
    componente.submitReview();

    expect(publicar).toHaveBeenCalledWith(1, { nombre: 'Luis', calificacion: 5, comentario: 'Genial' });
    expect(componente.reviews[0].text).toBe('Genial');
    expect(componente.reviewText).toBe('');
    expect(componente.selectedStars).toBe(0);
  });

  it('si el servidor responde 401 se cierra la sesión y no se agrega la reseña', () => {
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => undefined);
    const { componente, auth } = crear({
      disponible: true,
      listar: () => of({ resenas: [] }),
      publicar: () => throwError(() => ({ status: 401, error: { error: 'Sesión vencida' } }))
    });
    componente.ngOnInit();

    componente.selectedStars = 4;
    componente.reviewText = 'Bien';
    componente.submitReview();

    expect(auth.cerrarSesion).toHaveBeenCalled();
    expect(alerta).toHaveBeenCalledWith('Sesión vencida');
    expect(componente.reviews.length).toBe(0);
    alerta.mockRestore();
  });

  it('la validación de calificación y comentario sigue igual que antes', () => {
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => undefined);
    const publicar = vi.fn();
    const { componente } = crear({ disponible: true, listar: () => of({ resenas: [] }), publicar });

    componente.submitReview();

    expect(alerta).toHaveBeenCalledWith('Elige una calificación y escribe tu comentario.');
    expect(publicar).not.toHaveBeenCalled();
    alerta.mockRestore();
  });
});
