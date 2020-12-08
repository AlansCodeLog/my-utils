/** @packageDocumentation @module types */

/** Like `Partial` but deep. */
export type DeepPartial<T> = {
	[P in keyof T]?:
	T[P] extends (infer U)[]
		? DeepPartial<U>[]
		: T[P] extends object
		? DeepPartial<T[P]>
		: T[P]
}
