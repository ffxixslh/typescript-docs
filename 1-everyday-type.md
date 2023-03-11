# 1

## Everyday Types

```ts
/**
 * primitives: string, number, boolean,
 *
 * and you should always use their `lowercase` word
 */

let username: string = 'John'
let age: number = 22
let isMale: boolean = true

/**
 * object
 *
 * you can use `;` to separate the properties,
 * and the `?:` means this property is optional
 */
let userInfo: {
  address: string
  phoneNumber?: number
} = {
  address: '123 Main St',
}

/**
 * array
 *
 */
let hobbies: string[] = ['coding', 'movie']
let scores: number[] = [66, 77, 88]

/**
 * functions
 *
 */
// parameter type annotations
function greet(name: string) {
  console.log(`Hello ${name}!`)
}
// return type annotations, you usually don't need a type annotation
function getFavoriteNumber(): number {
  return 42
}

/**
 * anonymous functions
 *
 * anonymous function are a little bit different from function declarations
 */
// No type annotations here, but TypeScript can spot the bug
const names = ['Alice', 'Bob', 'Eve']
// Contextual typing also applies to arrow functions
names.forEach((s) => {
  console.log(s.toUppercase())
  // Property 'toUppercase' does not exist on type 'string'. Did you mean 'toUpperCase'?
})

/**
 * any, and you have better not use it
 *
 */
let notSure: any = 4

/**
 * union
 *
 * a type formed from two or more other types,
 * representing values that may be any one of those types
 */
function printId(id: string | number) {
  console.log(`Your ID is: ${id}`)
}
printId(123) // ok
printId('123') // ok
printId(true) // error
// Argument type "boolean" is not assignable to parameter of type 'string | number'

/**
 * tuple
 *
 */
let pocket: [string, number] = ['trigger', 23]

/**
 * type alias
 *
 * > remember! it's just an alias for any type
 * when you want to extend the type alias,
 * you should think in set operations
 */
type Animal = {
  name: string
}

type Bear = Animal & {
  honey: boolean
}

function getBear() {
  const bear: Bear = {
    name: 'bear',
    honey: true,
  }
  return bear
}

const bear = getBear()
bear.names // 'bear'
bear.honey // true

/**
 * interface
 *
 * almost same to type alias, but always more extendable
 */
interface Human {
  name: string
}

interface Person extends Human {
  money: boolean
}

function getPerson() {
  const person: Person = {
    name: 'person',
    money: false,
  }
  return person
}

const person = getPerson()
person.name // 'person'
person.money // false

/**
 * Differences between interface and type alias is:
 *   1. Type aliases may not participate in `declaration merging` , but interfaces can.
 *   2. Interfaces may only be used to declare the shapes of objects, not rename primitives.
 *   3. A class can implements an Interface or Type alias, but not a type alias that names a union type.
 */
// 1. declaration merging, means interface can rewrite many times
interface Point {
  x: number
}

interface Point {
  y: number
}

const point: Point = { x: 1, y: 2 } // ok
const point: Point = { x: 1, y: 2, z: 3 } // error
// Object literal may only specify known properties, and 'z' does not exist in type 'Point'.

/**
 * type assertion
 *
 * rule: TypeScript only allows type assertions which convert to a more specific or less specific version of a type.
 *
 * > tsx can only use `as` syntax
 */
let myCanvas = document.getElementById('main_canvas') as HTMLCanvasElement
// which is equivalent to:
let myCanvas = <HTMLCanvasElement>document.getElementById('main_canvas')

// sometimes the "rule" is too conservative to disallow more complex coercions that might be valid.
// if this happens, you can use two assertions, first to `any` or `unknown`, then to the desired type.

/**
 * literal type
 *
 * TypeScript makes this like the `const`
 */
let hello: 'hello' = 'hello'
hello = 'hi' // error, variable hello can only have 'hello' value

// by combining literals into unions, function's return value can only accept a certain set of known values
function compare(a: string, b: string): -1 | 0 | 1 {
  return a === b ? 0 : a > b ? 1 : -1
}

/**
 * literal inference
 *
 * When you initialize a variable with an object,
 * TypeScript assumes that the properties of that object might change values later.
 *
 * The reason the property in an object turns to a type is
 * because types are used to determine both reading and writing behavior.
 */
const obj = { counter: 0 } // const obj: { counter: number }

// when you want to send a request but the method automatically turns to `string` type, it causes error
const req = { url: 'https://example.com', method: 'GET' }
handleRequest(req.url, req.method)
// Argument of type 'string' is not assignable to parameter of type '"GET" | "POST"'.

// there are two ways to work around it:
//   1. change the inference by adding a type assertion in either location:
//    Change 1:
//      const req = { url: "https://example.com", method: "GET" as "GET" };
//    Change 2
//      handleRequest(req.url, req.method as "GET");
//   2. use as const to convert the entire object to be type literals:
//      const req = { url: "https://example.com", method: "GET" } as const;
//      handleRequest(req.url, req.method);

/**
 * null and undefined
 *
 * how these type behave depends on whether you have the strictNullChecks option on
 */
// With `strictNullChecks` off, values that might be `null` or `undefined` can still be accessed normally, and that leads a tend of a major source of bugs because of the lacking of checking for these values.
// With `strictNullChecks` on, you need to test for those values before using methods or properties on that value.
function doSomething(x: string | null) {
  if (x === null) {
    // do thing
  } else {
    console.log(`Hello, ${x.toUpperCase()}`)
  }
}

/**
 * Non-null Assertion Operator (Postfix ! )
 *
 * a syntax for removing `null` and `undefined` from a type without doing any explicit checking.
 * it's important to only use `!` when you know that the value can't be `null` or `undefined`
 */
function liveDangerously(x?: number | null) {
  // No error
  console.log(x!.toFixed())
}

/**
 * Enums
 *
 * Enums are a feature that allows for describing a value which could be one of a set of possible named constants.
 * It's not a type-level addition, but something added to the language and runtime.
 * It's a feature which you should know exists, but maybe hold off on using unless you are sure.
 */

/**
 * Less Common Primitives
 *
 * bigint and symbol
 */
// bigint, from ES2020 onwards
// Creating a bigint via the BigInt function
const onHundred: bigint = BigInt(100)
// Creating a BigInt via the literal syntax
const anotherHundred: bigint = 100n

// symbol, create a globally unique reference via the function Symbol()
const firstName = Symbol('foo')
const SecondName = Symbol('foo')

if (firstName === secondName) {
  // This condition will always return 'false' since the types 'typeof firstName' and 'typeof secondName' have no overlap.
  // Can't ever happen
}
```
