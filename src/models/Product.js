import { Schema, model } from 'mongoose'
import { slugify } from '../utils/slugify.js'

export const CATEGORIES = ['perros', 'gatos', 'aves', 'higiene', 'accesorios']

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    benefits: {
      type: [String],
      default: [],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    specifications: {
      type: [{ label: String, value: String }],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    category: {
      type: String,
      enum: {
        values: CATEGORIES,
        message: 'Categoría inválida',
      },
      default: 'perros',
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

productSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name)
  }
  next()
})

productSchema.index({ name: 'text', brand: 'text', description: 'text' })
productSchema.index({ category: 1, active: 1, price: 1 })

export const Product = model('Product', productSchema)