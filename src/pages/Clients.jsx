import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Mail, Phone, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientService } from '../services/clientService';
import Modal from '../components/Modal';

function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', email: '', telephone: '', adresse: '', ville: ''
  });

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = { limit: 100, ...(search && { search }) };
      const res = await clientService.getAll(params);
      setClients(res.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search]);

  const handleAdd = () => {
    setEditingClient(null);
    setFormData({ nom: '', email: '', telephone: '', adresse: '', ville: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      nom: client.nom,
      email: client.email,
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      ville: client.ville || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientService.update(editingClient.id, formData);
        toast.success('Client modifié');
      } else {
        await clientService.create(formData);
        toast.success('Client créé');
      }
      setIsModalOpen(false);
      loadClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await clientService.delete(id);
      toast.success('Client supprimé');
      loadClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const getGradient = (id) => {
    const gradients = ['gradient-blue', 'gradient-purple', 'gradient-orange', 'gradient-green'];
    return gradients[id % gradients.length];
  };

  return (
    <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Répertoire Clients</h1>
          <p className="text-gray-400 mt-1">{clients.length} client(s) - Cliquez pour voir le profil</p>
        </div>
        <button
          onClick={handleAdd}
          className="gradient-purple glow-purple text-white px-5 py-3 rounded-xl flex items-center gap-2 font-medium hover:scale-105 transition-all"
        >
          <Plus size={20} />
          Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="glass rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="glass rounded-2xl p-12 text-center text-gray-500">Chargement...</div>
      ) : clients.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <User size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div 
              key={client.id} 
              className="glass glass-hover rounded-2xl p-6 transition-all hover:scale-[1.02] group cursor-pointer"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              {/* Avatar + Actions */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${getGradient(client.id)} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {client.nom.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition">{client.nom}</h3>
                    <span className="text-xs text-gray-500">Client #{client.id}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(client);
                    }}
                    className="text-blue-400 hover:bg-blue-500/10 p-2 rounded-lg transition"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(client.id);
                    }}
                    className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Infos */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <Mail size={14} className="text-blue-400" />
                  </div>
                  <span className="text-gray-300 truncate">{client.email}</span>
                </div>

                {client.telephone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                      <Phone size={14} className="text-green-400" />
                    </div>
                    <span className="text-gray-300">{client.telephone}</span>
                  </div>
                )}

                {client.ville && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                      <MapPin size={14} className="text-purple-400" />
                    </div>
                    <span className="text-gray-300">{client.ville}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Modifier le client' : 'Nouveau client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ville</label>
            <input
              type="text"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-gray-300 hover:bg-white/5 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="gradient-purple glow-purple px-5 py-2.5 text-white rounded-xl font-medium hover:scale-105 transition-all"
            >
              {editingClient ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Clients;