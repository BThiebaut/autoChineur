import BaseController from "./BaseController";
import MailService from "../Services/MailService";
import Server from "../Server";
import { Request, Response} from 'express';
import {isAuthenticated, isLocalDev} from "../Security/passport.mw";
import jwt from "jsonwebtoken"
import pug from "pug";

export default class TestController extends BaseController
{
    private mailService: MailService;

    constructor(mailService: MailService) {
        super();
        this.mailService = mailService;
    }
    public register() {
        Server.app.get('/test/mail', isLocalDev, (req: Request, res: Response) => {
            const url = `${Server.http.protocol}://${Server.http.host}/login?token=<token>`;
            const content = pug.renderFile( __dirname + '/../Views/mails/loginMail.pug', {
                url: url
            });
            console.log(content);
            res.send('Show console for debug results');
        });

        Server.app.get('/test/token/:mail', isLocalDev, async (req: Request, res: Response) => {
            const prisma = await this.getPrisma();
            const user = await prisma.user.findUnique({
                where: { email: req.params.mail },
            });

            if (!user){
                throw Error('User not found');
            }

            const payload = {
                email: user.email,
                id: user.id,
            };

            const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
            const url = `${Server.http.protocol}://${Server.http.host}/jwt-login?token=${token}`;
            const content = pug.renderFile( __dirname + '/../Views/mails/loginMail.pug', {
                url: url
            });
            res.send(content);
        });



    }
}