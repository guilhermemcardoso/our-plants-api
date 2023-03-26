export function removeForbiddenUserFields(item) {
  const user = { ...item }
  delete user._id
  delete user.email
  delete user.score
  delete user.created_at
  delete user.updated_at
  delete user.confirmed_email
  delete user.password
  delete user.profile_image
  delete user.completed_profile

  return user
}
