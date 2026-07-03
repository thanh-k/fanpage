const NOTIFICATION_WS_URL =
  'ws://localhost:8080/ws/notifications';

class NotificationSocket {

  connect(onMessage) {

    const token =
      localStorage.getItem('token');

    this.socket =
      new WebSocket(
        `${NOTIFICATION_WS_URL}?token=${token}`
      );

    this.socket.onmessage = (event) => {

      const data =
        JSON.parse(event.data);

      onMessage(data);
    };

    return this.socket;
  }

  disconnect() {

    if (this.socket) {
      this.socket.close();
    }
  }
}

export default new NotificationSocket();