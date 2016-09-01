'use strict';

// used by apply() and isApplicationOf()
const _appliedMixin = '__mixwith_appliedMixin';

/**
 * Applies `mixin` to `superclass`.
 *
 * `apply` stores a reference from the mixin application to the unwrapped mixin
 * to make `isApplicationOf` and `hasMixin` work.
 */
export const apply = (superclass, mixin) => {
  let application = mixin(superclass);
  application.prototype[_appliedMixin] = unwrap(mixin);
  return application;
};

/**
 * Returns `true` iff `proto` is a prototype created by the application of
 * `mixin` to a superclass.
 *
 * `isApplicationOf` works by checking that `proto` has a reference to `mixin`
 * as created by `apply`.
 */
export const isApplicationOf = (proto, mixin) =>
  proto.hasOwnProperty(_appliedMixin) && proto[_appliedMixin] === unwrap(mixin);

// used by wrap() and unwrap()
const _wrappedMixin = '__mixwith_wrappedMixin';

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
 */
export const wrap = (mixin, wrapper) => {
  Object.setPrototypeOf(wrapper, mixin);
  if (!mixin[_wrappedMixin]) {
    mixin[_wrappedMixin] = mixin;
  }
  return wrapper;
};

/**
 * Unwraps the function `wrapper` to return the original function wrapped by
 * one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
 * function.
 */
export const unwrap = (wrapper) => wrapper[_wrappedMixin] || wrapper;


/**
 * Returns `true` iff `o` has an application of `mixin` on its prototype
 * chain.
 */
export const hasMixin = (o, mixin) => {
  while (o != null) {
    if (isApplicationOf(o, mixin)) return true;
    o = Object.getPrototypeOf(o);
  }
  return false;
}

const _cachedApplications = '__mixwith_cachedApplications';

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
export const Cached = (mixin) => wrap(mixin, (superclass) => {
  // Get or create a symbol used to look up a previous application of mixin
  // to the class. This symbol is unique per mixin definition, so a class will have N
  // applicationRefs if it has had N mixins applied to it. A mixin will have
  // exactly one _cachedApplicationRef used to store its applications.

  let cachedApplications = superclass[_cachedApplications];
  if (!cachedApplications) {
    cachedApplications = superclass[_cachedApplications] = new Map();
  }

  let application = cachedApplications.get(mixin);
  if (!application) {
    application = mixin(superclass);
    cachedApplications.set(mixin, application);
  }

  return application;
});

/**
 * Decorates `mixin` so that it only applies if it's not already on the
 * prototype chain.
 */
export const DeDupe = (mixin) => wrap(mixin, (superclass) => {
  if (hasMixin(superclass.prototype, mixin)) return superclass;
  return mixin(superclass);
});

/**
 * Adds [@@hasInstance] (ES2015 instanceof support) to `mixin`.
 */
export const HasInstance = (mixin) => {
  if (Symbol && Symbol.hasInstance && !mixin[Symbol.hasInstance]) {
    Object.defineProperty(mixin, Symbol.hasInstance, {
      value(o) {
        return hasMixin(o, mixin);
      },
    });
  }
  return mixin;
};

/**
 * A basic mixin decorator that sets up a reference from mixin applications
 * to the mixin defintion for use by other mixin decorators.
 */
export const BareMixin = (mixin) => wrap(mixin, (s) => apply(s, mixin));

/**
 * Decorates a mixin function to add application caching and instanceof
 * support.
 */
export const Mixin = (mixin) => DeDupe(Cached(BareMixin(mixin)));

/**
 * A fluent interface to apply a list of mixins to a superclass.
 *
 * Example:
 *
 *     class X extends mix(Object).with(A, B, C) {}
 *
 * The mixins are applied in order to the superclass, so the prototype chain
 * will be: X->C'->B'->A'->Object.
 *
 * This is purely a convenience function. The above example is equivalent to:
 *
 *    class X extends C(B(A(Object))) {}
 */
export const mix = (superclass) => new MixinBuilder(superclass);

class MixinBuilder {

  constructor(superclass) {
    this.superclass = superclass;
  }

  with(...mixins) {
    return mixins.reduce((c, m) => m(c), this.superclass);
  }
}
