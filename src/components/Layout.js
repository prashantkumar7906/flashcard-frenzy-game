// components/Layout.js
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  );
}
