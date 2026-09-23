import { BingoManager } from './managers/BingoManager';
import { BingoDetailModal } from './ui/BingoDetailModal';
import { NewGameConfirmationModal } from './ui/NewGameConfirmationModal';

const landingScreen = document.querySelector<HTMLElement>('#landing-screen');
const gameScreen = document.querySelector<HTMLElement>('#game-screen');
const playButton = document.querySelector<HTMLButtonElement>('#play-button');
const boardElement = document.querySelector<HTMLDivElement>('#board');
const boardNewGameButton = document.querySelector<HTMLButtonElement>('#board-new-game');
const bingoOverlayElement = document.querySelector<HTMLElement>('#bingo-overlay');
const confirmationModalElement = document.querySelector<HTMLElement>('#new-game-confirmation');
const confirmationButton = document.querySelector<HTMLButtonElement>('#new-game-confirm');
const cancelButton = document.querySelector<HTMLButtonElement>('#new-game-cancel');
const modalElement = document.querySelector<HTMLElement>('#cell-detail-modal');
const modalTitleElement = document.querySelector<HTMLElement>('#detail-title');
const modalImageElement = document.querySelector<HTMLImageElement>('.modal-image');
const modalToggleButton = document.querySelector<HTMLButtonElement>('#detail-toggle');
const modalBackdropElement = document.querySelector<HTMLElement>('#cell-detail-modal .modal-backdrop');

if (!landingScreen || !gameScreen || !playButton || !boardElement || !boardNewGameButton || !bingoOverlayElement || !confirmationModalElement || !confirmationButton || !cancelButton || !modalElement || !modalTitleElement || !modalImageElement || !modalToggleButton || !modalBackdropElement) {
  throw new Error('Required UI elements were not found.');
}

const detailModal = new BingoDetailModal({
  modalElement,
  titleElement: modalTitleElement,
  imageElement: modalImageElement,
  toggleButton: modalToggleButton,
  backdropElement: modalBackdropElement,
});

const newGameConfirmationModal = new NewGameConfirmationModal({
  modalElement: confirmationModalElement,
  confirmButton: confirmationButton,
  cancelButton,
});

const bingoManager = new BingoManager({
  boardElement,
  bingoOverlayElement,
  detailModal,
  boardNewGameButton,
  newGameConfirmationModal,
});

playButton.addEventListener('click', () => {
  landingScreen.classList.add('hidden');

  window.setTimeout(() => {
    landingScreen.style.display = 'none';
    gameScreen.classList.add('is-visible');
    bingoManager.initialize();
  }, 220);
});
