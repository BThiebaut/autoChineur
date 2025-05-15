import { PrismaClient } from '../../prisma/prisma'
export default abstract class BaseController
{

    protected prisma: PrismaClient = null;
    protected isPrismaConnected: boolean = false;

    public register(): void {
        throw new Error("Controllers must implements public register method");
    }

    protected async getPrisma(): Promise<PrismaClient>
    {
        if (this.prisma === null){
            this.prisma = new PrismaClient();
            await this.prisma.$connect();
            this.isPrismaConnected = true;
        }

        return this.prisma;
    }

    public async destroy(): Promise<void>
    {
        if (this.prisma !== null && this.isPrismaConnected){
            await this.prisma.$disconnect();
        }
    }

}