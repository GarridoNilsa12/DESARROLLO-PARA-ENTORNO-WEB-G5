import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

type Modo = 'login' | 'registro';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly modo = signal<Modo>('login');
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly usuario = this.auth.usuario;
  readonly apiDisponible = this.auth.disponible;

  nombre = '';
  email = '';
  password = '';

  cambiarModo(modo: Modo): void {
    this.modo.set(modo);
    this.error.set('');
  }

  enviar(): void {
    this.error.set('');

    const email = this.email.trim();
    if (!email || !this.password) {
      this.error.set('Escribe tu correo y tu contraseña.');
      return;
    }
    if (this.modo() === 'registro' && this.nombre.trim().length < 2) {
      this.error.set('Escribe tu nombre.');
      return;
    }

    this.cargando.set(true);

    const peticion =
      this.modo() === 'registro'
        ? this.auth.registrar({ nombre: this.nombre.trim(), email, password: this.password })
        : this.auth.iniciarSesion({ email, password: this.password });

    peticion.subscribe({
      next: () => {
        this.cargando.set(false);
        this.password = '';
        this.router.navigate(['/resenas']);
      },
      error: (respuesta: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          respuesta.error?.error ?? 'No pudimos conectar con el servidor. Inténtalo de nuevo.'
        );
      }
    });
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
  }
}
