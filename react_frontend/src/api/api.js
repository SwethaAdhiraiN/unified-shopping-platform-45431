/**
 * Simple API abstraction to backend. Replace fetch URLs with actual backend endpoints.
 * Uses environment variables if available.
 */
const API_BASE =
  process.env.REACT_APP_API_URL || 'https://mock.api.endpoint/v1';

export async function fetchProducts({ search = '', category = '' } = {}) {
  // Replace with: `${API_BASE}/products?search=${search}&category=${category}`
  // For now, return mock data:
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: 'Wireless Headphones',
          image:
            'https://images.unsplash.com/photo-1512070800541-448b6165c7de?auto=format&fit=face&w=480&q=80',
          price: 79.99,
          description: 'Premium wireless headphones with long battery life.',
          stock: 18,
          category: 'Electronics'
        },
        {
          id: 2,
          name: 'Coffee Maker',
          image:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=face&w=480&q=80',
          price: 49.95,
          description:
            'Brew delicious coffee with programmable options and compact design.',
          stock: 32,
          category: 'Home'
        },
        {
          id: 3,
          name: 'Yoga Mat',
          image:
            'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=face&w=480&q=80',
          price: 19.99,
          description: 'Cushioned, non-slip mat perfect for home or gym.',
          stock: 57,
          category: 'Sports'
        }
        // ...add more products if desired
      ].filter(
        p =>
          (!search ||
            (p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.description.toLowerCase().includes(search.toLowerCase()))) &&
          (!category || p.category === category)
      ));
    }, 400)
  );
}

export async function fetchProductDetail(id) {
  const all = await fetchProducts();
  return all.find(p => p.id.toString() === id.toString());
}

export async function placeOrder(order) {
  // POST to `${API_BASE}/orders`
  // For now, mock/pretend confirmation.
  return new Promise(resolve => setTimeout(() => resolve({ success: true, orderId: Math.floor(Math.random() * 9000 + 1000) }), 700));
}

export async function fetchOrders() {
  // For admin panel; mock some orders.
  return new Promise(resolve =>
    setTimeout(
      () =>
        resolve([
          {
            id: 1071,
            customer: 'Alice',
            items: [
              { name: 'Wireless Headphones', qty: 2, price: 79.99 }
            ],
            total: 159.98,
            status: 'New',
            created: '2024-06-02'
          },
          {
            id: 1072,
            customer: 'Bob',
            items: [
              { name: 'Yoga Mat', qty: 1, price: 19.99 }
            ],
            total: 19.99,
            status: 'Shipped',
            created: '2024-06-01'
          }
        ]),
      300
    )
  );
}

export async function adminFetchProducts() {
  // Simulate all products endpoint for admin
  return fetchProducts();
}

export async function adminUpdateProduct(product) {
  // PATCH to `${API_BASE}/products/${product.id}`
  // For demo: pretend to succeed and return updated object.
  return new Promise(resolve =>
    setTimeout(() => resolve({ ...product }), 400)
  );
}
