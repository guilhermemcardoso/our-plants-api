import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

export const complaintSchema = new Schema({
  _id: ObjectId,
  description: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, required: true },
  plant_id: { type: ObjectId, ref: 'Plant', required: true },
  created_by: { type: String, required: true },
  evaluator_ids: { type: [String], required: false },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
})

export default mongoose.model('Complaint', complaintSchema, 'complaints')
