import { Router } from 'express'
import { getStats } from '../controllers/stats.controller.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()

router.use(protect, restrictTo('admin', 'staff'))

router.get('/', getStats)

export default router