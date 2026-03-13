import { nonNullable } from '@/utils/nonNullable';

class ClientError extends Error {
  constructor(
    message: string,
    readonly clientError: unknown,
  ) {
    super(message);
  }
}

export const clientRequestPromiseWrapper = <Data>(promise: Promise<{ data?: Data; error?: unknown }>) => {
  return promise.then((clientResponse) => {
    if (clientResponse.error) {
      const clientError = new ClientError('Client request error', clientResponse.error);

      throw clientError;
    }

    return nonNullable(clientResponse.data);
  });
};

export const useClientRequestPromiseWrapper = () => {
  return clientRequestPromiseWrapper;
};
