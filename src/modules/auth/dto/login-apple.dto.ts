import { IsString } from "class-validator";

export class LoginAppleDto {
  @IsString()
  idToken: string;
}
