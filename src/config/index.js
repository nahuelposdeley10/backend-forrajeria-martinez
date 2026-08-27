import 'dotenv/config'

const env = process.env

export const config = {
  port: Number(env.PORT || 5000),
  nodeEnv: env.NODE_ENV || 'development',
  isProd: env.NODE_ENV === 'production',

  mongo: {
    uri: env.MONGODB_URI,
    dbName: env.DB_NAME || 'forrajeria_martinez',
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN || '7d',
  },

  publicUrl: env.PUBLIC_URL || 'http://localhost:5000',
  corsOrigins: (env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: env.CLOUDINARY_API_KEY || '',
    apiSecret: env.CLOUDINARY_API_SECRET || '',
    folder: env.CLOUDINARY_FOLDER || 'forrajeria-martinez',
  },

  rateLimit: {
    windowMs: Number(env.RATE_LIMIT_WINDOW_MS || 900000),
    max: Number(env.RATE_LIMIT_MAX || 300),
  },
}