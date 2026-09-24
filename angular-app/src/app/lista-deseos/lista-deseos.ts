import { Component } from '@angular/core';

interface WishlistItem {
  id: string;
  name: string;
  price: string;
  icon: string;
}

@Component({
  selector: 'app-lista-deseos',
  standalone: true,
  templateUrl: './lista-deseos.html',
  styleUrl: './lista-deseos.css'
})
export class ListaDeseos {

  wishlist: WishlistItem[] = [
    {
      id: 'macbook',
      name: 'Apple MacBook Air 13.6" Chip M5',
      price: 'S/ 4,999',
      icon: '💻'
    },
    {
      id: 'ipad',
      name: 'Apple iPad 11" Wi-Fi 128GB',
      price: 'S/ 1,449',
      icon: '📱'
    },
    {
      id: 'g733',
      name: 'Audífonos Logitech G733 RGB',
      price: 'S/ 429',
      icon: '🎧'
    }
  ];

  removeItem(id: string): void {
    this.wishlist = this.wishlist.filter(
      item => item.id !== id
    );
  }

  moveToCart(id: string): void {
    const item = this.wishlist.find(
      product => product.id === id
    );

    if (!item) {
      return;
    }

    alert(`"${item.name}" se agregó al carrito.`);

    this.removeItem(id);
  }
}