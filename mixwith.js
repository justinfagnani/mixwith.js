'use strict';

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.mixwith = mod.exports;
  }
})(this, function (exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  const _cachedApplicationRef = exports._cachedApplicationRef = Symbol('_cachedApplicationRef');

  const _mixinRef = exports._mixinRef = Symbol('_mixinRef');

  const mix = exports.mix = superClass => new MixinBuilder(superClass);

  class MixinBuilder {
    constructor(superclass) {
      this.superclass = superclass;
    }

    with() {
      let mixins = Array.prototype.slice.call(arguments);
      return mixins.reduce((c, mixin) => {
        let applicationRef = mixin[_cachedApplicationRef];

        if (!applicationRef) {
          applicationRef = mixin[_cachedApplicationRef] = Symbol(mixin.name);
        }

        if (c.hasOwnProperty(applicationRef)) {
          return c[applicationRef];
        }

        let application = mixin(c);
        application.prototype[_mixinRef] = mixin;
        c[applicationRef] = application;

        if (Symbol.hasInstance && !mixin.hasOwnProperty(Symbol.hasInstance)) {
          mixin[Symbol.hasInstance] = function (o) {
            do {
              if (o.hasOwnProperty(_mixinRef) && o[_mixinRef] === this) {
                return true;
              }

              o = Object.getPrototypeOf(o);
            } while (o !== Object);

            return false;
          };
        }

        return application;
      }, this.superclass);
    }

  }
});