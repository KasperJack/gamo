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
  Zap,
  Timer,
  DollarSign,
  User,
  Calendar,
  Play,
  Pause,
  XCircle
} from 'lucide-react';

export default function CurativeMaintenanceManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const queryClient = useQueryClient();

  // Fetch curative interventions
  const { data: interventionsData = { interventions: [] }, isLoading, error } = useQuery({
    queryKey: ['curative', searchTerm, filterPriority, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await fetch(`/api/curative?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch curative interventions');
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

  // Create intervention mutation
  const createInterventionMutation = useMutation({
    mutationFn: async (interventionData) => {
      const response = await fetch('/api/curative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interventionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create curative intervention');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curative'] });
      setShowAddForm(false);
    },
  });

  // Update intervention mutation
  const updateInterventionMutation = useMutation({
    mutationFn: async ({ id, ...interventionData }) => {
      const response = await fetch(`/api/curative/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interventionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update curative intervention');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curative'] });
      setEditingIntervention(null);
    },
  });

  // Delete intervention mutation
  const deleteInterventionMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/curative/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete curative intervention');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curative'] });
    },
  });

  const handleDeleteIntervention = useCallback((id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette intervention curative ?')) {
      deleteInterventionMutation.mutate(id);
    }
  }, [deleteInterventionMutation]);

  const handleStatusChange = useCallback((intervention, newStatus) => {
    updateInterventionMutation.mutate({
      ...intervention,
      status: newStatus
    });
  }, [updateInterventionMutation]);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Zap className="h-4 w-4 text-red-600" />;
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
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
      case 'planned':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-yellow-500" />;
      case 'on_hold':
        return <Pause className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'planned':
        return 'Planifiée';
      case 'in_progress':
        return 'En cours';
      case 'on_hold':
        return 'En attente';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return 'Inconnu';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
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

  // Calculate intervention statistics
  const interventionStats = interventionsData.interventions.reduce((acc, intervention) => {
    acc.total++;
    if (intervention.status === 'planned') acc.planned++;
    if (intervention.status === 'in_progress') acc.inProgress++;
    if (intervention.status === 'completed') acc.completed++;
    if (intervention.priority === 'urgent') acc.urgent++;
    acc.totalCost += parseFloat(intervention.cost) || 0;
    
    // Calculate average duration for completed interventions
    if (intervention.status === 'completed' && intervention.actual_duration) {
      acc.totalDuration += intervention.actual_duration;
      acc.completedCount++;
    }
    
    return acc;
  }, { total: 0, planned: 0, inProgress: 0, completed: 0, urgent: 0, totalCost: 0, totalDuration: 0, completedCount: 0 });

  const averageDuration = interventionStats.completedCount > 0 
    ? Math.round(interventionStats.totalDuration / interventionStats.completedCount) 
    : 0;

  if (showAddForm || editingIntervention) {
    return <CurativeForm 
      intervention={editingIntervention}
      equipment={equipmentData.equipment}
      onSave={editingIntervention ? updateInterventionMutation.mutate : createInterventionMutation.mutate}
      onCancel={() => {
        setShowAddForm(false);
        setEditingIntervention(null);
      }}
      isLoading={editingIntervention ? updateInterventionMutation.isLoading : createInterventionMutation.isLoading}
      error={editingIntervention ? updateInterventionMutation.error : createInterventionMutation.error}
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
              <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Maintenance Curative</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Intervention
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intervention Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{interventionStats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planifiées</p>
                <p className="text-2xl font-bold text-blue-600">{interventionStats.planned}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-yellow-600">{interventionStats.inProgress}</p>
              </div>
              <Play className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-green-600">{interventionStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Durée Moy.</p>
                <p className="text-2xl font-bold text-purple-600">{averageDuration}min</p>
              </div>
              <Timer className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coût Total</p>
                <p className="text-2xl font-bold text-indigo-600">{interventionStats.totalCost.toFixed(0)}€</p>
              </div>
              <DollarSign className="h-8 w-8 text-indigo-400" />
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
                placeholder="Rechercher interventions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Toutes priorités</option>
              <option value="urgent">Urgente</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Tous statuts</option>
              <option value="planned">Planifiée</option>
              <option value="in_progress">En cours</option>
              <option value="on_hold">En attente</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>

        {/* Interventions List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des interventions...</p>
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
                      Intervention
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Équipement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technicien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Prévue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interventionsData.interventions.map((intervention) => (
                    <tr key={intervention.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {intervention.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {intervention.description && intervention.description.length > 50 
                              ? `${intervention.description.substring(0, 50)}...` 
                              : intervention.description}
                          </div>
                          {intervention.breakdown_title && (
                            <div className="text-xs text-red-600 mt-1">
                              🔗 Panne: {intervention.breakdown_title}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {intervention.equipment_name || 'Non assigné'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {intervention.equipment_code}
                        </div>
                        <div className="text-xs text-gray-500">
                          {intervention.equipment_location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPriorityIcon(intervention.priority)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(intervention.priority)}`}>
                            {getPriorityText(intervention.priority)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(intervention.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(intervention.status)}`}>
                            {getStatusText(intervention.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {intervention.assigned_technician || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {intervention.planned_date 
                          ? new Date(intervention.planned_date).toLocaleDateString('fr-FR')
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {intervention.status === 'planned' && (
                            <button
                              onClick={() => handleStatusChange(intervention, 'in_progress')}
                              className="text-green-600 hover:text-green-900"
                              title="Démarrer"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          {intervention.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusChange(intervention, 'completed')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Terminer"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingIntervention(intervention)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIntervention(intervention.id)}
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
            {interventionsData.interventions.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune intervention curative trouvée</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CurativeForm({ intervention, equipment, onSave, onCancel, isLoading, error }) {
  const [formData, setFormData] = useState({
    equipment_id: intervention?.equipment_id || '',
    title: intervention?.title || '',
    description: intervention?.description || '',
    priority: intervention?.priority || 'medium',
    status: intervention?.status || 'planned',
    assigned_technician: intervention?.assigned_technician || '',
    planned_date: intervention?.planned_date ? intervention.planned_date.split('T')[0] : '',
    estimated_duration: intervention?.estimated_duration || '',
    actual_duration: intervention?.actual_duration || '',
    cost: intervention?.cost || '',
    notes: intervention?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (intervention) {
      onSave({ id: intervention.id, ...formData });
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
              <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                {intervention ? 'Modifier Intervention' : 'Nouvelle Intervention Curative'}
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
                  Titre de l'Intervention *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipement
                </label>
                <select
                  value={formData.equipment_id}
                  onChange={(e) => handleChange('equipment_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="planned">Planifiée</option>
                  <option value="in_progress">En cours</option>
                  <option value="on_hold">En attente</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technicien Assigné
                </label>
                <input
                  type="text"
                  value={formData.assigned_technician}
                  onChange={(e) => handleChange('assigned_technician', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Prévue
                </label>
                <input
                  type="date"
                  value={formData.planned_date}
                  onChange={(e) => handleChange('planned_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée Estimée (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => handleChange('estimated_duration', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée Réelle (minutes)
                </label>
                <input
                  type="number"
                  value={formData.actual_duration}
                  onChange={(e) => handleChange('actual_duration', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
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