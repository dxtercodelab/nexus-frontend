import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, ShoppingCart, Calendar, DollarSign, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientService } from '../services/clientService';
import Modal from '../components/Modal';

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: '#FCD34D' },
  confirmed: { label: 'Confirmée', color: '#60A5FA' },
  shipped: { label: 'Expédiée', color: '#A78BFA' },
  delivered: { label: 'Livrée', color: '#34D399' },
  cancelled: { label: 'Annulée', color: '#F87171' }
};

function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const res = await clientService.getById(id);
      setClient(res.data.data);
      setFormData({
        nom: res.data.data.nom,
        email: res.data.data.email,
        telephone: res.data.data.telephone || '',
        adresse: res.data.data.adresse || '',
        ville: res.data.data.ville || ''
      });
    } catch (error) {
      toast.error('Client introuvable');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await clientService.update(id, formData);
      toast.success('Client modifié');
      setIsEditModalOpen(false);
      loadClient();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await clientService.delete(id);
      toast.success('Client supprimé');
      navigate('/clients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Chargement...</div>;
  }

  if (!client) return null;

  const totalRevenue = (client.orders || []).reduce((sum, o) => 
    o.status !== 'cancelled' ? sum + parseFloat(o.montant_total) : sum, 0
  );

  return (
    <div className="p-4 lg:p-8 space-y-4 lg:space-y-6 animate-fade-in">
      {/* Retour */}
      <button
        onClick={() => navigate('/clients')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Retour aux clients</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GAUCHE — Infos client */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card Profil */}
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-32 h-32 gradient-purple rounded-full flex items-center justify-center text-white text-5xl font-bold mx-auto mb-4 shadow-2xl glow-purple">
              {client.nom.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{client.nom}</h1>
            <p className="text-sm text-gray-400 mb-4">Client #{client.id}</p>
            <div className="text-xs text-gray-500">
              Inscrit le {new Date(client.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>

          {/* Card Contact */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Coordonnées
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Mail size={18} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-white truncate">{client.email}</div>
              </div>
            </div>

            {client.telephone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Phone size={18} className="text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Téléphone</div>
                  <div className="text-white">{client.telephone}</div>
                </div>
              </div>
            )}

            {client.ville && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <MapPin size={18} className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Localisation</div>
                  <div className="text-white">{client.ville}</div>
                  {client.adresse && (
                    <div className="text-xs text-gray-400 mt-0.5">{client.adresse}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="gradient-purple glow-purple text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:scale-105 transition-all"
            >
              <Edit size={18} />
              Modifier
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500/10 border border-red-500/20 text-red-400 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
            >
              <Trash2 size={18} />
              Supprimer
            </button>
          </div>
        </div>

        {/* DROITE — Statistiques + Commandes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center">
                  <ShoppingCart size={18} className="text-white" />
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Commandes</span>
              </div>
              <div className="text-3xl font-bold text-white">{client.ordersCount || 0}</div>
              <div className="text-sm text-gray-500 mt-1">Total des commandes</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 gradient-green rounded-xl flex items-center justify-center">
                  <DollarSign size={18} className="text-white" />
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Chiffre d'affaires</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </div>
              <div className="text-sm text-gray-500 mt-1">Total dépensé</div>
            </div>
          </div>

          {/* Historique commandes */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package size={20} className="text-blue-400" />
                Historique des commandes
              </h3>
            </div>

            {!client.orders || client.orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Aucune commande</p>
              </div>
            ) : (
              <div className="space-y-3">
                {client.orders.map((order) => (
                  <div 
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="glass glass-hover rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 gradient-blue rounded-xl flex items-center justify-center text-white font-bold">
                      #{order.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full inline-block"
                        style={{ 
                          backgroundColor: STATUS_CONFIG[order.status].color + '20',
                          color: STATUS_CONFIG[order.status].color
                        }}
                      >
                        {STATUS_CONFIG[order.status].label}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-400">
                        {parseFloat(order.montant_total).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Édition */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier le client"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ville</label>
            <input
              type="text"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-gray-300 hover:bg-white/5 rounded-xl">
              Annuler
            </button>
            <button type="submit" className="gradient-purple glow-purple px-5 py-2.5 text-white rounded-xl font-medium hover:scale-105 transition-all">
              Modifier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClientDetail;