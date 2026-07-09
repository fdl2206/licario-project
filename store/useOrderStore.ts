import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderStatus = "Success" | "Pending" | "Failed";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  orderId: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  snapToken: string;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId ? { ...o, status } : o
          ),
        })),
    }),
    { name: "licario-orders" }
  )
);
