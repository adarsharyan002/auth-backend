class CustomAPIError extends Error {
    constructor(message: string) {
      super(message);
      Object.setPrototypeOf(this, CustomAPIError.prototype);
    }
  }
  
  export default CustomAPIError;
  