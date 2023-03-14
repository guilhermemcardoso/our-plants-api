import nodemailer from 'nodemailer'
import handlebars from 'handlebars'
import { readTemplate } from './utils.js'
import { EmailTemplates } from './constants.js'
import { generateJwt } from '../auth/utils/jwt.js'
import { JwtTokenType } from '../auth/constants.js'

export default class MailService {
  static getInstance() {
    if (this.instance) {
      return this.instance
    }

    return nodemailer.createTransport({
      port: 465,
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
      secure: true,
    })
  }

  static async sendUserConfirmation(user) {
    const transporter = this.getInstance()

    const confirmEmailPayload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    }

    const token = await generateJwt({
      payload: confirmEmailPayload,
      type: JwtTokenType.EMAIL_CONFIRMATION,
      cachedValue: user.email
    })

    const url = `${process.env.MAIL_LINK_URL}:${process.env.PORT}/auth/email-confirmation?token=${token}`

    const emailTemplateSource = readTemplate(EmailTemplates.EMAIL_CONFIRMATION)

    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({
      name: user.name,
      url,
    })
    const data = {
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: 'Welcome to Nice App! Confirm your Email',
      html: htmlToSend,
    }
    await new Promise((resolve, reject) => {
      transporter.sendMail(data, (err, info) => {
        if (err) {
          reject()
        }
        resolve()
      })
    })
  }

  static async sendRecoveryPassword(user) {
    const transporter = this.getInstance()

    const recoveryPasswordPayload = {
      sub: user.email,
      email: user.email,
    }

    const token = await generateJwt({
      payload: recoveryPasswordPayload,
      type: JwtTokenType.PASSWORD_RECOVERY,
      cachedValue: user.email
    })

    const url = `${process.env.MAIL_LINK_URL}:${process.env.PORT}/auth/recovery-password?token=${token}&email=${user.email}`
    const emailTemplateSource = readTemplate(EmailTemplates.PASSWORD_RECOVERY)

    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({
      name: user.name,
      url,
    })
    const data = {
      from: process.env.MAIL_FROM,
      to: user.email,
      subject:
        'Welcome to Nice App! Click on the link to access the password recovery',
      html: htmlToSend,
    }
    await new Promise((resolve, reject) => {
      transporter.sendMail(data, (err, info) => {
        if (err) {
          reject()
        }
        resolve()
      })
    })
  }
}
