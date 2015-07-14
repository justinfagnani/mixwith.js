'use strict';

export const _cachedApplicationRef = Symbol('_cachedApplicationRef');
export const _mixinRef = Symbol('_mixinRef');

export const mix = (superClass) => new MixinBuilder(superClass);

class MixinBuilder {

  constructor(superclass) {
    this.superclass = superclass;
  }

  with() {
    let mixins = Array.prototype.slice.call(arguments);
    return mixins.reduce((c, mixin) => {

      // Get or create a Symbol used to look up a previous application of mixin
      // to the class. This symbol is unique per mixin, so a class will have N
      // applicationRefs if it has had N mixins applied to it. A mixin will have
      // exactly one _cachedApplicationRef use to store its applications.
      let applicationRef = mixin[_cachedApplicationRef];
      if (!applicationRef) {
        applicationRef = mixin[_cachedApplicationRef] = Symbol(mixin.name);
      }
      // Look up an existing application of `mixin` to `c`, return it if found.
      if (c.hasOwnProperty(applicationRef)) {
        return c[applicationRef];
      }

      // Apply the mixin
      let application = mixin(c);

      // Attach a reference from mixin applition to mixin for RTTI
      // mixin[@@hasInstance] should use this
      application.prototype[_mixinRef] = mixin;

      // Cache the mixin application on superclass c
      c[applicationRef] = application;

      // Patch in instanceof support to mixin
      // not supported in any browsers yet?
      if (Symbol.hasInstance && !mixin.hasOwnProperty(Symbol.hasInstance)) {
        mixin[Symbol.hasInstance] = function(o) {
          do {
            if (o.hasOwnProperty(_mixinRef) && o[_mixinRef] === this) {
              return true;
            }
            o = Object.getPrototypeOf(o);
          } while (o !== Object)
          return false;
        }
      }

      return application;
    }, this.superclass);

  }
}

// function extend(subclass, superclass) {
//   var prototype = Object.create(superclass.prototype);
//   prototype.constructor = subclass;
//   return prototype;
// }
