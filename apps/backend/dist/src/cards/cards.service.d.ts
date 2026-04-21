import { PrismaService } from '../prisma/prisma.service';
export declare class CardsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        number: string;
        id: number;
        name: string;
        rarity: string | null;
        externalId: string | null;
        setName: string;
        imageUrl: string | null;
        imageSmallUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
