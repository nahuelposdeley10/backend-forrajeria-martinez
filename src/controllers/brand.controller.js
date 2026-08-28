import { Brand } from '../models/Brand.js'
import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { deleteImage, publicIdFromUrl } from '../utils/cloudinary.js'
import { slugify } from '../utils/slugify.js'

async function withCounts(brands) {
  const rows = await Product.find({ brand: { $ne: '' } }).select('brand').lean()

  const counts = new Map()
  for (const r of rows) {
    counts.set(r.brand, (counts.get(r.brand) || 0) + 1)
  }

  return brands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    active: b.active,
    count: counts.get(b.name) || 0,
  }))
}

export const listBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find().sort({ name: 1 }).lean()
  res.json({ brands: await withCounts(brands) })
})

export const createBrand = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim()
  if (!name) throw new ApiError(400, 'El nombre de la marca es obligatorio.')

  const exists = await Brand.findOne({ name })
  if (exists) throw new ApiError(400, `La marca "${name}" ya existe.`)

  const brand = await Brand.create({ name })

  const [withCounts] = await withCounts([brand])
  res.status(201).json({ brand: withCounts })
})

export const renameBrand = asyncHandler(async (req, res) => {
  const oldName = decodeURIComponent(req.params.name)
  const newName = (req.body.name || '').trim()

  if (!newName) throw new ApiError(400, 'El nuevo nombre de la marca es obligatorio.')
  if (oldName === newName) throw new ApiError(400, 'La marca ya tiene ese nombre.')

  const brand = await Brand.findOne({ name: oldName })
  if (!brand) throw new ApiError(404, `La marca "${oldName}" no existe.`)

  const dup = await Brand.findOne({ name: newName })
  if (dup && dup.id !== brand.id) {
    throw new ApiError(400, `La marca "${newName}" ya existe.`)
  }

  let slug = slugify(newName)
  let probe = slug
  let i = 2
  while (await Brand.findOne({ slug: probe, _id: { $ne: brand._id } })) {
    probe = `${slug}-${i}`
    i += 1
  }

  brand.name = newName
  brand.slug = probe
  await brand.save()

  const products = await Product.updateMany({ brand: oldName }, { $set: { brand: newName } })

  const [withCount] = await withCounts([brand])
  res.json({ brand: withCount, updated: products.modifiedCount })
})

export const deleteBrand = asyncHandler(async (req, res) => {
  const name = decodeURIComponent(req.params.name)
  const { products } = req.query

  const brand = await Brand.findOne({ name })
  if (!brand) throw new ApiError(404, `La marca "${name}" no existe.`)

  const count = await Product.countDocuments({ brand: name })

  if (products === 'delete') {
    const toDelete = await Product.find({ brand: name }).select('image')
    await Promise.all(
      toDelete
        .map((p) => publicIdFromUrl(p.image))
        .filter(Boolean)
        .map((pid) => deleteImage(pid))
    )
    await Product.deleteMany({ brand: name })
    await brand.deleteOne()
    return res.json({ removed: 'products', deleted: count })
  }

  await Product.updateMany({ brand: name }, { $set: { brand: '' } })
  await brand.deleteOne()
  res.json({ removed: 'brand', updated: count })
})
