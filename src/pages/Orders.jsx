import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../services/orderService';
import { clientService } from '../services/clientService';
import { productService } from '../services/productService';
import Modal from '../components/Modal';

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: '#FCD34D', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  confirmed: { label: 'Confirmée', color: '#60A5FA', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  shipped: { label: 'Expédiée', color: '#A78BFA', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  delivered: { label: 'Livrée', color: '#34D399', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  cancelled: { label: 'Annulée', color: '#F87171', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' }
};

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = { limit: 100, ...(statusFilter && { status: statusFilter }) };
      const res = await orderService.getAll(params);
      setOrders(res.data.data);
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const loadClientsAndProducts = async () => {
    try {
      const [c, p] = await Promise.all([
        clientService.getAll({ limit: 100 }),
        productService.getAll({ limit: 100 })
      ]);
      setClients(c.data.data);
      setProducts(p.data.data);
    } catch (error) {
      toast.error('Erreur');
    }
  };

  useEffect(() => { loadOrders(); }, [statusFilter]);
  useEffect(() => { loadClientsAndProducts(); }, []);

  const addItem = () => setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => orderItems.length > 1 && setOrderItems(orderItems.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const newItems = [...orderItems];
    newItems[i][field] = value;
    setOrderItems(newItems);
  };

  const calculateTotal = () => orderItems.reduce((total, item) => {
    const product = products.find(p => p.id === parseInt(item.product_id));
    return product && item.quantity ? total + (parseFloat(product.prix) * parseInt(item.quantity)) : total;
  }, 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedClient) return toast.error('Sélectionnez un client');
    const validItems = orderItems.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) return toast.error('Ajoutez au moins un produit');

    try {
      await orderService.create({
        client_id: parseInt(selectedClient),
        items: validItems.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity)
        }))
      });
      toast.success('Commande créée');
      setIsCreateModalOpen(false);
      setSelectedClient('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette commande ?')) return;
    try {
      await orderService.delete(id);
      toast.success('Commande supprimée');
      loadOrders();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Commandes</h1>
          <p className="text-gray-400 mt-1">{orders.length} commande(s) - Cliquez pour voir les détails</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="gradient-green text-white px-5 py-3 rounded-xl flex items-center gap-2 font-medium hover:scale-105 transition-all shadow-lg shadow-green-500/20"
        >
          <Plus size={20} />
          Nouvelle commande
        </button>
      </div>

      {/* Filtres */}
      <div className="glass rounded-2xl p-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            statusFilter === '' 
              ? 'gradient-blue text-white shadow-lg shadow-blue-500/30' 
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Toutes
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
              statusFilter === key 
                ? `${config.bg} ${config.text} ${config.border}` 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-transparent'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="glass rounded-2xl overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Aucune commande</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">N°</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Montant</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer group"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-300 group-hover:text-blue-400 transition">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 gradient-blue rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {order.client_nom.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{order.client_nom}</div>
                        <div className="text-xs text-gray-500">{order.client_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[order.status].bg} ${STATUS_CONFIG[order.status].text} ${STATUS_CONFIG[order.status].border}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CONFIG[order.status].color }} />
                      {STATUS_CONFIG[order.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-green-400">
                      {parseFloat(order.montant_total).toFixed(2)} €
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order.id}`);
                        }}
                        className="text-blue-400 hover:bg-blue-500/10 p-2 rounded-lg transition"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order.id);
                        }}
                        className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Création */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouvelle commande"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Client *</label>
            <select
              required
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500 transition"
            >
              <option value="" className="bg-gray-900">Sélectionner...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-gray-900">{c.nom} ({c.email})</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">Produits *</label>
              <button
                type="button"
                onClick={addItem}
                className="text-green-400 hover:text-green-300 text-sm font-medium"
              >
                + Ajouter
              </button>
            </div>
            
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                  >
                    <option value="" className="bg-gray-900">Produit</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} className="bg-gray-900">
                        {p.nom} ({parseFloat(p.prix).toFixed(2)}€)
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-4 flex justify-between items-center">
            <span className="text-gray-300">Total :</span>
            <span className="text-2xl font-bold gradient-text">
              {calculateTotal().toFixed(2)} €
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-5 py-2.5 text-gray-300 hover:bg-white/5 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="gradient-green px-5 py-2.5 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-green-500/20"
            >
              Créer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Orders;