import express, {NextFunction, Request, Response} from 'express';
import Utils from "./Utils/Utils";
import path from "path";
import passport from "passport";
import JwtStrategy from 'passport-jwt';
import { PrismaClient } from '../prisma/prisma'
import bodyParser from "body-parser";
import flash from 'express-flash';
import BaseController from "./Controller/BaseController";
import { ControllerInterface } from "./Controller/Interfaces/ControllerInterface"
import nodemailer from "nodemailer"
import http from "http"
import https from "https"
import SMTPTransport from "nodemailer/lib/smtp-transport";

export default class Server
{
    public static app: express.Application;
    public static httpServer;
    public static httpsServer;
    public static user = null;
    public static mailer: nodemailer.Transporter;
    public static http = {
        host : null,
        protocol: null
    };

    protected static noUserUri = ['/login', '/resetpw', '/favicon'];

    private static controllers: ControllerInterface[] = [];

    /**
     * Configure the application routing and security
     * @param app
     */
    public static configure(app: express.Application): void
    {
        Server.app = app;
        Server.app.use((req: Request, res: Response, next: NextFunction) => {

            let noUserPage = false;
            for(let page of Server.noUserUri){
                if (req.url.indexOf(page) > -1){
                    noUserPage = true;
                    break;
                }
            }

            if (Utils.defined((req as any).user) && !noUserPage){
                Server.user = (req as any).user;
            }else {
                Server.user = null;
            }

            Server.http.host = req.headers.host;
            Server.http.protocol = req.protocol;
            next();
        });

        Server.app.set('views', __dirname + "/Views");
        Server.app.set('view engine', 'pug');
        Server.app.use(express.static(__dirname + "/Resources/css"));
        Server.app.use(express.static(__dirname + "/Resources/lib"));
        Server.app.use(express.static(__dirname + "/Resources/fonts"));
        Server.app.use(bodyParser.json());
        Server.app.use(express.urlencoded({ extended: true }));
        Server.app.use(passport.initialize());
        Server.app.use(passport.session());
        Server.app.use(flash());

        Server.app.use((req: Request, res: Response, next: NextFunction) => {
           req.on('end', async () => {
               for(let controller of Server.controllers){
                   if (controller instanceof BaseController){
                       await controller.destroy();
                   }
               }
           });
           next();
        });

        passport.use('local-jwt', new JwtStrategy.Strategy({
            secretOrKey : process.env.TOKEN_SECRET,
            jwtFromRequest : (req) => {
                return req.params.token;
            }
        }, async (data, done) => {
            const prisma = new PrismaClient();
            await prisma.$connect();

            const user = await prisma.user.findUnique({
                where: {
                    id : data.id,
                }
            });
            if (!user){
                return done(null, false, { message : 'Invalid token, login again to refresh' });
            }

            await prisma.$disconnect();
            return done(null, user);
        }));

        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id, done) => {
            const prisma = new PrismaClient();
            await prisma.$connect();

            const user = await prisma.user.findUnique({
                where: {
                    id : id,
                }
            });

            await prisma.$disconnect();
            done(null, user);
        });

        const transportOptions: SMTPTransport.Options = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: true,
            auth : {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        }

        Server.mailer = nodemailer.createTransport(transportOptions);

    }

    public static async sendMail(subject: string, to: string, content: string): Promise<any>
    {
        if (!Utils.defined(Server.mailer)){
            throw new Error("You need to call configure method first");
        }

        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.MAIL_SENDER,
            to: to,
            subject: subject,
            html: content
        };
        let result = null;
        try {
            result = await Server.mailer.sendMail(mailOptions);
        }catch(e){
            console.error("Sending mail error: ", e);
            return false;
        }

        return result;
    }

    /**
     * Register a new controller in the routing queue
     * @param controller
     */
    public static addController(controller: ControllerInterface): void
    {
        Server.controllers.push(controller);
    }

    /**
     * Start the server
     */
    public static listen()
    {

         Server.app.listen(process.env.PORT, () => {
            return console.log(`Express is listening at http://localhost:${process.env.PORT}`);
        });

        Server.app.get('/', (req, res) => {
            if (Server.user === null){
                res.redirect('/login');
            }else {
                res.redirect('/home');
            }
        });

        for(let controller of Server.controllers){
            controller.register();
        }



    }

}