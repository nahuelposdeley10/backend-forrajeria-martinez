import app from './app.js'
import { connectDB } from './config/db.js'

export default function handler(req, res) {
  connectDB()
    .then(() => app(req, res))
    .catch((err) => {
      console.error('[api] No se pudo conectar a MongoDB:', err.message)
      res.status(503).json({
        error: 'No se pudo conectar a la base de datos. Verificá MONGODB_URI y el acceso de red en Atlas.',
      })
    })
}