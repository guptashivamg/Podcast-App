const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
    <div className="bg-white-1/5 rounded-xl p-3 flex flex-col items-center min-w-24 border border-white-1/10 hover:bg-white-1/10 transition-colors">
        <div className="text-orange-1 mb-1">{icon}</div>
        <div className="text-xl font-bold text-white-1">{value}</div>
        <div className="text-xs text-white-2">{label}</div>
    </div>
);

export default StatCard;