import express from 'express';
import session from 'express-session';
import * as dotenv from 'dotenv'
import passport from "passport";
import LocalStrategy from 'passport-local';
import StoreFactory from 'better-sqlite3-session-store';
import JwtStrategy from 'passport-jwt';
import path from 'path';
import Database from 'better-sqlite3';
import Utils from "./Utils/Utils";
import Server from "./Server";
import LoginController from "./Controller/LoginController";
const SqliteStore = StoreFactory(session);

dotenv.config({ path: "../.env" });

let dbPath = path.resolve(process.env.DB_LOCATION);
Utils.mkdir(dbPath);

const sessionsDB = new Database(path.resolve(`${dbPath}/sessions.db`));
const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store : new SqliteStore({
        client: sessionsDB
    })
}));


// CONFIGS
Server.configure(app);
// -CONFIGS

// CONTROLLERS
Server.addController(new LoginController());
// -CONTROLLERS

// SERVER START
Server.listen();
// -SERVER START


