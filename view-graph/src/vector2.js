export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    assign(v) {
        this.x = v.x;
        this.y = v.y;
    }
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    mulScalar(a) {
        return new Vector2(this.x * a, this.y * a);
    }
    div(v) {
        return new Vector2(this.x / v.x, this.y / v.y);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    length() {
        return Math.sqrt(this.dot(this));
    }
    normalize() {
        return this.div(this.length());
    }
    distance(v) {
        return this.sub(v).length();
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
    inBox(TL, BR) {
        // BR is exclusive
        return this.x >= TL.x && this.x < BR.x && this.y >= TL.y && this.y < BR.y;
    }
    lerp(v, t) {
        return this.add(v.sub(this).mulScalar(t));
    }
}