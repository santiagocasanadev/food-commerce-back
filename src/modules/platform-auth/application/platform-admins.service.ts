import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BcryptPasswordHasher } from 'src/modules/auth/infrastructure/security/bcrypt-password-hasher';
import { PlatformAdmin } from '../domain/platform-admin.entity';
import { PlatformAdminRepository } from '../infrastructure/platform-admin.repository.postgres';

@Injectable()
export class PlatformAdminsService {
  constructor(
    private readonly platformAdminRepository: PlatformAdminRepository,
    private readonly passwordHasher: BcryptPasswordHasher,
  ) {}

  async list() {
    const admins = await this.platformAdminRepository.findAll();
    return admins.map((admin) => this.toView(admin));
  }

  async get(id: string) {
    const admin = await this.platformAdminRepository.findById(id);

    if (!admin) {
      throw new NotFoundException('Platform admin not found');
    }

    return this.toView(admin);
  }

  async create(payload: {
    email: string;
    name: string;
    password: string;
    active?: boolean;
  }) {
    const email = normalizeEmail(payload.email);
    const existing = await this.platformAdminRepository.findByEmail(email);

    if (existing) {
      throw new ConflictException('Platform admin email already exists');
    }

    const passwordHash = await this.passwordHasher.hash(payload.password);
    const admin = await this.platformAdminRepository.create({
      email,
      name: payload.name.trim(),
      passwordHash,
      active: payload.active,
    });

    return this.toView(admin);
  }

  async update(
    id: string,
    payload: {
      email?: string;
      name?: string;
      password?: string;
      active?: boolean;
    },
    actorId: string,
  ) {
    const admin = await this.platformAdminRepository.findById(id);

    if (!admin) {
      throw new NotFoundException('Platform admin not found');
    }

    if (payload.active === false && actorId === id) {
      throw new BadRequestException('You cannot deactivate your own platform admin');
    }

    const nextEmail =
      payload.email !== undefined ? normalizeEmail(payload.email) : admin.email;

    if (nextEmail !== admin.email) {
      const existing = await this.platformAdminRepository.findByEmail(nextEmail);

      if (existing && existing.id !== admin.id) {
        throw new ConflictException('Platform admin email already exists');
      }
    }

    const passwordHash = payload.password
      ? await this.passwordHasher.hash(payload.password)
      : undefined;

    const updatedAdmin = admin.withChanges({
      email: nextEmail,
      name: payload.name?.trim(),
      passwordHash,
      active: payload.active,
      updatedAt: new Date(),
    });

    await this.platformAdminRepository.save(updatedAdmin);

    return this.toView(updatedAdmin);
  }

  async remove(id: string, actorId: string) {
    if (id === actorId) {
      throw new BadRequestException('You cannot delete your own platform admin');
    }

    const admin = await this.platformAdminRepository.findById(id);

    if (!admin) {
      throw new NotFoundException('Platform admin not found');
    }

    await this.platformAdminRepository.deleteById(id);

    return { success: true };
  }

  private toView(admin: PlatformAdmin) {
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'PLATFORM_ADMIN',
      active: admin.active,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
