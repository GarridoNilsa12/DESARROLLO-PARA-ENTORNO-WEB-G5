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
      text: '¡Hola! Soy el asistente de Coolbox 👋 ¿En qué producto estás interesado?',
      who: 'bot'
    }
  ];

  replies = [
    'Ese modelo tiene stock disponible en tienda y para envío a domicilio.',
    'Cuenta con 12 meses de garantía oficial Coolbox.',
    'Puedes pagar en hasta 12 cuotas sin intereses con tarjetas participantes.',
    'Te recomiendo revisar el comparador de productos para ver specs lado a lado.',
    'Un asesor especializado puede darte más detalles, ¿quieres que te derivemos por WhatsApp?'
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

      const randomIndex = Math.floor(
        Math.random() * this.replies.length
      );

      this.addMsg(this.replies[randomIndex], 'bot');
    }, 900);
  }

  addMsg(text: string, who: 'user' | 'bot'): void {
    this.messages.push({
      text,
      who
    });
  }
}