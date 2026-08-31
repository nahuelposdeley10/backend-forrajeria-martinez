import { Router } from 'express'
import {
  listPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../controllers/promotion.controller.js'
import { protect, restrictTo } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  promotionSchema,
  promotionQuerySchema,
  idParamSchema,
} from '../validators/index.js'

const router = Router()

router.get('/', validate(promotionQuerySchema, 'query'), listPromotions)

router.post('/', protect, restrictTo('admin', 'staff'), validate(promotionSchema), createPromotion)
router.patch(
  '/:id',
  protect,
  restrictTo('admin', 'staff'),
  validate(idParamSchema, 'params'),
  validate(promotionSchema),
  updatePromotion
)
router.delete(
  '/:id',
  protect,
  restrictTo('admin'),
  validate(idParamSchema, 'params'),
  deletePromotion
)

export default router
