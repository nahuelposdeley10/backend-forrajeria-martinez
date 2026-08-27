import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

import { config } from './config/index.js'
import apiRoutes from './routes/index.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
)
app.use(compression())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.resolve(__dirname, '../public')))

if (!config.isProd) {
  app.use(morgan('dev'))
}

app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Intentalo más tarde.' },
  })
)

app.get('/', (req, res) =>
  res.json({
    name: 'Forrajería Martínez API',
    docs: '/api/health',
    version: '1.0.0',
  })
)

app.use('/api', apiRoutes)

app.use(notFound)
app.use(errorHandler)

export default app