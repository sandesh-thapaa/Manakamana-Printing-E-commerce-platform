export interface User {
  id: string;
  clientId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  printingRequirements?: string;
}

export type OrderStatus =
  | "ORDER_PLACED"
  | "ORDER_ACCEPTED"
  | "ORDER_PROCESSING"
  | "ORDER_DISPATCHED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED";

export interface Order {
  id: string;
  orderName: string;
  service: string;
  quantity: number;
  paperType: string;
  finishingOption: string;
  designId?: string;
  orderType: "STANDARD" | "CUSTOM";
  status: OrderStatus;
  date: string;
}

export interface Service {
  id: string;
  name: string;
  minimumQuantity: number;
  imageUrl?: string;
  image?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  previewUrl?: string;
  downloadUrl?: string;
  image?: string;
}

export interface DashboardStats {
  totalOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  availableTemplates: number;
}
