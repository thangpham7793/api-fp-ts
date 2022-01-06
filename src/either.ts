import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'

type User = {
  name: string
}

type HttpResponse<T = Error> =
  | {
      type: 'Error'
      error: string
    }
  | {
      type: 'Success'
      data: T
    }

const getUserService = (name: unknown): E.Either<Error, User> => {
  if (!name || typeof name !== 'string')
    return E.left(new Error('No name is given'))
  return E.right({ name })
}

const handleError = (err: Error): HttpResponse => {
  return {
    type: 'Error',
    error: err.message,
  }
}

const handleSuccess = (u: User): HttpResponse<User> => {
  return { type: 'Success', data: u }
}

// ramda's pipe but with type!
const runGetUser = flow(
  // business layer
  getUserService,
  // web layer
  // map to api response
  E.bimap(handleError, handleSuccess),
  // serialization
  E.bimap(JSON.stringify, JSON.stringify),
  // client acknowledges - delegate to whatever api framework (IO here)
  E.bimap(console.error, console.log),
)

const program = (input: unknown) => {
  runGetUser(input)
}

program('Tom')
program(null)
program(undefined)
