import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { PDFDocument, PDFPage } from 'pdf-lib';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';

type CardPage = { imageUrls: string[] };

const POINTS_PER_INCH = 72;
const LETTER_PAGE_WIDTH = 8.5 * POINTS_PER_INCH;
const LETTER_PAGE_HEIGHT = 11 * POINTS_PER_INCH;
const CARD_WIDTH = 2.5 * POINTS_PER_INCH;
const CARD_HEIGHT = 3.5 * POINTS_PER_INCH;
const PAGE_VERTICAL_MARGIN = (LETTER_PAGE_HEIGHT - (3 * CARD_HEIGHT)) / 4;
const PAGE_HORIZONTAL_MARGIN = (LETTER_PAGE_WIDTH - (3 * CARD_WIDTH)) / 4;
const COL_WIDTH = LETTER_PAGE_WIDTH / 3;
const ROW_HEIGHT = LETTER_PAGE_HEIGHT / 3;

@Component({
  selector: 'lib-card-printer',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatGridListModule,
    CommonModule,
  ],
  templateUrl: 'card-printer.html',
  styleUrls: ['card-printer.scss'],
})
export class CardPrinterComponent {
  files: File[] = [];
  pages = signal<CardPage[]>([]);
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.files.push(...input.files);
      this.updateImageUrls();
    }
  }

  async updateImageUrls(): Promise<void> {
    const pages: CardPage[] = [];
    let currentFileIndex = 0;
    for (const file of this.files) {
      const url = await this.readFileAsDataURL(file);
      if (currentFileIndex % 9 === 0) {
        pages.push({ imageUrls: [] });
      }
      const currentPage = pages[pages.length - 1];
      currentPage.imageUrls.push(url);
      currentFileIndex++;
    }
    this.pages.set(pages);
  }

  removeImage(pageIndex: number, imageIndex: number): void {
    const globalIndex = pageIndex * 9 + imageIndex;
    this.files.splice(globalIndex, 1);
    this.updateImageUrls();
  }

  readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }


  async createPdf(): Promise<void> {
    const pdf = await PDFDocument.create();
    let currentFileIndex = 0;
    let page!: PDFPage;
    for (const file of this.files) {
      if (currentFileIndex % 9 === 0) {
        page = pdf.addPage([LETTER_PAGE_WIDTH, LETTER_PAGE_HEIGHT]);
      }
      currentFileIndex++;

      const fileBytes = await file.arrayBuffer();

      const embeddedImage = file.type.includes('png') ? await pdf.embedPng(fileBytes) : await pdf.embedJpg(fileBytes);
      const currentRow = Math.floor((currentFileIndex - 1) / 3) % 3;
      const currentCol = (currentFileIndex - 1) % 3;
      const x = PAGE_HORIZONTAL_MARGIN + currentCol * COL_WIDTH;
      const y = PAGE_VERTICAL_MARGIN + (2 - currentRow) * ROW_HEIGHT;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      });
    }
    const pdfBytes = await pdf.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}
