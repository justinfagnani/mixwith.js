'use strict';

import {mix, _mixinRef, Mixin, _originalMixin} from '../mixwith';
import {assert} from 'chai';

// Enable the @@hasInstance patch in HasInstance
const originalHasInstance = Symbol.hasInstance;
Symbol.hasInstance = Symbol.hasInstance || Symbol('hasInstance');

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

suite('mix', () => {

  test('subclasses are subclasses', () => {
    let o = new DwithA();
    assert.instanceOf(o, D);
  });

  test('mixin application is on prototype chain', () => {
    let o = new DwithA();
    assert.isTrue(o.__proto__.__proto__.hasOwnProperty(_mixinRef));
    assert.equal(o.__proto__.__proto__[_mixinRef], A[_originalMixin]);
  });

  test('subclasses implement mixins', () => {
    let o = new DwithA();
    assert.isTrue(A[Symbol.hasInstance](o));
    if (originalHasInstance) {
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
