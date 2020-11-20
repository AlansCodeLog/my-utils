/** @packageDocumentation @module utils */
import { keys } from "@/retypes"
import type { AnyClass, AnyFunction } from "@/types"

/**
 * Mixes a series of mixins onto a class + some extra magic. Mixes in both non-static and static methods.
 *
 * It ignores the constructors of mixins (they cannot be used even if we wanted to), but mixins can still define a `__constructor` method (which should only take in one parameter) and if there's at least one mixin with a `__constructor` they will get combined into a `__mixin` method on the object which should be called like `super` from the base's constructor (except after properties are initiated usually, see notes below).
 *
 * This `__mixin` method can only take in one parameter for typing reasons, but there's some magic happening so that each mixin can take in different parameters since the type of the first parameter gets merged.
 *
 * Regarding types, a {@link Mixin `Mixin`} type is provided for extending the type of `Base` via declaration merging which will make everything work correctly (so long as you follow the notes below).
 * ```ts
 *
 * class Mixin1 {
 * 	// mixins cannot see what's extending them
 * 	shared!: string
 * 	// mixins can't use real constructors, we must use `!` to tell typescript the property is defined
 * 	str!: string
 * 	__constructor(
 * 		{mixin1: {str}}:
 * 		{mixin1: {str:string}}
 * 	) {
 * 		this.str = this.shared + str
 * 	}
 * }
 * class Mixin2 {
 *		shared!: string
 * 	num!: number
 * 	__constructor(
 * 		{mixin2: {num}}:
 * 		{mixin2: {num:number}}
 * 	) {
 * 		this.num = num
 * 	}
 * 	someMethod() {
 * 		return this.shared
 * 	}
 * 	overrideMe() {
 * 		return throw new Error("Base class did not override me!")
 * 	}
 * }
 *
 * class Base {
 * 	shared: string
 * 	constructor(shared: string) {
 * 		this.shared = shared
 * 		// should be called after `shared` since Mixin1 uses it in it's constructor
 * 		// (it would not need to if it was just Mixin2 we were mixing)
 * 		this.__mixin({
 * 			mixin1: {str: ""}
 * 			mixin2: {num: 0}
 * 		})
 * 	}
 * 	someOtherMethod() {
 * 		// will work and without type errors!
 * 		return this.str + this.num
 * 	}
 * 	overrideMe() {
 * 		// will override Mixin2's method
 * 		return "override"
 * 	}
 * }
 * // declaration merging
 * interface Base extends Mixin<Mixin1 | Mixin2> {} // the mixins need to be passed as a union type
 * ```
 *
 * **Notes:**
 * - You cannot do something like `str = "something"` to define a property. **This won't work** because it's compiled to an assignment inside the constructor which is ignored.
 * - If a mixin makes use of a base's property it will need to declare it as if it exists (i.e. `prop!: ...`) but this type cannot differ from the type of the property on the base (typescript will complain on the interface declaration).
 * 	- If the mixin accesses the property in it's `__constructor`, be sure to call `__mixin` in the base's constructor **after** that property is defined.
 * - If the same method exists on both a base and a mixin, the base's is used and the mixin's is ignored.
 *
 * @param base
 * @param mixins
 */
export function mixin<
	T extends
		AnyClass =
		AnyClass,
	TMixins extends
		AnyClass<{ __constructor: AnyFunction } | any>[] =
		AnyClass<{ __constructor: AnyFunction } | any>[],
>(base: T, mixins: TMixins): void {
	let constructors: AnyFunction[] = []
	mixins.forEach(mixin_ctor => {
		let methods = Object.getOwnPropertyDescriptors(mixin_ctor.prototype)
		// <string> because of https://github.com/microsoft/TypeScript/issues/1863
		keys<string>(methods).forEach(key => {
			let method = methods[key]
			if (!["constructor", "__constructor"].includes(key.toString()) && base.prototype[key] === undefined) {
				Object.defineProperty(base.prototype, key, method)
			} else if (key === "__constructor") {
				constructors.push(method.value)
			}
		})
		let static_props = Object.getOwnPropertyDescriptors(mixin_ctor)
		keys(static_props).forEach(key => {
			let prop = static_props[key]
			if ((base as any)[key] === undefined && prop.writable && prop.configurable) {
				Object.defineProperty(base, key, prop)
			}
		})
	})
	if (constructors.length > 0) {
		if (Object.getOwnPropertyDescriptor(base, "__mixin")) {
			throw new Error("Mixin base cannot have a method named `__mixin`.")
		}
		Object.defineProperty(base.prototype, "__mixin", {
			value(...args: any[]) {
				for (let constructor of constructors) {
					constructor.call(this, ...args)
				}
			},
			writable: false,
			configurable: false,
			enumerable: false,
		})
	}
}