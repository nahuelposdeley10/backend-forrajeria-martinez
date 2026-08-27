import app from './app.js'
import { config } from './config/index.js'
import { connectDB, disconnectDB } from './config/db.js'

async function start() {
  try {
    await connectDB()
    const server = app.listen(config.port, () => {
      console.log(`[server] API escuchando en http://localhost:${config.port}`)
    })

    const shutdown = async (signal) => {
      console.log(`\n[server] Señal ${signal} recibida, cerrando...`)
      server.close(async () => {
        await disconnectDB()
        process.exit(0)
      })
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
  } catch (err) {
    console.error('[server] Error al iniciar:', err.message)
    process.exit(1)
  }
}

start()