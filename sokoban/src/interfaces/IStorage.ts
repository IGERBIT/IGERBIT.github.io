import { Vector2 } from "../classes/Vector2";
import { IDynamicEntity, IEntity } from "./entities";

export interface IStorage {
	readonly size: Vector2;
	
	getEntity(pos: Vector2): IEntity | null;
	getEntities(): IEntity[];

	setEntityPos(entity: IEntity, pos: Vector2): void;
	getEntityPos(entity: IEntity): Vector2;

	getEntityAt(pos: Vector2): IEntity;
}