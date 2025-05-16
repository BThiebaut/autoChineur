import Server from "../Server";
import express, {Express, NextFunction, Request, Response} from 'express';
import BaseController from "./BaseController";
import MailService from "../Services/MailService";
import passport from "passport";

export default class LoginController extends BaseController
{
    private mailService: MailService;

    constructor(mailService: MailService) {
        super();
        this.mailService = mailService;
    }
    public register() {


        Server.app.get('/login', (req: Request, res: Response) => {

            const token = req.query.token ?? null;
            if (token !== null){
                passport.authenticate('local-jwt', { failureRedirect: '/login', failureMessage: "Token is not valid" })
            }

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

        Server.app.get('/jwt-login', passport.authenticate('local-jwt', { failureRedirect: '/login', failureMessage: "Token is not valid" }), (req: Request, res: Response) => {
           res.redirect('/home');
        });

        Server.app.get('/logout', (req: Request, res: Response, next: NextFunction) => {
            req.logout((err) => {
               if (err) return next(err);
               res.redirect('/login');
            });
        });
    }



}