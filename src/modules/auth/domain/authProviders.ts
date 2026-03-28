export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
}

export type EmailPayload = {
  email: string;
  password: string;
};

export type GooglePayload = {
  idToken: string;
};

export type ApplePayload = {
  idToken: string;
};

export type FacebookPayload = {
  accessToken: string;
};
