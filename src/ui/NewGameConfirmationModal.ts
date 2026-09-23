export class NewGameConfirmationModal {
  private readonly modalElement: HTMLElement;
  private readonly confirmButton: HTMLButtonElement;
  private readonly cancelButton: HTMLButtonElement;
  private onConfirm: (() => void) | null = null;

  constructor({
    modalElement,
    confirmButton,
    cancelButton,
  }: {
    modalElement: HTMLElement;
    confirmButton: HTMLButtonElement;
    cancelButton: HTMLButtonElement;
  }) {
    this.modalElement = modalElement;
    this.confirmButton = confirmButton;
    this.cancelButton = cancelButton;
  }

  public initialize(onConfirm: () => void): void {
    this.onConfirm = onConfirm;
    this.confirmButton.addEventListener('click', () => {
      this.close();
      this.onConfirm?.();
    });
    this.cancelButton.addEventListener('click', () => this.close());
  }

  public open(): void {
    this.modalElement.classList.remove('hidden');
    requestAnimationFrame(() => this.modalElement.classList.add('is-visible'));
  }

  public close(): void {
    this.modalElement.classList.remove('is-visible');
    window.setTimeout(() => this.modalElement.classList.add('hidden'), 220);
  }
}
