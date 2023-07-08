import { io } from 'socket.io-client'

// 현재 파일은 수정하지 않고 사용만 해주세요.

const serverUrl = 'ws://front-assignment.exp.channel.io'

class Socket {
  handlers = new Set<(email) => void>()

  constructor() {
    const socket = io(`${serverUrl}/conversations`)

    socket.on('email', email => {
      this.handlers.forEach(handler => handler(email))
    })
  }

  on(handler: (email) => void) {
    this.handlers.add(handler)
  }

  off(handler: (email) => void) {
    this.handlers.delete(handler)
  }
}

export default new Socket()
