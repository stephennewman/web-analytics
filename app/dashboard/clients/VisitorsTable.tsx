'use client';

import { useState, useMemo, useRef, useCallback } from 'react';

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
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  
  // Column widths (resizable)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    time: 150,
    device: 120,
    location: 180,
    ipAddress: 140,
    referrer: 200,
    landingPage: 200,
    pages: 90,
    clicks: 90,
    timeSpent: 120,
    status: 140,
    actions: 120
  });
  
  const resizingColumn = useRef<string | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);
  
  // Column resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, column: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizingColumn.current = column;
    startX.current = e.clientX;
    startWidth.current = columnWidths[column];
    document.addEventListener('mousemove', handleResizeMove as any);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [columnWidths]);
  
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingColumn.current) return;
    const diff = e.clientX - startX.current;
    const newWidth = Math.max(60, startWidth.current + diff);
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn.current!]: newWidth
    }));
  }, []);
  
  const handleResizeEnd = useCallback(() => {
    resizingColumn.current = null;
    document.removeEventListener('mousemove', handleResizeMove as any);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);
  
  // Column filters
  const [filters, setFilters] = useState({
    time: { start: '', end: '', mode: 'include' as 'include' | 'exclude' },
    device: { values: [] as string[], mode: 'include' as 'include' | 'exclude' },
    location: { values: [] as string[], mode: 'include' as 'include' | 'exclude' },
    ipAddress: { value: '', mode: 'include' as 'include' | 'exclude' },
    referrer: { value: '', mode: 'include' as 'include' | 'exclude' },
    landingPage: { value: '', mode: 'include' as 'include' | 'exclude' },
    pages: { min: '', max: '', mode: 'include' as 'include' | 'exclude' },
    clicks: { min: '', max: '', mode: 'include' as 'include' | 'exclude' },
    timeSpent: { min: '', max: '', mode: 'include' as 'include' | 'exclude' },
    status: { values: [] as string[], mode: 'include' as 'include' | 'exclude' }
  });

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

      // Time filter
      if (filters.time.start || filters.time.end) {
        const sessionTime = new Date(session.updated_at);
        let timeMatches = true;
        if (filters.time.start && sessionTime < new Date(filters.time.start)) timeMatches = false;
        if (filters.time.end && sessionTime > new Date(filters.time.end)) timeMatches = false;
        if (filters.time.mode === 'exclude' ? timeMatches : !timeMatches) return false;
      }

      // Device filter
      if (filters.device.values.length > 0) {
        const deviceMatches = filters.device.values.includes(session.deviceType);
        if (filters.device.mode === 'exclude' ? deviceMatches : !deviceMatches) return false;
      }

      // Location filter
      if (filters.location.values.length > 0) {
        const sessionLocation = `${session.city || 'Unknown'}, ${session.country || 'Unknown'}`;
        const locationMatches = filters.location.values.includes(sessionLocation);
        if (filters.location.mode === 'exclude' ? locationMatches : !locationMatches) return false;
      }

      // IP Address filter
      if (filters.ipAddress.value) {
        const ipMatches = session.ipAddress.includes(filters.ipAddress.value);
        if (filters.ipAddress.mode === 'exclude' ? ipMatches : !ipMatches) return false;
      }

      // Referrer filter
      if (filters.referrer.value) {
        const referrerMatches = session.referrer.toLowerCase().includes(filters.referrer.value.toLowerCase());
        if (filters.referrer.mode === 'exclude' ? referrerMatches : !referrerMatches) return false;
      }

      // Landing Page filter
      if (filters.landingPage.value) {
        const landingPageMatches = session.landingPage.toLowerCase().includes(filters.landingPage.value.toLowerCase());
        if (filters.landingPage.mode === 'exclude' ? landingPageMatches : !landingPageMatches) return false;
      }

      // Pages filter
      if (filters.pages.min || filters.pages.max) {
        let pagesMatches = true;
        if (filters.pages.min && session.pageviews < parseInt(filters.pages.min)) pagesMatches = false;
        if (filters.pages.max && session.pageviews > parseInt(filters.pages.max)) pagesMatches = false;
        if (filters.pages.mode === 'exclude' ? pagesMatches : !pagesMatches) return false;
      }

      // Clicks filter
      if (filters.clicks.min || filters.clicks.max) {
        let clicksMatches = true;
        if (filters.clicks.min && session.clicks < parseInt(filters.clicks.min)) clicksMatches = false;
        if (filters.clicks.max && session.clicks > parseInt(filters.clicks.max)) clicksMatches = false;
        if (filters.clicks.mode === 'exclude' ? clicksMatches : !clicksMatches) return false;
      }

      // Time Spent filter
      if (filters.timeSpent.min || filters.timeSpent.max) {
        let timeSpentMatches = true;
        if (filters.timeSpent.min && session.timeSpent < parseInt(filters.timeSpent.min)) timeSpentMatches = false;
        if (filters.timeSpent.max && session.timeSpent > parseInt(filters.timeSpent.max)) timeSpentMatches = false;
        if (filters.timeSpent.mode === 'exclude' ? timeSpentMatches : !timeSpentMatches) return false;
      }

      // Status filter
      if (filters.status.values.length > 0) {
        let sessionStatus = 'normal';
        if (session.converted) sessionStatus = 'converted';
        else if (session.hasIntent) sessionStatus = 'intent';
        else if (session.hasFrustration) sessionStatus = 'frustrated';
        else if (session.hasErrors) sessionStatus = 'errors';
        
        const statusMatches = filters.status.values.includes(sessionStatus);
        if (filters.status.mode === 'exclude' ? statusMatches : !statusMatches) return false;
      }

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
  }, [sessions, searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const updateFilter = (column: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const clearFilter = (column: keyof typeof filters) => {
    const defaultValue = {
      time: { start: '', end: '', mode: 'include' as 'include' | 'exclude' },
      device: { values: [] as string[], mode: 'include' as 'include' | 'exclude' },
      location: { values: [] as string[], mode: 'include' as 'include' | 'exclude' },
      ipAddress: { value: '', mode: 'include' as 'include' | 'exclude' },
      referrer: { value: '', mode: 'include' as 'include' | 'exclude' },
      landingPage: { value: '', mode: 'include' as 'include' | 'exclude' },
      pages: { min: '', max: '', mode: 'include' as 'include' | 'exclude' },
      clicks: { min: '', max: '', mode: 'include' as 'include' | 'exclude' },
      timeSpent: { min: '', max: '', mode: 'include' as 'include' | 'exclude' },
      status: { values: [] as string[], mode: 'include' as 'include' | 'exclude' }
    };
    setFilters(prev => ({
      ...prev,
      [column]: defaultValue[column]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      time: { start: '', end: '', mode: 'include' as 'include' | 'exclude' },
      device: { values: [] as string[], mode: 'include' as 'include' | 'exclude' },
      location: { values: [] as string[], mode: 'include' as 'include' | 'exclude' },
      ipAddress: { value: '', mode: 'include' as 'include' | 'exclude' },
      referrer: { value: '', mode: 'include' as 'include' | 'exclude' },
      landingPage: { value: '', mode: 'include' as 'include' | 'exclude' },
      pages: { min: '', max: '', mode: 'include' as 'include' | 'exclude' },
      clicks: { min: '', max: '', mode: 'include' as 'include' | 'exclude' },
      timeSpent: { min: '', max: '', mode: 'include' as 'include' | 'exclude' },
      status: { values: [] as string[], mode: 'include' as 'include' | 'exclude' }
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.time.start !== '' || filters.time.end !== '' ||
      filters.device.values.length > 0 ||
      filters.location.values.length > 0 ||
      filters.ipAddress.value !== '' ||
      filters.referrer.value !== '' ||
      filters.landingPage.value !== '' ||
      filters.pages.min !== '' || filters.pages.max !== '' ||
      filters.clicks.min !== '' || filters.clicks.max !== '' ||
      filters.timeSpent.min !== '' || filters.timeSpent.max !== '' ||
      filters.status.values.length > 0
    );
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
      {/* Search and Clear Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">☰</span>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredAndSortedSessions.length} of {sessions.length} sessions
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 relative">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative"
                onClick={() => handleSort('time')}
                style={{ width: columnWidths.time, minWidth: columnWidths.time, maxWidth: columnWidths.time }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    Time
                    {sortField === 'time' && (
                      <span className="text-yellow-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFilter(expandedFilter === 'time' ? null : 'time');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <span className={`text-xs ${filters.time.start || filters.time.end ? (filters.time.mode === 'exclude' ? 'text-red-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                      ☰
                    </span>
                  </button>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'time')}
                />
                {expandedFilter === 'time' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 mt-1">
                    <div className="space-y-3">
                      {/* Include/Exclude Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Mode:</span>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            onClick={() => updateFilter('time', { ...filters.time, mode: 'include' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.time.mode === 'include' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => updateFilter('time', { ...filters.time, mode: 'exclude' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.time.mode === 'exclude' 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                        <input
                          type="datetime-local"
                          value={filters.time.start}
                          onChange={(e) => updateFilter('time', { ...filters.time, start: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                        <input
                          type="datetime-local"
                          value={filters.time.end}
                          onChange={(e) => updateFilter('time', { ...filters.time, end: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => clearFilter('time')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative"
                onClick={() => handleSort('device')}
                style={{ width: columnWidths.device, minWidth: columnWidths.device, maxWidth: columnWidths.device }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    Device
                    {sortField === 'device' && (
                      <span className="text-yellow-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFilter(expandedFilter === 'device' ? null : 'device');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <span className={`text-xs ${filters.device.values.length > 0 ? (filters.device.mode === 'exclude' ? 'text-red-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                      ☰
                    </span>
                  </button>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'device')}
                />
                {expandedFilter === 'device' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 mt-1">
                    <div className="space-y-3">
                      {/* Include/Exclude Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Mode:</span>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            onClick={() => updateFilter('device', { ...filters.device, mode: 'include' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.device.mode === 'include' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => updateFilter('device', { ...filters.device, mode: 'exclude' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.device.mode === 'exclude' 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-32 overflow-y-auto">
                        {deviceTypes.map(device => (
                          <label key={device} className="flex items-center space-x-2 text-xs">
                            <input
                              type="checkbox"
                              checked={filters.device.values.includes(device)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateFilter('device', { ...filters.device, values: [...filters.device.values, device] });
                                } else {
                                  updateFilter('device', { ...filters.device, values: filters.device.values.filter(d => d !== device) });
                                }
                              }}
                              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                            />
                            <span>{device}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => clearFilter('device')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative"
                onClick={() => handleSort('location')}
                style={{ width: columnWidths.location, minWidth: columnWidths.location, maxWidth: columnWidths.location }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    Location
                    {sortField === 'location' && (
                      <span className="text-yellow-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFilter(expandedFilter === 'location' ? null : 'location');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <span className={`text-xs ${filters.location.values.length > 0 ? (filters.location.mode === 'exclude' ? 'text-red-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                      ☰
                    </span>
                  </button>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'location')}
                />
                {expandedFilter === 'location' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 mt-1">
                    <div className="space-y-3">
                      {/* Include/Exclude Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Mode:</span>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            onClick={() => updateFilter('location', { ...filters.location, mode: 'include' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.location.mode === 'include' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => updateFilter('location', { ...filters.location, mode: 'exclude' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.location.mode === 'exclude' 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-32 overflow-y-auto">
                        {locations.map(location => (
                          <label key={location} className="flex items-center space-x-2 text-xs">
                            <input
                              type="checkbox"
                              checked={filters.location.values.includes(location)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateFilter('location', { ...filters.location, values: [...filters.location.values, location] });
                                } else {
                                  updateFilter('location', { ...filters.location, values: filters.location.values.filter(l => l !== location) });
                                }
                              }}
                              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                            />
                            <span>{location}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => clearFilter('location')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative"
                onClick={() => handleSort('ipAddress')}
                style={{ width: columnWidths.ipAddress, minWidth: columnWidths.ipAddress, maxWidth: columnWidths.ipAddress }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    IP Address
                    {sortField === 'ipAddress' && (
                      <span className="text-yellow-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFilter(expandedFilter === 'ipAddress' ? null : 'ipAddress');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <span className={`text-xs ${filters.ipAddress.value ? (filters.ipAddress.mode === 'exclude' ? 'text-red-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                      ☰
                    </span>
                  </button>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'ipAddress')}
                />
                {expandedFilter === 'ipAddress' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 mt-1">
                    <div className="space-y-3">
                      {/* Include/Exclude Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Mode:</span>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            onClick={() => updateFilter('ipAddress', { ...filters.ipAddress, mode: 'include' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.ipAddress.mode === 'include' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => updateFilter('ipAddress', { ...filters.ipAddress, mode: 'exclude' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.ipAddress.mode === 'exclude' 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Filter by IP address..."
                        value={filters.ipAddress.value}
                        onChange={(e) => updateFilter('ipAddress', { ...filters.ipAddress, value: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <div className="flex justify-between">
                        <button
                          onClick={() => clearFilter('ipAddress')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative"
                onClick={() => handleSort('referrer')}
                style={{ width: columnWidths.referrer, minWidth: columnWidths.referrer, maxWidth: columnWidths.referrer }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    Referrer
                    {sortField === 'referrer' && (
                      <span className="text-yellow-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFilter(expandedFilter === 'referrer' ? null : 'referrer');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <span className={`text-xs ${filters.referrer.value ? (filters.referrer.mode === 'exclude' ? 'text-red-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                      ☰
                    </span>
                  </button>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'referrer')}
                />
                {expandedFilter === 'referrer' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 mt-1">
                    <div className="space-y-3">
                      {/* Include/Exclude Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Mode:</span>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            onClick={() => updateFilter('referrer', { ...filters.referrer, mode: 'include' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.referrer.mode === 'include' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => updateFilter('referrer', { ...filters.referrer, mode: 'exclude' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.referrer.mode === 'exclude' 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Filter by referrer..."
                        value={filters.referrer.value}
                        onChange={(e) => updateFilter('referrer', { ...filters.referrer, value: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <div className="flex justify-between">
                        <button
                          onClick={() => clearFilter('referrer')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                style={{ width: columnWidths.landingPage, minWidth: columnWidths.landingPage, maxWidth: columnWidths.landingPage }}
              >
                <div className="flex items-center justify-between">
                  <span>Landing Page</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFilter(expandedFilter === 'landingPage' ? null : 'landingPage');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <span className={`text-xs ${filters.landingPage.value ? (filters.landingPage.mode === 'exclude' ? 'text-red-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                      ☰
                    </span>
                  </button>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'landingPage')}
                />
                {expandedFilter === 'landingPage' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 mt-1">
                    <div className="space-y-3">
                      {/* Include/Exclude Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Mode:</span>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            onClick={() => updateFilter('landingPage', { ...filters.landingPage, mode: 'include' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.landingPage.mode === 'include' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => updateFilter('landingPage', { ...filters.landingPage, mode: 'exclude' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.landingPage.mode === 'exclude' 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Filter by landing page..."
                        value={filters.landingPage.value}
                        onChange={(e) => updateFilter('landingPage', { ...filters.landingPage, value: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <div className="flex justify-between">
                        <button
                          onClick={() => clearFilter('landingPage')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative"
                onClick={() => handleSort('pages')}
                style={{ width: columnWidths.pages, minWidth: columnWidths.pages, maxWidth: columnWidths.pages }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    Pages
                    {sortField === 'pages' && (
                      <span className="text-yellow-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFilter(expandedFilter === 'pages' ? null : 'pages');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <span className={`text-xs ${filters.pages.min || filters.pages.max ? (filters.pages.mode === 'exclude' ? 'text-red-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                      ☰
                    </span>
                  </button>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'pages')}
                />
                {expandedFilter === 'pages' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 mt-1">
                    <div className="space-y-3">
                      {/* Include/Exclude Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Mode:</span>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            onClick={() => updateFilter('pages', { ...filters.pages, mode: 'include' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.pages.mode === 'include' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => updateFilter('pages', { ...filters.pages, mode: 'exclude' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.pages.mode === 'exclude' 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Min</label>
                          <input
                            type="number"
                            placeholder="Min pages"
                            value={filters.pages.min}
                            onChange={(e) => updateFilter('pages', { ...filters.pages, min: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Max</label>
                          <input
                            type="number"
                            placeholder="Max pages"
                            value={filters.pages.max}
                            onChange={(e) => updateFilter('pages', { ...filters.pages, max: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => clearFilter('pages')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative"
                onClick={() => handleSort('clicks')}
                style={{ width: columnWidths.clicks, minWidth: columnWidths.clicks, maxWidth: columnWidths.clicks }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    Clicks
                    {sortField === 'clicks' && (
                      <span className="text-yellow-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFilter(expandedFilter === 'clicks' ? null : 'clicks');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <span className={`text-xs ${filters.clicks.min || filters.clicks.max ? (filters.clicks.mode === 'exclude' ? 'text-red-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                      ☰
                    </span>
                  </button>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'clicks')}
                />
                {expandedFilter === 'clicks' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 mt-1">
                    <div className="space-y-3">
                      {/* Include/Exclude Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Mode:</span>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            onClick={() => updateFilter('clicks', { ...filters.clicks, mode: 'include' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.clicks.mode === 'include' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => updateFilter('clicks', { ...filters.clicks, mode: 'exclude' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.clicks.mode === 'exclude' 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Min</label>
                          <input
                            type="number"
                            placeholder="Min clicks"
                            value={filters.clicks.min}
                            onChange={(e) => updateFilter('clicks', { ...filters.clicks, min: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Max</label>
                          <input
                            type="number"
                            placeholder="Max clicks"
                            value={filters.clicks.max}
                            onChange={(e) => updateFilter('clicks', { ...filters.clicks, max: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => clearFilter('clicks')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative"
                onClick={() => handleSort('timeSpent')}
                style={{ width: columnWidths.timeSpent, minWidth: columnWidths.timeSpent, maxWidth: columnWidths.timeSpent }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    Time Spent
                    {sortField === 'timeSpent' && (
                      <span className="text-yellow-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFilter(expandedFilter === 'timeSpent' ? null : 'timeSpent');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <span className={`text-xs ${filters.timeSpent.min || filters.timeSpent.max ? (filters.timeSpent.mode === 'exclude' ? 'text-red-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                      ☰
                    </span>
                  </button>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'timeSpent')}
                />
                {expandedFilter === 'timeSpent' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 mt-1">
                    <div className="space-y-3">
                      {/* Include/Exclude Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Mode:</span>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            onClick={() => updateFilter('timeSpent', { ...filters.timeSpent, mode: 'include' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.timeSpent.mode === 'include' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => updateFilter('timeSpent', { ...filters.timeSpent, mode: 'exclude' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.timeSpent.mode === 'exclude' 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Min (sec)</label>
                          <input
                            type="number"
                            placeholder="Min seconds"
                            value={filters.timeSpent.min}
                            onChange={(e) => updateFilter('timeSpent', { ...filters.timeSpent, min: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Max (sec)</label>
                          <input
                            type="number"
                            placeholder="Max seconds"
                            value={filters.timeSpent.max}
                            onChange={(e) => updateFilter('timeSpent', { ...filters.timeSpent, max: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => clearFilter('timeSpent')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative"
                onClick={() => handleSort('status')}
                style={{ width: columnWidths.status, minWidth: columnWidths.status, maxWidth: columnWidths.status }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    Status
                    {sortField === 'status' && (
                      <span className="text-yellow-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFilter(expandedFilter === 'status' ? null : 'status');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <span className={`text-xs ${filters.status.values.length > 0 ? (filters.status.mode === 'exclude' ? 'text-red-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                      ☰
                    </span>
                  </button>
                </div>
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'status')}
                />
                {expandedFilter === 'status' && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 mt-1">
                    <div className="space-y-3">
                      {/* Include/Exclude Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Mode:</span>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            onClick={() => updateFilter('status', { ...filters.status, mode: 'include' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.status.mode === 'include' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => updateFilter('status', { ...filters.status, mode: 'exclude' })}
                            className={`px-2 py-1 text-xs rounded ${
                              filters.status.mode === 'exclude' 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {['normal', 'converted', 'intent', 'frustrated', 'errors'].map(status => (
                          <label key={status} className="flex items-center space-x-2 text-xs">
                            <input
                              type="checkbox"
                              checked={filters.status.values.includes(status)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateFilter('status', { ...filters.status, values: [...filters.status.values, status] });
                                } else {
                                  updateFilter('status', { ...filters.status, values: filters.status.values.filter(s => s !== status) });
                                }
                              }}
                              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                            />
                            <span className="capitalize">{status}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => clearFilter('status')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setExpandedFilter(null)}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}
              >
                Actions
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-yellow-300 bg-gray-300"
                  onMouseDown={(e) => handleResizeStart(e, 'actions')}
                />
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: columnWidths.time, minWidth: columnWidths.time, maxWidth: columnWidths.time }}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500">
                      {new Date(session.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: columnWidths.device, minWidth: columnWidths.device, maxWidth: columnWidths.device }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {session.deviceType === 'mobile' ? '📱' : session.deviceType === 'tablet' ? '📱' : '💻'}
                    </span>
                    <span className="capitalize">{session.deviceType}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: columnWidths.location, minWidth: columnWidths.location, maxWidth: columnWidths.location }}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {session.city || 'Unknown'}, {session.country || 'Unknown'}
                    </span>
                    {session.region && session.region !== session.country && (
                      <span className="text-gray-500 text-xs">{session.region}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: columnWidths.ipAddress, minWidth: columnWidths.ipAddress, maxWidth: columnWidths.ipAddress }}>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {session.ipAddress}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900" style={{ width: columnWidths.referrer, minWidth: columnWidths.referrer, maxWidth: columnWidths.referrer }}>
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
                <td className="px-6 py-4 text-sm text-gray-900" style={{ width: columnWidths.landingPage, minWidth: columnWidths.landingPage, maxWidth: columnWidths.landingPage }}>
                  <div className="truncate" title={session.landingPage}>
                    {session.landingPage || 'Unknown page'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: columnWidths.pages, minWidth: columnWidths.pages, maxWidth: columnWidths.pages }}>
                  {session.pageviews}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: columnWidths.clicks, minWidth: columnWidths.clicks, maxWidth: columnWidths.clicks }}>
                  {session.clicks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: columnWidths.timeSpent, minWidth: columnWidths.timeSpent, maxWidth: columnWidths.timeSpent }}>
                  {formatTime(session.timeSpent)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ width: columnWidths.status, minWidth: columnWidths.status, maxWidth: columnWidths.status }}>
                  {getStatusBadge(session)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
                  <button className="text-yellow-600 hover:text-purple-900">
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
