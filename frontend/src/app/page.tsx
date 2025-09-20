import StoreList from '@/components/StoreList'; // The '@' is a shortcut for your src folder

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 md:p-24 bg-gray-50">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Store Rating Platform
        </h1>
        <p className="text-center text-gray-600 mt-2">
          Discover and rate stores near you.
        </p>

        {/* This is where the component that fetches and displays stores will appear */}
        <StoreList />
        
      </div>
    </main>
  );
}
