import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  Bell,
  MapPin,
  Phone,
  Mail,
  Home,
  Clock,
  Shield,
  Palette,
  Save,
  Plus,
  Edit2,
  Trash2,
  Check,
  CreditCard,
  Receipt,
  Lock,
  Repeat,
  Play,
  Pause,
  X,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Monitor,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface NotificationPreferences {
  emailBookingConfirmation: boolean;
  emailServiceReminders: boolean;
  emailPromotions: boolean;
  smsBookingConfirmation: boolean;
  smsServiceReminders: boolean;
  pushNotifications: boolean;
}

interface ServicePreferences {
  preferredTimeSlots: string[];
  specialInstructions: string;
  autoBookingSuggestions: boolean;
  ratingReminders: boolean;
}

interface RecurringBooking {
  id: string;
  serviceName: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  status: 'active' | 'paused' | 'cancelled';
  nextBookingDate: string;
  amount: number;
  address: string;
  lastBookingDate?: string;
  totalBookings: number;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  passwordVisible: boolean;
  newPasswordVisible: boolean;
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  loginTime: string;
  ipAddress: string;
  isCurrent: boolean;
}

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Profile state - matching the User interface from NewBooking
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe', // Full name for compatibility
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    phoneNumber: '+1 (555) 123-4567', // Alternative field name
    address: '123 Main Street, Apt 4B',
    postalCode: '10001',
    bedrooms: 3,
    bathrooms: 2,
    emergencyContact: '+1 (555) 987-6543'
  });

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      label: 'Home',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      isDefault: true
    },
    {
      id: '2',
      type: 'work',
      label: 'Office',
      address: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      isDefault: false
    }
  ]);

  // Notification preferences state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailBookingConfirmation: true,
    emailServiceReminders: true,
    emailPromotions: false,
    smsBookingConfirmation: true,
    smsServiceReminders: true,
    pushNotifications: true
  });

  // Service preferences state
  const [servicePrefs, setServicePrefs] = useState<ServicePreferences>({
    preferredTimeSlots: ['morning', 'afternoon'],
    specialInstructions: 'Please call before arriving. Dog-friendly service providers preferred.',
    autoBookingSuggestions: true,
    ratingReminders: true
  });

  // Recurring bookings state
  const [recurringBookings, setRecurringBookings] = useState<RecurringBooking[]>([
    {
      id: '1',
      serviceName: 'House Cleaning',
      frequency: 'bi-weekly',
      status: 'active',
      nextBookingDate: '2024-02-15',
      amount: 150,
      address: '123 Main Street, Apt 4B',
      lastBookingDate: '2024-01-15',
      totalBookings: 6
    },
    {
      id: '2',
      serviceName: 'Garden Maintenance',
      frequency: 'monthly',
      status: 'active',
      nextBookingDate: '2024-02-20',
      amount: 80,
      address: '123 Main Street, Apt 4B',
      lastBookingDate: '2024-01-20',
      totalBookings: 12
    },
    {
      id: '3',
      serviceName: 'Window Cleaning',
      frequency: 'quarterly',
      status: 'paused',
      nextBookingDate: '2024-04-01',
      amount: 60,
      address: '123 Main Street, Apt 4B',
      lastBookingDate: '2024-01-01',
      totalBookings: 4
    }
  ]);

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    passwordVisible: false,
    newPasswordVisible: false
  });

  // Mock login sessions data
  const [loginSessions] = useState<LoginSession[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, NY',
      loginTime: '2 hours ago',
      ipAddress: '192.168.1.100',
      isCurrent: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, NY',
      loginTime: '1 day ago',
      ipAddress: '192.168.1.101',
      isCurrent: false
    },
    {
      id: '3',
      device: 'Chrome on MacBook',
      location: 'New York, NY',
      loginTime: '3 days ago',
      ipAddress: '192.168.1.102',
      isCurrent: false
    }
  ]);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});

  const handleBackNavigation = () => {
    navigate('/new-booking');
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
    setIsEditing({});
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Preferences Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSaveServicePrefs = () => {
    toast({
      title: "Preferences Updated", 
      description: "Your service preferences have been saved.",
    });
  };

  const handleAddAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      type: 'other',
      label: 'New Address',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    };
    setAddresses([...addresses, newAddress]);
    setIsEditing({ [`address-${newAddress.id}`]: true });
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId));
    toast({
      title: "Address Deleted",
      description: "The address has been removed from your account.",
    });
  };

  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
    toast({
      title: "Default Address Updated",
      description: "Your default address has been changed.",
    });
  };

  const getAddressTypeColor = (type: Address['type']) => {
    switch (type) {
      case 'home': return 'bg-green-100 text-green-700';
      case 'work': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Recurring bookings handlers
  const handlePauseRecurringBooking = (bookingId: string) => {
    setRecurringBookings(bookings => 
      bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'paused' }
          : booking
      )
    );
    toast({
      title: "Booking Paused",
      description: "Your recurring booking has been paused successfully.",
    });
  };

  const handleResumeRecurringBooking = (bookingId: string) => {
    setRecurringBookings(bookings => 
      bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'active' }
          : booking
      )
    );
    toast({
      title: "Booking Resumed",
      description: "Your recurring booking has been resumed successfully.",
    });
  };

  const handleCancelRecurringBooking = (bookingId: string) => {
    setRecurringBookings(bookings => 
      bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      )
    );
    toast({
      title: "Booking Cancelled",
      description: "Your recurring booking has been cancelled.",
    });
  };

  const getStatusColor = (status: RecurringBooking['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getFrequencyLabel = (frequency: RecurringBooking['frequency']) => {
    switch (frequency) {
      case 'weekly': return 'Every week';
      case 'bi-weekly': return 'Every 2 weeks';
      case 'monthly': return 'Every month';
      case 'quarterly': return 'Every 3 months';
      default: return frequency;
    }
  };

  // Security handlers
  const handlePasswordChange = () => {
    // Validate passwords
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    if (securitySettings.newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Reset form
    setSecuritySettings({
      ...securitySettings,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
  };

  const handleToggle2FA = (enabled: boolean) => {
    setSecuritySettings({ ...securitySettings, twoFactorEnabled: enabled });
    toast({
      title: enabled ? "2FA Enabled" : "2FA Disabled",
      description: enabled 
        ? "Two-factor authentication has been enabled for your account."
        : "Two-factor authentication has been disabled.",
    });
  };

  const handleLogoutSession = (sessionId: string) => {
    toast({
      title: "Session Terminated",
      description: "The selected session has been logged out.",
    });
  };

  const timeSlotOptions = [
    { value: 'early-morning', label: 'Early Morning (7AM-9AM)' },
    { value: 'morning', label: 'Morning (9AM-12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM-5PM)' },
    { value: 'evening', label: 'Evening (5PM-8PM)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackNavigation}
                className="hover:bg-slate-100 p-1 sm:p-2"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-800 font-title">Account & Settings</h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Manage your profile, addresses, and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 h-auto p-1">
            <TabsTrigger value="profile" className="flex items-center space-x-1 text-xs sm:text-sm px-2 py-2">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center space-x-1 text-xs sm:text-sm px-2 py-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center space-x-1 text-xs sm:text-sm px-2 py-2">
              <Repeat className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Recurring</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-1 text-xs sm:text-sm px-2 py-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center space-x-1 text-xs sm:text-sm px-2 py-2">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-1 text-xs sm:text-sm px-2 py-2">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-1 text-xs sm:text-sm px-2 py-2">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Personal Information</span>
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing({ profile: !isEditing.profile })}
                  >
                    {isEditing.profile ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    {isEditing.profile ? 'Save' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value, name: `${e.target.value} ${profile.lastName}` })}
                      disabled={!isEditing.profile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value, name: `${profile.firstName} ${e.target.value}` })}
                      disabled={!isEditing.profile}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing.profile}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">This email is used for service confirmations and notifications</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value, phoneNumber: e.target.value })}
                      disabled={!isEditing.profile}
                      className="pl-10"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Precise Address *</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      disabled={!isEditing.profile}
                      className="pl-10"
                      placeholder="123 Main Street, Apt 4B"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">Include apartment/unit number for accurate service delivery</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal/ZIP Code *</Label>
                  <Input
                    id="postalCode"
                    value={profile.postalCode}
                    onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                    disabled={!isEditing.profile}
                    placeholder="10001"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Number of Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      max="20"
                      value={profile.bedrooms}
                      onChange={(e) => setProfile({ ...profile, bedrooms: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing.profile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Number of Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={profile.bathrooms}
                      onChange={(e) => setProfile({ ...profile, bathrooms: parseFloat(e.target.value) || 0 })}
                      disabled={!isEditing.profile}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="emergency"
                      value={profile.emergencyContact}
                      onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                      disabled={!isEditing.profile}
                      className="pl-10"
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Optional: Alternative contact for emergencies</p>
                </div>

                {isEditing.profile && (
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsEditing({ profile: false })}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Service Addresses</span>
                  </span>
                  <Button onClick={handleAddAddress} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className={getAddressTypeColor(address.type)}>
                              {address.type}
                            </Badge>
                            {address.isDefault && (
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                Default
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-slate-800">{address.label}</h4>
                          <p className="text-sm text-slate-600">
                            {address.address}<br />
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!address.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultAddress(address.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing({ [`address-${address.id}`]: true })}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {addresses.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recurring Bookings Tab */}
          <TabsContent value="recurring" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Repeat className="w-5 h-5" />
                  <span>Recurring Bookings</span>
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  Manage your recurring service bookings and subscription status
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recurringBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">No Recurring Bookings</h3>
                      <p className="text-slate-500 mb-4">Set up recurring bookings to automate your regular services.</p>
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Recurring Booking
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recurringBookings.map((booking) => (
                        <div key={booking.id} className="p-4 sm:p-6 border border-slate-200 rounded-lg bg-gradient-to-br from-white to-slate-50">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                                <h4 className="text-lg font-semibold text-slate-800">{booking.serviceName}</h4>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-600">Frequency:</span>
                                  <span className="font-medium">{getFrequencyLabel(booking.frequency)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-600">Next booking:</span>
                                  <span className="font-medium">{new Date(booking.nextBookingDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-600">Amount:</span>
                                  <span className="font-medium">${booking.amount}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-600">Address:</span>
                                  <span className="font-medium text-sm">{booking.address}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Receipt className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-600">Total bookings:</span>
                                  <span className="font-medium">{booking.totalBookings}</span>
                                </div>
                                {booking.lastBookingDate && (
                                  <div className="flex items-center space-x-2">
                                    <Check className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-600">Last booking:</span>
                                    <span className="font-medium">{new Date(booking.lastBookingDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto sm:ml-4">
                              {booking.status === 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePauseRecurringBooking(booking.id)}
                                  className="text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:bg-yellow-50 text-xs sm:text-sm"
                                >
                                  <Pause className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  <span className="hidden xs:inline">Pause</span>
                                </Button>
                              )}
                              {booking.status === 'paused' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResumeRecurringBooking(booking.id)}
                                  className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50 text-xs sm:text-sm"
                                >
                                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  <span className="hidden xs:inline">Resume</span>
                                </Button>
                              )}
                              {booking.status !== 'cancelled' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelRecurringBooking(booking.id)}
                                  className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50 text-xs sm:text-sm"
                                >
                                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  <span className="hidden xs:inline">Cancel</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-slate-700 text-xs sm:text-sm"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Subscription Status Integration */}
                  <Separator />
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Payment Status</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          All recurring bookings are automatically charged to your default payment method. 
                          You can view payment history and update your payment method in the Payment tab.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
                          onClick={() => setActiveTab('payment')}
                        >
                          Manage Payment Method
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              {/* Password Change Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>Change Password</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={securitySettings.passwordVisible ? "text" : "password"}
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                        placeholder="Enter your current password"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setSecuritySettings({ 
                          ...securitySettings, 
                          passwordVisible: !securitySettings.passwordVisible 
                        })}
                      >
                        {securitySettings.passwordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={securitySettings.newPasswordVisible ? "text" : "password"}
                        value={securitySettings.newPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                        placeholder="Enter new password (min. 8 characters)"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setSecuritySettings({ 
                          ...securitySettings, 
                          newPasswordVisible: !securitySettings.newPasswordVisible 
                        })}
                      >
                        {securitySettings.newPasswordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                    />
                  </div>

                  <div className="pt-4">
                    <Button onClick={handlePasswordChange} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5" />
                    <span>Two-Factor Authentication</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">Authenticator App</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Add an extra layer of security using an authenticator app like Google Authenticator or Authy.
                        </p>
                        {securitySettings.twoFactorEnabled && (
                          <Badge className="bg-green-100 text-green-700 mt-2">
                            <Check className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                        )}
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorEnabled}
                        onCheckedChange={handleToggle2FA}
                      />
                    </div>

                    {!securitySettings.twoFactorEnabled && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-orange-800">Security Recommendation</h4>
                            <p className="text-sm text-orange-700 mt-1">
                              Enable two-factor authentication to significantly improve your account security. 
                              This adds an extra verification step when logging in.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {securitySettings.twoFactorEnabled && (
                      <div className="space-y-3">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Backup Codes
                        </Button>
                        <p className="text-xs text-slate-500">
                          Download backup codes in case you lose access to your authenticator app
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Login Activity Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5" />
                    <span>Recent Login Activity</span>
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-2">
                    Monitor recent access to your account for any suspicious activity
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loginSessions.map((session) => (
                      <div key={session.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-slate-800">{session.device}</h4>
                              {session.isCurrent && (
                                <Badge className="bg-green-100 text-green-700">
                                  Current Session
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-slate-600">
                              <p className="flex items-center space-x-2">
                                <MapPin className="w-3 h-3" />
                                <span>{session.location}</span>
                              </p>
                              <p className="flex items-center space-x-2">
                                <Clock className="w-3 h-3" />
                                <span>{session.loginTime}</span>
                              </p>
                              <p className="flex items-center space-x-2">
                                <Monitor className="w-3 h-3" />
                                <span>{session.ipAddress}</span>
                              </p>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLogoutSession(session.id)}
                              className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Logout
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Account Recovery Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Account Recovery</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Recovery Email</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Your current email ({profile.email}) is used for account recovery. 
                        Make sure you have access to this email.
                      </p>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Update Recovery Email
                      </Button>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Account Deletion</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Backend Integration Required</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      For full security functionality including secure password changes, 2FA verification, 
                      and session management, integration with Supabase Auth or similar authentication service is required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="mt-6">
            <div className="space-y-6">
              {/* Payment Method Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">••••</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">•••• •••• •••• 4242</p>
                          <p className="text-sm text-slate-600">Expires 12/2028</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Secure Payment Integration</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          To implement secure payment functionality, we need to integrate with Stripe. 
                          This requires setting up Supabase backend integration first.
                        </p>
                        <Button variant="outline" size="sm" className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                          Setup Payment Integration
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Receipt className="w-5 h-5" />
                    <span>Payment History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock payment history entries */}
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className="bg-green-100 text-green-700">Completed</Badge>
                            <span className="text-sm text-slate-600">Jan 15, 2024</span>
                          </div>
                          <h4 className="font-semibold text-slate-800">House Cleaning Service</h4>
                          <p className="text-sm text-slate-600">3-bedroom deep cleaning</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">$150.00</p>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            <Receipt className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className="bg-green-100 text-green-700">Completed</Badge>
                            <span className="text-sm text-slate-600">Dec 20, 2023</span>
                          </div>
                          <h4 className="font-semibold text-slate-800">Garden Maintenance</h4>
                          <p className="text-sm text-slate-600">Seasonal garden cleanup</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">$80.00</p>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            <Receipt className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className="bg-green-100 text-green-700">Completed</Badge>
                            <span className="text-sm text-slate-600">Nov 15, 2023</span>
                          </div>
                          <h4 className="font-semibold text-slate-800">Appliance Repair</h4>
                          <p className="text-sm text-slate-600">Washing machine drainage fix</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">$120.00</p>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            <Receipt className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">Total Spent</h4>
                        <p className="text-sm text-slate-600">Last 12 months</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-800">$350.00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-4">Email Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailBooking">Booking Confirmations</Label>
                        <p className="text-sm text-slate-600">Get notified when your bookings are confirmed</p>
                      </div>
                      <Switch
                        id="emailBooking"
                        checked={notifications.emailBookingConfirmation}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, emailBookingConfirmation: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailReminders">Service Reminders</Label>
                        <p className="text-sm text-slate-600">Reminders about upcoming services</p>
                      </div>
                      <Switch
                        id="emailReminders"
                        checked={notifications.emailServiceReminders}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, emailServiceReminders: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailPromotions">Promotions & Offers</Label>
                        <p className="text-sm text-slate-600">Special deals and promotional content</p>
                      </div>
                      <Switch
                        id="emailPromotions"
                        checked={notifications.emailPromotions}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, emailPromotions: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-slate-800 mb-4">SMS Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsBooking">Booking Confirmations</Label>
                        <p className="text-sm text-slate-600">SMS alerts for booking confirmations</p>
                      </div>
                      <Switch
                        id="smsBooking"
                        checked={notifications.smsBookingConfirmation}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, smsBookingConfirmation: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsReminders">Service Reminders</Label>
                        <p className="text-sm text-slate-600">SMS reminders about upcoming services</p>
                      </div>
                      <Switch
                        id="smsReminders"
                        checked={notifications.smsServiceReminders}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, smsServiceReminders: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Service Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Preferred Time Slots</Label>
                  <p className="text-sm text-slate-600 mb-4">Select your preferred times for service appointments</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {timeSlotOptions.map((slot) => (
                      <div key={slot.value} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={slot.value}
                          checked={servicePrefs.preferredTimeSlots.includes(slot.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setServicePrefs({
                                ...servicePrefs,
                                preferredTimeSlots: [...servicePrefs.preferredTimeSlots, slot.value]
                              });
                            } else {
                              setServicePrefs({
                                ...servicePrefs,
                                preferredTimeSlots: servicePrefs.preferredTimeSlots.filter(t => t !== slot.value)
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={slot.value} className="text-sm">{slot.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="specialInstructions" className="text-base font-semibold">Special Instructions</Label>
                  <p className="text-sm text-slate-600 mb-3">Default instructions for service providers</p>
                  <Textarea
                    id="specialInstructions"
                    value={servicePrefs.specialInstructions}
                    onChange={(e) => setServicePrefs({ ...servicePrefs, specialInstructions: e.target.value })}
                    placeholder="Enter any special instructions for service providers..."
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoSuggestions">Auto Booking Suggestions</Label>
                      <p className="text-sm text-slate-600">Get suggestions for repeat services</p>
                    </div>
                    <Switch
                      id="autoSuggestions"
                      checked={servicePrefs.autoBookingSuggestions}
                      onCheckedChange={(checked) => 
                        setServicePrefs({ ...servicePrefs, autoBookingSuggestions: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ratingReminders">Rating Reminders</Label>
                      <p className="text-sm text-slate-600">Remind me to rate completed services</p>
                    </div>
                    <Switch
                      id="ratingReminders"
                      checked={servicePrefs.ratingReminders}
                      onCheckedChange={(checked) => 
                        setServicePrefs({ ...servicePrefs, ratingReminders: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveServicePrefs}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountSettings;