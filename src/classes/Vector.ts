export default class Vector {
  public x: number;
  public y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // Vector.add() 호출
  static add(v1: Vector, v2: Vector) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }

  static sub(v1: Vector, v2: Vector) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }

  // const vector = new Vector();
  // vector.add() 인스턴스에서 호출
  add(x: number | Vector, y: number) {
    if (typeof x === "number") {
      this.x += x;
      this.y += y;
    } else {
      this.x += x.x;
      this.y += x.y;
    }

    return this;
  }

  sub(x: number | Vector, y: number) {
    if (typeof x === "number") {
      this.x -= x;
      this.y -= y;
    } else {
      this.x -= x.x;
      this.y -= x.y;
    }

    return this;
  }

  mult(v: number | Vector) {
    if (typeof v === "number") {
      this.x *= v;
      this.y *= v;
    } else {
      this.x = v.x;
      this.y = v.y;
    }

    return this;
  }

  setXY(x: number, y: number) {
    this.x = x;
    this.y = y;

    return this;
  }

  dist(v: Vector) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;

    return Math.sqrt(dx * dx + dy * dy);
  }
}
