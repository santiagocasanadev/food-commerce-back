import { Module, Post } from "@nestjs/common";
import { CustomersController } from "./api/customers.controller";
import { AdminCustomersController } from "./admin/admin-customers.controller";
import { CustomersService } from "./application/customers.service";
import { CustomerContextService } from "./application/customer-context.service";
import { PostgresCustomerRepository } from "./infrastructure/customer.repository.postgres";

@Module({
  controllers: [
    CustomersController,
    AdminCustomersController
  ],
  providers: [
    CustomersService,
    CustomerContextService,
    { 
      provide: 'CustomerRepository', 
      useClass: PostgresCustomerRepository 
    }
  ],
  exports: ['CustomerRepository', CustomerContextService],
})
export class CustomersModule {}
