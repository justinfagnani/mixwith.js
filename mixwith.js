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

  const _originalMixin = exports._originalMixin = Symbol('_originalMixin');

  const apply = exports.apply = (superclass, mixin) => {
    let application = mixin(superclass);
    application.prototype[_mixinRef] = unwrap(mixin);
    return application;
  };

  const isApplicationOf = exports.isApplicationOf = (proto, mixin) => proto.hasOwnProperty(_mixinRef) && proto[_mixinRef] === unwrap(mixin);

  const wrap = exports.wrap = (mixin, wrapper) => {
    Object.setPrototypeOf(wrapper, mixin);
    if (!mixin[_originalMixin]) {
      mixin[_originalMixin] = mixin;
    }
    return wrapper;
  };

  const unwrap = exports.unwrap = wrapper => wrapper[_originalMixin] || wrapper;

  const hasMixin = exports.hasMixin = (o, mixin) => {
    while (o != null) {
      if (isApplicationOf(o, mixin)) return true;
      o = Object.getPrototypeOf(o);
    }
    return false;
  };

  const Cached = exports.Cached = mixin => wrap(mixin, superclass => {
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

  const DeDupe = exports.DeDupe = mixin => wrap(mixin, superclass => {
    if (hasMixin(superclass.prototype, mixin)) return superclass;
    return mixin(superclass);
  });

  const HasInstance = exports.HasInstance = mixin => {
    if (Symbol.hasInstance && !mixin[Symbol.hasInstance]) {
      Object.defineProperty(mixin, Symbol.hasInstance, {
        value(o) {
          return hasMixin(o, mixin);
        }
      });
    }
    return mixin;
  };

  const BareMixin = exports.BareMixin = mixin => wrap(mixin, s => apply(s, mixin));

  const Mixin = exports.Mixin = mixin => DeDupe(Cached(BareMixin(mixin)));

  const mix = exports.mix = superclass => new MixinBuilder(superclass);

  class MixinBuilder {
    constructor(superclass) {
      this.superclass = superclass;
    }

    with(...mixins) {
      return mixins.reduce((c, m) => m(c), this.superclass);
    }

  }
});