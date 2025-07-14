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
  Check
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

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Profile state
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
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
                <h1 className="text-2xl font-bold text-slate-800 font-title">Account & Settings</h1>
                <p className="text-sm text-slate-600">Manage your profile, addresses, and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Preferences</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      disabled={!isEditing.profile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      disabled={!isEditing.profile}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing.profile}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing.profile}
                      className="pl-10"
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
                    />
                  </div>
                </div>

                {isEditing.profile && (
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setIsEditing({ profile: false })}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
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