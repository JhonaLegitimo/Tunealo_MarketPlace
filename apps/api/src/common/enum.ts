import { registerEnumType } from '@nestjs/graphql';

export enum Role {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
    ADMIN = 'ADMIN',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

registerEnumType(Role, { name: 'Role' });
registerEnumType(OrderStatus, { name: 'OrderStatus' });