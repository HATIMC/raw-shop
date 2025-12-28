import { useStoreConfig } from '@/hooks/useStoreConfig';

export default function AboutPage() {
  const { config } = useStoreConfig();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>

        <div className="card mb-8">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              {config.aboutUs ||
                `Welcome to ${config.storeName || 'our store'}! We are dedicated to providing you with the best products and exceptional customer service.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700">
              To deliver quality products at competitive prices while ensuring customer satisfaction in every transaction.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Our Values</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Quality First</li>
              <li>✓ Customer Satisfaction</li>
              <li>✓ Fast Shipping</li>
              <li>✓ Honest Pricing</li>
            </ul>
          </div>
        </div>

        {config.returnPolicy && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">Return Policy</h2>
            <p className="text-gray-700">{config.returnPolicy}</p>
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          <div className="space-y-2 text-gray-700">
            {config.storeEmail && (
              <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${config.storeEmail}`} className="text-primary hover:underline">
                  {config.storeEmail}
                </a>
              </p>
            )}
            {config.storePhone && (
              <p>
                <strong>Phone:</strong>{' '}
                <a href={`tel:${config.storePhone}`} className="text-primary hover:underline">
                  {config.storePhone}
                </a>
              </p>
            )}
            {config.storeAddress && (
              <p>
                <strong>Address:</strong> {config.storeAddress}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
