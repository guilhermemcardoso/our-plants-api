import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

export const complaintSchema = new Schema({
  _id: ObjectId,
  description: { type: String, required: true },
  reason: { type: String, required: true },
  evaluation: { type: String },
  plant_id: { type: ObjectId, ref: 'Plant', required: true },
  created_by: { type: ObjectId, ref: 'User', required: true },
  evaluator_id: { type: ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false },
  closed: { type: Boolean, default: false },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
})

export default mongoose.model('Complaint', complaintSchema)
