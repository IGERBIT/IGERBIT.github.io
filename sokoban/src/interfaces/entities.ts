import { IStorage } from "./IStorage";
import { IVector2 } from "./IVector2";

export interface IEntity {
	readonly position: IVector2,
	readonly storage: IStorage
}

export interface IStaticEntity extends IEntity {
}
export interface IDynamicEntity extends IEntity {
	move(vector: IVector2): void;
}