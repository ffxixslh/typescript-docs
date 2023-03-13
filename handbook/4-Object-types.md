# Object Types

## Property Modifiers

Each property in an object type can specify a couple of things: the type, whether the property is optional, and whether the property can be written to.

### Optional Properties

Much of the time, we’ll find ourselves dealing with objects that _might_ have a property set. In those cases, we can mark those properties as _optional_ by adding a question mark (`?`) to the end of their names.

```ts
interface PaintOptions {
  shape: Shape
  xPos?: number
  yPos?: number
}
```

All optionality really says is that if the property _is_ set, it better have a specific type, or TypeScript will tell us they're potentially `undefined`.

```ts
function paintShape({ shape, xPos = 0, yPos = 0 }: PaintOptions) {
  console.log('x coordinate at', xPos)
  //                             ^
  //                 (parameter) xPos: number
  console.log('y coordinate at', yPos)
  //                             ^
  //                 (parameter) yPos: number
  // ...
}
```

Here We used a destructing pattern for `PaintOption` and provided default values for the optionality. Now `xPos` and `yPos` are both definitely present within the body of paintShape, but optional for any callers to `paintShape`.
can

> Note that there is currently no way to place type annotations within destructuring patterns. This is because the following syntax already means something different in JavaScript.

### `readonly` Properties

Properties can also be marked as `readonly` for TypeScript.
While it won’t change any behavior at runtime, a property marked as `readonly` can’t be written to during type-checking.

```ts
interface SomeType {
  readonly prop: string
}

function doSomething(obj: SomeType) {
  // We can read from 'obj.prop'.
  console.log(`prop has the value '${obj.prop}'.`)

  // But we can't re-assign it.
  obj.prop = 'hello'
  //  ^~~~
  // Cannot assign to 'prop' because it is a read-only property.
}
```

The `readonly` modifier just means the property itself can't be re-written to.

**It’s useful to signal intent during development time for TypeScript on how an object should be used**. TypeScript doesn’t factor in whether properties on two types are readonly when checking whether those types are compatible, so readonly properties can also change via aliasing.

```ts
interface Person {
  name: string
  age: number
}

interface ReadonlyPerson {
  readonly name: string
  readonly age: number
}

let writablePerson: Person = {
  name: 'Person McPersonface',
  age: 42,
}

// works
let readonlyPerson: ReadonlyPerson = writablePerson

console.log(readonlyPerson.age) // prints '42'
writablePerson.age++
console.log(readonlyPerson.age) // prints '43'
```

### Index Signatures

Sometimes you don’t know all the names of a type’s properties ahead of time, but you do know the shape of the values.

In those cases you can use an index signature to describe the types of possible values.

```ts
interface StringArray {
  [index: number]: string
}

const myArray: StringArray = getStringArray()
const secondItem = myArray[1]
//    ^---------
//    const secondItem: string
```

Only some types are allowed for index signature properties: `string`, `number`, `symbol`, template string patterns, and union types consisting only of these.

While string index signatures are a powerful way to describe the “dictionary” pattern, they also enforce that all properties match their return type.

```ts
interface NumberDictionary {
  [index: string]: number

  length: number // ok
  name: string
  //^~
  // Property 'name' of type 'string' is not assignable to 'string' index type 'number'.
}
```

However, properties of different types are acceptable if the index signature is a union of the property types.

```ts
interface NumberOrStringDictionary {
  [index: string]: number | string
  length: number // ok, length is a number
  name: string // ok, name is a string
}
```

You can also make index signatures `readonly` in order to prevent assignment to their indices.

## Extending Types

The `extends` keyword on an `interface` allows us to effectively copy members from other named types, and add whatever new members we want.

`interface`s can also extend from multiple types.

```ts
interface Colorful {
  color: string
}

interface Circle {
  radius: number
}

interface ColorfulCircle extends Colorful, Circle {}

const cc: ColorfulCircle = {
  color: 'red',
  radius: 42,
}
```

## Intersection Types

TypeScript provides another construct called _intersection types_ that is mainly used to combine existing object types.

An intersection type is defined using the `&` operator.

```ts
interface Colorful {
  color: string
}

interface Circle {
  radius: number
}

type ColorfulCircle = Colorful & Circle
```

## Interfaces vs. Intersection

The principle difference between the two is how conflicts are handled, and that difference is typically one of the main reasons why you'd pick one over the other between an interface and a type alias of an intersection type.

## Generic Object Types

We can make a generic `Box` type which declares a _type parameter_ to contain more types.

```ts
interface Box<Type> {
  contents: Type
}
```

It is worth nothing that type aliases can also be generic.

```ts
type Box<Type> = {
  contents: Type
}
```

Since type aliases, unlike interfaces, can describe more than just object types, we can also use them to write other kinds of generic helper types.

```ts
type OrNull<Type> = Type | null

type OneOrMany<Type> = Type | Type[]

type OneOrManyOrNull<Type> = OrNull<OneOrMany<Type>>

type OneOrManyOrNullStrings = OneOrManyOrNUll<string>
```

## The `Array` Type

Whenever we write out types like `number[]` or `string[]`, that's really just a shorthand for `Array<number>` and `Array<string>`.

```ts
function doSomething(value: Array<string>) {
  // ...
}

let myArray: string[] = ['hello', 'world']

// either of these work!
doSomething(myArray)
doSomething(new Array('hello', 'world'))
```

Much like the `Box` type above, `Array` itself is a generic type.

Modern JavaScript also provides other data structures which are generic, like `Map<K, V>`, `Set<T>`, and `Promise<T>`. All this really means is that because of how `Map`, `Set`, and `Promise` behave, they can work with any sets of types.

## The `ReadonlyArray` Type

The `ReadonlyArray` is a special type that describes arrays that shouldn't be changed.

```ts
function doStuff(values: ReadonlyArray<string>) {
  // We can read from 'values'...
  const copy = values.slice()
  console.log(`The first value is ${values[0]}`)

  // ...but we can't mutate 'values'.
  values.push('hello!')
  //     ^~~~
  // Property 'push' does not exist on type 'readonly string[]'.
}
```

Much like the `readonly` modifier for properties, it's mainly a tool we can use for intent.

Unlike `Array`, there isn't a `ReadonlyArray` constructor that we can use.

Just as TypeScript provides a shorthand syntax for `Array<Type>` with Type[], it also provides a shorthand syntax for `ReadonlyArray<Type>` with readonly Type[].

## Tuple Types

A _tuple type_ is another sort of `Array` type that knows exactly how many elements it contains, and exactly which types it contains at specific positions.

```ts
type StringNumberPair = [string, number]
```

To the type system, `StringNumberPair` describes arrays whose `0` index contains a `string` and whose `1` index contains a `number`.

```ts
function doSomething(pair: [string, number]) {
  const a = pair[0]
  //    ^
  // const a: string
  const b = pair[1]
  //    ^
  // const b: number
  // ...
}

doSomething(['hello', 42])
```

If we try to index past the number of elements, we'll get an error.

```ts
function doSomething(pair: [string, number]) {
  // ...

  const c = pair[2]
  //             ^
  // Tuple type '[string, number]' of length '2' has no element at index '2'.
}
```

Tuples can have optional properties by writing out a question mark (`?` after an element’s type). Optional tuple elements can only come at the end, and also affect the type of `length`.

```ts
type Either2dOr3d = [number, number, number?]

function setCoordinate(coord: Either2dOr3d) {
  const [x, y, z] = coord
  //           ^
  // const z: number | undefined

  console.log(`Provided coordinates had ${coord.length} dimensions`)
  //                                            ^~~~~~
  // (property) length: 2 | 3
}
```

Tuples can also have rest elements, which have to be an array/tuple type.

```ts
type StringNumberBooleans = [string, number, ...boolean[]]
type StringBooleansNumber = [string, ...boolean[], number]
type BooleansStringNumber = [...boolean[], string, number]
```

A tuple with a rest element has no set “length” - it only has a set of well-known elements in different positions.

Tuples types can be used in rest parameters and arguments, so that the following:

```ts
function readButtonInput(...args: [string, number, ...boolean[]]) {
  const [name, version, ...input] = args
  // ...
}
```

is basically equivalent to:

```ts
function readButtonInput(name: string, version: number, ...input: boolean[]) {
  // ...
}
```

This is handy when you want to take a variable number of arguments with a rest parameter, and you need a minimum number of elements, but you don’t want to introduce intermediate variables.

## `readonly` Tuple Types

One final note about tuple types - tuples types have readonly variants, and can be specified by sticking a readonly modifier in front of them - just like with array shorthand syntax.

As you might expect, writing to any property of a readonly tuple isn’t allowed in TypeScript.

```ts
function doSomething(pair: readonly [string, number]) {
  pair[0] = 'hello!'
  //   ^
  // Cannot assign to '0' because it is a read-only property.
}
```

This is also important given that array literals with const assertions will be inferred with `readonly` tuple types.

```ts
let point = [3, 4] as const

function distanceFromOrigin([x, y]: [number, number]) {
  return Math.sqrt(x ** 2 + y ** 2)
}

distanceFromOrigin(point)
//                 ^~~~~
// Argument of type 'readonly [3, 4]' is not assignable to parameter of type '[number, number]'.
// The type 'readonly [3, 4]' is 'readonly' and cannot be assigned to the mutable type '[number, number]'.
```
