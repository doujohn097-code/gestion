import { v4 as uuidv4 } from 'uuid'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function uploadFile(file, path = 'uploads') {
  if (!file) return null
  const ext = file.name.split('.').pop()
  const key = `${path}/${uuidv4()}.${ext}`

  const res = await fetch(`${API_BASE}/api/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, contentType: file.type || 'application/octet-stream' }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to get upload URL')
  }

  const { uploadUrl, publicUrl } = await res.json()

  const upload = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  })

  if (!upload.ok) {
    const text = await upload.text().catch(() => '')
    throw new Error(`Upload to Cloudflare R2 failed: ${upload.status} ${text}`)
  }

  return publicUrl
}

export function getFileType(file) {
  if (!file) return 'text'
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'file'
}
