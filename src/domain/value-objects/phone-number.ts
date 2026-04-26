import { AppError } from "../../shared/errors/app-error";

export class PhoneNumber {
  private constructor(private readonly value: string) {}

  static create(rawValue: string): PhoneNumber {
    const normalized = rawValue.replace(/\D/g, "");
    if (normalized.length < 10) {
      throw new AppError("Numero de telefone invalido.");
    }

    return new PhoneNumber(normalized);
  }

  toString(): string {
    return this.value;
  }
}
