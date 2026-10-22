export interface PropertyUser {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export interface PropertyItem {
  id: string;
  code: number;
  title: string;
  description: string;
  dealType: string;
  propertyType: string;
  status: string;
  condition: string;
  city: string;
  district: string;
  address: string;
  priceUsd: number;
  area: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  hasBalcony: boolean;
  hasParking: boolean;
  hasElevator: boolean;
  hasCentralHeating: boolean;
  isVip: boolean;
  vipType: string | null;
  images: string;
  views: number;
  createdAt: string;
  user: PropertyUser;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  favorites?: { propertyId: string }[];
}
