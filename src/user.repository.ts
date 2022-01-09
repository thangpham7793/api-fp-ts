import { User } from './user.service'

// for now we couple db model with domain model
const UserDatabase: User[] = [
  {
    id: '61da89330366054b203b5f7a',
    name: 'John',
  },
  {
    id: '61da893a748c78f4ffbb87f3',
    name: 'Smith',
  },
  {
    id: '61da893f42815b89905a312e',
    name: 'Tom',
  },
]

export const readUser = (id: string) =>
  Promise.resolve(UserDatabase.find((u) => u.id === id))
