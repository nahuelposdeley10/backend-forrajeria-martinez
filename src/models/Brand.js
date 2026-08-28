import { Schema, model } from 'mongoose'
import { slugify } from '../utils/slugify.js'

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la marca es obligatorio'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
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

brandSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name)
  }
  next()
})

export const Brand = model('Brand', brandSchema)
