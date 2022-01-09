import * as E from 'fp-ts/lib/Either'
import { flow, pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import { readUser } from './user.repository'

// domain model
export type User = {
  id: string
  name: string
}

export type GetUserDto =
  | {
      readonly type: 'Failure'
      error: string
    }
  | {
      readonly type: 'Success'
      data: User
    }

// imperative code would throw an exception
export const handleRepoError = (err: Error): GetUserDto => {
  return {
    type: 'Failure',
    error: err.message,
  }
}

export const handleSuccess = (u: User | undefined): GetUserDto => {
  if (!u) return { type: 'Failure', error: 'not found' }

  return { type: 'Success', data: u }
}

export const getUser = (id: string) =>
  pipe(
    TE.tryCatch(() => readUser(id), E.toError),
    // since client always gets a response back, it makes sense to fold the 2 possible outcome into one Task that will definitely return a GetUserDto
    // basically we destroy the Either wrapper at this point
    TE.fold(flow(handleRepoError, T.of), flow(handleSuccess, T.of)),
  )
