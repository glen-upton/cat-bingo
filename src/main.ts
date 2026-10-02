import { createIcons, Cat, ChevronLeft, PawPrint, Plus, Settings } from 'lucide';
import { PLACEHOLDER_CAT_IMAGE, SAMPLE_ITEMS } from './consts/sampleItems';
import { GameStorage } from './storage/GameStorage';
import { BingoManager } from './managers/BingoManager';
import { BingoDetailModal } from './ui/BingoDetailModal';
import { BingoSettingsModal } from './ui/BingoSettingsModal';
import { ConfirmationModal } from './ui/ConfirmationModal';

const landingScreen = document.querySelector<HTMLElement>('#landing-screen');
const gameScreen = document.querySelector<HTMLElement>('#game-screen');
const playButton = document.querySelector<HTMLButtonElement>('#play-button');
const boardElement = document.querySelector<HTMLDivElement>('#board');
const boardNewGameButton = document.querySelector<HTMLButtonElement>('#board-new-game');
const bingoOverlayElement = document.querySelector<HTMLElement>('#bingo-overlay');
const confirmationModalElement = document.querySelector<HTMLElement>('#new-game-confirmation');
const confirmationButton = document.querySelector<HTMLButtonElement>('#new-game-confirm');
const cancelButton = document.querySelector<HTMLButtonElement>('#new-game-cancel');
const confirmationBackdropElement = document.querySelector<HTMLElement>('#new-game-confirmation .confirmation-backdrop');
const settingsResetConfirmationElement = document.querySelector<HTMLElement>('#settings-reset-confirmation');
const settingsResetConfirmButton = document.querySelector<HTMLButtonElement>('#settings-reset-confirm');
const settingsResetCancelButton = document.querySelector<HTMLButtonElement>('#settings-reset-cancel');
const settingsResetBackdropElement = document.querySelector<HTMLElement>('#settings-reset-confirmation .confirmation-backdrop');
const modalElement = document.querySelector<HTMLElement>('#cell-detail-modal');
const modalTitleElement = document.querySelector<HTMLElement>('#detail-title');
const modalImageElement = document.querySelector<HTMLImageElement>('.modal-image');
const modalToggleButton = document.querySelector<HTMLButtonElement>('#detail-toggle');
const modalBackdropElement = document.querySelector<HTMLElement>('#cell-detail-modal .modal-backdrop');
const settingsButton = document.querySelector<HTMLButtonElement>('#settings-button');
const settingsScreenElement = document.querySelector<HTMLElement>('#settings-screen');
const settingsCloseButton = document.querySelector<HTMLButtonElement>('#settings-close');
const settingsResetButton = document.querySelector<HTMLButtonElement>('#settings-reset');
const settingsAddButton = document.querySelector<HTMLButtonElement>('#settings-add');
const settingsCountElement = document.querySelector<HTMLElement>('#settings-count');
const addOptionModalElement = document.querySelector<HTMLElement>('#add-option-modal');
const addOptionBackdropElement = document.querySelector<HTMLElement>('#add-option-modal .settings-backdrop');
const addOptionFormElement = document.querySelector<HTMLFormElement>('#add-option-form');
const addOptionTitleInput = document.querySelector<HTMLInputElement>('#add-option-input');
const addOptionErrorElement = document.querySelector<HTMLElement>('#add-option-error');
const addOptionCancelButton = document.querySelector<HTMLButtonElement>('#add-option-cancel');
const settingsListElement = document.querySelector<HTMLElement>('#settings-list');
const settingsErrorElement = document.querySelector<HTMLElement>('#settings-error');
const gameStorage = new GameStorage();

if (!landingScreen || !gameScreen || !playButton || !boardElement || !boardNewGameButton || !bingoOverlayElement || !confirmationModalElement || !confirmationButton || !cancelButton || !confirmationBackdropElement || !settingsResetConfirmationElement || !settingsResetConfirmButton || !settingsResetCancelButton || !settingsResetBackdropElement || !modalElement || !modalTitleElement || !modalImageElement || !modalToggleButton || !modalBackdropElement || !settingsButton || !settingsScreenElement || !settingsCloseButton || !settingsResetButton || !settingsAddButton || !settingsCountElement || !addOptionModalElement || !addOptionBackdropElement || !addOptionFormElement || !addOptionTitleInput || !addOptionErrorElement || !addOptionCancelButton || !settingsListElement || !settingsErrorElement) {
  throw new Error('Required UI elements were not found.');
}

const syncAppHeight = (): void => {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`);
};

syncAppHeight();
window.addEventListener('resize', syncAppHeight, { passive: true });
window.visualViewport?.addEventListener('resize', syncAppHeight, { passive: true });

const detailModal = new BingoDetailModal({
  modalElement,
  titleElement: modalTitleElement,
  imageElement: modalImageElement,
  toggleButton: modalToggleButton,
  backdropElement: modalBackdropElement,
});

detailModal.preloadImages([...SAMPLE_ITEMS.map((item) => item.imageSrc), PLACEHOLDER_CAT_IMAGE]);
createIcons({ icons: { Cat, ChevronLeft, PawPrint, Plus, Settings } });

const newGameConfirmationModal = new ConfirmationModal({
  modalElement: confirmationModalElement,
  confirmButton: confirmationButton,
  cancelButton,
  backdropElement: confirmationBackdropElement,
});

const settingsResetConfirmationModal = new ConfirmationModal({
  modalElement: settingsResetConfirmationElement,
  confirmButton: settingsResetConfirmButton,
  cancelButton: settingsResetCancelButton,
  backdropElement: settingsResetBackdropElement,
});

const settingsModal = new BingoSettingsModal({
  gameScreenElement: gameScreen,
  settingsScreenElement,
  backButton: settingsCloseButton,
  countElement: settingsCountElement,
  addButton: settingsAddButton,
  addModalElement: addOptionModalElement,
  addModalBackdropElement: addOptionBackdropElement,
  addFormElement: addOptionFormElement,
  optionTitleInput: addOptionTitleInput,
  addOptionErrorElement,
  addCancelButton: addOptionCancelButton,
  optionListElement: settingsListElement,
  errorElement: settingsErrorElement,
});

const bingoManager = new BingoManager({
  gameStorage,
  boardElement,
  bingoOverlayElement,
  detailModal,
  boardNewGameButton,
  newGameConfirmationModal,
});

settingsModal.initialize((nextOptions) => {
  gameStorage.saveOptions(nextOptions);
});

settingsResetConfirmationModal.initialize(() => {
  settingsModal.resetToDefaults();
});
settingsResetButton.addEventListener('click', () => settingsResetConfirmationModal.open());

settingsButton.addEventListener('click', () => {
  settingsModal.open(gameStorage.loadOptions());
});

playButton.addEventListener('click', () => {
  landingScreen.classList.add('hidden');

  window.setTimeout(() => {
    landingScreen.style.display = 'none';
    gameScreen.classList.add('is-visible');
    bingoManager.initialize();
  }, 220);
});
