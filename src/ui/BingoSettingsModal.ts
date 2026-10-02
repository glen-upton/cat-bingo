import { BingoOption } from '../models/BingoOption';
import { PLACEHOLDER_CAT_IMAGE, SAMPLE_ITEMS } from '../consts/sampleItems';

export class BingoSettingsModal {
  private static readonly MIN_VISIBLE_OPTIONS = 24;
  private static readonly SCREEN_TRANSITION_DURATION_MS = 280;

  private readonly gameScreenElement: HTMLElement;
  private readonly settingsScreenElement: HTMLElement;
  private readonly backButton: HTMLButtonElement;
  private readonly countElement: HTMLElement;
  private readonly addButton: HTMLButtonElement;
  private readonly addModalElement: HTMLElement;
  private readonly addModalBackdropElement: HTMLElement;
  private readonly addFormElement: HTMLFormElement;
  private readonly optionTitleInput: HTMLInputElement;
  private readonly addOptionErrorElement: HTMLElement;
  private readonly addCancelButton: HTMLButtonElement;
  private readonly optionListElement: HTMLElement;
  private readonly errorElement: HTMLElement;
  private onOptionsChange: ((options: BingoOption[]) => void) | null = null;
  private options: BingoOption[] = [];
  private recentlyAddedOptionIds: string[] = [];
  private screenTransitionTimeout: number | null = null;

  constructor({
    gameScreenElement,
    settingsScreenElement,
    backButton,
    countElement,
    addButton,
    addModalElement,
    addModalBackdropElement,
    addFormElement,
    optionTitleInput,
    addOptionErrorElement,
    addCancelButton,
    optionListElement,
    errorElement,
  }: {
    gameScreenElement: HTMLElement;
    settingsScreenElement: HTMLElement;
    backButton: HTMLButtonElement;
    countElement: HTMLElement;
    addButton: HTMLButtonElement;
    addModalElement: HTMLElement;
    addModalBackdropElement: HTMLElement;
    addFormElement: HTMLFormElement;
    optionTitleInput: HTMLInputElement;
    addOptionErrorElement: HTMLElement;
    addCancelButton: HTMLButtonElement;
    optionListElement: HTMLElement;
    errorElement: HTMLElement;
  }) {
    this.gameScreenElement = gameScreenElement;
    this.settingsScreenElement = settingsScreenElement;
    this.backButton = backButton;
    this.countElement = countElement;
    this.addButton = addButton;
    this.addModalElement = addModalElement;
    this.addModalBackdropElement = addModalBackdropElement;
    this.addFormElement = addFormElement;
    this.optionTitleInput = optionTitleInput;
    this.addOptionErrorElement = addOptionErrorElement;
    this.addCancelButton = addCancelButton;
    this.optionListElement = optionListElement;
    this.errorElement = errorElement;
  }

  public initialize(onOptionsChange: (options: BingoOption[]) => void): void {
    this.onOptionsChange = onOptionsChange;
    this.backButton.addEventListener('click', () => this.close());
    this.addButton.addEventListener('click', () => this.openAddModal());
    this.addModalBackdropElement.addEventListener('click', () => this.closeAddModal());
    this.addCancelButton.addEventListener('click', () => this.closeAddModal());
    this.addFormElement.addEventListener('submit', (event) => {
      event.preventDefault();
      const title = this.optionTitleInput.value.trim();

      if (!title) {
        this.optionTitleInput.setCustomValidity('Enter an option title.');
        this.optionTitleInput.reportValidity();
        return;
      }

      this.optionTitleInput.setCustomValidity('');
      const normalizedTitle = title.normalize('NFKC').toLocaleLowerCase();
      const isDuplicate = this.options.some((option) =>
        option.title.trim().normalize('NFKC').toLocaleLowerCase() === normalizedTitle,
      );

      if (isDuplicate) {
        this.addOptionErrorElement.hidden = false;
        this.optionTitleInput.focus();
        return;
      }

      this.addOptionErrorElement.hidden = true;
      this.addOption(title);
      this.onOptionsChange?.([...this.options]);
      this.closeAddModal();
    });
    this.optionTitleInput.addEventListener('input', () => {
      this.optionTitleInput.setCustomValidity('');
      this.addOptionErrorElement.hidden = true;
    });
  }

  public open(options: BingoOption[]): void {
    if (this.screenTransitionTimeout !== null) {
      window.clearTimeout(this.screenTransitionTimeout);
      this.screenTransitionTimeout = null;
    }

    this.options = options.map((option) => ({ ...option, visible: option.visible !== false }));
    this.recentlyAddedOptionIds = [];
    this.render();
    this.settingsScreenElement.classList.remove('hidden');
    this.settingsScreenElement.setAttribute('aria-hidden', 'false');
    void this.settingsScreenElement.offsetWidth;
    this.gameScreenElement.classList.add('is-sliding-left');
    this.settingsScreenElement.classList.add('is-active');
  }

  public close(): void {
    if (this.screenTransitionTimeout !== null) {
      window.clearTimeout(this.screenTransitionTimeout);
    }

    this.settingsScreenElement.setAttribute('aria-hidden', 'true');
    this.settingsScreenElement.classList.remove('is-active');
    this.gameScreenElement.classList.remove('is-sliding-left');
    this.screenTransitionTimeout = window.setTimeout(() => {
      if (!this.settingsScreenElement.classList.contains('is-active')) {
        this.settingsScreenElement.classList.add('hidden');
      }
      this.screenTransitionTimeout = null;
    }, BingoSettingsModal.SCREEN_TRANSITION_DURATION_MS);
  }

  public resetToDefaults(): void {
    this.options = SAMPLE_ITEMS.map((option) => ({
      ...option,
      visible: option.visible !== false,
    }));
    this.recentlyAddedOptionIds = [];
    this.render();
    this.onOptionsChange?.([...this.options]);
  }

  private render(): void {
    this.optionListElement.innerHTML = '';

    const recentOrder = new Map(this.recentlyAddedOptionIds.map((id, index) => [id, index]));
    const sortedOptions = [...this.options].sort((first, second) => {
      const firstOrder = recentOrder.get(first.id);
      const secondOrder = recentOrder.get(second.id);

      if (firstOrder !== undefined || secondOrder !== undefined) {
        if (firstOrder === undefined) {
          return 1;
        }
        if (secondOrder === undefined) {
          return -1;
        }
        return firstOrder - secondOrder;
      }

      return first.title.localeCompare(second.title);
    });

    sortedOptions.forEach((option) => {
      const item = document.createElement('label');
      item.className = 'settings-option';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = option.visible !== false;
      checkbox.setAttribute('aria-label', `Toggle ${option.title}`);
      checkbox.addEventListener('change', () => {
        const nextOptions = this.options.map((candidate) =>
          candidate.id === option.id ? { ...candidate, visible: checkbox.checked } : candidate,
        );
        const visibleCount = nextOptions.filter((candidate) => candidate.visible !== false).length;

        if (visibleCount < BingoSettingsModal.MIN_VISIBLE_OPTIONS) {
          checkbox.checked = option.visible !== false;
          this.errorElement.hidden = false;
          return;
        }

        this.options = nextOptions;
        this.updateValidation();
        this.onOptionsChange?.([...this.options]);
      });

      const text = document.createElement('span');
      text.textContent = option.title;

      item.appendChild(checkbox);
      item.appendChild(text);
      this.optionListElement.appendChild(item);
    });

    this.updateValidation();
  }

  private updateValidation(): void {
    const visibleCount = this.options.filter((option) => option.visible !== false).length;
    const isValid = visibleCount >= BingoSettingsModal.MIN_VISIBLE_OPTIONS;

    this.countElement.textContent = `${visibleCount} of ${this.options.length} cats selected`;
    this.errorElement.hidden = isValid;
  }

  private openAddModal(): void {
    this.addModalElement.classList.remove('hidden');
    this.addModalElement.setAttribute('aria-hidden', 'false');
    void this.addModalElement.offsetWidth;
    this.addModalElement.classList.add('is-visible');
    window.setTimeout(() => this.optionTitleInput.focus({ preventScroll: true }), 50);
  }

  private closeAddModal(): void {
    this.addModalElement.classList.remove('is-visible');
    this.addModalElement.setAttribute('aria-hidden', 'true');
    this.optionTitleInput.value = '';
    this.optionTitleInput.setCustomValidity('');
    this.addOptionErrorElement.hidden = true;
    window.setTimeout(() => {
      if (!this.addModalElement.classList.contains('is-visible')) {
        this.addModalElement.classList.add('hidden');
      }
    }, 220);
    this.addButton.focus();
  }

  private addOption(title: string): void {
    const newOption = {
      id: `custom-${crypto.randomUUID()}`,
      title,
      imageSrc: PLACEHOLDER_CAT_IMAGE,
      visible: true,
    };
    this.options.push(newOption);
    this.recentlyAddedOptionIds.unshift(newOption.id);
    this.render();
  }

}
