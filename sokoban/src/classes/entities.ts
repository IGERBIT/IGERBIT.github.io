import { IDynamicEntity, IEntity } from "../interfaces/entities";
import { IStorage } from "../interfaces/IStorage";
import { IVector2 } from "../interfaces/IVector2";

abstract class Entity implements IEntity {
	protected _storage: IStorage;
	
	constructor(store: IStorage, position: IVector2) {
		this._storage = store;
		this._storage.setEntityPos(this, position);
	}
	
	public get position(): IVector2 {
		return this.storage.getEntityPos(this);
	}

	public get storage(): IStorage {
		return this._storage;
	}
}

class DynamicEntity extends Entity implements IDynamicEntity {
	move(vector: IVector2): void {
		this.storage.setEntityPos(this, this.position.sum(vector));
	}
	
}



export class Player extends DynamicEntity {

}

export class Box extends DynamicEntity {
	
}

export class Wall extends Entity {
	
}

export class Target extends Entity {
	
}

export class Floor extends Entity {
	
}