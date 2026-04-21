import { Card } from '@prisma/client';
import { CardsService } from './cards.service';
export declare class CardsController {
    private readonly cardsService;
    constructor(cardsService: CardsService);
    getCards(): Promise<Card[]>;
}
