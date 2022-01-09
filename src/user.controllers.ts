import { getUser } from './user.service'
import express from 'express'
import { flow, pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import { z } from 'zod'

import { parseWith } from './parseWith'
import { HttpHandler, ResponseDto } from './types'

// this should be reusable across all handlers since all errs are of type t.Errors
const handleInputValidationError =
  (res: express.Response) =>
  <T>(error: T) => {
    res
      .status(400)
      .json({
        type: 'InputValidationError',
        error,
      })
      .send()
  }

// ignorant of the response shape, only takes care of responding
// shouldn't abstract this too early though, as the mapping may vary from handlers to handlers
// not all failure would be 404 or 400
const respondWith =
  <TBody extends ResponseDto>(res: express.Response<TBody>) =>
  (body: TBody) => {
    // TODO: need more fine-grained mapping here
    res.status(body.type === 'Failure' ? 404 : 200).json(body)
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
