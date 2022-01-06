import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'

type User = {
  name: string
}

const queryDecoder = new t.Type<string, string, unknown>(
  'string',
  (i: unknown): i is string => typeof i === 'string',
  (input, context) =>
    typeof input === 'string'
      ? t.success(input)
      : t.failure(input, context, 'name must be a non-empty string'),
  t.identity,
)

const UserDatabase: User[] = [
  {
    name: 'John',
  },
  {
    name: 'Smith',
  },
  {
    name: 'Tom',
  },
]

type HttpResponse<T = never> =
  | {
      type: 'Error'
      error: string
    }
  | {
      type: 'Success'
      data: T
    }

const getUserService = (name: string): E.Either<Error, User> => {
  const maybeUser = UserDatabase.find((u) => u.name === name)
  if (!maybeUser) return E.left(new Error('User not found'))

  return E.right(maybeUser)
}

const handleServiceError = (err: Error): HttpResponse => {
  return {
    type: 'Error',
    error: err.message,
  }
}

const handleInputValidationError = <T>(errs: t.Errors): HttpResponse<T> => {
  console.log(errs[0])
  return {
    type: 'Error',
    error: errs.map((e) => e.message).join('\n'),
  }
}

const handleSuccess = (u: User): HttpResponse<User> => {
  return { type: 'Success', data: u }
}

const tryGetUser = flow(
  getUserService,
  // map to api response
  E.bimap(handleServiceError, handleSuccess),
  // serialization
  // E.bimap(JSON.stringify, JSON.stringify),
  // // client acknowledges - delegate to whatever api framework (IO here)
  // E.bimap(console.error, console.log),
)

// E.fold actually makes sense since it all ends up being a HttpResponse at the end of the day
// it captures the data transformation in both cases

// ramda's pipe but with type!
const runGetUser = flow(
  queryDecoder.decode,
  E.fold(<never>handleInputValidationError, tryGetUser),
)

const program = (input: unknown) => {
  returnToClient(runGetUser(input))
}

const returnToClient = (res: unknown) => {
  console.log(`Received ${JSON.stringify(res)}`)
}

program('Tom')
program(null)
program(undefined)
