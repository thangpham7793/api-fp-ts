import { getUser, ReadUserDto } from './user.service'
import express from 'express'
import { flow, pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import { z } from 'zod'

import { parseWith } from './parseWith'
import { HttpHandler } from './types'

// this should be reusable across all handlers since all errs are of type t.Errors
const handleInputValidationError =
  (res: express.Response) =>
  <T extends z.ZodIssue[]>(errors: T) => {
    res
      .status(400)
      .json({
        type: 'Input Validation Error',
        errors: errors.map(({ message }) => ({ message })),
      })
      .send()
  }

// ignorant of the response shape, only takes care of responding
const respondWith =
  <TBody extends ReadUserDto>(res: express.Response<TBody>) =>
  (body: TBody) => {
    switch (body.type) {
      case 'Invalid Identifier':
        res.status(400).send(body)
        break
      case 'Entity Not Found':
        res.status(404).json(body)
        break
      case 'Success':
        res.status(200).json(body)
        break
      default:
        res.status(500).json(body)
    }
  }

const runTask = (t: T.Task<void>) => t()

export const handleGetUser: HttpHandler = (req, res) => {
  pipe(
    req.params.id,
    parseWith<string>(z.string().min(1)),
    E.bimap(
      handleInputValidationError(res),
      flow(getUser, T.map(respondWith(res)), runTask),
    ),
  )
}
