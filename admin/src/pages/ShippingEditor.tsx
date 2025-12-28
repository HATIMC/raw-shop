import { useEffect, useState } from 'react';
import { readCSV, saveCSV } from '@/services/csvService';

interface ShippingMethod {
  [key: string]: string | number;
}

export default function ShippingEditor() {
  const [data, setData] = useState<ShippingMethod[]>([]);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    loadData();
    loadConfig();
  }, []);

  const loadData = async () => {
    try {
      const csv = await readCSV('shipping.csv');
      setData(csv.rows);
    } catch (error) {
      console.error('Error loading shipping:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const csv = await readCSV('config.csv');
      const configObj: any = {};
      csv.rows.forEach((row: any) => {
        const key = row.setting_key || row.settingKey;
        const value = row.setting_value || row.settingValue;
        if (key && value !== undefined) {
          configObj[key] = value;
        }
      });
      setConfig(configObj);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleDelete = async (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    await saveCSV('shipping.csv', newData);
    loadData();
  };

  const handleEdit = (method: ShippingMethod) => {
    setEditingMethod({ ...method });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    const newMethod: ShippingMethod = {
      shipping_id: `SH${String(data.length + 1).padStart(3, '0')}`,
      shipping_name: '',
      description: '',
      base_price: 0,
      price_per_kg: 0,
      min_order_value: 0,
      max_order_value: 0,
      estimated_days: '',
      regions: '',
      is_active: 'true',
    };
    setEditingMethod(newMethod);
    setIsAddingNew(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMethod) return;

    let newData;
    if (isAddingNew) {
      newData = [...data, editingMethod];
    } else {
      const index = data.findIndex(
        (m) =>
          (m.shipping_id || m.shippingId) ===
          (editingMethod.shipping_id || editingMethod.shippingId)
      );
      newData = [...data];
      newData[index] = editingMethod;
    }

    setData(newData);
    setEditingMethod(null);
    await saveCSV('shipping.csv', newData);
    loadData();
  };

  const handleFieldChange = (field: string, value: string | number) => {
    if (editingMethod) {
      setEditingMethod({ ...editingMethod, [field]: value });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading shipping methods...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Methods</h1>
          <p className="text-gray-600">{data.length} shipping options</p>
        </div>
        <button onClick={handleAddNew} className="btn btn-primary">
          ➕ Add New Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((row, index) => {
          const id = row.shipping_id || row.shippingId;
          const name = row.shipping_name || row.shippingName;
          const description = row.description || '';
          const price = row.base_price || row.basePrice || 0;
          const minOrder = row.min_order_value || row.minOrderValue || 0;
          const estimatedDays = row.estimated_days || row.estimatedDays || '';
          const isActive = row.is_active || row.isActive;

          return (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">{name}</h3>
                <span className="text-2xl">🚚</span>
              </div>

              <div className="text-sm text-gray-600 mb-3">{description}</div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-lg text-blue-600">
                    {price === 0 ? 'FREE' : `${config.currency_symbol || '$'}${price}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Min Order:</span>
                  <span className="font-medium">
                    {Number(minOrder) > 0 ? `${config.currency_symbol || '$'}${minOrder}` : 'None'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-medium">{estimatedDays}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      String(isActive) === 'true'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {String(isActive) === 'true' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t">ID: {id}</div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(row)}
                  className="flex-1 btn btn-secondary text-sm py-2"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="btn btn-danger text-sm py-2 px-4"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Add Modal */}
      {editingMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {isAddingNew ? '➕ Add New Shipping Method' : '✏️ Edit Shipping Method'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Shipping ID *</label>
                    <input
                      type="text"
                      value={editingMethod.shipping_id || editingMethod.shippingId || ''}
                      onChange={(e) => handleFieldChange('shipping_id', e.target.value)}
                      className="input"
                      disabled={!isAddingNew}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={String(editingMethod.is_active || 'true')}
                      onChange={(e) => handleFieldChange('is_active', e.target.value)}
                      className="input"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Name *</label>
                  <input
                    type="text"
                    value={editingMethod.shipping_name || editingMethod.shippingName || ''}
                    onChange={(e) => handleFieldChange('shipping_name', e.target.value)}
                    className="input"
                    placeholder="Standard Shipping"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editingMethod.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="input"
                    rows={2}
                    placeholder="Delivery within 5-7 business days"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Price ({config.currency_symbol || '$'})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingMethod.base_price || editingMethod.basePrice || 0}
                      onChange={(e) => handleFieldChange('base_price', parseFloat(e.target.value) || 0)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price Per KG ({config.currency_symbol || '$'})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingMethod.price_per_kg || editingMethod.pricePerKg || 0}
                      onChange={(e) => handleFieldChange('price_per_kg', parseFloat(e.target.value) || 0)}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Order Value ({config.currency_symbol || '$'})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingMethod.min_order_value || editingMethod.minOrderValue || 0}
                      onChange={(e) => handleFieldChange('min_order_value', parseFloat(e.target.value) || 0)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Order Value ({config.currency_symbol || '$'})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingMethod.max_order_value || editingMethod.maxOrderValue || 0}
                      onChange={(e) => handleFieldChange('max_order_value', parseFloat(e.target.value) || 0)}
                      className="input"
                      placeholder="0 for unlimited"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Delivery</label>
                    <input
                      type="text"
                      value={editingMethod.estimated_days || editingMethod.estimatedDays || ''}
                      onChange={(e) => handleFieldChange('estimated_days', e.target.value)}
                      className="input"
                      placeholder="5-7 business days"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Regions</label>
                    <input
                      type="text"
                      value={editingMethod.regions || ''}
                      onChange={(e) => handleFieldChange('regions', e.target.value)}
                      className="input"
                      placeholder="US|CA|UK"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 mt-6">
                <button onClick={handleSaveEdit} className="flex-1 btn btn-primary">
                  💾 Save Method
                </button>
                <button
                  onClick={() => setEditingMethod(null)}
                  className="flex-1 btn btn-secondary"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
