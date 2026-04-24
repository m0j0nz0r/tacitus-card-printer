import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardPrinterComponent } from 'card-printer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CardPrinterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('test-app');
}
