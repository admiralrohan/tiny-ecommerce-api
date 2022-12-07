// To make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Response {
      userId?: number;
      token?: string;
      userType?: string;
    }
  }
}
