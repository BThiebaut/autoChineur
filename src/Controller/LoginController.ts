import Server from "../Server";
import express, { Express, Request, Response} from 'express';
import BaseController from "./BaseController";
import {User} from "../../prisma/prisma";
import jwt from "jsonwebtoken"
import pug from "pug"

export default class LoginController extends BaseController
{
    constructor() {
        super();
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
                await this.sendAuthMail(user);
            }

            res.render('login', {
                title: 'Login',
                message: "Si cette adresse existe, un lien de connexion vous a été envoyé"
            })
        });
    }

    private async sendAuthMail(user: User): Promise<boolean>
    {
        const payload = {
            email: user.email,
            id: user.id,
        };
        const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
        const url = `${Server.http.protocol}://${Server.http.host}/login?token=${token}`;
        const content = pug.render('mails/loginMail.pug', {
           url: url
        });
        const res = await Server.sendMail("Connexion token", user.email, content);
        if (res){
            return true;
        }
        return false;
    }

}