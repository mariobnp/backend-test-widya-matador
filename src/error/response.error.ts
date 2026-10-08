export type ResponseError = Error & {
  status: number;
};

export const createResponseError = (
  status: number,
  message: string,
): ResponseError => {
  const error = Object.assign(new Error(message), {
    status,
  });

  return error;
};
