import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadImageBuffer } from '../utils/cloudinary.js'

export const uploadImage = asyncHandler(async (req, res) => {
  const file = req.file
  if (!file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' })
  }

  const result = await uploadImageBuffer(file.buffer)

  res.status(201).json({ url: result.url, ...result })
})