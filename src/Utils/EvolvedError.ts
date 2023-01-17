export class EvolvedError extends Error {
  public readonly statusCode: number;
  constructor(message: string, status: number) {
    super(message);
    this.statusCode = status;
  }
}
