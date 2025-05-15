import { existsSync, mkdirSync } from 'node:fs';
import { Buffer } from 'buffer'
import * as dotenv from 'dotenv'
dotenv.config();

export default class Utils
{
    public static btoa(payload){
        return Buffer.from(payload).toString('base64');
    }

    public static atob(bstring){
        return Buffer.from(bstring, 'base64').toString('utf8');
    }

    public static satanize(input) {
        return input.replace(/[^A-z0-9_:\-àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ.]/g, '');
    }

    public static defined(variable) {
        return typeof variable !== typeof void(0);
    }

    public static mkdir(path) {
        if (!existsSync(path)){
            mkdirSync(path, { recursive: true });
        }
    }

}
