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

export const findUserAsync = (name: string) =>
  Promise.resolve(UserDatabase.find((u) => u.name === name))
