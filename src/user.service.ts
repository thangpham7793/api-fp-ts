import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/TaskEither'
import { findUserAsync } from './user.repository'

// domain model
export type User = {
  name: string
}

export type GetUserDto =
  | {
      readonly type: 'Error'
      error: string
    }
  | {
      readonly type: 'Success'
      data: User
    }

// imperative code would throw an exception
export const handleRepoError = (err: Error): GetUserDto => {
  return {
    type: 'Error',
    error: err.message,
  }
}

export const handleSuccess = (u: User | undefined): GetUserDto => {
  if (!u) return { type: 'Error', error: 'not found' }

  return { type: 'Success', data: u }
}

export const getUser = (name: string) =>
  pipe(
    TE.tryCatch(() => findUserAsync(name), E.toError),
    // E.fold(handleRepoError, handleSuccess),
    TE.bimap(handleRepoError, handleSuccess),
  )
