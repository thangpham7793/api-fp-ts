import { array } from 'fp-ts/lib/Array'
import { pipe, flow } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as E from 'fp-ts/lib/Either'
import axios, { AxiosResponse } from 'axios'
import * as t from 'io-ts'

//create a schema to load our user data into
const users = t.type({
  data: t.array(
    t.type({
      first_name: t.string,
    }),
  ),
})

//schema to hold the deepest of answers
const answer = t.type({
  ans: t.number,
})

//Convert our api call to a TaskEither
const httpGet = (url: string) =>
  TE.tryCatch<Error, AxiosResponse>(
    () => axios.get(url),
    (reason) => new Error(String(reason)),
  )

/**
 * Make our api call, pull out the data section and decode it
 * We need to massage the Error type, since `decode` returns a list of `ValidationError`s
 * We should probably use `reporter` to make this nicely readable down the line
 */
const getUser = pipe(
  httpGet('https://reqres.in/api/users?page=1'),
  // right-biased only applies to right side
  TE.map((x) => x.data),
  TE.chain((str) =>
    pipe(
      users.decode(str),
      E.mapLeft((err) => new Error(String(err))),
      TE.fromEither,
    ),
  ),
)

const getAnswer = pipe(
  TE.right(42),
  // join map
  TE.chain(
    flow(
      (ans) => ({ ans }),
      answer.decode,
      // return either errors or the value
      E.mapLeft((err) => new Error(String(err))),
      // natural transformation from Either to TaskEither
      TE.fromEither,
    ),
  ),
)

/**
 * Make our calls, and iterate over the data we get back
 */
pipe(
  // combine both TaskEither into a tuple
  sequenceT(TE.ApplySeq)(getAnswer, getUser),
  TE.map(([answer, users]) =>
    array.map(users.data, (user) =>
      console.log(
        `Hello ${user.first_name}! The answer you're looking for is ${answer.ans}`,
      ),
    ),
  ),
  TE.mapLeft(console.error),
)()

export {}
