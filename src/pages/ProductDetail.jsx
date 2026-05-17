import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Package, Box, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';
import Modal from '../components/Modal';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(id);
      setProduct(res.data.data);
      setFormData({
        nom: res.data.data.nom,
        description: res.data.data.description || '',
        prix: res.data.data.prix,
        stock: res.data.data.stock
      });
    } catch (error) {
      toast.error('Produit introuvable');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await productService.update(id, {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock)
      });
      toast.success('Produit modifié');
      setIsEditModalOpen(false);
      loadProduct();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await productService.delete(id);
      toast.success('Produit supprimé');
      navigate('/products');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!product) return null;

  // Liste des images (avec fallback si pas d'image)
  const images = [
    { url: product.image_front, label: 'Devant' },
    { url: product.image_back, label: 'Arriere' },
    { url: product.image_side, label: 'Cote' }
  ].filter(img => img.url);

  // Si aucune image, on met un placeholder
  if (images.length === 0) {
    images.push({ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', label: 'Image' });
  }

  const stockStatus = product.stock > 10 
    ? { label: 'En stock', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' }
    : product.stock > 0 
    ? { label: 'Stock limité', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }
    : { label: 'Rupture', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header avec retour */}
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Retour aux produits</span>
      </button>

      {/* Section principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GAUCHE — Galerie photos */}
        <div className="space-y-4">
          {/* Image principale */}
          <div className="glass rounded-3xl overflow-hidden aspect-square relative group">
            <img
              src={images[selectedImage].url}
              alt={product.nom}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Badge label */}
            <div className="absolute top-4 left-4 glass rounded-full px-4 py-1.5">
              <span className="text-sm font-medium text-white">{images[selectedImage].label}</span>
            </div>
            {/* Badge ID */}
            <div className="absolute top-4 right-4 glass rounded-full px-4 py-1.5">
              <span className="text-xs font-mono text-gray-300">#{product.id}</span>
            </div>
          </div>

          {/* Miniatures */}
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`glass rounded-xl overflow-hidden aspect-square transition-all ${
                    selectedImage === index 
                      ? 'ring-2 ring-blue-500 scale-105 glow-blue' 
                      : 'hover:scale-105 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DROITE — Infos produit */}
        <div className="space-y-6">
          {/* Titre */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package size={18} className="text-blue-400" />
              <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Produit</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">{product.nom}</h1>
            <p className="text-gray-400 leading-relaxed">{product.description || 'Aucune description'}</p>
          </div>

          {/* Prix */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold gradient-text">
                {parseFloat(product.prix).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-2xl text-gray-400 font-medium">€</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Prix unitaire TTC</p>
          </div>

          {/* Stock */}
          <div className={`glass rounded-2xl p-6 border ${stockStatus.border}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Box size={20} className={stockStatus.color} />
                <span className="font-semibold text-white">Stock disponible</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color} border ${stockStatus.border}`}>
                {stockStatus.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{product.stock}</span>
              <span className="text-gray-400">unités en stock</span>
            </div>
            
            {product.stock <= 10 && product.stock > 0 && (
              <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                <AlertCircle size={14} />
                <span>Pensez à réapprovisionner bientôt</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="gradient-blue glow-blue text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:scale-105 transition-all"
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

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-green-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Valeur stock</span>
              </div>
              <div className="text-xl font-bold text-white">
                {(parseFloat(product.prix) * product.stock).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={16} className="text-blue-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Date ajout</span>
              </div>
              <div className="text-sm font-medium text-white">
                {new Date(product.created_at).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Édition */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier le produit"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prix (€)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stock</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 text-gray-300 hover:bg-white/5 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="gradient-blue glow-blue px-5 py-2.5 text-white rounded-xl font-medium hover:scale-105 transition-all"
            >
              Modifier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProductDetail;