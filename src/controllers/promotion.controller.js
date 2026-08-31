import { Promotion } from '../models/Promotion.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listPromotions = asyncHandler(async (req, res) => {
  const { active = 'true' } = req.query
  const filter = active === 'all' ? {} : { active: active === 'true' }

  const promotions = await Promotion.find(filter)
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean()

  res.json({ promotions: promotions.map(toDTO) })
})

export const createPromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.create(req.body)
  res.status(201).json({ promotion: toDTO(promotion) })
})

export const updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id)
  if (!promotion) throw new ApiError(404, 'La promoción no existe.')

  Object.assign(promotion, req.body)
  await promotion.save()

  res.json({ promotion: toDTO(promotion) })
})

export const deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id)
  if (!promotion) throw new ApiError(404, 'La promoción no existe.')

  await promotion.deleteOne()
  res.json({ ok: true })
})

function toDTO(p) {
  return {
    id: p.id,
    title: p.title,
    image: p.image,
    description: p.description,
    whatsappMessage: p.whatsappMessage,
    active: p.active,
    sortOrder: p.sortOrder,
  }
}
