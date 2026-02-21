import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;
export const hashPass = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePass = async (
  password: string,
  hashedVal: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedVal);
};
