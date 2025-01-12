'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ResponsesPage({ params }) {
  const { user } = useAuth();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await fetch('/api/evaluation/responses');
      if (response.ok) {
        const data = await response.json();
        // 只显示当前评价的回复
        const filteredResponses = data.responses.filter(r => r.evaluationId === params.id);
        setResponses(filteredResponses);
      } else {
        setError('获取评价回复失败');
      }
    } catch (error) {
      setError('获取评价回复失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            加载中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">评价回复</h1>
          <p className="mt-2 text-sm text-gray-600">
            评价ID: {params.id}
          </p>
        </div>

        {error && (
          <div className="mt-4 text-center text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {responses.map((response) => (
            <div
              key={response.id}
              className="bg-white shadow overflow-hidden sm:rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        评分：{response.rating} 分
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(response.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">参与的委员会</h4>
                      <p className="mt-1 text-sm text-gray-900">{response.committees}</p>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">整体印象</h4>
                      <p className="mt-1 text-sm text-gray-900">{response.impression}</p>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">详细评价</h4>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{response.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {responses.length === 0 && (
            <div className="text-center text-gray-500">
              还没有收到任何评价回复
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
