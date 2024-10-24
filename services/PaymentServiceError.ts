export class PaymentServiceError extends Error {
    constructor(
      message: string,
      public statusCode?: number,
      public responseData?: any
    ) {
      super(message);
      this.name = 'PaymentServiceError';
    }
  }