import 'dotenv/config'
import { connectDB, disconnectDB } from '../src/config/db.js'
import { User } from '../src/models/User.js'

const [email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_PASSWORD] = process.argv.slice(2)

async function main() {
  if (!email || !password) {
    console.error('Uso: npm run create-admin -- <email> <password>')
    console.error('  (o definí ADMIN_EMAIL y ADMIN_PASSWORD en el .env)')
    process.exit(1)
  }

  await connectDB()

  const exists = await User.findOne({ email })
  if (exists) {
    console.error(`[admin] Ya existe un usuario con email ${email}`)
    await disconnectDB()
    process.exit(1)
  }

  const user = await User.create({ name: 'Administrador', email, password, role: 'admin' })
  console.log(`[admin] Usuario admin creado: ${user.toPublicJSON().email}`)
  await disconnectDB()
}

main().catch(async (err) => {
  console.error('[admin] Error:', err.message)
  await disconnectDB()
  process.exit(1)
})