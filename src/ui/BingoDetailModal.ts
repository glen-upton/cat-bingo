import { BingoCell } from '../models/BingoCell';

export class BingoDetailModal {
  private readonly modalElement: HTMLElement;
  private readonly titleElement: HTMLElement;
  private readonly imageElement: HTMLImageElement;
  private readonly toggleButton: HTMLButtonElement;
  private readonly backdropElement: HTMLElement;
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

  public open(cell: BingoCell): void {
    if (this.closeTimer !== null) {
      window.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }

    this.currentCell = cell;
    this.titleElement.textContent = cell.text;
    this.imageElement.src = cell.imageSrc;
    this.imageElement.alt = cell.text;
    this.modalElement.classList.remove('hidden');
    this.modalElement.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => this.modalElement.classList.add('is-visible'));

    if (cell.isFree) {
      this.toggleButton.hidden = true;
      return;
    }

    this.toggleButton.hidden = false;
    this.toggleButton.textContent = cell.marked ? 'Unmark As Seen' : 'Mark As Seen';
    this.toggleButton.classList.toggle('is-undo', cell.marked);
    this.toggleButton.classList.toggle('is-complete', !cell.marked);
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
