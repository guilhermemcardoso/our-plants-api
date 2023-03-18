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
  created_by: { type: ObjectId, required: true, ref: 'User' },
  specie_id: { type: ObjectId, ref: 'Specie', required: true },
  reported: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  editable: { type: Boolean, default: true },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
})

plantSchema.index({ location: '2dsphere' })

export default mongoose.model('Plant', plantSchema)
