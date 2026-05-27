'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRealtimeEvents } from '@/hooks/use-realtime-events';
import { useEmergencyStore } from '@/lib/store';

interface DashboardStats {
  totalUsers: number;
  totalVolunteers: number;
  activeEmergencies: number;
  todayRegistrations: number;
}

export function AdminDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVolunteers: 0,
    activeEmergencies: 0,
    todayRegistrations: 0,
  });

  const { alerts } = useEmergencyStore()
  const activeAlertCount = alerts.filter((alert) =>
    ['pending', 'accepted', 'on_the_way', 'reached'].includes(alert.status)
  ).length
  const [loading, setLoading] = useState(true);

  useRealtimeEvents((event) => {
    if (event.type === 'stats-update' && event.data) {
      setStats(event.data);
      setLoading(false);
    }
  });

  useEffect(() => {
    // Fetch initial stats
    fetchStats();

    // Keep local event compatibility for older in-page flows.
    const handleStatsUpdate = (event: CustomEvent<DashboardStats>) => {
      setStats(event.detail);
    };

    window.addEventListener('stats-updated' as any, handleStatsUpdate as EventListener);

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchStats, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('stats-updated' as any, handleStatsUpdate as EventListener);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Users Card */}
      <Card className="border-2 border-blue-600 bg-blue-50 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Total Users</h3>
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-4xl font-bold text-blue-600">
          {loading ? '...' : stats.totalUsers}
        </p>
        <p className="text-xs text-gray-600 mt-2">Regular platform users</p>
      </Card>

      {/* Total Volunteers Card */}
      <Card className="border-2 border-green-600 bg-green-50 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Volunteers</h3>
          <UserCheck className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-4xl font-bold text-green-600">
          {loading ? '...' : stats.totalVolunteers}
        </p>
        <p className="text-xs text-gray-600 mt-2">Verified emergency responders</p>
      </Card>

      {/* Active Emergencies Card */}
      <Card className="border-2 border-red-600 bg-red-50 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Active SOS</h3>
          <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
        </div>
        <p className="text-4xl font-bold text-red-600">
          {loading ? '...' : Math.max(activeAlertCount, stats.activeEmergencies)}
        </p>
        <p className="text-xs text-gray-600 mt-2">Ongoing emergency situations</p>
      </Card>

      {/* Today Registrations Card */}
      <Card className="border-2 border-purple-600 bg-purple-50 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">New Today</h3>
          <TrendingUp className="w-5 h-5 text-purple-600" />
        </div>
        <p className="text-4xl font-bold text-purple-600">
          {loading ? '...' : stats.todayRegistrations}
        </p>
        <p className="text-xs text-gray-600 mt-2">Registrations today</p>
      </Card>
    </div>
  );
}
