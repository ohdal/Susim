import { getRandomNum } from "../utils";
import Vector from "./Vector";
import Mouse from "./Mouse";

export default class Particle {
  private pos: Vector;
  private firstPosX: number;
  private firstPosY: number;
  private friction: number;
  private radius: number;
  public speed: number;
  public opacity: number;
  private ctx: CanvasRenderingContext2D;
  public isTouched: boolean;

  constructor(x: number, y: number, opacity: number, ctx: CanvasRenderingContext2D) {
    const r = getRandomNum(0, 0.5);
    const angle = (Math.PI / 180) * getRandomNum(0, 360);

    this.pos = new Vector(x, y);
    this.firstPosX = r * Math.cos(angle);
    this.firstPosY = r * Math.sin(angle);
    this.radius = 20;
    this.speed = 0.95;
    this.friction = 0.9;

    this.opacity = opacity;
    this.ctx = ctx;
    this.isTouched = false;
  }

  firstUpdate(): void {
    if (Number(this.speed.toFixed(5)) === 0) return;

    this.pos.x += this.firstPosX * this.speed;
    this.pos.y += this.firstPosY * this.speed;

    this.speed *= this.friction;
  }

  update(mouse: Mouse): void {
    const dist = this.pos.dist(mouse.pos);

    if (this.isTouched) this.opacity -= 0.005;

    if (dist > this.radius) return;

    const { x: dx_m, y: dy_m } = Vector.sub(mouse.pos, mouse.oldPos);
    const { x: dx_c, y: dy_c } = Vector.sub(mouse.pos, this.pos);

    const dist_m = Math.sqrt(dx_m * dx_m + dy_m * dy_m); // 이전 마우스 위치와의 거리 구하기
    const dist_c = Math.sqrt(dx_c * dx_c + dy_c * dy_c); // 현재 파티클 위치와 마우스의 위치와의 거리 구하기

    const direction_m = new Vector(dx_m / dist_m, dy_m / dist_m); // 방향 벡터 구하기 - 마우스 방향대로 밀리는
    const direction_c = new Vector(dx_c / dist_c, dy_c / dist_c); // 방향 벡터 구하기 - 마우스 위치에서 떨어져서 밀리는

    // direction_c - 마우스 포인터 위치에서 떨어지게끔 밀려야하므로 마이너스 값을 곱해준다.
    const randomNum_m = getRandomNum(20, 40);
    const randomNum_c = getRandomNum(-20, -5);
    const add_Vector = Vector.add(direction_m.mult(randomNum_m), direction_c.mult(randomNum_c));
    this.pos.add(add_Vector.x, add_Vector.y);

    if (!this.isTouched) this.isTouched = true;
  }

  update_opacity() {
    this.opacity -= 0.03;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    this.ctx.fillRect(this.pos.x, this.pos.y, 1, 1);
    this.ctx.closePath();
  }
}
