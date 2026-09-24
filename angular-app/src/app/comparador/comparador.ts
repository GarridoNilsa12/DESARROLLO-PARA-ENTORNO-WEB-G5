import { Component } from '@angular/core';

interface Product {
  id: string;
  name: string;
  price: string;
  icon: string;
  specs: Record<string, string>;
}

@Component({
  selector: 'app-comparador',
  standalone: true,
  templateUrl: './comparador.html',
  styleUrl: './comparador.css'
})
export class Comparador {

  products: Product[] = [
    {
      id: 'macbook',
      name: 'Apple MacBook Air 13.6" Chip M5',
      price: 'S/ 4,999',
      icon: '💻',
      specs: {
        'Procesador': 'Chip M5',
        'RAM': '16 GB',
        'Almacenamiento': '512 GB SSD',
        'Pantalla': '13.6"',
        'Marca': 'Apple'
      }
    },

    {
      id: 'dell',
      name: 'DELL Inspiron 15 Intel Core i7',
      price: 'S/ 2,999',
      icon: '💻',
      specs: {
        'Procesador': 'Intel Core i7',
        'RAM': '—',
        'Almacenamiento': '—',
        'Pantalla': '15"',
        'Marca': 'Dell'
      }
    },

    {
      id: 'ipad',
      name: 'Apple iPad 11" Wi-Fi 128GB',
      price: 'S/ 1,449',
      icon: '📱',
      specs: {
        'Almacenamiento': '128 GB',
        'Conectividad': 'Wi-Fi',
        'Pantalla': '11"',
        'Marca': 'Apple'
      }
    },

    {
      id: 'monitor',
      name: 'Monitor Gamer LG UltraGear 27"',
      price: 'S/ 999',
      icon: '🖥️',
      specs: {
        'Panel': 'IPS',
        'Resolución': '—',
        'Frecuencia': '165Hz',
        'Tiempo de respuesta': '1ms',
        'Marca': 'LG'
      }
    },

    {
      id: 'ps5fat',
      name: 'Consola PlayStation 5 Fat 825GB',
      price: 'S/ 3,219',
      icon: '🎮',
      specs: {
        'Almacenamiento': '825 GB',
        'Marca': 'Sony'
      }
    },

    {
      id: 'ps5slim',
      name: 'PlayStation 5 Slim 1TB + Astro Bot',
      price: 'S/ 2,499',
      icon: '🎮',
      specs: {
        'Almacenamiento': '1 TB',
        'Incluye': 'Astro Bot',
        'Marca': 'PlayStation'
      }
    },

    {
      id: 'g733',
      name: 'Audífonos Logitech G733 RGB',
      price: 'S/ 429',
      icon: '🎧',
      specs: {
        'Conectividad': 'Inalámbrico Lightspeed',
        'Iluminación': 'RGB',
        'Marca': 'Logitech'
      }
    }
  ];

  selected: string[] = [];

  get chosenProducts(): Product[] {
    return this.selected
      .map(id => this.products.find(product => product.id === id))
      .filter((product): product is Product => product !== undefined);
  }

  get comparisonLabels(): string[] {
    const labels: string[] = [];

    this.chosenProducts.forEach(product => {
      Object.keys(product.specs).forEach(label => {
        if (!labels.includes(label)) {
          labels.push(label);
        }
      });
    });

    return labels;
  }

  get emptySlots(): number[] {
    return Array(3 - this.selected.length).fill(0);
  }

  toggleSelect(id: string): void {

    if (this.selected.includes(id)) {
      this.selected = this.selected.filter(
        selectedId => selectedId !== id
      );
      return;
    }

    if (this.selected.length >= 3) {
      return;
    }

    this.selected.push(id);
  }

  removeFromCompare(id: string): void {
    this.selected = this.selected.filter(
      selectedId => selectedId !== id
    );
  }
}