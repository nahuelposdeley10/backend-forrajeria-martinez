import { Router } from 'express'
import {
  listProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
  brandsList,
  productFacets,
} from '../controllers/product.controller.js'
import { protect, restrictTo } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  idParamSchema,
  productBulkSchema,
  productFacetsQuerySchema,
  productQuerySchema,
  productSchema,
} from '../validators/index.js'

const router = Router()

router.get('/', validate(productQuerySchema, 'query'), listProducts)
router.get('/facets', validate(productFacetsQuerySchema, 'query'), productFacets)
router.get('/brands', brandsList)
router.get('/slug/:slug', getProductBySlug)
router.get('/:id', validate(idParamSchema, 'params'), getProduct)

router.post('/bulk', protect, restrictTo('admin', 'staff'), validate(productBulkSchema), bulkCreateProducts)
router.post('/', protect, restrictTo('admin', 'staff'), validate(productSchema), createProduct)
router.patch('/:id', protect, restrictTo('admin', 'staff'), validate(idParamSchema, 'params'), validate(productSchema.partial()), updateProduct)
router.delete('/:id', protect, restrictTo('admin'), validate(idParamSchema, 'params'), deleteProduct)

export default router