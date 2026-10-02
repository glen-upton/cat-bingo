import { PLACEHOLDER_CAT_IMAGE, SAMPLE_ITEMS } from '../consts/sampleItems';
import { BingoBoard } from '../models/BingoBoard';
import { BingoCell } from '../models/BingoCell';
import { BingoOption } from '../models/BingoOption';

interface StoredGameState {
  board?: BingoCell[];
  options?: BingoOption[];
}

export class GameStorage {
  private readonly storageKey: string;
  private readonly legacyOptionStorageKey: string;

  constructor(storageKey = 'generic-bingo-state-v1', optionStorageKey = 'generic-bingo-options-v1') {
    this.storageKey = storageKey;
    this.legacyOptionStorageKey = optionStorageKey;
  }

  public load(): BingoBoard | null {
    const board = this.readStoredState().board;

    if (!Array.isArray(board) || board.length !== BingoBoard.SIZE * BingoBoard.SIZE) {
      return null;
    }

    return BingoBoard.fromSerialized(board);
  }

  public save(board: BingoBoard): void {
    const state = this.readStoredState();
    state.board = board.cells;
    this.writeStoredState(state);
  }

  public loadOptions(): BingoOption[] {
    const savedOptions = this.readStoredState().options;

    if (!Array.isArray(savedOptions)) {
      return SAMPLE_ITEMS.map((item) => ({ ...item, visible: item.visible !== false }));
    }

    const validSavedOptions = savedOptions.filter((option) =>
      option && typeof option.id === 'string' && typeof option.title === 'string' && typeof option.imageSrc === 'string',
    );
    const savedById = new Map(validSavedOptions.map((option) => [option.id, option]));
    const sampleIds = new Set(SAMPLE_ITEMS.map((item) => item.id));
    const sampleOptions = SAMPLE_ITEMS.map((item) => {
      const savedOption = savedById.get(item.id);
      return { ...item, visible: savedOption ? savedOption.visible !== false : item.visible !== false };
    });
    const customOptions = validSavedOptions
      .filter((option) => !sampleIds.has(option.id))
      .map((option) => ({
        ...option,
        imageSrc: PLACEHOLDER_CAT_IMAGE,
        visible: option.visible !== false,
      }));

    return [...sampleOptions, ...customOptions];
  }

  public saveOptions(options: BingoOption[]): void {
    const state = this.readStoredState();
    state.options = options;
    this.writeStoredState(state);
  }

  public getVisibleOptions(): BingoOption[] {
    const options = this.loadOptions();
    const visibleOptions = options.filter((item) => item.visible !== false);

    if (visibleOptions.length >= 24) {
      return visibleOptions;
    }

    return options.map((item) => ({ ...item, visible: true }));
  }

  public clear(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.legacyOptionStorageKey);
  }

  private readStoredState(): StoredGameState {
    const rawState = localStorage.getItem(this.storageKey);
    let state: StoredGameState = {};

    if (rawState) {
      try {
        const parsed = JSON.parse(rawState) as StoredGameState;
        if (Array.isArray(parsed.board)) {
          state.board = parsed.board;
        }
        if (Array.isArray(parsed.options)) {
          state.options = parsed.options;
        }
      } catch {
        state = {};
      }
    }

    const legacyOptions = localStorage.getItem(this.legacyOptionStorageKey);
    let shouldMigrate = false;

    if (legacyOptions !== null) {
      if (Array.isArray(state.options)) {
        shouldMigrate = true;
      } else {
        try {
          const parsedOptions = JSON.parse(legacyOptions) as BingoOption[];
          if (Array.isArray(parsedOptions)) {
            state.options = parsedOptions;
            shouldMigrate = true;
          }
        } catch {
          shouldMigrate = false;
        }
      }
    }

    if (shouldMigrate) {
      this.writeStoredState(state);
    }

    return state;
  }

  private writeStoredState(state: StoredGameState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
    if (this.legacyOptionStorageKey !== this.storageKey) {
      localStorage.removeItem(this.legacyOptionStorageKey);
    }
  }
}
