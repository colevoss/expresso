class ValidationError extends Error {
  public status: number = 400;
  public errors: string[];

  constructor(errors: string[]) {
    super(JSON.stringify(errors));

    this.errors = errors;
  }
}
