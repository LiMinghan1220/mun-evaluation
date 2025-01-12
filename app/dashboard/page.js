'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch('/api/evaluation/list');
      if (response.ok) {
        const data = await response.json();
        setEvaluations(data.evaluations);
      } else {
        setError('获取评价列表失败');
      }
    } catch (error) {
      setError('获取评价列表失败');
    } finally {
      setLoading(false);
    }
  };

  const createEvaluation = async () => {
    try {
      const response = await fetch('/api/evaluation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: user.userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 添加新创建的评价到列表
        setEvaluations(prev => [{
          id: data.evaluationId,
          targetUserId: user.userId,
          creatorId: user.userId,
          createdAt: Date.now(),
          status: 'active',
          responseCount: 0,
          evaluationUrl: data.evaluationUrl
        }, ...prev]);
      } else {
        setError('创建评价链接失败');
      }
    } catch (error) {
      setError('创建评价链接失败');
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
          <h1 className="text-3xl font-bold text-gray-900">我的评价</h1>
          <p className="mt-2 text-sm text-gray-600">
            你的用户ID是: {user?.userId}
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={createEvaluation}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            创建新的评价链接
          </button>
        </div>

        {error && (
          <div className="mt-4 text-center text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      评价链接 #{evaluation.id.slice(0, 8)}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      创建时间: {new Date(evaluation.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      收到回复: {evaluation.responseCount} 条
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + evaluation.evaluationUrl);
                      alert('链接已复制到剪贴板');
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    复制链接
                  </button>
                  <Link
                    href={`/responses/${evaluation.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    查看回复
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {evaluations.length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            还没有创建过评价链接
          </div>
        )}
      </div>
    </div>
  );
}
