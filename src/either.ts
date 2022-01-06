import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'

export type User = {
  name: string
}

export interface ResponseDto {
  readonly type: 'Error' | 'Success'
}

// zod could be better since we just need to lift the result
export const queryDecoder = new t.Type<string>(
  'string',
  (i: unknown): i is string => typeof i === 'string',
  (input, context) =>
    typeof input === 'string' && input.length > 0
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

export type GetUserDto =
  | {
      readonly type: 'Error'
      error: string
    }
  | {
      readonly type: 'Success'
      data: User
    }

// since this is the entrypoint we can safely assume that the passed in data is valid
export const getUserService = (name: string) => {
  return E.fromNullable(new Error('user not found'))(
    UserDatabase.find((u) => u.name === name),
  )
}

// imperative code would throw an exception
export const handleServiceError = (err: Error): GetUserDto => {
  return {
    type: 'Error',
    error: err.message,
  }
}

export const handleSuccess = (u: User): GetUserDto => {
  return { type: 'Success', data: u }
}

export const getUser = flow(
  getUserService,
  E.fold(handleServiceError, handleSuccess),
)
