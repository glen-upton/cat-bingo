import { BingoCell } from '../models/BingoCell';
import { PLACEHOLDER_CAT_IMAGE } from '../consts/sampleItems';

export class BingoDetailModal {
  private readonly modalElement: HTMLElement;
  private readonly titleElement: HTMLElement;
  private readonly imageElement: HTMLImageElement;
  private readonly toggleButton: HTMLButtonElement;
  private readonly backdropElement: HTMLElement;
  private readonly imageLoadPromises = new Map<string, Promise<void>>();
  private currentCell: BingoCell | null = null;
  private onToggle: ((cellId: string) => void) | null = null;
  private closeTimer: number | null = null;

  constructor({
    modalElement,
    titleElement,
    imageElement,
    toggleButton,
    backdropElement,
  }: {
    modalElement: HTMLElement;
    titleElement: HTMLElement;
    imageElement: HTMLImageElement;
    toggleButton: HTMLButtonElement;
    backdropElement: HTMLElement;
  }) {
    this.modalElement = modalElement;
    this.titleElement = titleElement;
    this.imageElement = imageElement;
    this.imageElement.decoding = 'async';
    this.imageElement.loading = 'eager';
    this.toggleButton = toggleButton;
    this.backdropElement = backdropElement;
  }

  public initialize(onToggle: (cellId: string) => void): void {
    this.onToggle = onToggle;

    this.backdropElement.addEventListener('click', () => this.close());
    this.toggleButton.addEventListener('click', () => {
      if (!this.currentCell) {
        return;
      }

      this.onToggle(this.currentCell.id);
      this.close();
    });
  }

  public preloadImage(src: string): Promise<void> {
    const cached = this.imageLoadPromises.get(src);
    if (cached) {
      return cached;
    }

    const promise = new Promise<void>((resolve) => {
      const preloadImage = new Image();
      preloadImage.decoding = 'async';
      preloadImage.onload = () => resolve();
      preloadImage.onerror = () => resolve();
      preloadImage.src = src;
    });

    this.imageLoadPromises.set(src, promise);
    return promise;
  }

  public preloadImages(srcs: string[]): void {
    srcs.forEach((src) => {
      void this.preloadImage(src);
    });
  }

  public async open(cell: BingoCell): Promise<void> {
    if (this.closeTimer !== null) {
      window.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }

    this.currentCell = cell;
    this.titleElement.textContent = cell.text;
    const isCustomOption = cell.optionId.startsWith('custom-');
    const imageSrc = isCustomOption ? PLACEHOLDER_CAT_IMAGE : cell.imageSrc;
    this.imageElement.alt = cell.text;
    this.imageElement.classList.remove('hidden');
    this.imageElement.removeAttribute('src');
    this.modalElement.classList.remove('hidden');
    this.modalElement.setAttribute('aria-hidden', 'false');

    try {
      await this.preloadImage(imageSrc);
    } catch {
      // Intentionally ignore image load failures so the modal still opens.
    }

    this.imageElement.src = imageSrc;

    if (cell.isFree) {
      this.toggleButton.hidden = true;
      requestAnimationFrame(() => this.modalElement.classList.add('is-visible'));
      return;
    }

    this.toggleButton.hidden = false;
    this.toggleButton.textContent = cell.marked ? 'Unmark As Seen' : 'Mark As Seen';
    this.toggleButton.classList.toggle('is-undo', cell.marked);
    this.toggleButton.classList.toggle('is-complete', !cell.marked);
    requestAnimationFrame(() => this.modalElement.classList.add('is-visible'));
  }

  public close(): void {
    this.modalElement.classList.remove('is-visible');
    this.modalElement.setAttribute('aria-hidden', 'true');
    this.currentCell = null;
    this.closeTimer = window.setTimeout(() => {
      this.modalElement.classList.add('hidden');
      this.closeTimer = null;
    }, 220);
  }
}
