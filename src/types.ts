import { Request, Response } from 'express'

export type HttpHandler = (req: Request, res: Response) => void

export interface ResponseDto {
  readonly type: 'Error' | 'Success'
}
