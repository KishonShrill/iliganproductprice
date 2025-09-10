export const mockProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    category: 'Electronics',
    price: 299.99,
    stock: 45,
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Ergonomic Office Chair',
    category: 'Furniture',
    price: 599.99,
    stock: 12,
    status: 'active',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Smart Watch Series X',
    category: 'Electronics',
    price: 399.99,
    stock: 0,
    status: 'inactive',
    createdAt: '2024-01-05'
  },
  {
    id: '4',
    name: 'Coffee Maker Deluxe',
    category: 'Appliances',
    price: 149.99,
    stock: 23,
    status: 'active',
    createdAt: '2023-12-20'
  },
  {
    id: '5',
    name: 'Bluetooth Speaker',
    category: 'Electronics',
    price: 79.99,
    stock: 67,
    status: 'active',
    createdAt: '2023-12-15'
  }
];

export const mockLocations = [
  {
    id: '1',
    name: 'Downtown Store',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    status: 'active',
    createdAt: '2023-06-01'
  },
  {
    id: '2',
    name: 'Mall Location',
    address: '456 Shopping Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    status: 'active',
    createdAt: '2023-07-15'
  },
  {
    id: '3',
    name: 'Airport Terminal',
    address: '789 Airport Way',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    status: 'inactive',
    createdAt: '2023-08-10'
  },
  {
    id: '4',
    name: 'Suburban Outlet',
    address: '321 Suburb Lane',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    status: 'active',
    createdAt: '2023-09-05'
  }
];

export const mockListings = [
  {
    id: '1',
    title: 'Premium Audio Experience',
    product: 'Premium Wireless Headphones',
    location: 'Downtown Store',
    price: 299.99,
    status: 'published',
    views: 1247,
    createdAt: '2024-01-20'
  },
  {
    id: '2',
    title: 'Workspace Comfort Solution',
    product: 'Ergonomic Office Chair',
    location: 'Mall Location',
    price: 599.99,
    status: 'published',
    views: 856,
    createdAt: '2024-01-18'
  },
  {
    id: '3',
    title: 'Smart Lifestyle Companion',
    product: 'Smart Watch Series X',
    location: 'Downtown Store',
    price: 399.99,
    status: 'draft',
    views: 0,
    createdAt: '2024-01-16'
  },
  {
    id: '4',
    title: 'Perfect Morning Brew',
    product: 'Coffee Maker Deluxe',
    location: 'Suburban Outlet',
    price: 149.99,
    status: 'published',
    views: 432,
    createdAt: '2024-01-14'
  },
  {
    id: '5',
    title: 'Portable Sound System',
    product: 'Bluetooth Speaker',
    location: 'Mall Location',
    price: 79.99,
    status: 'archived',
    views: 2103,
    createdAt: '2024-01-12'
  }
];
