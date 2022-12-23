import { IEntity } from "./entities";

export interface IEntitySerializer {
	serialize(entity: IEntity): string;
	deserialize(entity: string): IEntity;
}