# mixwith.js

A simple, powerful and safe mixin library for ES6.

## Overview

`mixwith` differs from other mixin approaches because it does not copy properties from one object to another. Instead, `mixwith` works with "subclass factories" which create a new class that extends a superclass with the mixin - this is called a _mixin_ _application_.

Subclass factory style mixins take advantage of two awesome features of ES6 classes: _class_ _expressions_, and expressions in the `extends` clause of a class declaration.

### Quick Example

#### Define a Mixin:

```javascript
let MyMixin = (superclass) => class extends superclass {
  // mixin methods here
};
```

#### Use a Mixin without mixwith:

```javascript
class MyClass extends MyMixin(MySuperClass) {
  // class methods here, go ahead, use super!
}
```

#### Use a Mixin with mixwith:

```javascript
class MyClass extends mix(MySuperClass).with(MyMixin, OtherMixin) {
  // class methods here, go ahead, use super!
}
```

`mixwith` preserves the object-oriented inheritance properties that classes provide, like method overriding and `super` calls, while letting you compose classes out of mixins without being constrained to a single inheritance hierarchy, and without monkey-patching or copying.

### Advantages of subclass factories over typical JavaScript mixins

#### Method overriding that just works

Methods in subclasses can naturally override methods in the mixin or superclass, and mixins override methods in the superclass. This means that precedence is preserved - the order is: _subclass_ -> _mixin__1_ -> ... -> _mixin__N_ -> _superclass_.

#### `super` works

Subclasses and mixins can use `super` normally, as defined in standard Javascript, and without needing the mixin library to do special chaining of functions.

#### Mixins can have constructors

Since `super()` works, mixins can define constructors. Combined with ES6 rest arguments and the spread operator, mixins can have generic constructors that work with any super constructor by passing along all arguments.

#### Prototypes and instances are not mutated

Typical JavaScript mixins usually used to either mutate each instance as created, which can be bad for performance and maintainability, or modify a prototype, which means every object inheriting from that prototype gets the mixin. Subclass factories don't mutate objects, they define new classes to subclass, leaving the original superclass intact.

## Usage

### Defining Mixins

A mixin is simply a function that takes a superclass and returns a subclass of it, using ES6 class expressions:

```javascript
let MyMixin = (superclass) => class extends superclass {

  constructor(args...) {
    // mixins should either 1) not define a constructor, 2) require a specific
    // constructor signature, or 3) pass along all arguments.
    super(...args);
  }

  foo() {
    console.log('foo from MyMixin');
    // this will call superclass.foo()
    super.foo();
  }

};
```

Mixins defined this way do not require any helpers to define or use. You can use this pattern without `mixwith` at all!

### Using Mixins

Without `mixwith`, just invoke them inside a classes `extends` clause:

```javascript
class MyClass extends MyMixin(MySuperClass) {
}
```

`mixwith` provides a helper that's a bit nicer when applying multiple mixins, and adds some features like mixin-deduplication and `@@hasInstance` support (`@@hasInstance` overloads `instanceof`, but isn't supported in any browsers yet).

```javascript
class MyClass extends mix(MySuperClass).with(MyMixin) {
}
```

Classes that use mixins can define and override constructors and methods as usual.

```javascript
class MyClass extends mix(MySuperClass).with(MyMixin) {

  constructor(a, b) {
    super(a, b); // calls MyMixin(a, b)
  }

  foo() {
    console.log('foo from MyClass');
    super.foo(); // calls MyMixin.foo()
  }

}
```
