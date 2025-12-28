import { useState } from 'react';
import StatCard from './components/StatCard';
import DataTable from './components/DataTable';
import UploadSection from './components/UploadSection';

const EHRLogAnalyzer = () => {
  const [logs, setLogs] = useState(null);
  const [activeTab, setActiveTab] = useState('players');
  const [loading, setLoading] = useState(false);

  const parseLogFile = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const logEntries = doc.querySelectorAll('.log-entry');
    
    const players = new Map();
    const rpcCounts = new Map();
    const chatMessages = [];
    const eacReports = [];

    logEntries.forEach(entry => {
      const text = entry.textContent;
      
      // Parse player sessions
      const sessionMatch = text.match(/\[Session\](.*?)\s*\(ClientID:\s*(\d+)\s*\/\s*FriendCode:\s*(.*?)\s*\/\s*(?:HashPuid|Hashed PUID):\s*([a-f0-9]+)\s*(?:\/\s*Platform:\s*(.*?))?\)/i);
      if (sessionMatch) {
        const [, name, clientId, friendCode, hashedPuid, platform] = sessionMatch;
        const cleanName = name.trim().replace(/\s*joined the lobby.*/, '').replace(/\s*Hosted room.*/, '');
        if (!players.has(clientId)) {
          players.set(clientId, {
            name: cleanName,
            friendCode: friendCode.trim(),
            hashedPuid: hashedPuid.trim(),
            platform: platform ? platform.trim() : 'Unknown',
            clientId: clientId.trim()
          });
        }
      }

      // Parse RPC calls
      const rpcMatch = text.match(/\[ReceiveRPC\]From ID:\s*(\d+)\s*\((.*?)\)\s*:\s*\d+\s*\((.*?)\)/);
      if (rpcMatch) {
        const [, playerId, playerName, rpcType] = rpcMatch;
        const key = `${playerId}|${playerName}|${rpcType}`;
        rpcCounts.set(key, (rpcCounts.get(key) || 0) + 1);
      }

      // Parse chat messages
      const chatMatch = text.match(/\[(\d{2}:\d{2}:\d{2})\]\[ReceiveChat\](.*?):(.*)/);
      if (chatMatch) {
        const [, timestamp, sender, message] = chatMatch;
        chatMessages.push({
          timestamp,
          sender: sender.trim(),
          message: message.trim()
        });
      }

      // Parse EAC reports
      if (entry.classList.contains('fatal') || entry.classList.contains('error')) {
        const eacMatch = text.match(/\[EAC/i);
        if (eacMatch) {
          const timeMatch = text.match(/\[(\d{2}:\d{2}:\d{2})\]/);
          const reportMatch = text.match(/EAC report:(.*?)$/i) || text.match(/\[EAC.*?\](.*)/i);
          eacReports.push({
            timestamp: timeMatch ? timeMatch[1] : 'Unknown',
            report: reportMatch ? reportMatch[1].trim() : text.replace(/\[\d{2}:\d{2}:\d{2}\]/, '').trim(),
            severity: entry.classList.contains('fatal') ? 'Fatal' : 'Error',
            fullText: text.trim()
          });
        }
      }
    });

    return {
      players: Array.from(players.values()),
      rpcs: Array.from(rpcCounts.entries()).map(([key, count]) => {
        const [playerId, playerName, rpcType] = key.split('|');
        return { playerId, playerName, rpcType, count };
      }),
      chats: chatMessages,
      eacReports
    };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const parsedData = parseLogFile(content);
        setLogs(parsedData);
      } catch (error) {
        console.error('Error parsing log file:', error);
        alert('Error parsing log file. Please ensure it\'s a valid EHR log file.');
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-xl p-8 mb-8 border border-cyan-400 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-emerald-400/10 animate-pulse"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              EHR Log Analyzer
            </h1>
            <p className="text-gray-400">Upload and analyze Endless Host Roles game logs</p>
          </div>
        </div>

        {/* Upload Section */}
        {!logs && (
          <UploadSection loading={loading} onFileUpload={handleFileUpload} />
        )}

        {/* Results Section */}
        {logs && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon="Users"
                label="Total Players"
                value={logs.players.length}
                color="#00a5ff"
              />
              <StatCard
                icon="Activity"
                label="RPC Events"
                value={logs.rpcs.reduce((sum, rpc) => sum + rpc.count, 0)}
                color="#00ffa5"
              />
              <StatCard
                icon="MessageSquare"
                label="Chat Messages"
                value={logs.chats.length}
                color="#00a5ff"
              />
              <StatCard
                icon="AlertTriangle"
                label="EAC Reports"
                value={logs.eacReports.length}
                color="#ef4444"
              />
            </div>

            {/* Data Tables */}
            <DataTable 
              logs={logs} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />

            {/* Reset Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => setLogs(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition border border-gray-600 hover:border-cyan-400"
              >
                Upload New File
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EHRLogAnalyzer;
