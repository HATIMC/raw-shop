import { useEffect, useState } from 'react';
import { readCSV, downloadCSV } from '@/services/csvService';

export default function TaxesEditor() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const csv = await readCSV('taxes.csv');
      setData(csv.rows);
    } catch (error) {
      console.error('Error loading taxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    downloadCSV('taxes.csv', data);
    alert('Downloaded! Please replace the file in public/data/taxes.csv');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading tax rules...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Configuration</h1>
          <p className="text-gray-600">{data.length} tax rules</p>
        </div>
        <button onClick={handleDownload} className="btn btn-primary">
          📥 Download CSV
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Tax ID</th>
                <th>Region</th>
                <th>Tax Rate</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const id = row.tax_id || row.taxId;
                const region = row.tax_region || row.taxRegion || 'N/A';
                const rate = row.tax_rate || row.taxRate || 0;
                const description = row.description || '';
                const active = row.is_active !== 'false' && row.isActive !== 'false';

                return (
                  <tr key={index}>
                    <td className="font-mono text-sm">{id}</td>
                    <td className="font-medium">{region}</td>
                    <td>
                      <span className="text-lg font-bold text-blue-600">{rate}%</span>
                    </td>
                    <td className="text-sm text-gray-600">{description}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-6 bg-blue-50">
        <h3 className="font-bold mb-2">📘 Tax Configuration Guide</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Tax rates are applied based on customer's billing address</li>
          <li>• Default tax rule applies if no region matches</li>
          <li>• Tax is calculated on subtotal before shipping</li>
          <li>• Set is_active to false to disable a tax rule</li>
        </ul>
      </div>
    </div>
  );
}
