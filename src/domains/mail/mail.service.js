import path from 'path'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'
import handlebars from 'handlebars'
import { readTemplate } from './utils.js'
import { EmailTemplates } from './constants.js'
import { generateJwt, JwtTokenType } from '../../services/jwt.js'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

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
      created_at: new Date(),
    }

    const token = await generateJwt({
      payload: confirmEmailPayload,
      type: JwtTokenType.EMAIL_CONFIRMATION,
      cachedValue: user.email,
    })

    const url = `${process.env.MAIL_LINK_URL}/email-confirmation/${token}`

    const emailTemplateSource = readTemplate(EmailTemplates.EMAIL_CONFIRMATION)

    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({
      name: user.name,
      url,
    })
    const data = {
      from: 'Nossas Plantas',
      to: user.email,
      subject: 'Nossas Plantas - Confirmação de email',
      html: htmlToSend,
      attachments: [
        {
          filename: 'nossas_plantas_logo.png',
          path: __dirname + '/assets/nossas_plantas_logo.png',
          cid: 'logo',
        },
      ],
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

  static async sendPasswordRecovery(user) {
    const transporter = this.getInstance()

    const passwordRecoveryPayload = {
      sub: user.email,
      email: user.email,
      created_at: new Date(),
    }

    const token = await generateJwt({
      payload: passwordRecoveryPayload,
      type: JwtTokenType.PASSWORD_RECOVERY,
      cachedValue: user.email,
    })

    const url = `${process.env.MAIL_LINK_URL}/password-recovery/${token}`
    const emailTemplateSource = readTemplate(EmailTemplates.PASSWORD_RECOVERY)

    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({
      name: user.name,
      url,
    })
    const data = {
      from: 'Nossas Plantas',
      to: user.email,
      subject:
        'Nossas Plantas - Alteração de senha',
      html: htmlToSend,
      attachments: [
        {
          filename: 'nossas_plantas_logo.png',
          path: __dirname + '/assets/nossas_plantas_logo.png',
          cid: 'logo',
        },
      ],
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

  static async sendTestMail(templateName = 'confirmation', email) {
    const transporter = this.getInstance()

    const url =
      templateName === 'confirmation'
        ? `${process.env.MAIL_LINK_URL}/email-confirmation/TOKEN1234`
        : `${process.env.MAIL_LINK_URL}/password-recovery/TOKEN1234`

    const emailTemplateSource =
      templateName === 'confirmation'
        ? readTemplate(EmailTemplates.EMAIL_CONFIRMATION)
        : readTemplate(EmailTemplates.PASSWORD_RECOVERY)

    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({
      name: 'John Doe',
      url,
    })
    const data = {
      from: 'Nossas Plantas',
      to: email,
      subject: templateName === 'confirmation' ? 'Nossas Plantas - Confirmação de email' : 'Nossas Plantas - Alteração de senha',
      html: htmlToSend,
      attachments: [
        {
          filename: 'nossas_plantas_logo.png',
          path: __dirname + '/assets/nossas_plantas_logo.png',
          cid: 'logo',
        },
      ],
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
