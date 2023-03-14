export function errorRes(
  res,
  errMsg = 'failed operation',
  statusCode = 500
) {
  return res.status(statusCode).json({ error: true, message: errMsg })
}

export function successRes(res, data, statusCode = 200) {
  return res.status(statusCode).json({ error: false, message: 'success', data })
}

export function errData(res, errMsg = 'failed operation') {
  return (err, data) => {
    if (err) return errorRes(res, err, errMsg)
    return successRes(res, data)
  }
}
