export class PaymentServiceError extends Error {
    public statusCode?: number;
    public response?: any;
  
    constructor(message: string, statusCode?: number, response?: any) {
      super(message);
      this.name = 'PaymentServiceError';
      this.statusCode = statusCode;
      this.response = response;
      
      // Set the prototype explicitly for inheritance to work properly
      Object.setPrototypeOf(this, PaymentServiceError.prototype);
    }
  }