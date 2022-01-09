import { handleGetUser } from './src/user.controllers'
import express from 'express'

const app = express()

app.get('/users/:id', handleGetUser)

app.listen(3000, () => {
  console.log('The application is listening on port 3000!')
})
