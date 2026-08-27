import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { config } from '../config/index.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'staff' } = req.body

  const exists = await User.findOne({ email })
  if (exists) throw new ApiError(409, 'Ya existe un usuario con ese email.')

  const user = await User.create({ name, email, password, role })
  const token = signToken(user)

  res.status(201).json({ token, user: user.toPublicJSON() })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')
  if (!user) throw new ApiError(401, 'Credenciales inválidas.')

  const ok = await user.comparePassword(password)
  if (!ok) throw new ApiError(401, 'Credenciales inválidas.')

  if (!user.active) throw new ApiError(403, 'Usuario desactivado.')

  const token = signToken(user)
  res.json({ token, user: user.toPublicJSON() })
})

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublicJSON() })
})

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt')
  res.json({ count: users.length, users: users.map((u) => u.toPublicJSON()) })
})

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, role, active, password } = req.body

  const user = await User.findById(id)
  if (!user) throw new ApiError(404, 'Usuario no encontrado.')

  if (name !== undefined) user.name = name
  if (role !== undefined) user.role = role
  if (active !== undefined) user.active = active
  if (password !== undefined) user.password = password

  if (req.user.id === id && active === false) {
    throw new ApiError(400, 'No podés desactivarte a vos mismo.')
  }
  if (req.user.id === id && role !== undefined && req.user.role !== 'admin') {
    throw new ApiError(403, 'Solo un admin puede cambiar roles.')
  }

  await user.save()
  res.json({ user: user.toPublicJSON() })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  if (req.user.id === id) {
    throw new ApiError(400, 'No podés eliminar tu propio usuario.')
  }
  const user = await User.findByIdAndDelete(id)
  if (!user) throw new ApiError(404, 'Usuario no encontrado.')
  res.status(204).end()
})