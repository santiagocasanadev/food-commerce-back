import { Inject } from "@nestjs/common";
import { Customer } from "../domain/customers.entity";
import type { CustomerRepository} from "../domain/customers.repository";


export class CustomersService {
  constructor(
    @Inject('CustomerRepository')
    private readonly repository: CustomerRepository
  ) {}

  get(customerId: string): Promise<Customer | null> {
    return this.repository.findById(customerId);
  }
}
