import { IEntity } from "./entities"
import { IVector2 } from "./IVector2"

export interface IScheme {
	readonly name: string
	readonly size: IVector2,
	readonly entities: IEntity[]
	readonly playerPosition: IVector2
}