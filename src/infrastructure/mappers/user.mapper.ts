import { User } from "src/modules/auth/domain/entities/user.entity";

export class UserMapper {
  static toDomain(row: any): User {
    return new User(
      row.id,
      row.email ?? null,
      row.name,
      row.avatar_url ?? null,
      Boolean(row.email_verified),
      new Date(row.created_at),
      new Date(row.updated_at),
      row.role,
    );
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      email: user.getEmail(),
      name: user.getName(),
      avatar_url: user.getAvatarUrl(),
      email_verified: user.isEmailVerified(),
      created_at: user.createdAt,
      updated_at: user.getUpdatedAt(),
      role: user.getRole(),
    };
  }
}
