'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WordCloud from '@/components/WordCloud';

export default function ResultsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results/summary');
      if (response.ok) {
        const resultData = await response.json();
        setData(resultData);
      } else {
        setError('获取结果数据失败');
      }
    } catch (error) {
      setError('获取结果数据失败');
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
          <h1 className="text-3xl font-bold text-gray-900">评价结果</h1>
          {user && (
            <p className="mt-2 text-sm text-gray-600">
              {user.username || user.userId}
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 text-center text-red-600">
            {error}
          </div>
        )}

        {data && (
          <div className="mt-8 space-y-8">
            {/* 统计数据卡片 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    平均评分
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {data.avgRating.toFixed(1)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    收到的评价数
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {data.totalResponses}
                  </dd>
                </div>
              </div>
            </div>

            {/* AI 总结 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">AI 总结分析</h3>
                <div className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">
                  {data.summary}
                </div>
              </div>
            </div>

            {/* 词云图 */}
            {data.wordCloudData.length > 0 && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">参与的委员会</h3>
                  <WordCloud 
                    words={data.wordCloudData}
                    width={800}
                    height={400}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {!data && (
          <div className="mt-8 text-center text-gray-500">
            暂无评价数据
          </div>
        )}
      </div>
    </div>
  );
}
