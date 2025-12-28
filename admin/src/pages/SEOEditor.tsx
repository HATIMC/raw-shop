import { useEffect, useState } from 'react';
import { readCSV, downloadCSV } from '@/services/csvService';

export default function SEOEditor() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const csv = await readCSV('seo.csv');
      setData(csv.rows);
    } catch (error) {
      console.error('Error loading SEO:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    downloadCSV('seo.csv', data);
    alert('Downloaded! Please replace the file in public/data/seo.csv');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading SEO data...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Management</h1>
          <p className="text-gray-600">Meta tags and SEO settings for {data.length} pages</p>
        </div>
        <button onClick={handleDownload} className="btn btn-primary">
          📥 Download CSV
        </button>
      </div>

      <div className="space-y-6">
        {data.map((row, index) => {
          const pagePath = row.page_path || row.pagePath;
          const title = row.meta_title || row.metaTitle;
          const description = row.meta_description || row.metaDescription;
          const keywords = row.meta_keywords || row.metaKeywords;
          const ogTitle = row.og_title || row.ogTitle;
          const ogDescription = row.og_description || row.ogDescription;
          const ogImage = row.og_image || row.ogImage;

          return (
            <div key={index} className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔍</span>
                <div>
                  <h3 className="text-xl font-bold">{pagePath}</h3>
                  <div className="text-sm text-gray-600">Page SEO Settings</div>
                </div>
              </div>

              {/* Meta Tags */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {title}
                    <span className="text-xs text-gray-500 ml-2">
                      ({title?.length || 0} characters)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {description}
                    <span className="text-xs text-gray-500 ml-2">
                      ({description?.length || 0} characters)
                    </span>
                  </div>
                </div>

                {keywords && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Keywords
                    </label>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {keywords.split(',').map((keyword: string, i: number) => (
                        <span
                          key={i}
                          className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2 mb-2"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Open Graph */}
                <div className="pt-4 border-t">
                  <h4 className="font-bold mb-3">Open Graph (Social Media)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">OG Title</label>
                      <div className="text-sm">{ogTitle || title}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">OG Description</label>
                      <div className="text-sm">{ogDescription || description}</div>
                    </div>
                    {ogImage && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">OG Image</label>
                        <img
                          src={ogImage}
                          alt="OG Preview"
                          className="w-full max-w-md rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <a
                          href={ogImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {ogImage}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-6 bg-green-50">
        <h3 className="font-bold mb-2">💡 SEO Best Practices</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Title: 50-60 characters (currently showing actual length)</li>
          <li>• Description: 150-160 characters for best display</li>
          <li>• Use relevant keywords naturally</li>
          <li>• OG images should be 1200x630px for best results</li>
          <li>• Keep titles unique for each page</li>
        </ul>
      </div>
    </div>
  );
}
