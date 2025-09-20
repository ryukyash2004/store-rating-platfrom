'use client';

import { useState, useEffect } from 'react';

// A simple type definition for a store
interface Store {
  id: number;
  name: string;
  description: string;
}

// Mock data for testing the UI when the database is empty
const mockStores: Store[] = [
  { id: 1, name: 'The Corner Cafe', description: 'A cozy spot for coffee and pastries.' },
  { id: 2, name: 'Main Street Books', description: 'Your friendly neighborhood bookstore.' },
  { id: 3, name: 'City Hardware', description: 'All your hardware needs in one place.' },
];

// A new sub-component to keep the rendering logic clean
function StoreDisplay({ stores }: { stores: Store[] }) {
    return (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.length > 0 ? (
            stores.map((store) => (
              <div key={store.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold text-gray-800">{store.name}</h2>
                <p className="text-gray-600 mt-2">{store.description}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No stores found. Try adding some to your database!</p>
          )}
        </div>
    );
}


export default function StoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/stores');
        if (!response.ok) {
          throw new Error('Failed to fetch stores from your backend');
        }
        const data = await response.json();

        // If the backend returns no stores, we'll use our mock data for testing.
        if (data.stores && data.stores.length === 0) {
          setStores(mockStores);
        } else {
          setStores(data.stores);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // If there's an error fetching, we will display the mock data so you can still test the UI.
        setStores(mockStores);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500 mt-8">Loading stores...</p>;
  }

  return (
    <>
      {error && (
        <p className="text-center text-orange-600 bg-orange-100 p-3 rounded-md mt-8">
          <strong>Connection Error:</strong> {error}. Displaying mock data for testing.
        </p>
      )}
      <StoreDisplay stores={stores} />
    </>
  );
}
