export const JwtTokenType = {
  EMAIL_CONFIRMATION: 'EMAIL_CONFIRMATION',
  ACCESS: 'ACCESS',
  PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
  REFRESH: 'REFRESH',
}

export const TimeValues = {
  ONE_HOUR: 3600,
  TWO_HOURS: 7200,
  ONE_DAY: 86400,
  SEVEN_DAYS: 604800,
  THIRTY_DAYS: 2592000,
  THREE_MONTHS: 7776000,
}

export const ExpirationTime = {
  [JwtTokenType.ACCESS]: TimeValues.THIRTY_DAYS,
  [JwtTokenType.EMAIL_CONFIRMATION]: TimeValues.ONE_HOUR,
  [JwtTokenType.PASSWORD_RECOVERY]: TimeValues.ONE_HOUR,
  [JwtTokenType.REFRESH]: TimeValues.THREE_MONTHS,
}
