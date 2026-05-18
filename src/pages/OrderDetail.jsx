import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, User, Calendar, Package, DollarSign, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../services/orderService';

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: '#FCD34D', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  confirmed: { label: 'Confirmée', color: '#60A5FA', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  shipped: { label: 'Expédiée', color: '#A78BFA', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  delivered: { label: 'Livrée', color: '#34D399', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  cancelled: { label: 'Annulée', color: '#F87171', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' }
};

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getById(id);
      setOrder(res.data.data);
    } catch (error) {
      toast.error('Commande introuvable');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      await orderService.updateStatus(id, newStatus);
      toast.success(`Statut: ${STATUS_CONFIG[newStatus].label}`);
      loadOrder();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette commande ?')) return;
    try {
      await orderService.delete(id);
      toast.success('Commande supprimée');
      navigate('/orders');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement...</div>;
  if (!order) return null;

  const status = STATUS_CONFIG[order.status];

  return (
    <div className="p-4 lg:p-8 space-y-4 lg:space-y-6 animate-fade-in">
      {/* Retour */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Retour aux commandes</span>
      </button>

      {/* Header de la commande */}
      <div className="glass rounded-3xl p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 gradient-blue rounded-2xl flex items-center justify-center text-white text-xl font-bold glow-blue">
                #{order.id}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Commande #{order.id}</h1>
                <div className="flex items-center gap-2 text-gray-400 mt-1">
                  <Calendar size={14} />
                  <span className="text-sm">
                    {new Date(order.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${status.bg} ${status.text} ${status.border} flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: status.color }} />
              {status.label}
            </span>
            <button
              onClick={handleDelete}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-xl hover:bg-red-500/20 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GAUCHE — Client + Statut */}
        <div className="space-y-6">
          {/* Client */}
          <div 
            className="glass glass-hover rounded-2xl p-6 cursor-pointer"
            onClick={() => navigate(`/clients/${order.client_id}`)}
          >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} />
              Client
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 gradient-purple rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {order.client_nom.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-white">{order.client_nom}</div>
                <div className="text-xs text-blue-400 hover:underline">Voir le profil →</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail size={14} />
                <span className="truncate">{order.client_email}</span>
              </div>
              {order.client_telephone && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone size={14} />
                  <span>{order.client_telephone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Changement statut */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Modifier le statut
            </h3>
            <div className="space-y-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleChangeStatus(key)}
                  disabled={order.status === key}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition border flex items-center gap-2 ${
                    order.status === key
                      ? `${config.bg} ${config.text} ${config.border} cursor-default`
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-transparent'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: config.color }} />
                  {config.label}
                  {order.status === key && <span className="ml-auto text-xs">Actuel</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DROITE — Items + Total */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
              <Package size={20} className="text-blue-400" />
              Produits commandés ({order.items?.length || 0})
            </h3>

            {!order.items || order.items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Aucun produit</div>
            ) : (
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => navigate(`/products/${item.product_id}`)}
                    className="glass glass-hover rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all"
                  >
                    <div className="w-14 h-14 gradient-blue rounded-xl flex items-center justify-center text-white">
                      <Package size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">{item.product_nom}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {item.quantity} × {parseFloat(item.prix_unitaire).toFixed(2)} €
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-400">
                        {parseFloat(item.sous_total).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="glass rounded-2xl p-8 border border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <DollarSign size={16} />
                  Montant total
                </div>
                <div className="text-5xl font-bold gradient-text">
                  {parseFloat(order.montant_total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Articles</div>
                <div className="text-2xl font-semibold text-white">
                  {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;