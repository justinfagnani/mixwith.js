'use strict';

export const _cachedApplicationRef = Symbol('_cachedApplicationRef');
export const _mixinRef = Symbol('_mixinRef');
export const _originalMixin = Symbol('_originalMixin');

/**
 * Sets the prototype of mixin to wrapper so that properties set on mixin are
 * inherited by the wrapper.
 *
 * This is needed in order to implement @@hasInstance as a decorator function.
 */
export const wrap = (mixin, wrapper) => {
  Object.setPrototypeOf(wrapper, mixin);
  if (!mixin[_originalMixin]) {
    mixin[_originalMixin] = mixin;
  }
  return wrapper;
};

/**
 * Decorates mixin so that it caches its applications. When applied multiple
 * times to the same superclass, mixin will only create one subclass and
 * memoize it.
 */
export const Cached = (mixin) => wrap(mixin, (superclass) => {
  // Get or create a symbol used to look up a previous application of mixin
  // to the class. This symbol is unique per mixin definition, so a class will have N
  // applicationRefs if it has had N mixins applied to it. A mixin will have
  // exactly one _cachedApplicationRef used to store its applications.
  let applicationRef = mixin[_cachedApplicationRef];
  if (!applicationRef) {
    applicationRef = mixin[_cachedApplicationRef] = Symbol(mixin.name);
  }
  // Look up an existing application of `mixin` to `c`, return it if found.
  if (superclass.hasOwnProperty(applicationRef)) {
    return superclass[applicationRef];
  }
  // Apply the mixin
  let application = mixin(superclass);
  // Cache the mixin application on the superclass
  superclass[applicationRef] = application;
  return application;
});

/**
 * Adds @@hasInstance (ES2015 instanceof support) to mixin.
 * Note: @@hasInstance is not supported in any browsers yet.
 */
export const HasInstance = (mixin) => {
  if (Symbol.hasInstance && !mixin.hasOwnProperty(Symbol.hasInstance)) {
    Object.defineProperty(mixin, Symbol.hasInstance, {
      value: function(o) {
        const originalMixin = this[_originalMixin];
        while (o != null) {
          if (o.hasOwnProperty(_mixinRef) && o[_mixinRef] === originalMixin) {
            return true;
          }
          o = Object.getPrototypeOf(o);
        }
        return false;
      }
    });
  }
  return mixin;
};

/**
 * A basic mixin decorator that sets up a reference from mixin applications
 * to the mixin defintion for use by other mixin decorators.
 */
export const BareMixin = (mixin) => wrap(mixin, (superclass) => {
  // Apply the mixin
  let application = mixin(superclass);

  // Attach a reference from mixin applition to wrapped mixin for RTTI
  // mixin[@@hasInstance] should use this.
  application.prototype[_mixinRef] = mixin[_originalMixin];
  return application;
});

/**
 * Decorates a mixin function to add application caching and instanceof
 * support.
 */
export const Mixin = (mixin) => Cached(HasInstance(BareMixin(mixin)));

export const mix = (superClass) => new MixinBuilder(superClass);

class MixinBuilder {

  constructor(superclass) {
    this.superclass = superclass;
  }

  with() {
    return Array.from(arguments).reduce((c, m) => m(c), this.superclass);
  }
}
