import { getUser } from './user.service'
import express from 'express'
import { pipe, flow } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
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
const responseWith =
  <TBody extends ResponseDto>(res: express.Response<TBody>) =>
  (body: TBody) => {
    res.status(body.type === 'Error' ? 404 : 200).json(body)
  }

const querySchema = z.string().min(1)

// curry with a schema for a particular handler
export const parseGetUserQuery = parseWith<string>(querySchema)

export const handleGetUser: HttpHandler = (req, res) => {
  pipe(
    req.query.name,
    parseGetUserQuery,
    E.bimap(handleInputValidationError(res), flow(getUser, responseWith(res))),
  )
}
