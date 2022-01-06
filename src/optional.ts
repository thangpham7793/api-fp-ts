import * as Option from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function'

// apFirst

const op1 = Option.of('hello')
const op2 = Option.of('world')

// where would you want do do this
console.log(Option.apFirst(op2)(op1))

const greet = (s: string) => `hello ${s}`

pipe('Tom', Option.of, Option.map(greet))

// Option is not a contravariant since it doesn't implement contramap
// contramap :: f a => (b -> a) -> f b
// given a functor for type a & and a function from b to a, returns the same functor for type b
