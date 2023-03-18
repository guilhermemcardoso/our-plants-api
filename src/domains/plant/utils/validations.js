export function removeForbiddenPlantFields(item) {
  const plant = { ...item }
  delete plant._id
  delete plant.created_at
  delete plant.updated_at
  delete plant.created_by
  delete plant.specie_id
  delete plant.images
  delete plant.deleted
  delete plant.reported
  delete plant.editable

  return plant
}
