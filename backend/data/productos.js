const categorias = [
  { id: 1, nombre: 'Laptops', icono: '💻' },
  { id: 2, nombre: 'Tablets', icono: '📱' },
  { id: 3, nombre: 'Monitores', icono: '🖥️' },
  { id: 4, nombre: 'Consolas', icono: '🎮' },
  { id: 5, nombre: 'Audio', icono: '🎧' },
];

const productos = [
  {
    id: 1,
    nombre: 'Apple MacBook Air 13.6" Chip M5',
    precio: 4999,
    idCategoria: 1,
    specs: {
      Procesador: 'Chip M5',
      RAM: '16 GB',
      Almacenamiento: '512 GB SSD',
      Pantalla: '13.6"',
      Marca: 'Apple',
    },
  },
  {
    id: 2,
    nombre: 'DELL Inspiron 15 Intel Core i7',
    precio: 2999,
    idCategoria: 1,
    specs: {
      Procesador: 'Intel Core i7',
      RAM: '16 GB',
      Almacenamiento: '512 GB SSD',
      Pantalla: '15"',
      Marca: 'Dell',
    },
  },
  {
    id: 3,
    nombre: 'Lenovo IdeaPad Slim 3 Ryzen 7',
    precio: 2599,
    idCategoria: 1,
    specs: {
      Procesador: 'AMD Ryzen 7',
      RAM: '16 GB',
      Almacenamiento: '1 TB SSD',
      Pantalla: '15.6"',
      Marca: 'Lenovo',
    },
  },
  {
    id: 4,
    nombre: 'Apple iPad 11" Wi-Fi 128GB',
    precio: 1449,
    idCategoria: 2,
    specs: {
      Almacenamiento: '128 GB',
      Conectividad: 'Wi-Fi',
      Pantalla: '11"',
      Marca: 'Apple',
    },
  },
  {
    id: 5,
    nombre: 'Samsung Galaxy Tab S9 FE 128GB',
    precio: 1599,
    idCategoria: 2,
    specs: {
      Almacenamiento: '128 GB',
      Conectividad: 'Wi-Fi',
      Pantalla: '10.9"',
      Marca: 'Samsung',
    },
  },
  {
    id: 6,
    nombre: 'Monitor Gamer LG UltraGear 27"',
    precio: 999,
    idCategoria: 3,
    specs: {
      Panel: 'IPS',
      Resolución: '2560 x 1440',
      Frecuencia: '165Hz',
      'Tiempo de respuesta': '1ms',
      Marca: 'LG',
    },
  },
  {
    id: 7,
    nombre: 'Monitor Samsung Odyssey G5 27"',
    precio: 1099,
    idCategoria: 3,
    specs: {
      Panel: 'VA',
      Resolución: '2560 x 1440',
      Frecuencia: '144Hz',
      'Tiempo de respuesta': '1ms',
      Marca: 'Samsung',
    },
  },
  {
    id: 8,
    nombre: 'Consola PlayStation 5 Fat 825GB',
    precio: 3219,
    idCategoria: 4,
    specs: {
      Almacenamiento: '825 GB',
      Lector: 'Blu-ray',
      Marca: 'Sony',
    },
  },
  {
    id: 9,
    nombre: 'PlayStation 5 Slim 1TB + Astro Bot',
    precio: 2499,
    idCategoria: 4,
    specs: {
      Almacenamiento: '1 TB',
      Lector: 'Blu-ray',
      Incluye: 'Astro Bot',
      Marca: 'Sony',
    },
  },
  {
    id: 10,
    nombre: 'Audífonos Logitech G733 RGB',
    precio: 429,
    idCategoria: 5,
    specs: {
      Conectividad: 'Inalámbrico Lightspeed',
      Iluminación: 'RGB',
      Marca: 'Logitech',
    },
  },
  {
    id: 11,
    nombre: 'Audífonos HyperX Cloud III Wireless',
    precio: 549,
    idCategoria: 5,
    specs: {
      Conectividad: 'Inalámbrico 2.4 GHz',
      Iluminación: 'No',
      Marca: 'HyperX',
    },
  },
];

module.exports = { categorias, productos };
