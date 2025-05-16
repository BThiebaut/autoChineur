import Server from "../Server";
import express, { Express, Request, Response} from 'express';
import BaseController from "./BaseController";
import {User} from "../../prisma/prisma";
import jwt from "jsonwebtoken"
import pug from "pug"
import {isAuthenticated} from "../Security/passport.mw";

export default class HomeController extends BaseController
{
    constructor() {
        super();
    }
    public register() {

        Server.app.get('/home', isAuthenticated, (req: Request, res: Response) => {
            res.render('home', {
                title: 'Accueil',
                message: false,
                user: req.user
            });
        });

    }

}