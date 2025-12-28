import { useState, useMemo } from 'react';
import { Download, Users, Activity, MessageSquare, AlertTriangle, Search, Filter } from 'lucide-react';
import Papa from 'papaparse';

const DataTable = ({ logs, activeTab, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const exportToCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Filter and search logic
  const filteredPlayers = useMemo(() => {
    return logs.players.filter(player => 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.friendCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.hashedPuid.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs.players, searchTerm]);

  const filteredRpcs = useMemo(() => {
    let filtered = logs.rpcs;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(rpc => rpc.rpcType === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(rpc =>
        rpc.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rpc.rpcType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => b.count - a.count);
  }, [logs.rpcs, searchTerm, filterType]);

  const filteredChats = useMemo(() => {
    return logs.chats.filter(chat =>
      chat.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs.chats, searchTerm]);

  const filteredEacReports = useMemo(() => {
    let filtered = logs.eacReports;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.severity === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.report.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.fullText.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [logs.eacReports, searchTerm, filterType]);

  // Get unique RPC types for filter
  const rpcTypes = useMemo(() => {
    const types = [...new Set(logs.rpcs.map(rpc => rpc.rpcType))];
    return types.sort();
  }, [logs.rpcs]);

  const tabs = [
    { id: 'players', label: 'Player Sessions', icon: Users },
    { id: 'rpcs', label: 'RPC Events', icon: Activity },
    { id: 'chats', label: 'Chat Transcript', icon: MessageSquare },
    { id: 'eac', label: 'EAC Reports', icon: AlertTriangle }
  ];

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-xl overflow-hidden border border-cyan-400">
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-700">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 min-w-[120px] px-4 py-4 font-semibold transition-all duration-300 ${
              activeTab === id
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 inline mr-2" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Filter Dropdown */}
          {(activeTab === 'rpcs' || activeTab === 'eac') && (
            <div className="relative sm:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition appearance-none cursor-pointer"
              >
                <option value="all">All {activeTab === 'rpcs' ? 'RPC Types' : 'Severities'}</option>
                {activeTab === 'rpcs' 
                  ? rpcTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))
                  : ['Fatal', 'Error'].map(severity => (
                      <option key={severity} value={severity}>{severity}</option>
                    ))
                }
              </select>
            </div>
          )}
        </div>
        
        {/* Results count */}
        <div className="mt-2 text-sm text-gray-400">
          Showing {
            activeTab === 'players' ? filteredPlayers.length :
            activeTab === 'rpcs' ? filteredRpcs.length :
            activeTab === 'chats' ? filteredChats.length :
            filteredEacReports.length
          } results
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Players Tab */}
        {activeTab === 'players' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Player Sessions</h3>
              <button
                onClick={() => exportToCSV(filteredPlayers, 'players.csv')}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Friend Code</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Hashed PUID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Platform</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Client ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPlayers.map((player, idx) => (
                    <tr key={idx} className="hover:bg-gray-700 transition">
                      <td className="px-4 py-3 text-sm text-white font-medium">{player.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{player.friendCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 font-mono">{player.hashedPuid}</td>
                      <td className="px-4 py-3 text-sm text-emerald-400">{player.platform}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{player.clientId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPlayers.length === 0 && (
                <p className="text-center text-gray-400 py-8">No players found</p>
              )}
            </div>
          </>
        )}

        {/* RPCs Tab */}
        {activeTab === 'rpcs' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">RPC Events</h3>
              <button
                onClick={() => exportToCSV(filteredRpcs, 'rpc_events.csv')}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Player ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Player Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">RPC Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredRpcs.map((rpc, idx) => (
                    <tr key={idx} className="hover:bg-gray-700 transition">
                      <td className="px-4 py-3 text-sm text-white">{rpc.playerId}</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">{rpc.playerName}</td>
                      <td className="px-4 py-3 text-sm text-emerald-400">{rpc.rpcType}</td>
                      <td className="px-4 py-3 text-sm text-cyan-400 font-bold">{rpc.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRpcs.length === 0 && (
                <p className="text-center text-gray-400 py-8">No RPC events found</p>
              )}
            </div>
          </>
        )}

        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Chat Transcript</h3>
              <button
                onClick={() => exportToCSV(filteredChats, 'chat_transcript.csv')}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredChats.map((chat, idx) => (
                <div key={idx} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition border-l-4 border-cyan-400">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs text-gray-400 font-mono">{chat.timestamp}</span>
                    <span className="font-semibold text-emerald-400">{chat.sender}:</span>
                    <span className="text-white">{chat.message}</span>
                  </div>
                </div>
              ))}
              {filteredChats.length === 0 && (
                <p className="text-center text-gray-400 py-8">No chat messages found</p>
              )}
            </div>
          </>
        )}

        {/* EAC Tab */}
        {activeTab === 'eac' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">EAC Reports</h3>
              <button
                onClick={() => exportToCSV(filteredEacReports, 'eac_reports.csv')}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="space-y-3">
              {filteredEacReports.map((report, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-4 border-l-4 ${
                    report.severity === 'Fatal' 
                      ? 'bg-red-900 bg-opacity-30 border-red-500' 
                      : 'bg-yellow-900 bg-opacity-30 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-xs font-mono text-gray-400">{report.timestamp}</span>
                    <span className={`text-xs font-bold ${report.severity === 'Fatal' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {report.severity}
                    </span>
                  </div>
                  <p className="text-sm text-white font-mono break-all">{report.report}</p>
                </div>
              ))}
              {filteredEacReports.length === 0 && (
                <p className="text-center text-gray-400 py-8">No EAC reports found</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataTable;
