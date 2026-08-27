import { Router } from 'express'
import authRoutes from './auth.routes.js'
import productRoutes from './product.routes.js'
import statsRoutes from './stats.routes.js'
import uploadRoutes from './upload.routes.js'

const router = Router()

router.get('/health', (req, res) =>
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
)

router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/stats', statsRoutes)
router.use('/upload', uploadRoutes)

export default router