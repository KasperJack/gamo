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
  ArrowLeft
} from 'lucide-react';

export default function EquipmentManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const queryClient = useQueryClient();

  // Fetch equipment
  const { data: equipmentData = { equipment: [] }, isLoading, error } = useQuery({
    queryKey: ['equipment', searchTerm, filterCategory, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await fetch(`/api/equipment?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }
      return response.json();
    },
  });

  // Create equipment mutation
  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData) => {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create equipment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setShowAddForm(false);
    },
  });

  // Update equipment mutation
  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, ...equipmentData }) => {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update equipment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setEditingEquipment(null);
    },
  });

  // Delete equipment mutation
  const deleteEquipmentMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete equipment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const handleDeleteEquipment = useCallback((id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      deleteEquipmentMutation.mutate(id);
    }
  }, [deleteEquipmentMutation]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showAddForm || editingEquipment) {
    return <EquipmentForm 
      equipment={editingEquipment}
      onSave={editingEquipment ? updateEquipmentMutation.mutate : createEquipmentMutation.mutate}
      onCancel={() => {
        setShowAddForm(false);
        setEditingEquipment(null);
      }}
      isLoading={editingEquipment ? updateEquipmentMutation.isLoading : createEquipmentMutation.isLoading}
      error={editingEquipment ? updateEquipmentMutation.error : createEquipmentMutation.error}
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
              <Package className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Gestion Équipements</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Équipement
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher équipements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Toutes catégories</option>
              <option value="Compresseur">Compresseur</option>
              <option value="Convoyeur">Convoyeur</option>
              <option value="Pompe">Pompe</option>
              <option value="Moteur">Moteur</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Tous statuts</option>
              <option value="active">Actif</option>
              <option value="maintenance">En maintenance</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        {/* Equipment List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des équipements...</p>
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
                      Équipement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criticité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {equipmentData.equipment.map((equipment) => (
                    <tr key={equipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {equipment.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {equipment.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {equipment.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {equipment.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(equipment.status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {equipment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCriticalityColor(equipment.criticality)}`}>
                          {equipment.criticality}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingEquipment(equipment)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(equipment.id)}
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
            {equipmentData.equipment.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun équipement trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EquipmentForm({ equipment, onSave, onCancel, isLoading, error }) {
  const [formData, setFormData] = useState({
    code: equipment?.code || '',
    name: equipment?.name || '',
    description: equipment?.description || '',
    category: equipment?.category || '',
    location: equipment?.location || '',
    manufacturer: equipment?.manufacturer || '',
    model: equipment?.model || '',
    serial_number: equipment?.serial_number || '',
    purchase_date: equipment?.purchase_date || '',
    warranty_end_date: equipment?.warranty_end_date || '',
    status: equipment?.status || 'active',
    criticality: equipment?.criticality || 'medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (equipment) {
      onSave({ id: equipment.id, ...formData });
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
              <Package className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                {equipment ? 'Modifier Équipement' : 'Nouvel Équipement'}
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
                  Code Équipement *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom Équipement *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Compresseur">Compresseur</option>
                  <option value="Convoyeur">Convoyeur</option>
                  <option value="Pompe">Pompe</option>
                  <option value="Moteur">Moteur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fabricant
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modèle
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de Série
                </label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => handleChange('serial_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'Achat
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleChange('purchase_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fin de Garantie
                </label>
                <input
                  type="date"
                  value={formData.warranty_end_date}
                  onChange={(e) => handleChange('warranty_end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="active">Actif</option>
                  <option value="maintenance">En maintenance</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Criticité
                </label>
                <select
                  value={formData.criticality}
                  onChange={(e) => handleChange('criticality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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