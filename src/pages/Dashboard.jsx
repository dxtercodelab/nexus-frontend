import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Award, ArrowUpRight, Activity } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import { dashboardService } from '../services/dashboardService';

const STATUS_COLORS = {
  pending: '#FCD34D',
  confirmed: '#60A5FA',
  shipped: '#A78BFA',
  delivered: '#34D399',
  cancelled: '#F87171'
};

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée'
};

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, recentRes, topRes, monthlyRes, statusRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentOrders(),
        dashboardService.getTopProducts(),
        dashboardService.getMonthlySales(),
        dashboardService.getOrdersByStatus()
      ]);

      setStats(statsRes.data.data);
      setRecentOrders(recentRes.data.data);
      setTopProducts(topRes.data.data);
      setMonthlySales(monthlyRes.data.data);
      setOrdersByStatus(statusRes.data.data.map(s => ({
        ...s,
        name: STATUS_LABELS[s.status],
        color: STATUS_COLORS[s.status]
      })));
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Bonjour, <span className="gradient-text">Carlos</span>
          </h1>
          <p className="text-gray-400 mt-1">Voici un apercu de votre activite</p>
        </div>
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
          <Activity size={16} className="text-green-400" />
          <span className="text-sm text-gray-300">Systeme actif</span>
        </div>
      </div>

      {/* Stats cards — CLIQUABLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Clients totaux"
          value={stats?.totalClients || 0}
          gradient="gradient-blue"
          glow="glow-blue"
          trend="+12%"
          onClick={() => navigate('/clients')}
        />
        <StatCard
          icon={Package}
          label="Produits"
          value={stats?.totalProducts || 0}
          gradient="gradient-purple"
          glow="glow-purple"
          trend="+5%"
          onClick={() => navigate('/products')}
        />
        <StatCard
          icon={ShoppingCart}
          label="Commandes"
          value={stats?.totalOrders || 0}
          gradient="gradient-orange"
          trend="+24%"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          icon={DollarSign}
          label="Chiffre d'affaires"
          value={`${parseFloat(stats?.totalRevenue || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
          gradient="gradient-green"
          trend={`Panier: ${stats?.averageOrderValue || 0} €`}
          isMoney
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ventes mensuelles */}
        <div className="lg:col-span-2 glass glass-hover rounded-2xl p-6 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                Evolution des ventes
              </h3>
              <p className="text-sm text-gray-400 mt-1">12 derniers mois</p>
            </div>
          </div>
          {monthlySales.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Aucune donnee disponible</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlySales}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
                <XAxis dataKey="mois" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ background: '#1a1f2e', border: '1px solid #2a3142', borderRadius: '12px', color: '#fff' }}
                  formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                />
                <Bar dataKey="chiffre_affaires" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Statuts */}
        <div className="glass glass-hover rounded-2xl p-6 transition-all">
          <h3 className="text-lg font-semibold text-white mb-1">Statuts</h3>
          <p className="text-sm text-gray-400 mb-4">Repartition des commandes</p>
          {ordersByStatus.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Aucune donnee</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count">
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {ordersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-gray-400 font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top produits */}
        <div className="glass glass-hover rounded-2xl p-6 transition-all cursor-pointer" onClick={() => navigate('/products')}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Award size={20} className="text-yellow-400" />
              Top ventes
            </h3>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Aucune vente</div>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm ${
                    index === 0 ? 'gradient-orange' : index === 1 ? 'bg-gray-600' : index === 2 ? 'bg-orange-700' : 'bg-gray-700'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate group-hover:text-blue-400 transition">{product.nom}</div>
                    <div className="text-xs text-gray-400">{product.total_vendu} vendus</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-400">{parseFloat(product.chiffre_affaires).toFixed(2)} €</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commandes récentes */}
        <div className="glass glass-hover rounded-2xl p-6 transition-all cursor-pointer" onClick={() => navigate('/orders')}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShoppingCart size={20} className="text-green-400" />
              Activite recente
            </h3>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Aucune commande</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center text-white text-xs font-bold">#{order.id}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{order.client_nom}</div>
                    <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">{parseFloat(order.montant_total).toFixed(2)} €</div>
                    <span className="text-xs px-2 py-0.5 rounded-full inline-block mt-1" style={{ backgroundColor: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient, glow, trend, isMoney, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="glass glass-hover rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${gradient} ${glow || ''} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
          <ArrowUpRight size={12} />
          <span className="font-medium">{trend}</span>
        </div>
      </div>
      <div className={`text-2xl font-bold text-white mb-1 ${isMoney ? 'text-xl' : ''}`}>{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

export default Dashboard;