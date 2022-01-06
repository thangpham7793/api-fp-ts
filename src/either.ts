import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import { z } from 'zod'

export type User = {
  name: string
}

export interface ResponseDto {
  readonly type: 'Error' | 'Success'
}

export const querySchema = z.string().min(1)

export const eitherFromZod = <Out, In>(res: z.SafeParseReturnType<Out, In>) => {
  return res.success ? E.right(res.data) : E.left(res.error)
}

/**
 * adapter between zod's API & fp-ts. Basically a custom EitherFrom
 */
export const parseWith = <Out, In = Out, Def = z.ZodTypeDef>(
  schema: z.ZodType<Out, Def, In>,
) =>
  // need to bind or safeParse's `this` is undefined
  // the calling code `this` is not schema, but something else
  flow(schema.safeParse.bind(schema), eitherFromZod)

// curry with a schema for a particular handler
export const parseGetUserQuery = parseWith<string>(querySchema)

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
