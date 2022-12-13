import bcrypt from "bcrypt";

const SALT_ROUNDS = parseInt(process.env.bcryptSaltRounds) ?? 12;

export default class BcryptHelper {
  static hashPassword = async (plaintext) => {
    return await bcrypt.hash(plaintext, SALT_ROUNDS);
  };

  static verifyPassword = async (plaintext, hash) => {
    return await bcrypt.compare(plaintext, hash);
  };
}
