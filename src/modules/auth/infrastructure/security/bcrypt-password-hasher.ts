import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { PasswordHasher } from '../../application/ports/password-hasher';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  async hash(value: string): Promise<string> {
    return hash(value, 12);
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return compare(value, hashedValue);
  }
}
