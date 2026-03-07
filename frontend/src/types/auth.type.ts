export type RegisterType = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
};

export type LoginType = {
  email: string;
  password: string;
};

export type Provider = "local" | "google" | "merged";

export interface UserType {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: Provider;
  enabled2fa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ResendVerificationType = {
  email: string;
};

export type ChangePasswordType = {
  newPassword: string;
  confirmNewPassword: string;
};

export type SetPasswordType = {
  password: string;
  confirmPassword: string;
};

export type Verify2FAType = {
  otp: string;
};

export type ForgotPasswordType = {
  email: string;
};

export type UpdatePasswordType = {
  newPassword: string;
  confirmNewPassword: string;
};
