import type { Message } from '~/types/message'

export function useWebsocket() {
  const newMessage = ref<Message | null>(null)

  function onNewMessage(message: Message) {
    newMessage.value = message
  }

  if (import.meta.client) {
    const { $socket } = useNuxtApp()

    $socket.on('new-message', onNewMessage)

    onBeforeUnmount(() => {
      $socket.off('new-message', onNewMessage)
    })
  }

  return { newMessage }
}
