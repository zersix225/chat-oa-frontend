import type { MessageType } from '~/types/enums/message-type.enum'
import type { StoredFile } from '~/types/file'

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

/**
 * Same list for LINE and Facebook (keep in sync with backend src/files/file-types.ts).
 * On LINE, images are sent as images and other files as a download link,
 * because LINE bots can't send documents.
 */
export const ACCEPTED_FILES = [
  '.jpg,.jpeg,.png,.gif,.webp',
  '.mp4,.mov,.webm',
  '.mp3,.m4a,.aac,.wav,.ogg',
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip'
].join(',')

export function isAcceptedFile(file: File, accept: string): boolean {
  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
  return accept.split(',').includes(ext)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}


export function messageLogText(msg: { messageType?: MessageType | null, content?: string | null, file?: StoredFile | null }): string {
  const type = msg.messageType ?? 'text'
  if (type === 'text') return msg.content ?? ''
  if (type === 'sticker') return '😊 Sticker'

  const name = msg.content || (msg.file ? getFileName(msg.file.path) : '')
  if (type === 'file') return name || 'File'
  return name
}
