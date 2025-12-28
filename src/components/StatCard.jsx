import { Users, Activity, MessageSquare, AlertTriangle } from 'lucide-react';

const iconMap = {
  Users,
  Activity,
  MessageSquare,
  AlertTriangle
};

const StatCard = ({ icon, label, value, color }) => {
  const Icon = iconMap[icon];
  
  return (
    <div 
      className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-6 border-2 overflow-hidden group hover:scale-105 transition-transform duration-300"
      style={{ borderColor: color }}
    >
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${color}20 0%, transparent 100%)`
        }}
      ></div>
      
      {/* Animated border glow */}
      <div 
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
        style={{
          background: `linear-gradient(135deg, ${color}40, transparent)`,
        }}
      ></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <p 
            className="text-4xl font-bold"
            style={{ color }}
          >
            {value}
          </p>
        </div>
        <Icon 
          className="w-14 h-14 opacity-30 group-hover:opacity-50 transition-opacity duration-300" 
          style={{ color }} 
        />
      </div>
      
      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
        style={{ backgroundColor: color }}
      ></div>
    </div>
  );
};

export default StatCard;
