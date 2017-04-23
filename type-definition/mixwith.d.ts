declare module mixwith {
  interface Ctor<T> {
    new (...args: any[]): T
  }

  export interface Mixin<T> {
    (superclass: Ctor<T>): T
  }

  export interface MixinBuilder<T> {
    with(...mixins: Mixin<T>[]): Mixin<T>
  }
  /**
   * Applies `mixin` to `superclass`.
   *
   * `apply` stores a reference from the mixin application to the unwrapped mixin
   * to make `isApplicationOf` and `hasMixin` work.
   *
   * This function is usefull for mixin wrappers that want to automatically enable
   * hasMixin support.
   *
   *
   *     const Applier = (mixin) => wrap(mixin, (superclass) => apply(superclass, mixin));
   *
   *     // M now works with `hasMixin` and `isApplicationOf`
   *     const M = Applier((superclass) => class extends superclass {});
   *
   *     class C extends M(Object) {}
   *     let i = new C();
   *     hasMixin(i, M); // true
   */
  export function apply<T>(superclass: Ctor<T>, mixin: Mixin<T>): T;

  /**
   * Returns `true` if `proto` is a prototype created by the application of
   * `mixin` to a superclass.
   *
   * `isApplicationOf` works by checking that `proto` has a reference to `mixin`
   * as created by `apply`.
   */
  export function isApplicationOf<T>(proto: T, mixin: Mixin<T>): boolean;

  /**
   * Returns `true` if `o` has an application of `mixin` on its prototype
   * chain.
   *
   * @function
   * @param {Object} o An object
   * @param {MixinFunction} mixin A mixin applied with {@link apply}
   * @return {boolean} whether `o` has an application of `mixin` on its prototype
   * chain
   */
  // TODO: find out if T or object is more appropriate
  export function hasMixin<T>(o: object, mixin: Mixin<T>): boolean;

  /**
   * Sets up the function `mixin` to be wrapped by the function `wrapper`, while
   * allowing properties on `mixin` to be available via `wrapper`, and allowing
   * `wrapper` to be unwrapped to get to the original function.
   *
   * `wrap` does two things:
   *   1. Sets the prototype of `mixin` to `wrapper` so that properties set on
   *      `mixin` inherited by `wrapper`.
   *   2. Sets a special property on `mixin` that points back to `mixin` so that
   *      it can be retreived from `wrapper`
   *
   * @function
   * @param {MixinFunction} mixin A mixin function
   * @param {MixinFunction} wrapper A function that wraps {@link mixin}
   * @return {MixinFunction} `wrapper`
   */
  /**
   *
   * FIXME:
   *   we can just replace the mixin with a totally differnt wrapper,so
   *   that the instance may get totally different methods or properties
   *   comparing to the original mixin.
   *   I think we should make the public api more compact.
   */
  export function wrap<T>(mixin: Mixin<T>, wrapper: Mixin<T>): Mixin<T>;

  /**
   * Unwraps the function `wrapper` to return the original function wrapped by
   * one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
   * function.
   */
  export function unwrap<T>(wrapper: Mixin<T>): Mixin<T>;

  /**
   * Decorates `mixin` so that it caches its applications. When applied multiple
   * times to the same superclass, `mixin` will only create one subclass, memoize
   * it and return it for each application.
   *
   * Note: If `mixin` somehow stores properties its classes constructor (static
   * properties), or on its classes prototype, it will be shared across all
   * applications of `mixin` to a super class. It's reccomended that `mixin` only
   * access instance state.
   */
  export function Cached(mixin: Mixin<T>): Mixin<T>;

  /**
   * Decorates `mixin` so that it only applies if it's not already on the
   * prototype chain.
   */
  export function DeDupe<T>(mixin: Mixin<T>): Mixin<T>;

  /**
   * Adds [Symbol.hasInstance] (ES2015 custom instanceof support) to `mixin`.
   */

  export function HasInstance<T>(mixin: Mixin<T>): Mixin<T>;

  /**
   * A basic mixin decorator that applies the mixin with apply so that it
   * can be used with isApplicationOf, hasMixin and the other
   * mixin decorator functions.
   */
  export function BareMixin<T>(mixin: Mixin<T>): Mixin<T>;

  /**
   * Decorates a mixin function to add deduplication, application caching and
   * instanceof support.
   */
  export function Mixin(mixin: Mixin<T>): Mixin<T>;

/**
 * A fluent interface to apply a list of mixins to a superclass.
 *
 * ```javascript
 * class X extends mix(Object).with(A, B, C) {}
 * ```
 *
 * The mixins are applied in order to the superclass, so the prototype chain
 * will be: X->C'->B'->A'->Object.
 *
 * This is purely a convenience function. The above example is equivalent to:
 *
 * ```javascript
 * class X extends C(B(A(Object))) {}
 * ```

 */
  export function mix<T>(superclass:Ctor<T>) : MixinBuilder<T>

}