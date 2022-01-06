import { getUser, queryDecoder, ResponseDto } from './src/either'
import express from 'express'
import { pipe, flow } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as t from 'io-ts'

const app = express()

// this should be reusable across all handlers since all errs are of type t.Errors
const handleInputValidationError =
  (res: express.Response) => (errs: t.Errors) => {
    res
      .status(400)
      .json({
        type: 'InputValidationError',
        error: errs.map((e) => e.message).join('\n'),
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

app.get('/users', (req, res) => {
  pipe(
    // extract user inputs
    req.query.name,
    // validate input
    queryDecoder.decode,
    // E.bimap == E.mapLeft, E.map(Right)
    // at this point the logics branches out, hence our abstraction
    E.bimap(handleInputValidationError(res), flow(getUser, responseWith(res))),
  )
})

app.listen(3000, () => {
  console.log('The application is listening on port 3000!')
})
