import { useEffect, useState } from 'react';
import { readCSV, downloadCSV } from '@/services/csvService';

export default function DiscountsEditor() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const csv = await readCSV('discounts.csv');
      setData(csv.rows);
    } catch (error) {
      console.error('Error loading discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    downloadCSV('discounts.csv', data);
    alert('Downloaded! Please replace the file in public/data/discounts.csv');
  };

  const isActive = (expiryDate: string) => {
    if (!expiryDate) return true;
    return new Date(expiryDate) > new Date();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading discounts...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discount Codes</h1>
          <p className="text-gray-600">{data.length} discount codes</p>
        </div>
        <button onClick={handleDownload} className="btn btn-primary w-full md:w-auto">
          📥 Download CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((row, index) => {
          const code = row.discount_code || row.discountCode;
          const description = row.description || '';
          const type = row.discount_type || row.discountType;
          const value = row.discount_value || row.discountValue;
          const minOrder = row.min_order_value || row.minOrderValue || 0;
          const expiryDate = row.expiry_date || row.expiryDate;
          const active = isActive(expiryDate);

          return (
            <div
              key={index}
              className={`card ${
                active ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{code}</div>
                  <div className="text-sm text-gray-600">{description}</div>
                </div>
                <div className="text-3xl">💰</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-t">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-bold text-lg">
                    {type === 'percentage' ? `${value}%` : `$${value}`} OFF
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Min Order:</span>
                  <span className="font-medium">
                    {minOrder > 0 ? `$${minOrder}` : 'None'}
                  </span>
                </div>

                {expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className={active ? 'text-green-600' : 'text-red-600'}>
                      {new Date(expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {active ? '✓ Active' : '✗ Expired'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
