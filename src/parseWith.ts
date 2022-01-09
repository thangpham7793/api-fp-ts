import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import { z } from 'zod'

const eitherFromZod = <Out, In>(
  res: z.SafeParseReturnType<Out, In>,
): E.Either<z.ZodIssue[], In> => {
  // TODO: do some mapping from zod errors(issues) to sth more generic
  // hmm thinking of Semigroup here :D
  return res.success ? E.right(res.data) : E.left(res.error.issues)
}

/**
 * adapter between zod's API & fp-ts. Basically a custom EitherFrom
 */
export const parseWith = <Out, In = Out, Def = z.ZodTypeDef>(
  schema: z.ZodType<Out, Def, In>,
) =>
  // need to bind or safeParse's `this` is undefined
  // the calling code `this` is not schema, but something else
  flow(schema.safeParse.bind(schema), eitherFromZod)
