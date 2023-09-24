type animationType = () => boolean | void;

export default class Canvas {
  public element: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D | null;
  public CANVAS_WIDTH: number;
  public CANVAS_HEIGHT: number;
  public readonly dpr: number;

  private frame: number;
  private interval: number;
  private now: number;
  private delta: number;
  private then: number;
  private requestId: number | null;
  private animCount: number;

  constructor(canvas: HTMLCanvasElement) {
    this.element = canvas;
    this.ctx = this.element.getContext("2d");
    this.CANVAS_WIDTH = innerWidth;
    this.CANVAS_HEIGHT = innerHeight;

    const ratio = window.devicePixelRatio;
    this.dpr = ratio > 2 ? 2 : ratio;

    this.frame = 10;
    this.interval = 1000 / this.frame;
    this.now = Date.now();
    this.delta = 0;
    this.then = 0;
    this.requestId = null;
    this.animCount = 0;
  }

  public init(width?: number, height?: number): void {
    this.CANVAS_WIDTH = width || innerWidth;
    this.CANVAS_HEIGHT = height || innerHeight;

    this.element.style.width = `${this.CANVAS_WIDTH}px`;
    this.element.style.height = `${this.CANVAS_HEIGHT}px`;

    this.element.width = this.CANVAS_WIDTH * this.dpr;
    this.element.height = this.CANVAS_HEIGHT * this.dpr;
    this.ctx?.scale(this.dpr, this.dpr);
  }

  public animate(anim: animationType): void {
    this.requestId = window.requestAnimationFrame(() => {
      this.animate(anim);
    });

    this.now = Date.now();
    this.delta = this.now - this.then;
    if (this.delta < this.interval) return;

    this.clearCanvas();
    anim();
    this.animCount += 1;

    this.then = this.now - (this.delta % this.interval);
  }

  public cancelAnimation(): void {
    if (this.requestId) {
      this.animCount = 0;
      cancelAnimationFrame(this.requestId);
    }
  }

  public getAnimCount(): number {
    return this.animCount;
  }

  public clearCanvas(): void {
    this.ctx?.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
  }

  public setFrame(v: number): void {
    this.frame = v;
    this.interval = 1000 / v;
  }
}
