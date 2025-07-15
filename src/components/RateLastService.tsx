import React, { useState } from 'react';
import { Star, Clock, MessageCircle, CheckCircle, SkipForward, Calendar, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface RateLastServiceProps {
  children: React.ReactNode;
}

const RateLastService: React.FC<RateLastServiceProps> = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    quality: 0,
    timeliness: 0,
    communication: 0
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState('');

  // Mock data for the last service
  const lastService = {
    id: 'SRV-001',
    type: 'House Cleaning',
    date: '2024-07-15',
    time: '10:00 AM',
    provider: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      services: 127
    },
    duration: '2 hours',
    cost: 89.99
  };

  const quickFeedbackOptions = [
    'Excellent work!',
    'Very professional',
    'Great attention to detail',
    'Friendly and efficient',
    'Exceeded expectations'
  ];

  const categories = [
    { key: 'quality', label: 'Quality', icon: CheckCircle },
    { key: 'timeliness', label: 'Timeliness', icon: Clock },
    { key: 'communication', label: 'Communication', icon: MessageCircle }
  ];

  const renderStars = (rating: number, onRate: (rating: number) => void, size = 'default') => {
    const starSize = size === 'large' ? 'h-8 w-8' : 'h-5 w-5';
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} cursor-pointer transition-all duration-200 hover:scale-110 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground hover:text-yellow-300'
            }`}
            onClick={() => onRate(star)}
          />
        ))}
      </div>
    );
  };

  const handleCategoryRating = (category: string, rating: number) => {
    setCategoryRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = () => {
    if (overallRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitted(true);
    toast({
      title: "Thank you for your feedback!",
      description: "Your rating helps us maintain quality service.",
    });

    setTimeout(() => {
      setOpen(false);
      // Reset form
      setOverallRating(0);
      setCategoryRatings({ quality: 0, timeliness: 0, communication: 0 });
      setFeedback('');
      setQuickFeedback('');
      setIsSubmitted(false);
    }, 2000);
  };

  const handleSkip = () => {
    setOpen(false);
    toast({
      title: "Rating skipped",
      description: "You can rate this service anytime from your service history.",
    });
  };

  const handleRebook = () => {
    setOpen(false);
    navigate('/new-booking');
    toast({
      title: "Rebooking service",
      description: "Taking you to book the same service again.",
    });
  };

  const handleQuickFeedback = (text: string) => {
    setQuickFeedback(text);
    setFeedback(text);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto animate-scale-in">
        <CardContent className="pt-8 text-center">
          <div className="mb-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-scale-in" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-6">
            Your feedback has been submitted and helps us maintain quality service.
          </p>
          <div className="space-y-2">
            <Button onClick={handleRebook} variant="default" className="w-full">
              <Repeat className="h-4 w-4 mr-2" />
              Book Again with Sarah
            </Button>
            <Button onClick={() => setOpen(false)} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-6 animate-fade-in p-4">
          {/* Header */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-center">Rate Your Service</CardTitle>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{lastService.type} • {lastService.date} at {lastService.time}</span>
              </div>
            </CardHeader>
          </Card>

          {/* Provider Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={lastService.provider.avatar} alt={lastService.provider.name} />
                  <AvatarFallback>{lastService.provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{lastService.provider.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{lastService.provider.rating} • {lastService.provider.services} services</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{lastService.duration}</Badge>
                    <Badge variant="outline">${lastService.cost}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Rating */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">How was your overall experience?</h3>
                <div className="flex justify-center">
                  {renderStars(overallRating, setOverallRating, 'large')}
                </div>
                {overallRating > 0 && (
                  <p className="text-sm text-muted-foreground animate-fade-in">
                    {overallRating === 5 ? 'Excellent!' : 
                     overallRating === 4 ? 'Great!' :
                     overallRating === 3 ? 'Good' :
                     overallRating === 2 ? 'Fair' : 'Needs Improvement'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Ratings */}
          {overallRating > 0 && (
            <Card className="animate-fade-in">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Rate specific aspects:</h3>
                <div className="space-y-4">
                  {categories.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      {renderStars(categoryRatings[key as keyof typeof categoryRatings], (rating) => handleCategoryRating(key, rating))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Feedback Options */}
          {overallRating >= 4 && (
            <Card className="animate-fade-in">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Quick feedback:</h3>
                <div className="flex flex-wrap gap-2">
                  {quickFeedbackOptions.map((option) => (
                    <Button
                      key={option}
                      variant={quickFeedback === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleQuickFeedback(option)}
                      className="text-xs"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Written Feedback */}
          {overallRating > 0 && (
            <Card className="animate-fade-in">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Additional comments (optional):</h3>
                <Textarea
                  placeholder="Share more details about your experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              disabled={overallRating === 0}
              size="lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Rating
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleSkip} variant="outline" size="sm">
                <SkipForward className="h-4 w-4 mr-2" />
                Skip for Now
              </Button>
              <Button onClick={handleRebook} variant="outline" size="sm">
                <Repeat className="h-4 w-4 mr-2" />
                Rebook Service
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RateLastService;