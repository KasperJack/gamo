import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';

export default function StockManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSparePart, setEditingSparePart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const queryClient = useQueryClient();

  // Fetch spare parts
  const { data: stockData = { spareParts: [] }, isLoading, error } = useQuery({
    queryKey: ['stock', searchTerm, filterCategory, filterStockStatus, filterSupplier],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filterStockStatus) params.append('stockStatus', filterStockStatus);
      if (filterSupplier) params.append('supplier', filterSupplier);
      
      const response = await fetch(`/api/stock?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch spare parts');
      }
      return response.json();
    },
  });

  // Create spare part mutation
  const createSparePartMutation = useMutation({
    mutationFn: async (sparePartData) => {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sparePartData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create spare part');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      setShowAddForm(false);
    },
  });

  // Update spare part mutation
  const updateSparePartMutation = useMutation({
    mutationFn: async ({ id, ...sparePartData }) => {
      const response = await fetch(`/api/stock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sparePartData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update spare part');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      setEditingSparePart(null);
    },
  });

  // Delete spare part mutation
  const deleteSparePartMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/stock/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete spare part');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });

  const handleDeleteSparePart = useCallback((id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette pièce de rechange ?')) {
      deleteSparePartMutation.mutate(id);
    }
  }, [deleteSparePartMutation]);

  const getStockStatusIcon = (stockStatus, currentStock, minimumStock) => {
    switch (stockStatus) {
      case 'out_of_stock':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'low_stock':
        return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'overstock':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStockStatusColor = (stockStatus) => {
    switch (stockStatus) {
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'low_stock':
        return 'bg-orange-100 text-orange-800';
      case 'overstock':
        return 'bg-blue-100 text-blue-800';
      case 'normal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatusText = (stockStatus) => {
    switch (stockStatus) {
      case 'out_of_stock':
        return 'Rupture';
      case 'low_stock':
        return 'Stock faible';
      case 'overstock':
        return 'Surstock';
      case 'normal':
        return 'Normal';
      default:
        return 'Inconnu';
    }
  };

  // Calculate stock statistics
  const stockStats = stockData.spareParts.reduce((acc, part) => {
    acc.total++;
    if (part.stock_status === 'out_of_stock') acc.outOfStock++;
    if (part.stock_status === 'low_stock') acc.lowStock++;
    if (part.stock_status === 'normal') acc.normal++;
    if (part.stock_status === 'overstock') acc.overstock++;
    acc.totalValue += (part.current_stock * part.unit_price) || 0;
    return acc;
  }, { total: 0, outOfStock: 0, lowStock: 0, normal: 0, overstock: 0, totalValue: 0 });

  if (showAddForm || editingSparePart) {
    return <SparePartForm 
      sparePart={editingSparePart}
      onSave={editingSparePart ? updateSparePartMutation.mutate : createSparePartMutation.mutate}
      onCancel={() => {
        setShowAddForm(false);
        setEditingSparePart(null);
      }}
      isLoading={editingSparePart ? updateSparePartMutation.isLoading : createSparePartMutation.isLoading}
      error={editingSparePart ? updateSparePartMutation.error : createSparePartMutation.error}
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Package className="h-8 w-8 text-teal-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Gestion Stock PDR</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Pièce
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stock Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pièces</p>
                <p className="text-2xl font-bold text-gray-900">{stockStats.total}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rupture Stock</p>
                <p className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Faible</p>
                <p className="text-2xl font-bold text-orange-600">{stockStats.lowStock}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Normal</p>
                <p className="text-2xl font-bold text-green-600">{stockStats.normal}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
                <p className="text-2xl font-bold text-blue-600">{stockStats.totalValue.toFixed(2)}€</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher pièces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Toutes catégories</option>
              <option value="Roulement">Roulement</option>
              <option value="Filtration">Filtration</option>
              <option value="Transmission">Transmission</option>
              <option value="Étanchéité">Étanchéité</option>
              <option value="Électrique">Électrique</option>
            </select>
            <select
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Tous statuts</option>
              <option value="out_of_stock">Rupture</option>
              <option value="low_stock">Stock faible</option>
              <option value="normal">Normal</option>
              <option value="overstock">Surstock</option>
            </select>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Tous fournisseurs</option>
              <option value="SKF">SKF</option>
              <option value="Parker">Parker</option>
              <option value="Gates">Gates</option>
              <option value="Freudenberg">Freudenberg</option>
            </select>
          </div>
        </div>

        {/* Spare Parts List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du stock...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Erreur: {error.message}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pièce
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix Unitaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockData.spareParts.map((sparePart) => (
                    <tr key={sparePart.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {sparePart.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sparePart.part_number}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sparePart.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{sparePart.current_stock}</span>
                          {sparePart.unit_of_measure && ` ${sparePart.unit_of_measure}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {sparePart.minimum_stock} | Max: {sparePart.maximum_stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStockStatusIcon(sparePart.stock_status, sparePart.current_stock, sparePart.minimum_stock)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(sparePart.stock_status)}`}>
                            {getStockStatusText(sparePart.stock_status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sparePart.unit_price ? `${sparePart.unit_price}€` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sparePart.supplier || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingSparePart(sparePart)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSparePart(sparePart.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {stockData.spareParts.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune pièce de rechange trouvée</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SparePartForm({ sparePart, onSave, onCancel, isLoading, error }) {
  const [formData, setFormData] = useState({
    part_number: sparePart?.part_number || '',
    name: sparePart?.name || '',
    description: sparePart?.description || '',
    category: sparePart?.category || '',
    manufacturer: sparePart?.manufacturer || '',
    supplier: sparePart?.supplier || '',
    unit_price: sparePart?.unit_price || '',
    currency: sparePart?.currency || 'EUR',
    current_stock: sparePart?.current_stock || 0,
    minimum_stock: sparePart?.minimum_stock || 0,
    maximum_stock: sparePart?.maximum_stock || 0,
    location: sparePart?.location || '',
    unit_of_measure: sparePart?.unit_of_measure || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sparePart) {
      onSave({ id: sparePart.id, ...formData });
    } else {
      onSave(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={onCancel}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Package className="h-8 w-8 text-teal-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                {sparePart ? 'Modifier Pièce' : 'Nouvelle Pièce'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de Pièce *
                </label>
                <input
                  type="text"
                  required
                  value={formData.part_number}
                  onChange={(e) => handleChange('part_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la Pièce *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Roulement">Roulement</option>
                  <option value="Filtration">Filtration</option>
                  <option value="Transmission">Transmission</option>
                  <option value="Étanchéité">Étanchéité</option>
                  <option value="Électrique">Électrique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fabricant
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fournisseur
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix Unitaire
                </label>
                <div className="flex">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => handleChange('unit_price', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Actuel
                </label>
                <input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => handleChange('current_stock', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Minimum
                </label>
                <input
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => handleChange('minimum_stock', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Maximum
                </label>
                <input
                  type="number"
                  value={formData.maximum_stock}
                  onChange={(e) => handleChange('maximum_stock', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité de Mesure
                </label>
                <select
                  value={formData.unit_of_measure}
                  onChange={(e) => handleChange('unit_of_measure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="pcs">Pièces</option>
                  <option value="kg">Kilogrammes</option>
                  <option value="m">Mètres</option>
                  <option value="l">Litres</option>
                  <option value="box">Boîtes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}