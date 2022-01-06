import * as E from 'fp-ts/lib/Either'
import { User } from './user.service'

// for now we couple db model with domain model
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

// since this is the entrypoint we can safely assume that the passed in data is valid
export const findUser = (name: string) => {
  return E.fromNullable(new Error('user not found'))(
    UserDatabase.find((u) => u.name === name),
  )
}
