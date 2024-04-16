import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

type CustomError = {
  statusCode: number;
  msg: string;
};

const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let customError: CustomError = {
    statusCode: err instanceof Error ? StatusCodes.INTERNAL_SERVER_ERROR : StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong. Please try again later.',
  };

  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map((item:any) => item.message).join(',');
    customError.msg = validationErrors;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.code && err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    customError.msg = `Duplicate value entered for ${key} field. Please choose another value.`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.name === 'CastError') {
    customError.msg = `No item found with id: ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;
