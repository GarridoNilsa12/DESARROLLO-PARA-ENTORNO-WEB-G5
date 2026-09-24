import { Routes } from '@angular/router';
import { Chat } from './chat/chat';
import { Comparador } from './comparador/comparador';
import { ListaDeseos } from './lista-deseos/lista-deseos';
import { Resenas } from './resenas/resenas';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: Chat },
  { path: 'comparador', component: Comparador },
  { path: 'lista-deseos', component: ListaDeseos },
  { path: 'resenas', component: Resenas },
];