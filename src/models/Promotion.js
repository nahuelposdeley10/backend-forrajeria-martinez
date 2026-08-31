import { Schema, model } from 'mongoose'

const promotionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'El título de la promoción es obligatorio'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    whatsappMessage: {
      type: String,
      default: '',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
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

promotionSchema.index({ active: 1, sortOrder: 1 })

export const Promotion = model('Promotion', promotionSchema)
