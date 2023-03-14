import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

export const userSchema = new Schema({
  _id: ObjectId,
  name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile_image_url: { type: String, required: false },
  bio: { type: String, required: false },
  address: {
    street_name: { type: String, required: false },
    neighbourhood: { type: String, required: false },
    zip_code: { type: String, required: false },
    house_number: { type: String, required: false },
    city: { type: String, required: false },
    state_or_province: { type: String, required: false },
    country: { type: String, required: false },
  },
  score: {
    xp: { type: Number, required: true, default: 0 },
    role: { type: String, required: true, default: 'novice' },
    level: { type: Number, required: true, default: 1 },
  },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  confirmed_email: { type: Boolean, required: true, default: false },
})

export default mongoose.model('User', userSchema, 'users')
