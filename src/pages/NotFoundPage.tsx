import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="text-9xl font-bold text-primary mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          <Link to="/products" className="btn btn-outline">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
