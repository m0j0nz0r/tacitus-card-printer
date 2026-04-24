import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPrinter } from './card-printer';

describe('CardPrinter', () => {
  let component: CardPrinter;
  let fixture: ComponentFixture<CardPrinter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPrinter],
    }).compileComponents();

    fixture = TestBed.createComponent(CardPrinter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
