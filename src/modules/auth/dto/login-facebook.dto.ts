import { IsString } from "class-validator";

export class LoginFacebookDto {
  @IsString()
  accessToken: string;
}
