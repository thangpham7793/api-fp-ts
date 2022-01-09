export type UserRecord = {
  id: string
  firstName: string
  lastName: string
  // simple field to make UserRecord different from UserModel
  createdAt: Date
}

// for now we couple db model with domain model
const UserDatabase: UserRecord[] = [
  {
    id: '61da89330366054b203b5f7a',
    firstName: 'John',
    lastName: 'Smith',
    createdAt: new Date(),
  },
  {
    id: '61da893a748c78f4ffbb87f3',
    firstName: 'Smith',
    lastName: 'Smith',
    createdAt: new Date(),
  },
  {
    id: '61da893f42815b89905a312e',
    firstName: 'Tom',
    lastName: 'Smith',
    createdAt: new Date(),
  },
]

export const readUser = (id: string) =>
  Promise.resolve(UserDatabase.find((u) => u.id === id))
