import { Controller, Get } from '@nestjs/common';
import { Card } from '@prisma/client';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  getCards(): Promise<Card[]> {
    return this.cardsService.findAll();
  }
}
