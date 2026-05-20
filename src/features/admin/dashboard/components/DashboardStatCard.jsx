export default function DashboardStatCard({ icon: Icon, label, valor, sub, color = 'bg-primary/20' }) {
  return (
    <div className="card flex items-start gap-3">
      <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
        <Icon size={18} className="text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-dark-text/50">{label}</p>
        <p className="text-lg font-semibold text-light-text dark:text-dark-text truncate">{valor}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-dark-text/40">{sub}</p>}
      </div>
    </div>
  )
}
