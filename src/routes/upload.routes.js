import { Router } from 'express'
import { protect, restrictTo } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { uploadImage } from '../controllers/upload.controller.js'

const router = Router()

router.post('/', protect, restrictTo('admin', 'staff'), upload.single('image'), uploadImage)

export default router