import passport from "passport";
import { Express, Request, Response, NextFunction } from "express";
import {PrismaClient} from "../../prisma/prisma";
import JwtStrategy from 'passport-jwt';

declare global {
    namespace Express {
        interface User {
            email: string;
            id: number;
        }
    }
}

export function initPassport(app: Express) {
    app.use(passport.initialize());
    app.use(passport.authenticate('session'));

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
                id : id as number,
            }
        });

        await prisma.$disconnect();
        done(null, user);
    });

}

export function isAuthenticated(req: Request, res: Response, next: NextFunction){
    if(req.user)
        return next();
    else
        res.redirect("/login");
}

export function isLocalDev(req: Request, res: Response, next: NextFunction){
    if (req.headers.host.indexOf('localhost') > -1){
        return next();
    }
    res.redirect("/login");
}