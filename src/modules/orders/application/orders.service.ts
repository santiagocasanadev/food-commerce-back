import type { CartRepository } from "src/modules/cart/domain/cart.repository";
import type { InventoryRepository } from "src/modules/inventory/domain/inventory.repository";
import type { LoyaltyRepository } from "src/modules/loyalty/domain/loyalty.repository";
import type { OrderRepository } from "../domain/orders.repository";
import { LoyaltyService } from "src/modules/loyalty/application/loyalty.service";
import { PricingService } from "src/modules/pricing/application/pricing.service";
import { Order } from "../domain/orders.entity";
import { OrderItem } from "../domain/order-item.entity";
import { Inject, Injectable } from "@nestjs/common";
import { UnitOfWork } from "src/infrastructure/database/unit-of-work";
import { PricingResult } from "src/modules/pricing/domain/pricing-result";

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

  async createFromCart(
    customerId: string,
    pointsToUse = 0
  ): Promise<Order> {

    return this.unitOfWork.execute(async (client) => {

      // 1. Obtener carrito activo
      const cart = await this.cartRepository.findActiveByCustomer(customerId, client);
      if (!cart) {
        throw new Error('No active cart');
      }

      // 2. Mapear items
      const items = cart.getItems().map(
        i => new OrderItem(i.productId, i.quantity, i.unitPrice)
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
        await this.inventoryRepository.reserve(
          item.productId,
          item.quantity,
          client
        );
      }

      // 6. Crear orden (precio final ya calculado)
      const order = new Order(
        crypto.randomUUID(),
        customerId,
        'PAID',
        items,
        pricingResult.total,
        new Date()
      );

      await this.orderRepository.save(order, client);

      // 7. Cerrar carrito
      cart.checkout();
      await this.cartRepository.save(cart, client);

      return order;
    });
  }




  async advance(orderId: string): Promise<Order> {

    return this.unitOfWork.execute(async (client) => {

      const order = await this.orderRepository.findById(orderId, client);
      if (!order) {
        throw new Error('Order not found');
      }

      order.advanceStatus();

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
}
