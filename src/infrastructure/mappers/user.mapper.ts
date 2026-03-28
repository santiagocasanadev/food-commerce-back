import { User } from "src/modules/auth/domain/entities/user.entity";
import { Role } from "src/security/roles.enum";

export class UserMapper {
  static toDomain(row: any): User {
    return new User(
      row.id,
      row.email ?? null,
      row.name,
      row.image_url ?? row.avatar_url ?? null,
      row.address ?? null,
      row.birth_date ? new Date(row.birth_date) : null,
      row.gender ?? null,
      Boolean(row.email_verified),
      new Date(row.created_at),
      new Date(row.updated_at),
      row.role as Role,
    );
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      email: user.getEmail(),
      name: user.getName(),
      image_url: user.getImageUrl(),
      address: user.getAddress(),
      birth_date: user.getBirthDate(),
      gender: user.getGender(),
      email_verified: user.isEmailVerified(),
      created_at: user.createdAt,
      updated_at: user.getUpdatedAt(),
      role: user.getRole(),
    };
  }
}
