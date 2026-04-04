import type { CartRepository } from "src/modules/cart/domain/cart.repository";
import type { InventoryRepository } from "src/modules/inventory/domain/inventory.repository";
import type { LoyaltyRepository } from "src/modules/loyalty/domain/loyalty.repository";
import type { OrderRepository } from "../domain/orders.repository";
import { LoyaltyService } from "src/modules/loyalty/application/loyalty.service";
import { PricingService } from "src/modules/pricing/application/pricing.service";
import { Order } from "../domain/orders.entity";
import { OrderItem } from "../domain/order-item.entity";
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { UnitOfWork } from "src/infrastructure/database/unit-of-work";
import { PricingResult } from "src/modules/pricing/domain/pricing-result";
import { PaginatedResponse } from "src/common/dto/paginated-response.dto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    @Inject('OrderRepository')
    private readonly orderRepository: OrderRepository,
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
    @Inject('InventoryRepository')
    private readonly inventoryRepository: InventoryRepository,
    @Inject('LoyaltyRepository')
    private readonly loyaltyRepository: LoyaltyRepository,
  
    private readonly loyaltyService: LoyaltyService,
    private readonly pricingService: PricingService
  ) { }

  private readonly logger = new Logger(OrdersService.name);

  async createFromCart(
    customerId: string,
    pointsToUse = 0,
    idempotencyKey?: string
  ): Promise<Order> {
    return this.unitOfWork.execute(async (client) => {

      // 1. Obtener carrito activo
      const cart = await this.cartRepository.findActiveByCustomer(customerId, client);
      
      this.logger.log(`Creating order for customer ${customerId}`);

      if (!cart) {
        throw new BadRequestException('No active cart');
      }

      if (!idempotencyKey) {
        throw new BadRequestException('Idempotency-Key required');
      }
      const existing =
        await this.orderRepository.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        return existing;
      }

      // 2. Mapear items
      const items = cart.getItems().map(
        i => new OrderItem(i.productId, i.getQuantity(), i.unitPrice)
      );

      // 3. Calcular total base
      const baseTotal = items.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity,
        0
      );

      // 4. Calcular pricing (SOLO precio)

      const pricingResult: PricingResult =
        this.pricingService.calculate(baseTotal, pointsToUse);

      // 5. Reservar inventario (concurrency-safe)
      for (const item of items) {
        try {
          await this.inventoryRepository.reserve(
            item.productId,
            item.quantity,
            client
          );
        } catch (error: any) {
          if (error instanceof Error && error.message === 'Inventory not found') {
            throw new BadRequestException(`Inventory not found for product ${item.productId}`);
          }
          if (error instanceof Error && error.message === 'Insufficient stock') {
            throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
          }
          throw error;
        }
      }

      // 6. Crear orden (precio final ya calculado)
      const order = new Order(
        crypto.randomUUID(),
        customerId,
        'PAID',
        items,
        pricingResult.total,
        new Date(),
        idempotencyKey
      );

      await this.orderRepository.save(order, client);

      // 7. Cerrar carrito
      cart.checkout();
      await this.cartRepository.save(cart, client);

      this.logger.log(`Order created successfully: ${order.id}`);

      return order;
    });
  }

  async advance(orderId: string): Promise<Order> {

    return this.unitOfWork.execute(async (client) => {

      const order = await this.orderRepository.findById(orderId, client);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      try {
        order.advanceStatus();
      } catch (error: any) {
        if (error instanceof Error && error.message === 'Invalid status transition') {
          throw new BadRequestException('Invalid status transition');
        }
        throw error;
      }

      if (order.getStatus() === 'DELIVERED') {

        const pointsEarned =
          this.loyaltyService.calculatePointsEarned(order.total);

        const loyalty = await this.loyaltyRepository.findByCustomer(
          order.customerId,
          client
        );

        loyalty.addPoints(pointsEarned);
        await this.loyaltyRepository.save(loyalty, client);
      }

      await this.orderRepository.save(order, client);
      return order;
    });
  }

  async list(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async listCustomerOrders(
    customerId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponse<Order>> {

    const { data, total } =
      await this.orderRepository.findByCustomerPaginated(
        customerId,
        page,
        limit
      );

    return new PaginatedResponse(data, page, limit, total);
  }
}
