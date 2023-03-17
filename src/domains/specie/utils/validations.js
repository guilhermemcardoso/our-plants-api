export function removeForbiddenSpecieFields(item) {
  const specie = { ...item }
  delete specie._id
  delete specie.created_at
  delete specie.updated_at
  delete specie.created_by
  delete specie.deleted
  delete specie.editable

  return specie
}
