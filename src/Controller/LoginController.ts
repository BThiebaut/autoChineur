import Server from "../Server";
import express, { Express, Request, Response} from 'express';
import BaseController from "./BaseController";
import MailService from "../Services/MailService";

export default class LoginController extends BaseController
{
    private mailService: MailService;

    constructor(mailService: MailService) {
        super();
        this.mailService = mailService;
    }
    public register() {

        Server.app.get('/login', (req: Request, res: Response) => {
            res.render('login', {
                title: 'Login',
                message: false
            });
        });

        Server.app.post('/login', async (req: Request, res: Response) => {
            const prisma = await this.getPrisma();
            const user = await prisma.user.findUnique({
                where : {
                    email : req.body.email
                }
            })
            if (user) {
                await this.mailService.sendAuthMail(user);
            }

            res.render('login', {
                title: 'Login',
                message: "Si cette adresse existe, un lien de connexion vous a été envoyé"
            })
        });
    }



}