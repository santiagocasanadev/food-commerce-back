import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CustomerRepository } from '../domain/customers.repository';
import { Customer } from '../domain/customers.entity';
import { Role } from 'src/security/roles.enum';

@Injectable()
export class CustomerContextService {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  async ensureCustomerByUserId(userId: string): Promise<Customer> {
    const existing = await this.customerRepository.findByUserId(userId);

    if (existing) {
      return existing;
    }

    return this.customerRepository.create({
      userId,
      role: Role.CUSTOMER,
    });
  }

  async getCustomerByUserId(userId: string): Promise<Customer> {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found for user');
    }

    return customer;
  }
}
