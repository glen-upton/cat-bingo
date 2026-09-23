import { BingoBoard } from '../models/BingoBoard';
import { BingoCell } from '../models/BingoCell';

export class GameStorage {
  private readonly storageKey: string;

  constructor(storageKey = 'generic-bingo-state-v1') {
    this.storageKey = storageKey;
  }

  public load(): BingoBoard | null {
    const rawValue = localStorage.getItem(this.storageKey);

    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as { board?: BingoCell[] };

      if (!Array.isArray(parsed.board) || parsed.board.length !== BingoBoard.SIZE * BingoBoard.SIZE) {
        return null;
      }

      return BingoBoard.fromSerialized(parsed.board);
    } catch {
      return null;
    }
  }

  public save(board: BingoBoard): void {
    localStorage.setItem(this.storageKey, JSON.stringify({ board: board.cells }));
  }

  public clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
