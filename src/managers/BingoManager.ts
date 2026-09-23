import { SAMPLE_ITEMS } from '../consts/sampleItems';
import { BingoBoard } from '../models/BingoBoard';
import { GameStorage } from '../storage/GameStorage';
import { BingoDetailModal } from '../ui/BingoDetailModal';
import { NewGameConfirmationModal } from '../ui/NewGameConfirmationModal';

export class BingoManager {
  private readonly gameStorage: GameStorage;
  private readonly boardElement: HTMLDivElement;
  private readonly bingoOverlayElement: HTMLElement;
  private readonly detailModal: BingoDetailModal;
  private readonly boardNewGameButton: HTMLButtonElement;
  private readonly newGameConfirmationModal: NewGameConfirmationModal;
  private board: BingoBoard;

  constructor({
    boardElement,
    bingoOverlayElement,
    detailModal,
    boardNewGameButton,
    newGameConfirmationModal,
  }: {
    boardElement: HTMLDivElement;
    bingoOverlayElement: HTMLElement;
    detailModal: BingoDetailModal;
    boardNewGameButton: HTMLButtonElement;
    newGameConfirmationModal: NewGameConfirmationModal;
  }) {
    this.gameStorage = new GameStorage();
    this.boardElement = boardElement;
    this.bingoOverlayElement = bingoOverlayElement;
    this.detailModal = detailModal;
    this.boardNewGameButton = boardNewGameButton;
    this.newGameConfirmationModal = newGameConfirmationModal;
    this.board = BingoBoard.createFromItems(SAMPLE_ITEMS);
  }

  public initialize(): void {
    this.board = this.loadBoard();
    this.bindEvents();
    this.render();
  }

  public handleCellToggle(cellId: string): void {
    const hadBingoBeforeToggle = this.board.hasBingo();
    this.board.toggleCell(cellId);
    this.gameStorage.save(this.board);
    this.render();

    if (!hadBingoBeforeToggle && this.board.hasBingo()) {
      this.showBingoOverlay();
    }
  }

  public startNewGame(): void {
    this.boardElement.classList.add('is-refreshing');

    window.setTimeout(() => {
      this.board = BingoBoard.createFromItems(SAMPLE_ITEMS);
      this.gameStorage.save(this.board);
      this.render();
      requestAnimationFrame(() => this.boardElement.classList.remove('is-refreshing'));
    }, 180);
  }

  private requestNewGame(): void {
    if (this.board.hasBingo()) {
      this.startNewGame();
      return;
    }

    this.newGameConfirmationModal.open();
  }

  public openCellDetails(cellId: string): void {
    const cell = this.board.cells.find((candidate) => candidate.id === cellId);

    if (!cell) {
      return;
    }

    this.detailModal.open(cell);
  }

  private bindEvents(): void {
    this.detailModal.initialize((cellId) => this.handleCellToggle(cellId));
    this.newGameConfirmationModal.initialize(() => this.startNewGame());
    this.boardNewGameButton.addEventListener('click', () => this.requestNewGame());
  }

  private showBingoOverlay(): void {
    this.bingoOverlayElement.classList.remove('is-visible');
    void this.bingoOverlayElement.offsetWidth;
    this.bingoOverlayElement.classList.add('is-visible');

    window.setTimeout(() => this.bingoOverlayElement.classList.remove('is-visible'), 3200);
  }

  private loadBoard(): BingoBoard {
    return this.gameStorage.load() ?? BingoBoard.createFromItems(SAMPLE_ITEMS);
  }

  private render(): void {
    this.boardElement.innerHTML = '';

    this.board.cells.forEach((cell) => {
      const cellButton = document.createElement('button');
      cellButton.type = 'button';
      cellButton.className = `cell ${cell.marked ? 'marked' : ''} ${cell.isFree ? 'free' : ''}`;
      const cellLabel = document.createElement('span');
      cellLabel.className = 'cell-label';
      cellLabel.textContent = cell.text;
      cellButton.appendChild(cellLabel);
      cellButton.title = cell.text;
      cellButton.setAttribute('aria-label', `${cell.text} ${cell.marked ? 'selected' : 'not selected'}`);
      cellButton.setAttribute('aria-pressed', String(cell.marked));

      if (!cell.isFree) {
        cellButton.addEventListener('click', () => this.openCellDetails(cell.id));
      }

      this.boardElement.appendChild(cellButton);
    });
  }
}
