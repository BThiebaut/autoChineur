import BaseController from "./BaseController";
import MailService from "../Services/MailService";
import Server from "../Server";
import { Request, Response} from 'express';
import {isAuthenticated, isLocalDev} from "../Security/passport.mw";
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
    }
}