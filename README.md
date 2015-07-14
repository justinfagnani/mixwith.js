# mixwith.js
A mixin library for ES6.

`mixwith` differs from other mixin approaches because it does not copy properties from a mixin into an instance. Instead, `mixwith` creates a new class that includes the superclass and all mixins, for you to subclass.

Mixins are defined as functions that take a superclass and return a new subclass. In this way, mixins are really abstract subclasses - subclasses without a fixed superclass. Another way to view them is as "subclass factories".

`mixwith` preserves the object-oriented inheritance techniques that classes provide, like method overriding and `super` calls, while letting you compose classes out of unrelated mixins without being constrained to a single inheritance hierarchy, and without mokey-patching objects.

# Usage

Defining Mixins:
```language-javascript
let MyMixin = (superclass) => class extends superclass {

  constructor() {
    // Mixins can have constructors, but _always_ call super like this:
    super(...arguments);
  }

  foo() {
    console.log('foo from MyMixin');
    // methods can call super
    super.foo();
  }
};
```

Using Mixins:

```language-javascript
class MyBaseClass {
  foo() {
    console.log('foo from MyBaseClass');
  }
}

// mix(S).with(M1, M2) creates a new superclass to extend:
class MyClass extends mix(MyBaseClass).with(MyMixin) {
  foo() {
    console.log('foo from MyClass');
    // super calls in classes with mixins call into the mixins
    super.foo();
  }
}
```

```language-javascript
new MyClass().foo();
```
prints:
```
foo from MyClass
foo from MyMixin
foo from MyBaseClass
```
