declare global {
  namespace Express {
    interface Request {
      customer?: { id: string };
    }
  }
}

export {};
