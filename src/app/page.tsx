import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Macs Cool Ecommerce PnL System</h1>
      <div>This is a work in progess. Expected MVP Release: Sat 9th Nov</div>

      <div className="flex gap-4 mt-8">
        <Link
          href="/sign-in"
          className="py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
