import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Message {
  text: string;
  who: 'user' | 'bot';
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {

  messageText = '';

  typing = false;

  messages: Message[] = [
    {
      text: '¡Hola! Soy el asistente virtual de Coolbox 👋',
      who: 'bot'
    },
    {
      text: 'Puedo ayudarte con productos, stock, envíos, pagos, garantías, pedidos y tiendas físicas.',
      who: 'bot'
    }
  ];

  sendMsg(): void {
    const text = this.messageText.trim();

    if (!text) {
      return;
    }

    this.addMsg(text, 'user');
    this.messageText = '';
    this.typing = true;

    setTimeout(() => {
      this.typing = false;
      this.addMsg(this.getBotResponse(text), 'bot');
    }, 900);
  }

  addMsg(text: string, who: 'user' | 'bot'): void {
    this.messages.push({
      text,
      who
    });
  }

  getBotResponse(userMessage: string): string {

    const text = userMessage.toLowerCase();

    // Saludos
    if (
      text.includes('hola') ||
      text.includes('buenas') ||
      text.includes('buenos dias') ||
      text.includes('buenas tardes') ||
      text.includes('hey') ||
      text.includes('saludos')
    ) {
      return '¡Hola! 👋 Bienvenido a Coolbox. ¿En qué puedo ayudarte hoy?';
    }

    // Celulares
    if (
      text.includes('celular') ||
      text.includes('celulares') ||
      text.includes('iphone') ||
      text.includes('samsung') ||
      text.includes('xiaomi') ||
      text.includes('motorola') ||
      text.includes('smartphone')
    ) {
      return '📱 En Coolbox contamos con celulares Samsung, Xiaomi, Apple, Motorola y más. ¿Qué marca te interesa?';
    }

    // Laptops
    if (
      text.includes('laptop') ||
      text.includes('laptops') ||
      text.includes('notebook') ||
      text.includes('computadora') ||
      text.includes('portatil')
    ) {
      return '💻 Tenemos laptops para estudio, trabajo y gaming de marcas reconocidas.';
    }

    // Audífonos
    if (
      text.includes('audifonos') ||
      text.includes('audífonos') ||
      text.includes('headphones') ||
      text.includes('auriculares')
    ) {
      return '🎧 Contamos con audífonos inalámbricos y con cable de diferentes marcas.';
    }

    // Smartwatch
    if (
      text.includes('smartwatch') ||
      text.includes('reloj') ||
      text.includes('watch')
    ) {
      return '⌚ Disponemos de smartwatches para deporte, salud y uso diario.';
    }

    // Stock
    if (
      text.includes('stock') ||
      text.includes('disponible') ||
      text.includes('hay') ||
      text.includes('existencia')
    ) {
      return '✅ La disponibilidad puede variar según la tienda y el producto seleccionado.';
    }

    // Envíos
    if (
      text.includes('envio') ||
      text.includes('envíos') ||
      text.includes('envio a domicilio') ||
      text.includes('delivery') ||
      text.includes('entrega')
    ) {
      return '🚚 Realizamos envíos a nivel nacional. El tiempo de entrega depende de tu ubicación.';
    }

    // Garantía
    if (
      text.includes('garantia') ||
      text.includes('garantía')
    ) {
      return '✅ Todos nuestros productos cuentan con garantía según las políticas del fabricante.';
    }

    // Pagos
    if (
      text.includes('pago') ||
      text.includes('pagar') ||
      text.includes('tarjeta') ||
      text.includes('visa') ||
      text.includes('mastercard') ||
      text.includes('cuotas') ||
      text.includes('yape') ||
      text.includes('plin')
    ) {
      return '💳 Aceptamos tarjetas de crédito, débito y otros métodos de pago disponibles.';
    }

    // Pedido
    if (
      text.includes('pedido') ||
      text.includes('orden') ||
      text.includes('compra') ||
      text.includes('seguimiento')
    ) {
      return '📦 Puedes consultar el estado de tu pedido desde tu cuenta de Coolbox.';
    }

    // Devoluciones
    if (
      text.includes('devolucion') ||
      text.includes('devolver') ||
      text.includes('cambio') ||
      text.includes('reembolso')
    ) {
      return '🔄 Puedes solicitar cambios o devoluciones según las políticas vigentes.';
    }

    // Tiendas
    if (
      text.includes('tienda') ||
      text.includes('local') ||
      text.includes('sucursal')
    ) {
      return '🏪 Coolbox cuenta con tiendas físicas en distintas ciudades del Perú.';
    }

    // Contacto
    if (
      text.includes('asesor') ||
      text.includes('soporte') ||
      text.includes('contacto') ||
      text.includes('whatsapp')
    ) {
      return '📞 Un asesor especializado puede ayudarte con mayor detalle en tu consulta.';
    }

    // Despedida
    if (
      text.includes('gracias') ||
      text.includes('muchas gracias') ||
      text.includes('adios') ||
      text.includes('hasta luego')
    ) {
      return '😊 Gracias por visitar Coolbox. ¡Que tengas un excelente día!';
    }

    // Respuesta por defecto
    return '🤖 Lo siento, no encontré información para esa consulta. Puedes preguntarme sobre celulares, laptops, audífonos, stock, envíos, pagos, garantías, pedidos o tiendas.';
  }
}
