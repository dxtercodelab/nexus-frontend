import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';
import Modal from '../components/Modal';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', description: '', prix: '', stock: ''
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = { limit: 100, ...(search && { search }) };
      const res = await productService.getAll(params);
      setProducts(res.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ nom: '', description: '', prix: '', stock: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nom: product.nom,
      description: product.description || '',
      prix: product.prix,
      stock: product.stock
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock)
      };
      if (editingProduct) {
        await productService.update(editingProduct.id, data);
        toast.success('Produit modifié');
      } else {
        await productService.create(data);
        toast.success('Produit créé');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await productService.delete(id);
      toast.success('Produit supprimé');
      loadProducts();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Catalogue Produits</h1>
          <p className="text-gray-400 mt-1">{products.length} produit(s) - Cliquez pour voir les details</p>
        </div>
        <button
          onClick={handleAdd}
          className="gradient-blue glow-blue text-white px-5 py-3 rounded-xl flex items-center gap-2 font-medium hover:scale-105 transition-all"
        >
          <Plus size={20} />
          Nouveau produit
        </button>
      </div>

      {/* Search */}
      <div className="glass rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="glass rounded-2xl overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Aucun produit trouvé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Produit</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Prix</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer group"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <td className="px-6 py-4 text-sm text-gray-500">#{product.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.image_front ? (
                        <img 
                          src={product.image_front} 
                          alt={product.nom}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 gradient-blue rounded-lg flex items-center justify-center">
                          <Package size={18} className="text-white" />
                        </div>
                      )}
                      <span className="font-medium text-white group-hover:text-blue-400 transition">
                        {product.nom}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                    {product.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-white">
                      {parseFloat(product.prix).toFixed(2)} €
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      product.stock > 0 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {product.stock} unités
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product);
                        }}
                        className="text-blue-400 hover:bg-blue-500/10 p-2 rounded-lg transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id);
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prix (€) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stock *</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
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
              className="gradient-blue glow-blue px-5 py-2.5 text-white rounded-xl font-medium hover:scale-105 transition-all"
            >
              {editingProduct ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Products;