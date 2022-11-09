# 2

## Narrowing

> Much like how TypeScript analyzes runtime values using static types, it overlays type analysis on JavaScript’s runtime control flow constructs like `if/else`, conditional ternaries, loops, truthiness checks, etc., which can all affect those types.

> TypeScript follows possible paths of execution that our programs can take to analyze the most specific possible type of a value at a given position. It looks at these special checks (like _type guards_) and assignments, and the process or refining types to more specific types than declared is call _narrowing_.

> If this mostly looks like uninteresting JavaScript code, that's sort of the point.

Imagine we have a function called `padLeft`.

```ts
function padLeft(padding: number | string, input: string): string {
  throw new Error('Not implemented yet!')
}
```

If `padding` is a `number`, it will treat that as the number of spaces we want to prepend to `input`. If `padding` is a `string`, it should just prepend `padding` to `input`. Let's try to implement the logic for when `padLeft` is passed a `number` for `padding`.

```ts
function padLeft(padding: number | string, input: string) {
  return ' '.repeat(padding) + input
  // Argument of type 'string | number' is not assignable to parameter of type 'number'.
  // Type 'string' is not assignable to type 'number'.
}
```

TypeScript warning us that adding a `number | string` to `number` might not give us what we want. In other words, we haven't explicitly checked if `padding` is a `number` first, nor are we handling the case where it's a `string`.

### typeof Type Guard

```ts
function padLeft(padding: number | string, input: string) {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + input
    // (parameter) padding: number
  }
  return padding + input
  // (parameter) padding: string
}
```

Within our `if` check, TypeScript sees `typeof padding === 'number'` and understands that as a special form of code called a _type guard_.

In TypeScript, checking against the value returned by `typeof` is a type guard. Because TypeScript encodes how `typeof` operates on different values, it knows about some of its quirks in JavaScript.

```ts
function printAll(strs: string | string[] | null) {
  if (typeof strs === 'object') {
    for (const s of strs) {
      // Object is possibly 'null'
      console.log(s)
    }
  } else if (typeof strs === 'string') {
    console.log(strs)
  } else {
    // do nothing
  }
}
```

In the `printAll` function, we try to check if `strs` is an obj to see if it's an array type, but it turns out that `null` is actually "object"! This is one of those unfortunate accidents of history.

But fortunately, TypeScript let us know that `strs` was only narrowed down to `string[] | null` instead of just `string[]`.

This might be a good segue into what we'll call "truthiness" checking.

### Truthiness narrowing

In JavaScript, constructs like `if` first “coerce” their conditions to `boolean`s to make sense of them, and then choose their branches depending on whether the result is `true` or `false`.

You can always coerce values to `boolean`s by running then through the `Boolean` function, or by using the shorter double-Boolean negation.

```ts
// both of these result in 'true'
Boolean('hello') // type: boolean, value: true
!!'world' // type: true, value: true
```

It's fairly popular to leverage this behavior, especially for guarding against values like `null` and `undefined`.

```ts
// good
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === 'object') {
    for (const s of strs) {
      console.log(s)
    }
  } else if (typeof strs === 'string') {
    console.log(strs)
  }
}
```

Keep in mind that though that truthiness checking on primitives can often be error prone.

```ts
// bad
function printAll(strs: string | string[] | null) {
  // !!!!!!!!!!!!!!!!
  //  DON'T DO THIS!
  //   KEEP READING
  // !!!!!!!!!!!!!!!!
  if (strs) {
    if (typeof strs === 'object') {
      for (const s of strs) {
        console.log(s)
      }
    } else if (typeof strs === 'string') {
      console.log(strs)
    }
  }
}
```

We wrapped the entire body of the function in a truthy check, but this has a subtle downside: we may no longer be handling the empty string case correctly.

TypeScript can often help you catch bugs early on, but if you choose to do _nothing_ with a value, there's only so much that it can do without being overly prescriptive.

### Equality narrowing

TypeScript also uses `switch` statements and equality checks like `===`, `!==`, `==`, and `!=` to narrow types.

```ts
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // We can now call any 'string' method on 'x' or 'y'.
    x.toUpperCase();

(method) String.toUpperCase(): string
    y.toLowerCase();

(method) String.toLowerCase(): string
  } else {
    console.log(x);

(parameter) x: string | number
    console.log(y);

(parameter) y: string | boolean
  }
}
```

Checking against specific literal values (as opposed to variables) works also. With equality narrowing, we can easily modify the `printAll` function which didn't handle the `null` condition in section "Truthiness narrowing":

```ts
function printAll(strs: string | string[] | null) {
  if (strs !== null) {
    if (typeof strs === 'object') {
      for (const s of strs) {
        console.log(s)
      }
    } else if (typeof strs === 'string') {
      console.log(strs)
    }
  }
}
```

The looser equality checks with `==` and `!=` also get narrowed correctly. It checks whether a value is either `null` or `undefined`.

```ts
interface Container {
  value: number | null | undefined
}

function multiplyValue(container: Container, factor: number) {
  // Remove both 'null' and 'undefined' from the type
  if (container.value != null) {
    console.log(container.value) // (property) Container.value: number
  }

  // Now we can safely multiply 'container.value'
  container.value *= factor
}
```

### The "in" operator narrowing

JavaScript has an operator for determining if an object has a property with a name: the `in` operator. TypeScript takes this into account as a way to narrow down potential types.

```ts
type Fish = { swim: () => void }
type Bird = { fly: () => void }
// To reiterate optional properties will exist in both sides for narrowing
type Human = { swim?: () => void; fly?: () => void }

function move(animal: Fish | Bird | Human) {
  if ('swim' in animal) {
    animal // (parameter) animal: Fish | Human
  } else {
    animal // (parameter) animal: Bird | Human
  }
}
```

### Instanceof narrowing

JavaScript has an operator for checking whether or not a value is an “instance” of another value. More specifically, in JavaScript `x instanceof Foo` checks whether the *prototype chain* of `x` contains `Foo.prototype`. While we won’t dive deep here, and you’ll see more of this when we get into classes, they can still be useful for most values that can be constructed with `new`. As you might have guessed, `instanceof` is also a type guard, and TypeScript narrows in branches guarded by `instanceof`s.

```ts
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString()) // (parameter) x: Date
  } else {
    console.log(x.toUpperCase()) // (parameter) x: string
  }
}
```

### Assignments

When we assign to any variable, TypeScript looks at the right side of the assignment and narrows the left side appropriately.

The reason why the parameter `x` can be assigned from `number` to `string` is that the declared type of `x` started with - is `string | number`, and assignability is always checked against the declared type.

But if we'd assigned a `boolean` to `x`, we'd have seen an error since that wasn't part of the declared type.

```ts
let x = Math.random() < 0.5 ? 10 : 'hello world!'
// let x: string | number
x = 1
console.log(x) // let x: number

x = 'goodbye!'
console.log(x) // let x: string

x = true
// Err: Type 'boolean' is not assignable to type 'string | number'.
console.log(x)
```

### Control Flow Analysis

When TypeScript encounters the `if` block, it will see whether there is a variable that includes one of the given types, then the rest of the body will remove the type from which variable is in the `if` block.

```ts
function padLeft(padding: number | string, input: string) {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + input // padding: number
  }
  return padding + input // padding: string
}
```

The function `padLeft` returns from within its first `if` block. TypeScript was able to analyze this code and see that the rest of the body (`return padding + input;`) is unreachable in the case where `padding` is a `number`. As a result, it was able to remove `number` from the type of `padding` (narrowing from `string | number` to `string`) for the rest of the function.

This analysis of code based on reachability is called _control flow analysis_, and TypeScript uses this flow analysis to narrow types as it encounters type guards and assignments. When a variable is analyzed, control flow can split off and re-merge over and over again, and that variable can be observed to have a different type at each point.

```ts
function example() {
  let x: string | number | boolean

  x = Math.random() < 0.5

  console.log(x) // let x: boolean

  if (Math.random() < 0.5) {
    x = 'hello'
    console.log(x) // let x: string
  } else {
    x = 100
    console.log(x) // let x: number
  }

  return x // let x: string | number
}
```

### Using type predicates

A predicate takes the form `parameterName is Type`, where `parameterName` must be the name of a parameter from the current function signature.

To define a user-defined type guard, we simply need to define a function whose return type is a type predicate:

```ts
type Fish = { swim: () => void }
type Bird = { fly: () => void }

function getSmallPet(): Fish | Bird {
  let pet: Fish | Bird
  if (Math.random() < 0.5) {
    pet = {
      name: Math.random() < 0.5 ? 'sharkey' : 'shark',
      swim() {
        console.log(`I am ${this.name}, I can swim`)
      },
    }
  } else {
    pet = {
      name: 'bird',
      fly() {
        console.log(`I am ${this.name}, I can fly`)
      },
    }
  }
  return pet
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined
}
```

Any time `isFish` is called with some variable, TypeScript will narrow that variable to that specific type if the original type is compatible.

```ts
// Both calls to 'swim' and 'fly' are now okay.
let pet = getSmallPet()

if (isFish(pet)) {
  pet.swim()
} else {
  pet.fly()
}
```

Notice that TypeScript not only knows that `pet` is a `Fish` in the `if` branch, but also knows that in the `else` branch, you don't have a `Fish`, so you must have a `Bird`.

You may use the type guard `isFish` to filter an array of `Fish | Bird` and obtain an array of `Fish`:

```ts
const zoo: (Fish | Bird)[] = [getSmallPet(), getSmallPet(), getSmallPet()]
const underWater1: Fish[] = zoo.filter(isFish)
// or, equivalently
const underWater2: Fish[] = zoo.filter(isFish) as Fish[]

// the predicate may need repeating for more complex examples
const underWater3: Fish[] = zoo.filter((pet): pet is Fish => {
  if (pet.name === 'sharkey') return false
  return isFish(pet)
})
```

### Discriminated Unions

> When every type in a union contains a common property with literal types, TypeScript considers that to be a _discriminated union_, and can narrow out the members of the union.

Imagine we're trying to encode shapes like circles and squares. Circles keep track of their radiuses and squares keep track of their side lengths. We'll use a field call `kind` to tell which shape we're dealing with. Here's a first attempt to defining `Shape`.

```ts
interface Shape {
  kind: 'circle' | 'square'
  radius?: number
  sideLength?: number
}
```

Notice we're using a union of string literal types: `"circle"` and `"square"` to tell us whether we should treat the shape as a circle or square respectively. By using `"circle" | "square"` instead of `string`, we can avoid misspelling issues.

```ts
function handleShape(shape: Shape) {
  // oops!
  if (shape.kind === 'rect') {
    // This condition will always return 'false' since the types '"circle" | "square"' and '"rect"' have no overlap.
    // ...
  }
}
```

we can write a `getArea` function that applies the right logic based on if it's dealing with a circle or square. We'll first try dealing with circles.

```ts
function getArea(shape: Shape) {
  return Math.PI * shape.radius ** 2 // Object is possibly 'undefined'.
}
```

We could try to use a non-null assertion (a `!` after shape.radius) to say that `radius` is definitely present.

But it doesn't feel ideal. We had to shout a bit at the type-checker with those non-null assertions (`!`) to convince it that `shape.radius` was defined, but those assertions are error-prone if we start to move code around. We can definitely do better.

The problem is that the type-checker doesn't know whether or not `radius` or `sideLength` are present based on the `kind` property. So we can make the define more explicitly. In this way, the type-checker can know it better.

```ts
interface Circle {
  kind: 'circle'
  radius: number
}

interface Square {
  kind: 'square'
  sideLength: number
}

type Shape = Circle | Square
```

After redefining the `Shape` type, we ran `getArea` function again, there still an error. When `radius` was optional, TypeScript couldn't tell whether the property was present. Because now the `Shape` is an union, TypeScript is telling us that `shape` might be a `Square`, and `Square` doesn't have `radius` defined on them. As the same to `Circle`. Both interpretations are correct, but only the union encoding of `Shape` will cause an error regardless of how `strictNullCheck` is configured.

This time, we should try checking the `kind` property:

```ts
function getArea(shape: Shape) {
  if (shape.kind === 'circle') {
    return Math.PI * shape.radius ** 2 // (parameter) shape: Circle
  }
}
```

That got rid of the error. When every type in a union contains a common property with literal types(in above case, each type contains the same property call `type`), TypeScript considers that to be a `discriminated union`, and can narrow out the members of the union.

Now we can try to write our complete `getArea` without any pesky `!` non-null assertions.

```ts
function handleShape(shape: Shape) {
  switch (shape.kind) {
    case 'square':
      return shape.sideLength * shape.sideLength
    // (parameter) shape: Circle
    case 'circle':
      return Math.PI * shape.radius ** 2
    // (parameter) shape: Square
    default:
      break
  }
}
```

Communicating the right information to TypeScript - that `Circle` and `Square` were really two separate types with specific `kind` fields - was crucial.

### The never type

When narrowing, you can reduce the options of a union to a point where you have removed all possibilities and have nothing left. In those cases, TypeScript will use a never type to represent a state which shouldn’t exist.

```ts
function error(message: string): never {
  throw new Error(message)
}
```

### Exhaustiveness checking

The never type is assignable to every type; however, no type is assignable to never (except never itself). This means you can use narrowing and rely on never turning up to do exhaustive checking in a switch statement.

For example, adding a `default` to our `getArea` function which tries to assign the shape to `never` will raise when every possible case has not been handled.

Adding a new member to the `Shape` union, will cause a TypeScript error:

```ts
interface Triangle {
  kind: 'triangle'
  sideLength: number
}

type Shape = Circle | Square | Triangle

function getArea(shape: Shape) {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'square':
      return shape.sideLength ** 2
    default:
      // Type 'Triangle' is not assignable to type 'never'.
      const _exhaustiveCheck: never = shape
      return _exhaustiveCheck
  }
}
```

As if there is no `case` for the new shape, TypeScript will throw an error, because it can’t narrow down the type of `shape` to `never`. In this way, you can ensure that the `getArea` function always exhausts all shape possibilities.
