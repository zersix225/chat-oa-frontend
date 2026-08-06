import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  const socket = io('http://localhost:80')

  return {
    provide: { socket }
  }
})
