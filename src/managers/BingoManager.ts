import { createElement, PawPrint } from 'lucide';
import { BingoBoard } from '../models/BingoBoard';
import { GameStorage } from '../storage/GameStorage';
import { BingoDetailModal } from '../ui/BingoDetailModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';

export class BingoManager {
  private readonly gameStorage: GameStorage;
  private readonly boardElement: HTMLDivElement;
  private readonly bingoOverlayElement: HTMLElement;
  private readonly detailModal: BingoDetailModal;
  private readonly boardNewGameButton: HTMLButtonElement;
  private readonly newGameConfirmationModal: ConfirmationModal;
  private board: BingoBoard;

  constructor({
    gameStorage,
    boardElement,
    bingoOverlayElement,
    detailModal,
    boardNewGameButton,
    newGameConfirmationModal,
  }: {
    gameStorage: GameStorage;
    boardElement: HTMLDivElement;
    bingoOverlayElement: HTMLElement;
    detailModal: BingoDetailModal;
    boardNewGameButton: HTMLButtonElement;
    newGameConfirmationModal: ConfirmationModal;
  }) {
    this.gameStorage = gameStorage;
    this.boardElement = boardElement;
    this.bingoOverlayElement = bingoOverlayElement;
    this.detailModal = detailModal;
    this.boardNewGameButton = boardNewGameButton;
    this.newGameConfirmationModal = newGameConfirmationModal;
    this.board = BingoBoard.createFromItems(this.gameStorage.getVisibleOptions());
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
      const visibleOptions = this.gameStorage.getVisibleOptions();
      this.board = BingoBoard.createFromItems(visibleOptions);
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
    const savedBoard = this.gameStorage.load();
    if (savedBoard) {
      return savedBoard;
    }

    return BingoBoard.createFromItems(this.gameStorage.getVisibleOptions());
  }

  private render(): void {
    this.boardElement.innerHTML = '';

    this.board.cells.forEach((cell) => {
      const cellElement = cell.isFree ? document.createElement('div') : document.createElement('button');
      cellElement.className = `cell ${cell.marked ? 'marked' : ''} ${cell.isFree ? 'free' : ''}`;
      if (cell.isFree) {
        const freeIcon = createElement(PawPrint, { 'aria-hidden': 'true' });
        freeIcon.classList.add('free-cell-icon');
        cellElement.appendChild(freeIcon);
        cellElement.setAttribute('role', 'img');
        cellElement.setAttribute('aria-label', 'Free space');
        cellElement.title = 'Free space';
      } else {
        const cellButton = cellElement as HTMLButtonElement;
        cellButton.type = 'button';
        const cellLabel = document.createElement('span');
        cellLabel.className = 'cell-label';
        cellLabel.textContent = cell.text;
        cellButton.appendChild(cellLabel);
        cellButton.title = cell.text;
        cellButton.setAttribute('aria-label', `${cell.text} ${cell.marked ? 'selected' : 'not selected'}`);
        cellButton.setAttribute('aria-pressed', String(cell.marked));
        cellButton.addEventListener('click', () => this.openCellDetails(cell.id));
      }

      this.boardElement.appendChild(cellElement);
    });
  }
}
