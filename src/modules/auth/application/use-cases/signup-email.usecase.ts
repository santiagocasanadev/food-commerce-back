import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { CustomerContextService } from 'src/modules/customers/application/customer-context.service';
import { Role } from 'src/security/roles.enum';
import { AUTH_INJECTION_TOKENS } from '../../constants/injection-tokens';
import { AuthProvider } from '../../domain/authProviders';
import type { AuthIdentityRepository } from '../../domain/repositories/auth-identity.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { SendVerificationEmailUseCase } from './email-verification.token.usecase';
import type { PasswordHasher } from '../ports/password-hasher';
import { AuthResponsePresenter } from '../presenters/auth-response.presenter';
import { SessionService } from '../session.service';

@Injectable()
export class SignupEmailUseCase {
    private readonly logger = new Logger(SignupEmailUseCase.name);

    constructor(
        @Inject(AUTH_INJECTION_TOKENS.USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(AUTH_INJECTION_TOKENS.AUTH_IDENTITY_REPOSITORY)
        private readonly authIdentityRepository: AuthIdentityRepository,
        @Inject(AUTH_INJECTION_TOKENS.PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
        private readonly customerContextService: CustomerContextService,
        private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
        private readonly sessionService: SessionService,
    ) { }

    async execute(input: {
        email: string;
        password: string;
        name?: string;
        userAgent?: string | null;
        ipAddress?: string | null;
    }) {
        const normalizedEmail = input.email.trim().toLowerCase();
        const existingIdentity =
            await this.authIdentityRepository.findEmailIdentityByEmail(normalizedEmail);

        if (existingIdentity) {
            throw new BadRequestException('Email is already registered');
        }

        const user = await this.userRepository.create({
            email: normalizedEmail,
            name: input.name?.trim() || normalizedEmail.split('@')[0],
            role: Role.CUSTOMER,
            emailVerified: false,
        });
        const passwordHash = await this.passwordHasher.hash(input.password);
        const customer = await this.customerContextService.ensureCustomerByUserId(user.id);

        await this.authIdentityRepository.create({
            userId: user.id,
            provider: AuthProvider.EMAIL,
            email: normalizedEmail,
            passwordHash,
        });
        const session = await this.sessionService.createSession({
            userId: user.id,
            role: user.getRole(),
            tenantId: user.getTenantId(),
            customerId: customer.id,
            userAgent: input.userAgent,
            ipAddress: input.ipAddress,
        });

        try {
            await this.sendVerificationEmailUseCase.execute(user.id);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown email provider error';
            this.logger.warn(
                `Verification email could not be sent automatically for user ${user.id}: ${message}`,
            );
        }

        return AuthResponsePresenter.withUser(session, user);
    }
}
