import { Resend } from "resend"
import { env } from "../../confiq/index.js"
import { logError, logInfo } from "../utils/helpers.js"

const resend = new Resend(env.RESEND_API_KEY)

async function sendResendEmail (to,subject,html) {
  try {
    const k = await resend.emails.send({
      from : `True Love Transformation <noreply@exponential-education.com>`,
      to : [to],
      subject,
      html
    })

    if(k.error) throw new Error(k.error.message)
    return true

  } catch (error) {
    logError(`An error occur when sending email.`, error )
    return false
  }
}

export default sendResendEmail
// sendResendEmail("hamnubulus@gmail.com","True Love Transformation","<h1>Hello</h1>")