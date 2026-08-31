import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { deleteImage, publicIdFromUrl } from '../utils/cloudinary.js'
import { slugify } from '../utils/slugify.js'
import {
  BREED_DEFS,
  BREED_PATTERNS,
  SIZE_PATTERNS,
  SIZE_TAGS,
  STAGE_PATTERNS,
  STAGE_TAGS,
} from '../utils/filters.js'

function buildQuery(q) {
  const and = []

  if (q.category) and.push({ category: q.category })
  if (q.brand) and.push({ brand: q.brand })
  if (q.foodType) and.push({ foodType: q.foodType })
  if (q.active === 'true') and.push({ active: true })
  if (q.active === 'false') and.push({ active: false })
  if (q.featured === 'true') and.push({ featured: true })
  if (q.featured === 'false') and.push({ featured: false })
  if (q.stage && STAGE_PATTERNS[q.stage]) {
    and.push({ name: { $regex: STAGE_PATTERNS[q.stage], $options: 'i' } })
  }
  if (q.size && SIZE_PATTERNS[q.size]) {
    and.push({ name: { $regex: SIZE_PATTERNS[q.size], $options: 'i' } })
  }
  if (q.breed && BREED_PATTERNS[q.breed]) {
    and.push({ name: { $regex: BREED_PATTERNS[q.breed], $options: 'i' } })
  }
  if (q.minPrice !== undefined) and.push({ price: { $gte: q.minPrice } })
  if (q.maxPrice !== undefined) and.push({ price: { $lte: q.maxPrice } })
  if (q.search) {
    and.push({
      $or: [
        { name: { $regex: q.search, $options: 'i' } },
        { brand: { $regex: q.search, $options: 'i' } },
        { description: { $regex: q.search, $options: 'i' } },
      ],
    })
  }

  if (and.length === 1) return and[0]
  if (and.length > 1) return { $and: and }
  return {}
}

export const listProducts = asyncHandler(async (req, res) => {
  const page = req.query.page ?? 1
  const limit = req.query.limit ?? 30

  const filter = buildQuery(req.query)
  const sort = req.query.sort ? { [req.query.sort.replace('-', '')]: req.query.sort.startsWith('-') ? -1 : 1 } : { createdAt: -1 }

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ])

  res.json({
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    products,
  })
})

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, 'Producto no encontrado.')
  res.json({ product })
})

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
  if (!product) throw new ApiError(404, 'Producto no encontrado.')
  res.json({ product })
})

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json({ product })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params
  const product = await Product.findById(id)
  if (!product) throw new ApiError(404, 'Producto no encontrado.')

  const { slug, ...data } = req.body
  if (data.name && data.name !== product.name) {
    data.slug = slugify(data.name)
  }

  Object.assign(product, data)
  await product.save()
  res.json({ product })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params
  const product = await Product.findById(id)
  if (!product) throw new ApiError(404, 'Producto no encontrado.')

  await deleteImage(publicIdFromUrl(product.image))
  await product.deleteOne()
  res.status(204).end()
})

export const bulkCreateProducts = asyncHandler(async (req, res) => {
  const { products, overwrite } = req.body

  if (overwrite) {
    await Product.deleteMany({})
  }

  const slugs = new Set()
  const docs = products.map((p) => {
    let slug = slugify(p.name)
    let i = 2
    while (slugs.has(slug)) {
      slug = `${slugify(p.name)}-${i}`
      i += 1
    }
    slugs.add(slug)
    return { ...p, slug }
  })

  const inserted = await Product.insertMany(docs)
  res.status(201).json({ inserted: inserted.length, products: inserted })
})

export const brandsList = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand', { brand: { $ne: '' } }).sort()
  res.json({ brands })
})

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export const productFacets = asyncHandler(async (req, res) => {
  const scope = {}
  if (req.query.active !== 'all') scope.active = true
  if (req.query.category) scope.category = req.query.category

  const rows = await Product.find(scope).select('name brand category foodType').lean()

  const categories = new Map()
  const brands = new Map()
  const foodTypes = new Map()
  for (const r of rows) {
    categories.set(r.category, (categories.get(r.category) || 0) + 1)
    if (r.brand) brands.set(r.brand, (brands.get(r.brand) || 0) + 1)
    if (r.foodType) foodTypes.set(r.foodType, (foodTypes.get(r.foodType) || 0) + 1)
  }

  const breeds = []
  for (const def of BREED_DEFS) {
    let count = 0
    for (const r of rows) {
      if (def.re.test(r.name)) count += 1
    }
    if (count > 0) breeds.push({ key: def.key, label: def.label, count })
  }

  res.json({
    total: rows.length,
    categories: [...categories.entries()].map(([key, count]) => ({
      key,
      label: capitalize(key),
      count,
    })),
    brands: [...brands.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    foodTypes: [...foodTypes.entries()].map(([key, count]) => ({
      key,
      label: key === 'seco' ? 'Seco' : 'Húmedo',
      count,
    })),
    stages: STAGE_TAGS.map(({ key, label }) => ({ key, label })),
    sizes: SIZE_TAGS.map(({ key, label }) => ({ key, label })),
    breeds,
  })
})