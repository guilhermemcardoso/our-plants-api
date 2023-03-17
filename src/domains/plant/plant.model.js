import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

export const plantSchema = new Schema({
  _id: ObjectId,
  description: { type: String, required: false },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  images: { type: [String], required: false },
  created_by: { type: String, required: true },
  specie_id: { type: ObjectId, ref: 'Specie', required: true },
  status: {
    type: String,
    enum: ['active', 'deleted', 'reported'],
    required: true,
    default: 'active'
  },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
})

plantSchema.index({ location: '2dsphere' })

export default mongoose.model('Plant', plantSchema, 'plants')
