import * as readline from "readline";
import Utils from "./src/Utils/Utils";
import {PrismaClient} from "./prisma/prisma";
const prisma = new PrismaClient();
prisma.$connect();

const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const commandList = {
    addUser : addUser,
};

async function askAsync(question){
    return await new Promise(resolve => {
        reader.question(`${question}  \n`, res => {
            resolve(res);
        });
    }) ;
}

async function askCommand(){

    let list = [];

    for(let command in commandList){
        list.push(command);
    }

    reader.question(`Commande ? [${list.join(' ')}]  \n`, async res => {
        if (Utils.defined(commandList[res])) {
            return await commandList[res]();
        }
        console.log('Invalid command');
        return askCommand();
    });
}

async function addUser(){
    let email: string = "" + await askAsync('Email ?');

    if (email){
        const actual = await prisma.user.findUnique({where: {email: email}});

        if (actual) {
            console.error('User already exists');
            return;
        }
        const user = await prisma.user.create({
            data: {
                email: email
            }
        });
        if (!user){
            console.error('Error in adding user attempt');
        }else {
            console.log(`Access for ${email} added successfully`);
        }
    }

    return askCommand();
}

askCommand();