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

let pet = getSmallPet()

if (isFish(pet)) {
  pet.swim()
} else {
  pet.fly()
}

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
console.log(handleShape(square))

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
