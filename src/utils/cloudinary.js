import { v2 as cloudinary } from 'cloudinary'
import { config } from '../config/index.js'
import { ApiError } from './ApiError.js'

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
})

const isConfigured = () =>
  Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret)

export function uploadImageBuffer(buffer, { folder = config.cloudinary.folder, publicId } = {}) {
  if (!isConfigured()) {
    return Promise.reject(
      new ApiError(500, 'Cloudinary no está configurado. Completá las credenciales en el .env.')
    )
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(new ApiError(500, `Error al subir imagen: ${error.message}`))
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        })
      }
    )
    stream.end(buffer)
  })
}

export async function deleteImage(publicId) {
  if (!publicId || publicId.includes('//')) return
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
  } catch (err) {
    console.error('[cloudinary] Error al eliminar imagen:', err.message)
  }
}

export function publicIdFromUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return null
  const match = url.match(/\/upload\/(?:v\d+\/)?(?:([^/]+)\/)?([^/]+)\.[a-z0-9]+$/i)
  if (!match) return null
  return match[1] ? `${match[1]}/${match[2]}` : match[2]
}