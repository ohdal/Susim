import Vector from "./Vector";
import Canvas from "./Canvas";

export default class Mouse {
  public pos: Vector;
  public oldPos: Vector;
  public radius: number;

  constructor(canvas: Canvas) {
    this.pos = new Vector(-1000, -1000);
    this.oldPos = new Vector(-1000, -1000);
    this.radius = 50;

    canvas.element.onmousemove = (e) => {
      this.oldPos.setXY(this.pos.x, this.pos.y);
      this.pos.setXY(e.clientX, e.clientY);
    };

    canvas.element.ontouchmove = (e) => {
      this.pos.setXY(e.touches[0].clientX, e.touches[0].clientY);
    };
  }
}
