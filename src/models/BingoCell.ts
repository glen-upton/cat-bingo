export class BingoCell {
  public readonly id: string;
  public readonly optionId: string;
  public text: string;
  public imageSrc: string;
  public marked: boolean;
  public readonly isFree: boolean;

  constructor({
    id,
    optionId = id,
    text,
    imageSrc = '/assets/cats/orange%20cat.png',
    marked = false,
    isFree = false,
  }: {
    id: string;
    optionId?: string;
    text: string;
    imageSrc?: string;
    marked?: boolean;
    isFree?: boolean;
  }) {
    this.id = id;
    this.optionId = optionId;
    this.text = text;
    this.imageSrc = imageSrc;
    this.marked = marked;
    this.isFree = isFree;
  }

  public static freeCell(index: number): BingoCell {
    return new BingoCell({
      id: `cell-${index}`,
      optionId: 'free',
      text: 'FREE',
      imageSrc: '/assets/cats/orange%20cat.png',
      marked: true,
      isFree: true,
    });
  }
}
