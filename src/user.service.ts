import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import { findUser } from './user.repository'

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
export const handleServiceError = (err: Error): GetUserDto => {
  return {
    type: 'Error',
    error: err.message,
  }
}

export const handleSuccess = (u: User): GetUserDto => {
  return { type: 'Success', data: u }
}

export const getUser = flow(findUser, E.fold(handleServiceError, handleSuccess))
