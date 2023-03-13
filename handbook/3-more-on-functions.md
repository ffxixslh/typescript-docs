# 3

## More on Functions

### Function Type Expressions

> The simplest way to describe a function is with a _function type expression_.

```ts
function greeter(fn: (a: string) => void) {
  fn('hello world')
}

function printToConsole(s: string) {
  console.log(s)
}

greeter(printToConsole)
```

The syntax `(a: string) => void` means "a function with one parameter, named `a`, of type string, that doesn't have a return value". Just like with function declarations, if a parameter type isn't specified, it's implicitly `any`.

> Note that the parameter name is **required**.

Of course, we can use a type alias to name a function type:

```ts
type GreetFunction = (a: string) => void
function greeter(fn: GreetFunction) {
  // ...
}
```

### Call Signatures

If we want to describe something callable with properties, we can write a _call signature_ in an object type:

```ts
type DescribableFunction = {
  description: string
  (someArg: number): boolean
}
function doSomething(fn: DescribableFunction) {
  console.log(fn.description + ' return ' + fn(6))
}
```

Note that the syntax is slightly different compared to a function type expression - use`:` between the parameter list and the return type rather than `=>`.

### Construct Signatures

JavaScript functions can also be invoked with the `new` operator. TypeScript refers to these as _constructors_ because they usually create a new object.

You can write a _construct signature_ by adding the `new` keyword in front of a call signature.

```ts
type SomeConstructor = {
  new (s: string): SomeObject
}
function fn(ctor: SomeConstructor) {
  return new ctor('hello')
}
```

Some objects, like the `Date` object, can be called with or without `new`. You can combine call and construct signatures in the same type arbitrarily.

```ts
interface CallOrConstruct {
  new (s: string): Date
  (n?: number): number
}
```

### Generic Functions

In TypeScript, _generics_ are used when we want to describe a correspondence between two values.

> Usually we use the short names for types, for example: `T` for `Type`, `V` for `Value`, `K` for `key` etc..

```ts
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0]
}
```

By adding a type parameter `T` to this function and using it in two places, we've created a link between the input of the function (the array) and the output (the return value). Now when we call it, a more specific type comes out

```ts
// s is for type 'string'
const s = firstElement(['a', 'b', 'c'])
// n is for type 'number'
const n = firstElement([1, 2, 3])
// u is for type undefined
const u = firstElement([])
```

### Inference

Note that we didn't have to specify `T` in this sample. The type was _inferred_ - chosen automatically - by TypeScript.

We can use multiple type parameters as well. For example, a standalone version of the `map` would look like this:

```ts
function map<Input, Output>(
  arr: Input[],
  func: (arg: Input) => Output
): Output[] {
  return arr.map(func)
}

// Parameter 'n' is of type 'string'
// 'parsed' is of type 'number[]'
const parsed = map(['1', '2', '3'], (n) => parseInt(n))
```

Note that in this sample, TypeScript could infer both the type of the `Input` type parameter (from the given `string` array), as well as the `Output` type parameter based on the return value of the function expression (`number`).

### Constraints

Sometimes we want to relate two values but can only operate on a certain subset of values. In this case, we can use a _constraint_ to limit the kinds of types that a type parameter can accept.

We _constrain_ the type parameter to that type by writing an `extends` clause:

```ts
function longest<Type extends { length: number }>(a: Type, b: Type): Type {
  if (a.length >= b.length) {
    return a
  } else {
    return b
  }
}

// longerArray is of type 'number[]'
const longerArray = longest([1, 2], [1, 2, 3])
// longerString is of type 'alice' | 'bob'
const longerString = longest('alice', 'bob')
// Error! Numbers don't have a 'length' property
const notOK = longest(10, 100)
```

### Working with Constrained Values

Here's a common error when working with generic constraints:

```ts
function minimumLength<Type extends { length: number }>(
  obj: Type,
  minimum: number
): Type {
  if (obj.length >= minimum) {
    return obj
  } else {
    return { length: minimum }
    // Type '{ length: number; }' is not assignable to type 'Type'.
    // '{ length: number; }' is assignable to the constraint of type 'Type', but 'Type' could be instantiated with a different subtype of constraint '{ length: number; }'.
  }
}
```

It might look like this function is OK - `Type` is constrained to `{ length: number }`, and the function either returns `Type` or a value matching that constraint.

The problem is that the function promises to return the _same_ kind of object as was passed in, not just _some_ object matching the constraint.

If this code were legal, you could write code that definitely wouldn't work:

```ts
// 'arr' gets value { length: 6 }
const arr = minimumLength([1, 2, 3], 6)
// and crashes here because arrays have
// a 'slice' method, but not the returned object
console.log(arr.slice(0))
```

### Specifying Type Arguments

TypeScript can't always infer the intended type arguments in a generic call.

```ts
function combine<Type>(arr1: Type[], arr2: Type[]): Type[] {
  return arr1.concat(arr2)
}
```

Normally it would be an error to call this function with mismatched arrays:

```ts
const arr = combine([1, 2, 3], ['hello'])
// Type 'string' is not assignable to type 'number'
```

If you intended to do this, however, you could manually specify the `Type`:

```ts
const arr = combine<string | number>([1, 2, 3], ['hello'])
```

### Guidelines for Writing Good Generic Functions

> Writing generic functions is fun, and it can be easy to get carried away with type parameters. Having too many type parameters or using constraints where they aren't needed can make inference less successful, frustrating callers of your function.

#### Push Type Parameters Down

> Rule: When possible, use the type parameters itself rather than constraining it.

```ts
function firstElement1<Type>(arr: Type[]) {
  return arr[0]
}

function firstElement2<Type extends any[]>(arr: Type) {
  return arr[0]
}

// a: number (good)
const a = firstElement1([1, 2, 3])
// b: any (bad)
const b = firstElement2([1, 2, 3])
```

These might seem identical at first glance, but `firstElement1` is a much better way to write this function. Its inferred return type is `Type`, but `firstElement2`'s inferred return is `any` because TypeScript has to resolve the `arr[0]` expression using the constraint type, rather than 'waiting' to resolve the element during a call.

#### Use Fewer Type Parameters

> Always use as few type parameters as possible.

Here's another pair of similar functions:

```ts
function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {
  return arr.filter(func)
}

function filter2<Type, Func extends (arg: Type) => boolean>(
  arr: Type[],
  func: Func
): Type[] {
  return arr.filter(func)
}
```

We've created a type parameter `Func` that _doesn't relate two values_. That's always a red flag because it means callers wanting to specify type arguments have to manually specify an extra type argument for no reason. `Func` doesn't do anything but make function harder to read and reason about!

#### Type Parameters Should Appear Twice

> If a type parameter only appears in one location, strongly reconsider if you actually need it.

Sometimes we forget that a function might not need to be generic:

```ts
function greet<Str extends string>(s: Str) {
  console.log('Hello, ' + s)
}

greet('world')
```

We could just as easily have written a simpler version:

```ts
function greet(s: string) {
  console.log('Hello, ' + s)
}
```

Remember, type parameters are for _relating the types of multiple values_. If a type parameter is only used once in the function signature, it's not relating anything.

### Optional Parameters

Functions in JavaScript often take a variable number of arguments. We can model this in TypeScript by marking the parameter as _optional_ with `?`:

```ts
function f(x?: number) {
  // ...
}
f() // OK
f(10) // OK
```

Although the parameter is specified as a type `number`, the `x` parameter will actually have the type `number | undefined` because unspecified parameters in JavaScript get the value `undefined`.

You can also provide a parameter _default_:

```ts
function f(x = 10) {
  // ...
}
```

Now in the body of `f`, `x` will have a type `number` because any `undefined` argument will be replaced with `10`. Note that when a parameter is optional, callers can always pass `undefined`, as this simply simulates a "missing" argument:

```ts
declare function f(x?: number): void
// cut
// All OK
f()
f(10)
f(undefined)
```

### Optional Parameters in Callbacks

> When writing a function type for a callback, _never_ write an optional parameter unless you intend to _call_ the function without passing that argument.

What people usually intend when writing `index?` as an optional parameter is that they want both of these calls to be legal:

```ts
myForEach([1, 2, 3], (a) => console.log(a))
myForEach([1, 2, 3], (a, i) => console.log(a, i))
```

What this actually means is that _`callback` might get invoked with one argument_. In other words, the function definition says that the implementation might look like this:

```ts
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    // I don't feel like providing the index today
    callback(arr[i])
  }
}
```

In turn, TypeScript will enforce this meaning and issue errors that aren't really possible:

```ts
myForEach([1, 2, 3], (a, i) => {
  console.log(i.toFixed())
  // Object is possibly 'undefined'.
  // log result:
  // 1 undefined
  // 2 undefined
  // 3 undefined
})
```

In JavaScript, if you call a function with more arguments than there are parameters, the extra arguments are simply ignored. TypeScript behaves the same way. Functions with fewer parameters (of the same types) can always take the place of functions with more parameters

### Function Overloads

In TypeScript, we can specify a function that can be called in different ways by writing _overload signatures_. To do this, write some number of function signatures (usually two or more), followed by the body of the function:

```ts
function makeDate(timestamp: number): Date
function makeDate(m: number, d: number, y: number): Date
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d)
  } else {
    return new Date(mOrTimestamp)
  }
}
const d1 = makeDate(12345678)
const d2 = makeDate(5, 5, 5)
const d2 = makeDate(1, 3)
// No overload expects 2 arguments, but overloads do exit that expect 1 or 3 arguments.
```

**These first two signatures are called the _overload signatures_.**

Then, we wrote a function implementation with a compatible signature, **Functions have an _implementation_ signature**, but this signature can't be called directly. Even though we wrote a function with two optional parameters after the required one, it can't be called with two parameters!

### Overload Signatures and the Implementation Signature

This is a comment source of confusion. Often people will write code like this and not understand why there is an error:

```ts
function fn(x: string): void
function fn() {
  // ...
}
// Expected to be able to call with zero arguments
fn()
// Excepted 1 arguments, but got 0.
```

Again, **the signature used to write the function body can't be "seen" from the outside.**

> The signature of the _implementation_ is not visible from the outside. When writing an overloaded function, you should always have _two_ or more signatures above the implementation of the function.

**The implementation signature must also be _compatible_ with the overload signatures.**

For example, these functions have errors because the implementation signature doesn't match the overloads in a correct way:

```ts
function fn(x: boolean): void
// Argument type isn't right
function fn(x: string): void
// This overload signature is not compatible with its implementation signature.
function fn(x: boolean) {}
```

### Writing Good Overloads

> Always prefer parameters with union types instead of overloads when possible

Like generics, there are a few guidelines you should follow when using function overloads. Following these principles will make your function easier to call, easier to understand, and easier to implement.

Let's consider a function that returns the length of a string or an array:

```ts
function len(s: string): number
function len(arr: any[]): number
function len(x: any) {
  return x.length
}
```

This function is fine; we can invoke it with strings or arrays. However, we can't invoke it with a value that might be a string _or_ an array, because TypeScript can only resolve a function call to a single overload:

```ts
len('') // OK
len([0]) // OK
len(Math.random() > 0.5 ? 'hello' : [0])
```

Because **both overloads have the same argument count and same return type**, we can instead write a non-overloaded version of the function:

```ts
function len(x: any[] | string) {
  return x.length
}
```

This is much better! Callers can invoke this with either sort of value, and as an added bonus, we don't have to figure out a correct implementation signature.

### Declaring `this` in a function

TypeScript will infer what the `this` should be in a function via code flow analysis, for example in the following:

```ts
const user = {
  id: 123,

  admin: false,
  becomeAdmin: function () {
    this.admin = true
  },
}
```

TypeScript understands that the function `user.becomeAdmin` has a corresponding `this` which is the outer object `user`. `this` can be enough for a lot of cases, but there are a lot of cases where you need more control over what object `this` represents, and so TypeScript uses that syntax space to let you declare the type for `this` in the function body.

```ts
interface DB {
  filterUsers(filter: (this: User) => boolean): User[]
}

const db = getDB()
const admins = db.filterUsers(function (this: User) {
  return this.admin
})
```

This pattern is common with callback-style APIS, where another object typically controls when your function is called. Note that you need to use `function` and not arrow functions to get this behavior:

```ts
interface DB {
  filterUsers(filter: (this: User) => boolean): User[]
}

const db = getDB()
const admins = db.filterUsers(() => this.admin)
//                                  ^~~~ ~~~~~
// The containing arrow function captures the global value of 'this'.
// Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
```

### Other Types to Know About

#### void

`void` represents the return value of functions which don't return a value.

In JavaScript, a function that doesn't return any value will implicitly return the value `undefined`. However, `void` and `undefined` are not the same thing in TypeScript.

> `void` is not the same as `undefined`.

#### object

The special type `object` refers to any value that isn't a primitive(`string`, `number`, `boolean`, `symbol`, `null`, or `undefined`). This is different from the _empty_ type `{}`, and also different from the global type `Object`. It's very likely you will never use `Object`.

> `object` is not `Object`. _Always_ use `object`!

#### unknown

The `unknown` type represents _any_ value. This is similar to `any` type, but is safer because it's not legal to do anything with an `unknown` value:

```ts
function f1(a: any) {
  a.b() // OK
}

function f2(a: unknown) {
  a.b()
  //^
  // Object is of type 'unknown'.
}
```

This is useful when describing function types because you can describe functions that accept any value without having `any` values in your function body.

#### never

the `never` type represents values which are _never_ observed. In a return type, this means that the function throw an exception or terminates execution fof the program.

**`never` also appears when TypeScript determines there's nothing left in a union.**

#### Function

The global type `Function` describes properties like `bind`, `call`, `apply`, and others present on all function values in JavaScript. it also has the special property that values of the `Function` can always be called; these calls return `any`.

```ts
function doSomething(f: Function) {
  return f(1, 2, 3)
}
// The return type of `doSomething` is any.
// Use `() => void` is more safer than `Function`.
```

### Rest Parameters and Arguments

### Rest Parameters

In addition to using optional parameters or overloads to make functions that can accept a variety of fixed argument counts, we can also define functions that take an _unbounded_ number of arguments using _rest_ parameters.

A rest parameter appears after all other parameters, and uses the `...` syntax.

```ts
function multiply(n: number, ...m: number[]) {
  return m.map((x) => n * x)
}
// 'a' gets value [10, 20, 30, 40]
const a = multiply(10, 1, 2, 3, 4)
```

In TypeScript, the type annotation on these parameters is implicitly `any[]` instead of `any`, and any type annotation given must be of the form `Array<T>` or `T[]`, or a tuple type.

#### Rest Arguments

TypeScript does not assume that arrays are immutable. This can lead to some surprising behavior:

```ts
// Inferred type is number [] -- "an array with zero or more numbers",
// not specifically two numbers
const args = [8, 5]
const angle = Math.atan2(...args)
//                       ^~~
// A spread argument must either have a tuple type or be passed to a rest parameter.
```

The best fix for this situation depends a bit on your code, but in general a `const` context is the most straightforward solution:

```ts
// Inferred as 2-length tuple
const args = [8, 5] as const
// OK
const angle = Math.atan2(...args)
```

Using rest arguments may require turning on downlevelIteration when targeting older runtimes.

### Parameter Destructuring

You can use parameter destructuring to conveniently unpack objects provided as an argument into one or more local variables in the function body. In JavaScript, it looks like this:

```js
function sum({ a, b, c }) {
  console.log(a + b + c)
}
sum({ a: 10, b: 3, c: 9 })
```

The type annotation for the object goes after the destructuring syntax:

```ts
function sum({ a, b, c }): { a: number; b: number; c: number } {
  console.log(a + b + c)
}
```

This can look a bit verbose, but you can use a named type here as well:

```ts
// Same as prior example
type ABC = { a: number; b: number; c: number }
function sum({ a, b, c }: ABC) {
  console.log(a + b + c)
}
```

### Assignability of Functions

#### Return type `void`

Contextual typing with a return type of `void` does **not** force functions to **not** return something. Another way to say this is a contextual function type with a `void` return type (`type vf = () => void`), when implemented, can return _any_ other value, but it will be ignored.

Thus, the following implementations of the type `() => void` are valid:

```ts
type voidFunc = () => void

const f1: voidFunc = () => {
  return true
}

const f2: voidFunc = () => true

const f3: voidFunc = function () {
  return true
}
```

This behavior exists so that the following code is valid even though `Array.prototype.push` returns a number and the `Array.prototype.forEach` method expects a function with a return type of `void`.

There is one other special case to be aware of, when a literal function definition has a `void` return type, that function must **not** return anything.

```ts
function f2(): void {
  // @ts-expect-error
  return true
}

const f3 = function (): void {
  // @ts-expect-error
  return true
}
```
