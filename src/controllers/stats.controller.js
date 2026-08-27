import { Product, CATEGORIES } from '../models/Product.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getStats = asyncHandler(async (req, res) => {
  const [productCount, activeProducts, lowStock, statsAgg] = await Promise.all([
    Product.countDocuments({}),
    Product.countDocuments({ active: true }),
    Product.countDocuments({ stock: { $gte: 0, $lte: 5 } }),
    Product.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalStock: { $sum: '$stock' },
        },
      },
    ]),
  ])

  const byCategory = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { _id: 0, category: '$_id', count: 1 } },
  ])

  const byBrand = await Product.aggregate([
    { $group: { _id: { $ifNull: ['$brand', 'Sin marca'] }, count: { $sum: 1 } } },
    { $project: { _id: 0, brand: '$_id', count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ])

  res.json({
    dashboard: {
      products: { total: productCount, active: activeProducts, lowStock },
      prices: statsAgg[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0, totalStock: 0 },
      byCategory: byCategory.map((c) => ({
        category: c.category,
        label: c.category[0]?.toUpperCase() + c.category.slice(1),
        count: c.count,
      })),
      byBrand,
      categoryList: CATEGORIES,
    },
  })
})