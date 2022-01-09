import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import { z } from 'zod'

/**
 * adapter between zod's API & fp-ts. Basically a custom EitherFrom
 */
export const parseWith = <Out, In = Out, Def = z.ZodTypeDef>(
  schema: z.ZodType<Out, Def, In>,
) =>
  // need to bind or safeParse's `this` is undefined
  // the calling code `this` is not schema, but something else
  flow(schema.safeParse.bind(schema), (res) =>
    res.success ? E.right(res.data) : E.left(res.error.issues),
  )
