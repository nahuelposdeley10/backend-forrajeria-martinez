import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { deleteImage, publicIdFromUrl } from '../utils/cloudinary.js'

export const listBrands = asyncHandler(async (req, res) => {
  const rows = await Product.find({ brand: { $ne: '' } }).select('brand').lean()

  const counts = new Map()
  for (const r of rows) {
    counts.set(r.brand, (counts.get(r.brand) || 0) + 1)
  }

  const brands = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  res.json({ brands })
})

export const createBrand = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim()
  if (!name) throw new ApiError(400, 'El nombre de la marca es obligatorio.')

  res.status(201).json({ brand: { name, count: 0 } })
})

export const renameBrand = asyncHandler(async (req, res) => {
  const oldName = decodeURIComponent(req.params.name)
  const newName = (req.body.name || '').trim()

  if (!newName) throw new ApiError(400, 'El nuevo nombre de la marca es obligatorio.')
  if (oldName === newName) throw new ApiError(400, 'La marca ya tiene ese nombre.')

  const count = await Product.countDocuments({ brand: oldName })
  if (count === 0) throw new ApiError(404, `La marca "${oldName}" no existe.`)

  await Product.updateMany({ brand: oldName }, { $set: { brand: newName } })

  res.json({ brand: { name: newName, count }, renamed: count })
})

export const deleteBrand = asyncHandler(async (req, res) => {
  const name = decodeURIComponent(req.params.name)
  const { products } = req.query

  const count = await Product.countDocuments({ brand: name })
  if (count === 0) throw new ApiError(404, `La marca "${name}" no existe.`)

  if (products === 'delete') {
    const toDelete = await Product.find({ brand: name }).select('image')
    await Promise.all(
      toDelete
        .map((p) => publicIdFromUrl(p.image))
        .filter(Boolean)
        .map((pid) => deleteImage(pid))
    )
    await Product.deleteMany({ brand: name })
    return res.json({ removed: 'products', deleted: count })
  }

  await Product.updateMany({ brand: name }, { $set: { brand: '' } })
  res.json({ removed: 'brand', updated: count })
})
