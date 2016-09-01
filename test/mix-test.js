'use strict';

import {assert} from 'chai';

import {
  apply,
  isApplicationOf,
  wrap,
  unwrap,
  hasMixin,
  Mixin,
  BareMixin,
  Cache,
  DeDupe,
  HasInstance,
  mix,
} from '../mixwith';


// Enable the @@hasInstance patch in mixwith.HasInstance
if (!Symbol.hasInstance) {
  Symbol.hasInstance = Symbol('hasInstance');
}

let A = Mixin((superclass) => class A extends superclass {
  foo() {
    return ['A.foo'];
  }

  bar() {
    return ['A.bar'];
  }

  baz() {
    return ['A.baz before'].concat(super.baz()).concat(['A.baz after']);
  }

});

let B = Mixin((superclass) => class extends superclass {
  bar() {
    console.log('B.bar');
  }
});

let C = Mixin((superclass) => class extends superclass {
  constructor() {
    console.log('C.constructor', arguments);
    super(...arguments);
  }
  bar() {
    console.log('C.bar');
    super.bar();
  }
});

class D {

  bar() {
    return ['D.bar'];
  }

  baz() {
    return ['D.baz'];
  }

  qux() {
    return ['D.qux'];
  }

}

class DwithA extends mix(D).with(A) {

  quux() {
    return ['DwithA.quux'];
  }

}

class DwithB extends mix(D).with(B) {
  bar() {
    return ['DwithB.bar'];
  }

  baz() {
    return ['DwithB.baz'];
  }

  qux() {
    return ['DwithB.qux before'].concat(super.qux()).concat(['DwithB.qux after']);
  }

}

class DwithAwithB extends mix(D).with(B, A) {
  // constructor() {
  //   super('OK');
  // }

  qux() {
    return ['DwithAwithB.qux'];
  }
}

// class DwithAwithC extends mix(D).with(C, A) {
//   constructor() {
//     console.log('DwithAwithC.constructor');
//     super();
//   }
//
//   bar() {
//     console.log('DwithAwithC.bar');
//     super.bar();
//   }
//
//   qux() {
//     console.log('DwithAwithC.qux');
//   }
// }

suite('mixwith.js', () => {

  suite('apply() and isApplicationOf()', () => {

    test('apply() applies a mixin function', () => {
      const M = (s) => class extends s {
        test() {
          return true;
        }
      };
      class Test extends apply(Object, M) {}
      const i = new Test();
      assert.isTrue(i.test());
    });

    test('isApplication() returns true for a mixin applied by apply()', () => {
      const M = (s) => class extends s {};
      assert.isTrue(isApplicationOf(apply(Object, M).prototype, M));
    });

    test('isApplication() works with wrapped mixins', () => {
      const M = (s) => class extends s {};
      const WrappedM = wrap(M, (superclass) => apply(superclass, M));
      assert.isTrue(isApplicationOf(WrappedM(Object).prototype, WrappedM));
    });

    test('isApplication() returns false when it should', () => {
      const M = (s) => class extends s {};
      const X = (s) => class extends s {};
      assert.isFalse(isApplicationOf(apply(Object, M).prototype, X));
    });

  });

  suite('hasMixin()', () => {
    test('hasMixin() returns true for a mixin applied by apply()', () => {
      const M = (s) => class extends s {};

      assert.isTrue(hasMixin(apply(Object, M).prototype, M));
    });

  });

  suite('wrap() and unwrap()', () => {

    test('wrap() sets the prototype', () => {
      const f = (x) => x*x;
      f.test = true;
      const wrapper = (x) => f(x);
      wrap(f, wrapper);
      assert.isTrue(wrapper.test);
      assert.equal(f, Object.getPrototypeOf(wrapper));
    });

    test('unwrap() returns the wrapped function', () => {
      const f = (x) => x*x;
      const wrapper = (x) => f(x);
      wrap(f, wrapper);
      assert.equal(f, unwrap(wrapper));
    });

  });

  suite('mix().with()', () => {

    test('subclasses are subclasses', () => {
      let o = new DwithA();
      assert.instanceOf(o, D);
    });

    test('mixin application is on prototype chain', () => {
      let o = new DwithA();
      assert.isTrue(hasMixin(o, A));
    });

    test('subclasses implement mixins', () => {

      class Check {
        static [Symbol.hasInstance](o) { return true; }
      }
      let hasNativeHasInstance = 1 instanceof Check;

      if (hasNativeHasInstance) {
        assert.instanceOf(o, A);
      }
    });

    test('methods on mixin are present', () => {
      let o = new DwithA();
      assert.deepEqual(o.foo(), ['A.foo']);
    });

    test('methods on superclass are present', () => {
      let o = new DwithA();
      assert.deepEqual(o.qux(), ['D.qux']);
    });

    test('methods on subclass are present', () => {
      let o = new DwithA();
      assert.deepEqual(o.quux(), ['DwithA.quux']);
    });

    test('methods on mixin override superclass', () => {
      let o = new DwithA();
      assert.deepEqual(o.bar(), ['A.bar']);
    });

    test('methods on mixin can call super', () => {
      let o = new DwithA();
      assert.deepEqual(o.baz(), ['A.baz before', 'D.baz', 'A.baz after']);
    });

    test('methods on subclass override superclass', () => {
      let o = new DwithB();
      assert.deepEqual(o.bar(), ['DwithB.bar']);
    });

    test('methods on subclass override mixin', () => {
      let o = new DwithB();
      assert.deepEqual(o.baz(), ['DwithB.baz']);
    });

    test('methods on subclass can call super to superclass', () => {
      let o = new DwithB();
      assert.deepEqual(o.qux(), ['DwithB.qux before', 'D.qux', 'DwithB.qux after']);
    });


  });



});
