import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  XCircle,
  Zap,
  Timer,
  DollarSign
} from 'lucide-react';

export default function BreakdownsManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBreakdown, setEditingBreakdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const queryClient = useQueryClient();

  // Fetch breakdowns
  const { data: breakdownsData = { breakdowns: [] }, isLoading, error } = useQuery({
    queryKey: ['breakdowns', searchTerm, filterSeverity, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterSeverity) params.append('severity', filterSeverity);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await fetch(`/api/breakdowns?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch breakdowns');
      }
      return response.json();
    },
  });

  // Fetch equipment for dropdown
  const { data: equipmentData = { equipment: [] } } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await fetch('/api/equipment');
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }
      return response.json();
    },
  });

  // Create breakdown mutation
  const createBreakdownMutation = useMutation({
    mutationFn: async (breakdownData) => {
      const response = await fetch('/api/breakdowns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(breakdownData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create breakdown');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breakdowns'] });
      setShowAddForm(false);
    },
  });

  // Update breakdown mutation
  const updateBreakdownMutation = useMutation({
    mutationFn: async ({ id, ...breakdownData }) => {
      const response = await fetch(`/api/breakdowns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(breakdownData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update breakdown');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breakdowns'] });
      setEditingBreakdown(null);
    },
  });

  // Delete breakdown mutation
  const deleteBreakdownMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/breakdowns/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete breakdown');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breakdowns'] });
    },
  });

  const handleDeleteBreakdown = useCallback((id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette panne ?')) {
      deleteBreakdownMutation.mutate(id);
    }
  }, [deleteBreakdownMutation]);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reported':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'investigating':
        return <Search className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return 'bg-orange-100 text-orange-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reported':
        return 'Signalée';
      case 'investigating':
        return 'Investigation';
      case 'in_progress':
        return 'En cours';
      case 'resolved':
        return 'Résolue';
      case 'closed':
        return 'Fermée';
      default:
        return 'Inconnu';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high':
        return 'Élevée';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Faible';
      default:
        return 'Inconnu';
    }
  };

  // Calculate breakdown statistics
  const breakdownStats = breakdownsData.breakdowns.reduce((acc, breakdown) => {
    acc.total++;
    if (breakdown.status === 'reported') acc.reported++;
    if (breakdown.status === 'in_progress') acc.inProgress++;
    if (breakdown.status === 'resolved') acc.resolved++;
    if (breakdown.severity === 'high') acc.critical++;
    acc.totalDowntime += breakdown.downtime_minutes || 0;
    acc.totalCost += parseFloat(breakdown.cost) || 0;
    return acc;
  }, { total: 0, reported: 0, inProgress: 0, resolved: 0, critical: 0, totalDowntime: 0, totalCost: 0 });

  if (showAddForm || editingBreakdown) {
    return <BreakdownForm 
      breakdown={editingBreakdown}
      equipment={equipmentData.equipment}
      onSave={editingBreakdown ? updateBreakdownMutation.mutate : createBreakdownMutation.mutate}
      onCancel={() => {
        setShowAddForm(false);
        setEditingBreakdown(null);
      }}
      isLoading={editingBreakdown ? updateBreakdownMutation.isLoading : createBreakdownMutation.isLoading}
      error={editingBreakdown ? updateBreakdownMutation.error : createBreakdownMutation.error}
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
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Gestion Pannes</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Panne
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breakdown Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pannes</p>
                <p className="text-2xl font-bold text-gray-900">{breakdownStats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signalées</p>
                <p className="text-2xl font-bold text-orange-600">{breakdownStats.reported}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-yellow-600">{breakdownStats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Résolues</p>
                <p className="text-2xl font-bold text-green-600">{breakdownStats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Arrêt Total</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(breakdownStats.totalDowntime / 60)}h</p>
              </div>
              <Timer className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coût Total</p>
                <p className="text-2xl font-bold text-purple-600">{breakdownStats.totalCost.toFixed(0)}€</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher pannes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Toutes sévérités</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Tous statuts</option>
              <option value="reported">Signalée</option>
              <option value="investigating">Investigation</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolue</option>
              <option value="closed">Fermée</option>
            </select>
          </div>
        </div>

        {/* Breakdowns List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des pannes...</p>
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
                      Panne
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Équipement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sévérité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signalé par
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {breakdownsData.breakdowns.map((breakdown) => (
                    <tr key={breakdown.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {breakdown.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {breakdown.description && breakdown.description.length > 50 
                              ? `${breakdown.description.substring(0, 50)}...` 
                              : breakdown.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {breakdown.equipment_name || 'Non assigné'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {breakdown.equipment_code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getSeverityIcon(breakdown.severity)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(breakdown.severity)}`}>
                            {getSeverityText(breakdown.severity)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(breakdown.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(breakdown.status)}`}>
                            {getStatusText(breakdown.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {breakdown.reported_by || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(breakdown.reported_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingBreakdown(breakdown)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBreakdown(breakdown.id)}
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
            {breakdownsData.breakdowns.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune panne trouvée</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownForm({ breakdown, equipment, onSave, onCancel, isLoading, error }) {
  const [formData, setFormData] = useState({
    equipment_id: breakdown?.equipment_id || '',
    title: breakdown?.title || '',
    description: breakdown?.description || '',
    severity: breakdown?.severity || 'medium',
    reported_by: breakdown?.reported_by || '',
    symptoms: breakdown?.symptoms || '',
    cause_analysis: breakdown?.cause_analysis || '',
    resolution: breakdown?.resolution || '',
    status: breakdown?.status || 'reported',
    downtime_minutes: breakdown?.downtime_minutes || '',
    cost: breakdown?.cost || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (breakdown) {
      onSave({ id: breakdown.id, ...formData });
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
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                {breakdown ? 'Modifier Panne' : 'Nouvelle Panne'}
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
                  Titre de la Panne *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipement
                </label>
                <select
                  value={formData.equipment_id}
                  onChange={(e) => handleChange('equipment_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un équipement</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sévérité
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleChange('severity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="reported">Signalée</option>
                  <option value="investigating">Investigation</option>
                  <option value="in_progress">En cours</option>
                  <option value="resolved">Résolue</option>
                  <option value="closed">Fermée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signalé par
                </label>
                <input
                  type="text"
                  value={formData.reported_by}
                  onChange={(e) => handleChange('reported_by', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temps d'Arrêt (minutes)
                </label>
                <input
                  type="number"
                  value={formData.downtime_minutes}
                  onChange={(e) => handleChange('downtime_minutes', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coût (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleChange('cost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptômes
              </label>
              <textarea
                rows={3}
                value={formData.symptoms}
                onChange={(e) => handleChange('symptoms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analyse des Causes
              </label>
              <textarea
                rows={3}
                value={formData.cause_analysis}
                onChange={(e) => handleChange('cause_analysis', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Résolution
              </label>
              <textarea
                rows={3}
                value={formData.resolution}
                onChange={(e) => handleChange('resolution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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