import { ApiError } from '../utils/ApiError.js'
import { config } from '../config/index.js'

export function notFound(req, res, next) {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.details && { details: err.details }),
    })
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ error: 'Datos inválidos', details })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID inválido' })
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos.' })
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message })
  }

  console.error('[error]', err)
  if (!config.isProd) {
    return res.status(500).json({ error: err.message })
  }
  res.status(500).json({ error: 'Error interno del servidor.' })
}