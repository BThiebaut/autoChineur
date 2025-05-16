import express, {NextFunction, Request, Response} from 'express';
import Utils from "./Utils/Utils";
import path from "path";
import passport from "passport";

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
            if (!Utils.defined(req.user) || req.user === null){
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