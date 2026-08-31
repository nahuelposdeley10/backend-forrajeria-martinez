import { z } from 'zod'
import { CATEGORIES } from '../models/Product.js'
import { BREED_KEYS, SIZE_KEYS, STAGE_KEYS } from '../utils/filters.js'

const objectId = z
  .string({ message: 'ID requerido' })
  .regex(/^[0-9a-fA-F]{24}$/, 'ID inválido')

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['admin', 'staff']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['admin', 'staff']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).optional(),
})

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  brand: z.string().optional(),
  description: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  category: z.enum(CATEGORIES, { message: 'Categoría inválida' }).optional(),
  image: z.string().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
})

export const productBulkSchema = z.object({
  products: z
    .array(productSchema)
    .min(1, 'Debés enviar al menos un producto')
    .max(500, 'Máximo 500 productos por carga'),
  overwrite: z.boolean().default(false),
})

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  stage: z.enum(STAGE_KEYS).optional(),
  size: z.enum(SIZE_KEYS).optional(),
  breed: z.enum(BREED_KEYS).optional(),
  sort: z
    .enum(['price', '-price', 'name', '-name', 'createdAt', '-createdAt', 'stock', '-stock'])
    .optional(),
  active: z.enum(['true', 'false', 'all']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
})

export const productFacetsQuerySchema = z.object({
  category: z.string().optional(),
  active: z.enum(['true', 'false', 'all']).default('true'),
})

export const idParamSchema = z.object({ id: objectId })

export const brandSchema = z.object({
  name: z.string().trim().min(1, 'El nombre de la marca es obligatorio'),
})

export const brandDeleteQuerySchema = z.object({
  products: z.enum(['delete', 'unbrand']).optional(),
})

export const brandQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
})