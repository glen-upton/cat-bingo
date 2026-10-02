export class ConfirmationModal {
  private readonly modalElement: HTMLElement;
  private readonly confirmButton: HTMLButtonElement;
  private readonly cancelButton: HTMLButtonElement;
  private readonly backdropElement: HTMLElement;
  private onConfirm: (() => void) | null = null;

  constructor({
    modalElement,
    confirmButton,
    cancelButton,
    backdropElement,
  }: {
    modalElement: HTMLElement;
    confirmButton: HTMLButtonElement;
    cancelButton: HTMLButtonElement;
    backdropElement: HTMLElement;
  }) {
    this.modalElement = modalElement;
    this.confirmButton = confirmButton;
    this.cancelButton = cancelButton;
    this.backdropElement = backdropElement;
  }

  public initialize(onConfirm: () => void): void {
    this.onConfirm = onConfirm;
    this.confirmButton.addEventListener('click', () => {
      this.close();
      this.onConfirm?.();
    });
    this.cancelButton.addEventListener('click', () => this.close());
    this.backdropElement.addEventListener('click', () => this.close());
  }

  public open(): void {
    this.modalElement.classList.remove('hidden');
    this.modalElement.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => this.modalElement.classList.add('is-visible'));
  }

  public close(): void {
    this.modalElement.classList.remove('is-visible');
    this.modalElement.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => this.modalElement.classList.add('hidden'), 220);
  }
}