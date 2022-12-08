// To make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    // These are not native properties of `Response` object, but I am trusting the AuthMiddleware to attach them.
    export interface Response {
      userId: number;
      token: string;
      userType: string;
    }
  }
}
