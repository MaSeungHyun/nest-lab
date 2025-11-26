type SignInRequestDto = {
  id: string;
  password: string;
};

type SignInResponseDto = {
  success: boolean;
  redirectUrl: string;
  message: string;
};

type SignUpRequestDto = {
  id: string;
  password: string;
  passwordConfirm: string;
};

type SignUpResponseDto = {
  success: boolean;
  message: string;
};

export type {
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
};
