import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

describe('CardsController', () => {
  let cardsController: CardsController;

  const cardsService = {
    findAll: jest.fn().mockResolvedValue([
      {
        id: 1,
        externalId: 'base1-4',
        name: 'Charizard',
        setName: 'Base Set',
        number: '4',
        rarity: 'Rare Holo',
        imageUrl: 'https://example.com/large.png',
        imageSmallUrl: 'https://example.com/small.png',
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [{ provide: CardsService, useValue: cardsService }],
    }).compile();

    cardsController = module.get<CardsController>(CardsController);
  });

  it('returns cards from service', async () => {
    await expect(cardsController.getCards()).resolves.toHaveLength(1);
  });
});
