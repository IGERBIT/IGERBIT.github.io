import { IVector2 } from "../interfaces/IVector2";

export class Vector2 implements IVector2 {
	constructor(public x: number, public y: number) { }
	
	public sum(vector: IVector2): IVector2 {
		return new Vector2(this.x + vector.x, this.y + vector.y);
	}

	public subtract(vector: IVector2): IVector2 {
		return new Vector2(this.x - vector.x, this.y - vector.y);
	}
	
	public multiply(vector: number | IVector2): IVector2 {
		if(typeof vector === "number") {
			return new Vector2(this.x * vector, this.y * vector);
		}
		return new Vector2(this.x * vector.x, this.y * vector.y);
	}

	public divide(vector: number | IVector2): IVector2 {
		if(typeof vector === "number") {
			return new Vector2(this.x / vector, this.y / vector);
		}
		return new Vector2(this.x / vector.x, this.y / vector.y);
	}

	public equal(vector: IVector2): boolean {
		return this.x === vector.x && this.y === vector.y;
	}

	
}