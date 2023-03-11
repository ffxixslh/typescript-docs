type Fish = { swim: () => void; name: string }
type Bird = { fly: () => void; name: string }
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

const zoo: (Fish | Bird)[] = [getSmallPet(), getSmallPet(), getSmallPet()]
const underWater1: Fish[] = zoo.filter(isFish)
// or, equivalently
const underWater2: Fish[] = zoo.filter(isFish) as Fish[]

// the predicate may need repeating for more complex examples
const underWater3: Fish[] = zoo.filter((pet): pet is Fish => {
  if (pet.name === 'sharkey') return false
  return isFish(pet)
})
// console.log(underWater1, underWater2, underWater3)

// let pet = getSmallPet()

// if (isFish(pet)) {
//   pet.swim()
// } else {
//   pet.fly()
// }

interface BadShape {
  kind: 'circle' | 'square'
  radius?: number
  sideLength?: number
}

interface Circle {
  kind: 'circle'
  radius: number
}

interface Square {
  kind: 'square'
  sideLength: number
}

type Shape = Circle | Square

function handleShape(shape: Shape) {
  switch (shape.kind) {
    case 'square':
      return shape.sideLength * shape.sideLength

    case 'circle':
      return Math.PI * shape.radius ** 2

    default:
      break
  }
}

let square: Square = { kind: 'square', sideLength: 4 }

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
bear.name
bear.honey

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

interface Point {
  x: number
}

interface Point {
  y: number
}

const point: Point = { x: 1, y: 2 }
// const point: Point = { x: 1, y: 2, z: 3 }

function compare(a: string, b: string): -1 | 0 | 1 {
  return a === b ? 0 : a > b ? 1 : -1
}

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

type SomeFn = {
  (n: number): number
}
function fn(n: number) {
  return n
}
function someFn(fn: SomeFn) {
  return fn(6)
}

type SomeCtor = {
  new (s: string): any
}
class Ctor {
  name: string
  constructor(s: string) {
    this.name = s
  }
}

function ctorFn(ctor: SomeCtor) {
  return new ctor('hello')
}

function firstElement<T>(arr: T[]): T | undefined {
  return arr[0]
}

const s = firstElement(['a', 'b', 'c'])
// n is for type 'number'
const n = firstElement([1, 2, 3])
// u is for type undefined
const u = firstElement([])

function map<Input, Output>(
  arr: Input[],
  func: (arg: Input) => Output
): Output[] {
  return arr.map(func)
}

const parsed = map(['1', '2', '3'], (n) => parseInt(n))

function longest<Type extends { length: number }>(a: Type, b: Type) {
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
// const notOK = longest(10, 100)

function minimumLength<Type extends { length: number }>(
  obj: Type,
  minimum: number
) {
  if (obj.length >= minimum) {
    return obj
  } else {
    return [minimum]
  }
}

const minimumArr = minimumLength([1, 2, 3], 6)

function combine<Type>(arr1: Type[], arr2: Type[]): Type[] {
  return arr1.concat(arr2)
}

const combineStrNum = combine<string | number>([1, 2, 3], ['hello'])

function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {
  return arr.filter(func)
}

function filter2<Type, Func extends (arg: Type) => boolean>(
  arr: Type[],
  func: Func
): Type[] {
  return arr.filter(func)
}

const filterArr1 = filter1([1, 2, 3], (n) => {
  return n <= 2
})

const filterArr2 = filter2([1, 2, 3], (n) => {
  return n <= 2
})

function f(x = 6) {
  console.log(x)
}

// f()

function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i])
  }
}

// myForEach([1, 2, 3], (a, i) => {
//   console.log(a, i)
// })

// function fun(a: any, b: any): void
// function fun(x: string): void {
//   console.log(x)
// }
// fun('1')

function len(x: string): number
function len(arr: any[]): number
function len(x: string | any[]) {
  return x.length
}

// console.log(len('hello'))
// console.log(len([0]))

const user = {
  id: 123,

  admin: false,
  becomeAdmin: function () {
    this.admin = true
  },
}

user.becomeAdmin()
console.log(user)
