'use client';

import { useState, useMemo } from 'react';

interface Session {
  id: string;
  session_id: string;
  converted: boolean;
  created_at: string;
  updated_at: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  language?: string;
  pageviews: number;
  clicks: number;
  phoneClicks: number;
  emailClicks: number;
  downloads: number;
  formSubmits: number;
  rageClicks: number;
  deadClicks: number;
  jsErrors: number;
  timeSpent: number;
  activeTime: number;
  scrollDepth: number;
  loadTime: number;
  deviceType: string;
  referrer: string;
  landingPage: string;
  ipAddress: string;
  hasIntent: boolean;
  hasFrustration: boolean;
  hasErrors: boolean;
  events: any[];
  siteName?: string;
  siteDomain?: string;
}

interface VisitorsTableProps {
  sessions: Session[];
  onSelectSession?: (session: Session) => void;
}

type SortField = 'time' | 'device' | 'location' | 'ipAddress' | 'referrer' | 'pages' | 'clicks' | 'timeSpent' | 'status';
type SortDirection = 'asc' | 'desc';

export default function VisitorsTable({ sessions, onSelectSession }: VisitorsTableProps) {
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');

  // Get unique values for filters
  const deviceTypes = useMemo(() => {
    const types = [...new Set(sessions.map(s => s.deviceType))];
    return types.filter(t => t && t !== 'unknown');
  }, [sessions]);

  const locations = useMemo(() => {
    const locs = [...new Set(sessions.map(s => `${s.city || 'Unknown'}, ${s.country || 'Unknown'}`))];
    return locs.filter(l => l !== 'Unknown, Unknown');
  }, [sessions]);

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions.filter(session => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          session.session_id.toLowerCase().includes(searchLower) ||
          session.landingPage.toLowerCase().includes(searchLower) ||
          (session.city && session.city.toLowerCase().includes(searchLower)) ||
          (session.country && session.country.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Device filter
      if (deviceFilter !== 'all' && session.deviceType !== deviceFilter) return false;

      // Location filter
      if (locationFilter !== 'all') {
        const sessionLocation = `${session.city || 'Unknown'}, ${session.country || 'Unknown'}`;
        if (sessionLocation !== locationFilter) return false;
      }

      // Intent filter
      if (intentFilter === 'intent' && !session.hasIntent) return false;
      if (intentFilter === 'converted' && !session.converted) return false;
      if (intentFilter === 'frustrated' && !session.hasFrustration) return false;
      if (intentFilter === 'errors' && !session.hasErrors) return false;

      return true;
    });

    // Sort sessions
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'time':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'device':
          aValue = a.deviceType;
          bValue = b.deviceType;
          break;
        case 'location':
          aValue = `${a.city || ''}, ${a.country || ''}`;
          bValue = `${b.city || ''}, ${b.country || ''}`;
          break;
        case 'ipAddress':
          aValue = a.ipAddress;
          bValue = b.ipAddress;
          break;
        case 'referrer':
          aValue = a.referrer;
          bValue = b.referrer;
          break;
        case 'pages':
          aValue = a.pageviews;
          bValue = b.pageviews;
          break;
        case 'clicks':
          aValue = a.clicks;
          bValue = b.clicks;
          break;
        case 'timeSpent':
          aValue = a.timeSpent;
          bValue = b.timeSpent;
          break;
        case 'status':
          aValue = a.converted ? 3 : (a.hasIntent ? 2 : (a.hasFrustration ? 1 : 0));
          bValue = b.converted ? 3 : (b.hasIntent ? 2 : (b.hasFrustration ? 1 : 0));
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [sessions, searchTerm, deviceFilter, locationFilter, intentFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusBadge = (session: Session) => {
    if (session.converted) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Converted</span>;
    }
    if (session.hasIntent) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">High Intent</span>;
    }
    if (session.hasFrustration) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Frustrated</span>;
    }
    if (session.hasErrors) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Errors</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Normal</span>;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search sessions, pages, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Device Filter */}
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="all">All Devices</option>
            {deviceTypes.map(device => (
              <option key={device} value={device}>{device}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="all">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          {/* Intent Filter */}
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="all">All Sessions</option>
            <option value="converted">Converted</option>
            <option value="intent">High Intent</option>
            <option value="frustrated">Frustrated</option>
            <option value="errors">Errors</option>
          </select>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredAndSortedSessions.length} of {sessions.length} sessions
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('time')}
              >
                <div className="flex items-center gap-1">
                  Time
                  {sortField === 'time' && (
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('device')}
              >
                <div className="flex items-center gap-1">
                  Device
                  {sortField === 'device' && (
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('location')}
              >
                <div className="flex items-center gap-1">
                  Location
                  {sortField === 'location' && (
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ipAddress')}
              >
                <div className="flex items-center gap-1">
                  IP Address
                  {sortField === 'ipAddress' && (
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('referrer')}
              >
                <div className="flex items-center gap-1">
                  Referrer
                  {sortField === 'referrer' && (
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Landing Page
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('pages')}
              >
                <div className="flex items-center gap-1">
                  Pages
                  {sortField === 'pages' && (
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('clicks')}
              >
                <div className="flex items-center gap-1">
                  Clicks
                  {sortField === 'clicks' && (
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timeSpent')}
              >
                <div className="flex items-center gap-1">
                  Time Spent
                  {sortField === 'timeSpent' && (
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortField === 'status' && (
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedSessions.map((session) => (
              <tr 
                key={session.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectSession?.(session)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500">
                      {new Date(session.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {session.deviceType === 'mobile' ? '📱' : session.deviceType === 'tablet' ? '📱' : '💻'}
                    </span>
                    <span className="capitalize">{session.deviceType}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {session.city || 'Unknown'}, {session.country || 'Unknown'}
                    </span>
                    {session.region && session.region !== session.country && (
                      <span className="text-gray-500 text-xs">{session.region}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {session.ipAddress}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  <div className="truncate" title={session.referrer}>
                    {session.referrer === 'direct' ? (
                      <span className="text-gray-500 italic">Direct</span>
                    ) : (
                      <span className="text-blue-600 hover:text-blue-800">
                        {session.referrer}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  <div className="truncate" title={session.landingPage}>
                    {session.landingPage || 'Unknown page'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.pageviews}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.clicks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(session.timeSpent)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(session)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-purple-600 hover:text-purple-900">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedSessions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No sessions found</div>
          <div className="text-gray-400 text-sm">
            Try adjusting your filters or search terms
          </div>
        </div>
      )}
    </div>
  );
}
