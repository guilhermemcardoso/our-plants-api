import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

export const specieSchema = new Schema({
  _id: ObjectId,
  popular_name: { type: String, required: true },
  scientific_name: { type: String, required: false },
  created_by: { type: ObjectId, ref:'User' },
  icon_url: { type: String, required: false },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
  editable: { type: Boolean, default: true },
})

export default mongoose.model('Specie', specieSchema)
