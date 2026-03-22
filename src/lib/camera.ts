const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.8

export async function compressImage(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image is too large (max 20 MB)')
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Unsupported format — use JPEG, PNG, or WebP')
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)

    let { width, height } = img
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width >= height) {
        height = Math.round((height / width) * MAX_DIMENSION)
        width = MAX_DIMENSION
      } else {
        width = Math.round((width / height) * MAX_DIMENSION)
        height = MAX_DIMENSION
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context unavailable')
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY)
    const dataUrl = await blobToDataUrl(blob)
    return dataUrl.replace(/^data:image\/jpeg;base64,/, '')
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function openCamera(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.setAttribute('accept', 'image/*')
    input.setAttribute('capture', 'environment')
    input.style.cssText =
      'position:fixed;top:-100px;left:-100px;width:1px;height:1px;opacity:0;pointer-events:none;'

    let settled = false

    const cleanup = () => {
      try {
        if (input.parentNode) input.parentNode.removeChild(input)
      } catch {
        // already removed
      }
    }

    input.addEventListener(
      'change',
      () => {
        settled = true
        cleanup()
        const file = input.files?.[0]
        if (file) resolve(file)
        else reject(new Error('No image selected'))
      },
      { once: true },
    )

    // 'cancel' event — Chrome 113+, Safari 17.4+, Firefox 91+
    input.addEventListener(
      'cancel',
      () => {
        if (settled) return
        settled = true
        cleanup()
        reject(new Error('cancelled'))
      },
      { once: true },
    )

    // Fallback: window regains focus without a file selection (older browsers / iOS)
    const onWindowFocus = () => {
      setTimeout(() => {
        if (settled) return
        settled = true
        cleanup()
        reject(new Error('cancelled'))
      }, 500)
    }
    window.addEventListener('focus', onWindowFocus, { once: true })

    document.body.appendChild(input)
    input.click()
  })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to compress image'))
      },
      type,
      quality,
    )
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read image data'))
    reader.readAsDataURL(blob)
  })
}
