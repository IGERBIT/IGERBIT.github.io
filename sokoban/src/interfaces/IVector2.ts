export interface IVector2 {
	readonly x: number;
	readonly y: number;

	sum(vector: IVector2): IVector2;
	subtract(vector: IVector2): IVector2;
	multiply(vector: IVector2 | number): IVector2;
	divide(vector: IVector2 | number): IVector2;

	equal(vector: IVector2): boolean;
}