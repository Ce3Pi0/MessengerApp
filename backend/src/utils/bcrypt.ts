import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;
export const hashPass = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const hashToken = async (token: string): Promise<string> => {
  return await bcrypt.hash(token, SALT_ROUNDS);
};

export const compareVal = async (
  val: string,
  hashedVal: string,
): Promise<boolean> => {
  return await bcrypt.compare(val, hashedVal);
};
