import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'No autorizado. Token requerido.')
  }

  let payload
  try {
    payload = jwt.verify(header.slice(7), config.jwt.secret)
  } catch {
    throw new ApiError(401, 'Token inválido o expirado.')
  }

  const user = await User.findById(payload.id)
  if (!user || !user.active) {
    throw new ApiError(401, 'Usuario inexistente o inactivo.')
  }

  req.user = user
  next()
})

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'No tenés permisos para esta acción.'))
  }
  next()
}