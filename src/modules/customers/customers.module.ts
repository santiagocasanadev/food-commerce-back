import { Module, Post } from "@nestjs/common";
import { CustomersController } from "./api/customers.controller";
import { AdminCustomersController } from "./admin/admin-customers.controller";
import { CustomersService } from "./application/customers.service";
import { PostgresCustomerRepository } from "./infrastructure/customer.repository.postgres";

@Module({
  controllers: [
    CustomersController,
    AdminCustomersController
  ],
  providers: [
    CustomersService,
    { provide: 'CustomerRepository', 
      useClass: PostgresCustomerRepository }
  ]
})
export class CustomersModule {}
