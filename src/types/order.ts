export interface MenuItem {
  name: string;
  category: {
    name: string;
  } | null;
}

export interface OrderItem {
  quantity: number;
  price: number;
  menuItem: MenuItem;
}

export interface Order {
  id: number;
  tableNumber: string;
  totalPrice: number;
  createdAt: string;
  waiter: {
    fullName: string;
  };
  items: OrderItem[];
} 