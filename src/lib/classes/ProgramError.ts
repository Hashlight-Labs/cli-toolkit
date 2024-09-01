export enum ProgramErrorFlag {
  DO_NOT_RETRY,
}

export class ProgramError extends Error {
  name: string;
  flags: ProgramErrorFlag[];

  constructor(
    message: string,
    flagOrFlags: ProgramErrorFlag | ProgramErrorFlag[] = []
  ) {
    super(message);
    this.name = "ProgramError";
    this.flags = Array.isArray(flagOrFlags) ? flagOrFlags : [flagOrFlags];
  }

  get shouldRetry() {
    return !this.flags.includes(ProgramErrorFlag.DO_NOT_RETRY);
  }
}
