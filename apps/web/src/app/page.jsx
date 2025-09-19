import { useState } from "react";
import {
  Wrench,
  Package,
  Calendar,
  AlertTriangle,
  BarChart3,
  Settings,
  Plus,
  Search,
} from "lucide-react";

export default function GMAODashboard() {
  const [activeModule, setActiveModule] = useState("dashboard");

  const modules = [
    {
      id: "maintenance",
      name: "Gestion Maintenance",
      icon: Wrench,
      color: "bg-blue-500",
      description: "Gestion des interventions et maintenance",
      href: "/maintenance",
    },
    {
      id: "equipment",
      name: "Gestion Équipements",
      icon: Package,
      color: "bg-green-500",
      description: "Inventaire et suivi des équipements",
      href: "/equipment",
    },
    {
      id: "preventive",
      name: "Maintenance Préventive",
      icon: Calendar,
      color: "bg-purple-500",
      description: "Planification maintenance préventive",
      href: "/preventive",
    },
    {
      id: "curative",
      name: "Maintenance Curative",
      icon: AlertTriangle,
      color: "bg-orange-500",
      description: "Interventions correctives urgentes",
      href: "/curative",
    },
    {
      id: "stock",
      name: "Gestion Stock PDR",
      icon: Package,
      color: "bg-teal-500",
      description: "Pièces de rechange et stock",
      href: "/stock",
    },
    {
      id: "breakdown",
      name: "Gestion Pannes",
      icon: AlertTriangle,
      color: "bg-red-500",
      description: "Suivi et analyse des pannes",
      href: "/breakdowns",
    },
  ];

  const stats = [
    { label: "Équipements Actifs", value: "156", change: "+12%" },
    { label: "Interventions ce mois", value: "43", change: "+8%" },
    { label: "Pannes Résolues", value: "28", change: "+15%" },
    { label: "Stock Critique", value: "7", change: "-3%" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">GMAO System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Intervention
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Modules GMAO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const IconComponent = module.icon;
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6 border border-gray-200 hover:border-blue-300"
                  onClick={() => (window.location.href = module.href)}
                >
                  <div className="flex items-center mb-4">
                    <div className={`${module.color} p-3 rounded-lg mr-4`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {module.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm">{module.description}</p>
                  <div className="mt-4 flex justify-end">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      Accéder →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Activités Récentes
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                {
                  type: "maintenance",
                  title: "Maintenance préventive - Compresseur A1",
                  time: "Il y a 2 heures",
                  status: "Terminé",
                  statusColor: "bg-green-100 text-green-800",
                },
                {
                  type: "panne",
                  title: "Panne signalée - Convoyeur B3",
                  time: "Il y a 4 heures",
                  status: "En cours",
                  statusColor: "bg-yellow-100 text-yellow-800",
                },
                {
                  type: "stock",
                  title: "Stock faible - Roulements SKF 6205",
                  time: "Il y a 6 heures",
                  status: "Critique",
                  statusColor: "bg-red-100 text-red-800",
                },
                {
                  type: "equipment",
                  title: "Nouvel équipement ajouté - Pompe C4",
                  time: "Hier",
                  status: "Ajouté",
                  statusColor: "bg-blue-100 text-blue-800",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${activity.statusColor}`}
                  >
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
