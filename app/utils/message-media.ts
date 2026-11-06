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

/** One-line text for chat lists / logs. */
export function messagePreview(msg: { messageType?: MessageType | null, content?: string | null }): string {
  switch (msg.messageType) {
    case 'image': return '📷 Photo'
    case 'video': return '🎬 Video'
    case 'audio': return '🎵 Voice message'
    case 'sticker': return '😊 Sticker'
    case 'file': return `📎 ${msg.content || 'File'}`
    default: return msg.content ?? ''
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * Text for logs/tables: the message text, or for attachments a label plus the
 * file name ("📷 Photo: shop.png"). Falls back to the stored file name when
 * the original name is unknown (older messages, customer photos).
 */
export function messageLogText(msg: { messageType?: MessageType | null, content?: string | null, file?: StoredFile | null }): string {
  const type = msg.messageType ?? 'text'
  if (type === 'text') return msg.content ?? ''
  if (type === 'sticker') return '😊 Sticker'

  const label = { image: '📷 Photo', video: '🎬 Video', audio: '🎵 Audio', file: '📎 File' }[type]
  const name = msg.content || (msg.file ? getFileName(msg.file.path) : '')
  return name ? `${label}: ${name}` : label
}
