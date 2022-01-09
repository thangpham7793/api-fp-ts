import * as E from 'fp-ts/lib/Either'
import { flow, identity, pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import { readUser, UserRecord } from './user.repository'
import { z } from 'zod'

// only service should have knowledge of what is considered as a valid user id
const isValidUserId = z.string().regex(/^[a-f\d]{24}$/i, 'invalid user id')

type UserId = string & {
  readonly type: 'UserId'
}

const isUserId = (s: string): s is UserId => {
  return isValidUserId.safeParse(s).success
}

const makeUserId = (s: string): E.Either<ReadUserDto, UserId> => {
  if (isUserId(s)) return E.right(s)

  return E.left({
    type: 'Invalid Identifier',
    error: 'invalid user id',
  })
}

export type User = {
  id: UserId
  firstName: string
  lastName: string
}

export type UserReadModel = {
  id: string
  fullName: string
}

export type ReadUserDto =
  | {
      readonly type: 'Invalid Identifier'
      error: string
    }
  | {
      readonly type: 'Internal Server Error'
      error: string
    }
  | {
      readonly type: 'Entity Not Found'
      error: string
    }
  | {
      readonly type: 'Success'
      data: UserReadModel
    }

// imperative code would throw an exception
const handleRepoError = (err: Error): ReadUserDto => {
  return {
    type: 'Internal Server Error',
    error: err.message,
  }
}

const toUserModel = (u: UserRecord): User => ({
  firstName: u.firstName,
  lastName: u.lastName,
  id: u.id as UserId,
})

const toUserReadModel = (u: User): UserReadModel => ({
  fullName: u.firstName + ' ' + u.lastName,
  id: u.id,
})

const toReadUserDto = (r: UserRecord): ReadUserDto => {
  return { type: 'Success', data: pipe(r, toUserModel, toUserReadModel) }
}

export const getUser = flow(
  makeUserId,
  E.fold(
    // web layer expects a Task, hence the lift
    T.of,
    flow(
      (userId) => TE.tryCatch(() => readUser(userId), E.toError),
      TE.fold(
        flow(handleRepoError, T.of),
        flow(
          // captures the null/undefined check and fallback value
          E.fromNullable<ReadUserDto>({
            type: 'Entity Not Found',
            error: 'not found',
          }),
          // return default value if user is not found
          E.fold(identity, toReadUserDto),
          T.of,
        ),
      ),
    ),
  ),
)
