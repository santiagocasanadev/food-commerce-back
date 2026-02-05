import type { CartRepository } from "src/modules/cart/domain/cart.repository";
import type { OrderRepository } from "../domain/orders.repository";
import { InventoryService } from "src/modules/inventory/application/inventory.service";
import { LoyaltyService } from "src/modules/loyalty/application/loyalty.service";
import { PricingService } from "src/modules/pricing/application/pricing.service";
import { Order } from "../domain/orders.entity";
import { OrderItem } from "../domain/order-item.entity";
import { Inject, Injectable } from "@nestjs/common";
import { getPgPool } from "src/infrastructure/database/postgres.connection";

@Injectable()
export class OrdersService {
  constructor(
    @Inject('OrderRepository')
    private readonly orderRepository: OrderRepository,
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
    private readonly inventoryService: InventoryService,
    private readonly loyaltyService: LoyaltyService,
    private readonly pricingService: PricingService
  ) {}

  async createFromCart(customerId: string, pointsToUse: number = 0): Promise<Order> {
    
    const pool = getPgPool();
    const client = await pool.connect();

    try{
      await client.query('BEGIN');

      const cart = await this.cartRepository.findActiveByCustomer(customerId);

      if (!cart) throw new Error('No active cart');
      
      const items = cart.getItems().map(
        i => new OrderItem(i.productId, i.quantity, i.unitPrice)
      );

      const baseTotal = items.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity,
        0
      );

      const pricingResult = this.pricingService.calculate(
        baseTotal,
        pointsToUse
      );

      for (const item of items) {
        await this.inventoryService.reserve(item.productId, item.quantity);
      }
      
      const order = new Order(
        crypto.randomUUID(),
        customerId,
        'PAID',
        items,
        pricingResult.total,
        new Date()
      );

      
      cart.checkout();
      await this.orderRepository.save(order);

      await client.query('COMMIT'); 

      return order;

    } catch(err){
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async advance(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.advanceStatus();

    if (order.getStatus() === 'DELIVERED') {
      this.loyaltyService.accumulate(order.customerId, order.total);
    }

    await this.orderRepository.save(order);
    return order;
  }

  async list(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }
}
