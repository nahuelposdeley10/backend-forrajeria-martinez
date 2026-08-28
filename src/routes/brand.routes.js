import { Router } from 'express'
import {
  listBrands,
  createBrand,
  renameBrand,
  deleteBrand,
} from '../controllers/brand.controller.js'
import { protect, restrictTo } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { brandSchema, brandDeleteQuerySchema, brandQuerySchema } from '../validators/index.js'

const router = Router()

router.get('/', validate(brandQuerySchema, 'query'), listBrands)

router.post('/', protect, restrictTo('admin', 'staff'), validate(brandSchema), createBrand)
router.patch('/:name', protect, restrictTo('admin', 'staff'), validate(brandSchema), renameBrand)
router.delete(
  '/:name',
  protect,
  restrictTo('admin'),
  validate(brandDeleteQuerySchema, 'query'),
  deleteBrand
)

export default router
