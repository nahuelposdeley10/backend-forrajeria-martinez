import 'dotenv/config'
import { connectDB, disconnectDB } from '../src/config/db.js'
import { Product } from '../src/models/Product.js'

async function main() {
  await connectDB()

  const DEMO = {
    name: 'Alimento Royal Canin Perro Mini Adult 8+ - 3 Kg',
    brand: 'Royal Canin',
    category: 'perros',
    price: 43200,
    stock: 24,
    featured: true,
    active: true,
    image: '/products/royalcanin.jpg',
    description:
      'Alimento para perros seniors de talla pequeña (hasta 10 kg), de 8 a 12 años de edad. Royal Canin Mini Adult 8+ aporta un contenido adaptado de nutrientes que ayudan a mantener la vitalidad frente a los primeros signos del envejecimiento.',
    benefits: [
      'Contribuye a mantener la vitalidad.',
      'Ayuda a mantener un peso saludable.',
      'Satisface apetitos caprichosos.',
      'Neutraliza los radicales libres con su complejo antioxidante.',
    ],
    ingredients: [
      'Arroz, maíz, harina de subproductos de pollo, harina de gluten de maíz, proteína vegetal purificada L.I.P. (gluten de trigo), grasas vacuna, aceite de pollo, hidrolizado de hígado de pollo, pulpa de remolacha, sales minerales, aceite de soja, aceite de pescado, levadura de cerveza, vitaminas, oligoelementos, fructo-oligosacáridos (FOS), L-lisina, taurina, DL-metionina.',
      'Vitaminas: vitamina A, vitamina D3, vitamina E, vitamina C, pantotenato de calcio, niacina, vitamina B1, vitamina B2, vitamina B6, ácido fólico, biotina, vitamina B12, colina.',
      'Oligoelementos: sulfato de hierro, óxido de zinc, óxido de manganeso, sulfato de cobre, iodato de calcio, selenio orgánico.',
    ],
    specifications: [
      { label: 'Tamaño de mascota', value: 'Mini' },
      { label: 'Línea', value: 'Súper Premium' },
      { label: 'Edad', value: 'Adulto Senior' },
      { label: 'Sabor', value: 'Pollo' },
      { label: 'Raza', value: 'Todas las razas' },
      { label: 'Presentación', value: '3 Kg' },
    ],
  }

  const existing = await Product.findOne({ name: DEMO.name })
  if (existing) {
    await existing.updateOne(DEMO)
    console.log(`[seed] Producto de ejemplo actualizado: ${existing.name}`)
  } else {
    const created = await Product.create(DEMO)
    console.log(`[seed] Producto de ejemplo creado: ${created.name}`)
  }

  await disconnectDB()
}

main().catch(async (err) => {
  console.error('[seed] Error:', err.message)
  await disconnectDB()
  process.exit(1)
})
