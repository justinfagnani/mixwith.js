'use strict'

// used by apply() and isApplicationOf()
;

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
  const _appliedMixin = '__mixwith_appliedMixin';

  const apply = exports.apply = (superclass, mixin) => {
    let application = mixin(superclass);
    application.prototype[_appliedMixin] = unwrap(mixin);
    return application;
  };

  const isApplicationOf = exports.isApplicationOf = (proto, mixin) => proto.hasOwnProperty(_appliedMixin) && proto[_appliedMixin] === unwrap(mixin);

  const hasMixin = exports.hasMixin = (o, mixin) => {
    while (o != null) {
      if (isApplicationOf(o, mixin)) return true;
      o = Object.getPrototypeOf(o);
    }
    return false;
  };

  const _wrappedMixin = '__mixwith_wrappedMixin';

  const wrap = exports.wrap = (mixin, wrapper) => {
    Object.setPrototypeOf(wrapper, mixin);
    if (!mixin[_wrappedMixin]) {
      mixin[_wrappedMixin] = mixin;
    }
    return wrapper;
  };

  const unwrap = exports.unwrap = wrapper => wrapper[_wrappedMixin] || wrapper;

  const _cachedApplications = '__mixwith_cachedApplications';

  const Cached = exports.Cached = mixin => wrap(mixin, superclass => {
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

  const DeDupe = exports.DeDupe = mixin => wrap(mixin, superclass => hasMixin(superclass.prototype, mixin) ? superclass : mixin(superclass));

  const HasInstance = exports.HasInstance = mixin => {
    if (Symbol && Symbol.hasInstance && !mixin[Symbol.hasInstance]) {
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
      this.superclass = superclass || class {};
    }

    with(...mixins) {
      return mixins.reduce((c, m) => m(c), this.superclass);
    }

  }
});