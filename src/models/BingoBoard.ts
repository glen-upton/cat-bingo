import { BingoCell } from './BingoCell';
import { BingoOption } from './BingoOption';

export class BingoBoard {
  public static readonly SIZE = 5;

  public readonly cells: BingoCell[];

  constructor(cells: BingoCell[] = []) {
    this.cells = cells;
  }

  public static createFromItems(items: BingoOption[]): BingoBoard {
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    const boardCells = Array.from({ length: BingoBoard.SIZE * BingoBoard.SIZE }, (_, index) => {
      if (index === Math.floor((BingoBoard.SIZE * BingoBoard.SIZE) / 2)) {
        return BingoCell.freeCell(index);
      }

      const item = shuffledItems[(index - (index > Math.floor((BingoBoard.SIZE * BingoBoard.SIZE) / 2) ? 1 : 0)) % shuffledItems.length];

      return new BingoCell({
        id: `cell-${index}`,
        optionId: item.id,
        text: item.title,
        imageSrc: item.imageSrc,
        marked: false,
      });
    });

    return new BingoBoard(boardCells);
  }

  public static fromSerialized(cells: BingoCell[]): BingoBoard {
    return new BingoBoard(
      cells.map((cell) => new BingoCell({
        id: cell.id,
        optionId: cell.optionId,
        text: cell.text,
        imageSrc: cell.imageSrc,
        marked: cell.marked,
        isFree: cell.isFree,
      })),
    );
  }

  public toggleCell(cellId: string): void {
    const cell = this.cells.find((candidate) => candidate.id === cellId);

    if (!cell || cell.isFree) {
      return;
    }

    cell.marked = !cell.marked;
  }

  public clearMarks(): void {
    this.cells.forEach((cell) => {
      if (cell.isFree) {
        cell.marked = true;
        return;
      }

      cell.marked = false;
    });
  }

  public hasBingo(): boolean {
    const lines: number[][] = [];

    for (let row = 0; row < BingoBoard.SIZE; row += 1) {
      lines.push(Array.from({ length: BingoBoard.SIZE }, (_, column) => row * BingoBoard.SIZE + column));
    }

    for (let column = 0; column < BingoBoard.SIZE; column += 1) {
      lines.push(Array.from({ length: BingoBoard.SIZE }, (_, row) => row * BingoBoard.SIZE + column));
    }

    lines.push(Array.from({ length: BingoBoard.SIZE }, (_, index) => index * BingoBoard.SIZE + index));
    lines.push(Array.from({ length: BingoBoard.SIZE }, (_, index) => index * BingoBoard.SIZE + (BingoBoard.SIZE - 1 - index)));

    return lines.some((line) =>
      line.every((index) => {
        const cell = this.cells[index];
        return cell && (cell.isFree || cell.marked);
      }),
    );
  }

  public render(container: HTMLDivElement, onToggle: (cellId: string) => void): void {
    container.innerHTML = '';

    this.cells.forEach((cell) => {
      const cellButton = document.createElement('button');
      cellButton.type = 'button';
      cellButton.className = `cell ${cell.marked ? 'marked' : ''} ${cell.isFree ? 'free' : ''}`;
      cellButton.textContent = cell.text;
      cellButton.setAttribute('aria-label', `${cell.text} ${cell.marked ? 'selected' : 'not selected'}`);

      if (!cell.isFree) {
        cellButton.addEventListener('click', () => {
          onToggle(cell.id);
        });
      }

      container.appendChild(cellButton);
    });
  }
}
