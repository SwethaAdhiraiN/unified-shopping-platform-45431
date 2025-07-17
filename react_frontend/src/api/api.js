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
          images: [
            'https://images.unsplash.com/photo-1512070800541-448b6165c7de?auto=format&fit=face&w=480&q=80',
            'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=face&w=480&q=80'
          ],
          image: 'https://images.unsplash.com/photo-1512070800541-448b6165c7de?auto=format&fit=face&w=480&q=80', // fallback image
          price: 79.99,
          description: 'Premium wireless headphones with long battery life.',
          stock: 18,
          category: 'Electronics',
          tags: ['trending', 'new'],
          ratings: [
            { user: 'Alice', rating: 5, comment: 'Great sound and comfort!', date: '2024-06-01' },
            { user: 'Bob', rating: 4, comment: 'Good battery but needs better ANC.', date: '2024-06-03' }
          ],
          relatedIds: [2, 3]
        },
        {
          id: 2,
          name: 'Coffee Maker',
          images: [
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=face&w=480&q=80',
            'https://images.unsplash.com/photo-1417325384643-aac51acc9e5d?auto=format&fit=face&w=480&q=80'
          ],
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=face&w=480&q=80',
          price: 49.95,
          description:
            'Brew delicious coffee with programmable options and compact design.',
          stock: 32,
          category: 'Home',
          tags: ['sale'],
          ratings: [
            { user: 'Charlie', rating: 5, comment: 'So easy in the morning!', date: '2024-06-02' }
          ],
          relatedIds: [1]
        },
        {
          id: 3,
          name: 'Yoga Mat',
          images: [
            'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=face&w=480&q=80',
            'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=face&w=480&q=80'
          ],
          image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=face&w=480&q=80',
          price: 19.99,
          description: 'Cushioned, non-slip mat perfect for home or gym.',
          stock: 57,
          category: 'Sports',
          tags: ['new'],
          ratings: [
            { user: 'Dana', rating: 4, comment: 'Nice grip and thickness.', date: '2024-06-04' }
          ],
          relatedIds: [1]
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
  // Fetches full info (e.g. including ratings, related, etc)
  const all = await fetchProducts();
  const prod = all.find(p => p.id.toString() === id.toString());
  if (!prod) return null;
  // For demo: also attach relatedProducts field (objects not just ids)
  prod.relatedProducts = all.filter(
    p => prod.relatedIds && prod.relatedIds.includes(p.id)
  );
  return prod;
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
