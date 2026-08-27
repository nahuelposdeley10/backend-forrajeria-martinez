import mongoose from 'mongoose'
import { config } from './index.js'

export async function connectDB() {
  await mongoose.connect(config.mongo.uri, {
    dbName: config.mongo.dbName,
    serverSelectionTimeoutMS: 15000,
  })
  console.log(`[db] Conectado a MongoDB → ${config.mongo.dbName}`)
}

export async function disconnectDB() {
  await mongoose.disconnect()
}