import { IsEnum, IsString } from 'class-validator';
import { AuthProvider } from '../domain/authProviders';

export class LinkIdentityDto {
  @IsEnum(AuthProvider)
  provider!: AuthProvider;

  @IsString()
  token!: string;
}
