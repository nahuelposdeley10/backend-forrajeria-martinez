import { Router } from 'express'
import {
  register,
  login,
  me,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/auth.controller.js'
import { protect, restrictTo } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { idParamSchema, loginSchema, registerSchema, updateUserSchema } from '../validators/index.js'

const router = Router()

router.post('/login', validate(loginSchema), login)

router.post('/register', protect, restrictTo('admin'), validate(registerSchema), register)

router.get('/me', protect, me)

router.use(protect, restrictTo('admin'))
router.get('/users', getUsers)
router.patch('/users/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), updateUser)
router.delete('/users/:id', validate(idParamSchema, 'params'), deleteUser)

export default router