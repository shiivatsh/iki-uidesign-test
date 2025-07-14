import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  Star,
  MoreVertical,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ServiceRecord {
  id: string;
  type: 'service' | 'chat';
  service_type: string;
  date: string;
  status: 'completed' | 'draft' | 'pending_confirmation' | 'awaiting_details' | 'cancelled';
  notes?: string;
  rating?: number;
  cost?: number;
  provider?: string;
  duration?: string;
  last_updated?: string;
}

// Mock data - in real app this would come from props or API
const mockServiceHistory: ServiceRecord[] = [
  {
    id: 'service-1',
    type: 'service',
    service_type: 'house cleaning',
    date: '2024-01-10',
    status: 'completed',
    notes: 'Deep cleaning service for 3-bedroom house',
    rating: 5,
    cost: 150,
    provider: 'CleanPro Services',
    duration: '3 hours'
  },
  {
    id: 'chat-1',
    type: 'chat',
    service_type: 'plumbing repair',
    date: '2024-01-15',
    status: 'draft',
    notes: 'Kitchen sink needs fixing',
    last_updated: '2024-01-15T10:30:00Z'
  },
  {
    id: 'service-2',
    type: 'service',
    service_type: 'garden maintenance',
    date: '2023-12-20',
    status: 'completed',
    notes: 'Seasonal garden cleanup and pruning',
    rating: 4,
    cost: 80,
    provider: 'Green Thumb Gardens',
    duration: '2 hours'
  },
  {
    id: 'chat-2',
    type: 'chat',
    service_type: 'electrical work',
    date: '2024-01-12',
    status: 'pending_confirmation',
    notes: 'Install new ceiling fan in bedroom',
    last_updated: '2024-01-12T15:45:00Z'
  },
  {
    id: 'service-3',
    type: 'service',
    service_type: 'appliance repair',
    date: '2023-11-15',
    status: 'completed',
    notes: 'Fixed washing machine drainage issue',
    rating: 5,
    cost: 120,
    provider: 'FixIt Fast',
    duration: '1.5 hours'
  }
];

const ServiceHistory: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const getServiceIcon = (serviceType: string) => {
    const type = serviceType.toLowerCase();
    if (type.includes('clean')) return '🧹';
    if (type.includes('repair') || type.includes('fix')) return '🔧';
    if (type.includes('plumb')) return '🚿';
    if (type.includes('electric')) return '⚡';
    if (type.includes('garden')) return '🌿';
    if (type.includes('appliance')) return '🔌';
    return '🏠';
  };

  const getStatusBadge = (status: ServiceRecord['status'], type: 'service' | 'chat') => {
    if (type === 'service') {
      switch (status) {
        case 'completed':
          return { text: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle };
        case 'cancelled':
          return { text: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle };
        default:
          return { text: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      }
    } else {
      switch (status) {
        case 'draft':
          return { text: 'Draft', color: 'bg-amber-100 text-amber-700', icon: MessageCircle };
        case 'pending_confirmation':
          return { text: 'Pending', color: 'bg-orange-100 text-orange-700', icon: Clock };
        case 'awaiting_details':
          return { text: 'Details', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle };
        default:
          return { text: 'Active', color: 'bg-blue-100 text-blue-700', icon: MessageCircle };
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const filteredHistory = mockServiceHistory
    .filter(item => {
      const matchesSearch = item.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (item.provider && item.provider.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      const matchesTab = activeTab === 'all' || item.type === activeTab;
      
      return matchesSearch && matchesFilter && matchesTab;
    })
    .sort((a, b) => {
      // Sort by date (newest first)
      const dateA = new Date(a.last_updated || a.date);
      const dateB = new Date(b.last_updated || b.date);
      return dateB.getTime() - dateA.getTime();
    });

  const handleResumeChat = (chatId: string) => {
    console.log('Resuming chat:', chatId);
    // Navigate to chat interface
  };

  const handleViewDetails = (recordId: string) => {
    console.log('Viewing details for:', recordId);
    // Open detailed view modal or navigate to details page
  };

  const handleBackNavigation = () => {
    // Check if there's browser history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // If no history, navigate to new-booking page (main page)
      navigate('/new-booking');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackNavigation}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 font-title">Service History</h1>
                <p className="text-sm text-slate-600">View all your past services and active conversations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search services, providers, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('completed')}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('draft')}>Draft</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('pending_confirmation')}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('awaiting_details')}>Awaiting Details</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="all">All Records ({mockServiceHistory.length})</TabsTrigger>
              <TabsTrigger value="service">Completed Services ({mockServiceHistory.filter(item => item.type === 'service').length})</TabsTrigger>
              <TabsTrigger value="chat">Active Chats ({mockServiceHistory.filter(item => item.type === 'chat').length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {/* Results */}
              <div className="grid gap-4">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((record) => {
                    const statusBadge = getStatusBadge(record.status, record.type);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <Card key={record.id} className="hover:shadow-lg transition-all duration-300 border-slate-200/60">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              {/* Service Icon */}
                              <div className="text-2xl mt-1">
                                {getServiceIcon(record.service_type)}
                              </div>
                              
                              {/* Main Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-slate-800 capitalize">
                                    {record.service_type}
                                  </h3>
                                  <Badge className={`${statusBadge.color} border-0`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusBadge.text}
                                  </Badge>
                                  {record.type === 'service' && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                      Service
                                    </Badge>
                                  )}
                                  {record.type === 'chat' && (
                                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                                      Chat
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Service Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(record.date)}</span>
                                  </div>
                                  
                                  {record.type === 'service' && record.duration && (
                                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                                      <Clock className="w-4 h-4" />
                                      <span>{record.duration}</span>
                                    </div>
                                  )}
                                  
                                  {record.type === 'service' && record.cost && (
                                    <div className="flex items-center space-x-2 text-sm font-medium text-green-600">
                                      <span>{formatCurrency(record.cost)}</span>
                                    </div>
                                  )}
                                  
                                  {record.type === 'service' && record.provider && (
                                    <div className="text-sm text-slate-600">
                                      by {record.provider}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Rating */}
                                {record.type === 'service' && record.rating && (
                                  <div className="flex items-center space-x-2 mb-3">
                                    <div className="flex space-x-1">
                                      {renderStars(record.rating)}
                                    </div>
                                    <span className="text-sm text-slate-600">({record.rating}/5)</span>
                                  </div>
                                )}
                                
                                {/* Notes */}
                                {record.notes && (
                                  <p className="text-sm text-slate-600 leading-relaxed">
                                    {record.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {record.type === 'chat' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleResumeChat(record.id)}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                                >
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                  Resume
                                </Button>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleViewDetails(record.id)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {record.type === 'service' && (
                                    <DropdownMenuItem>
                                      <Star className="w-4 h-4 mr-2" />
                                      Rate Service
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Receipt
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="text-center p-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No records found</h3>
                    <p className="text-slate-600 mb-6">
                      {searchTerm ? 'Try adjusting your search terms or filters.' : 'You haven\'t completed any services yet.'}
                    </p>
                    <Button onClick={() => navigate('/new-booking')} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                      Book New Service
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ServiceHistory;