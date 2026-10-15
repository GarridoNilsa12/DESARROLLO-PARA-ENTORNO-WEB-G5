import { Chat } from './chat';

describe('Chat', () => {
  it('responde según la palabra clave del cliente', () => {
    const chat = new Chat();
    expect(chat.getBotResponse('Hola')).toContain('Bienvenido a Coolbox');
    expect(chat.getBotResponse('¿Hacen envíos?')).toContain('envíos a nivel nacional');
    expect(chat.getBotResponse('quiero saber de la garantía')).toContain('garantía');
    expect(chat.getBotResponse('xyz')).toContain('no encontré información');
  });

  it('ignora mensajes vacíos y agrega mensaje y respuesta del asistente', () => {
    vi.useFakeTimers();
    const chat = new Chat();
    const inicial = chat.messages.length;

    chat.messageText = '   ';
    chat.sendMsg();
    expect(chat.messages.length).toBe(inicial);

    chat.messageText = 'laptop';
    chat.sendMsg();
    expect(chat.typing).toBe(true);
    expect(chat.messages.at(-1)?.who).toBe('user');

    vi.advanceTimersByTime(900);
    expect(chat.typing).toBe(false);
    expect(chat.messages.at(-1)?.who).toBe('bot');
    expect(chat.messages.at(-1)?.text).toContain('laptops');
    vi.useRealTimers();
  });
});
