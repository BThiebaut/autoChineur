import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {User} from "../../prisma/prisma";
import Server from "../Server";
import jwt from "jsonwebtoken"
import pug from "pug"

export default class MailService {
    private mailer: nodemailer.Transporter;

    constructor() {

        const transportOptions: SMTPTransport.Options = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: true,
            auth : {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        }

        this.mailer = nodemailer.createTransport(transportOptions);
    }

    public async sendMail(subject: string, to: string, content: string): Promise<any>
    {
        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.MAIL_SENDER,
            to: to,
            subject: subject,
            html: content
        };
        let result = null;
        try {
            result = await this.mailer.sendMail(mailOptions);
        }catch(e){
            console.error("Sending mail error: ", e);
            return false;
        }

        return result;
    }

    public async sendAuthMail(user: User): Promise<boolean>
    {
        const payload = {
            email: user.email,
            id: user.id,
        };
        const mailService = new MailService();
        const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
        const url = `${Server.http.protocol}://${Server.http.host}/login?token=${token}`;
        const content = pug.renderFile( __dirname + '/../Views/mails/loginMail.pug', {
            url: url
        });
        const res = await mailService.sendMail("Connexion token", user.email, content);
        return !!res;
    }
}