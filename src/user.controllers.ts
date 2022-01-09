import { getUser, GetUserDto } from './user.service'
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
// shouldn't abstract this too early though, as the mapping may vary from handlers to handlers
// not all failure would be 404 or 400
const respondWith =
  <TBody extends GetUserDto>(res: express.Response<TBody>) =>
  (body: TBody) => {
    // TODO: need more fine-grained mapping here
    switch (body.type) {
      case 'Entity Not Found':
        res.status(404).json(body)
        break
      case 'Success':
        res.status(200).json(body)
        break
      default:
        res.status(500).send()
    }
  }

const querySchema = z.string().regex(/^[a-f\d]{24}$/i, 'invalid user id')

// curry with a schema for a particular handler
export const parseReadUserQuery = parseWith<string>(querySchema)
const runTask = (t: T.Task<void>) => t()

export const handleGetUser: HttpHandler = (req, res) => {
  pipe(
    req.params.id,
    parseReadUserQuery,
    E.bimap(
      handleInputValidationError(res),
      // caller needs to call the async computation from within either
      flow(getUser, T.map(respondWith(res)), runTask),
    ),
  )
}
