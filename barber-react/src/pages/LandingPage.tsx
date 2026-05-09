import { useState, useEffect } from 'react'
import axios from 'axios'
import LoadingScreen from '../components/LoadingScreen'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import ServicesSection from '../components/ServicesSection'
import BarberAvailabilitySection from '../components/BarberAvailabilitySection'
import ExperienceSection from '../components/ExperienceSection'
import LocationSection from '../components/LocationSection'
import CtaSection from '../components/CtaSection'
import Footer from '../components/Footer'
import ServicesModal from '../components/ServicesModal'
import BarberModal from '../components/BarberModal'
import CampaignsSection from '../components/CampaignsSection'

export interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string | null;
  discount_type: string;
  service_id: number | null;
  required_points: number;
  discount_amount: string | number;
}

export interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price: number | string;
  image: string | null;
  description: string | null;
}

export interface Barber {
  id: number;
  name: string;
  specialty: string | null;
  status: string;
  image: string | null;
}

const LandingPage = () => {
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [isBarberModalOpen, setIsBarberModalOpen] = useState(false);
  
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, barbersRes, campaignsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/services'),
          axios.get('http://localhost:8000/api/barbers'),
          axios.get('http://localhost:8000/api/campaigns')
        ]);
        setServices(servicesRes.data.data);
        setBarbers(barbersRes.data.data);
        setCampaigns(campaignsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await axios.get('http://localhost:8000/api/user', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error: any) {
          if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth-change'));
            window.location.reload();
          }
        }
      }
    };

    checkToken();
    fetchData();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="dark bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection 
          onOpenServicesModal={() => setIsServicesModalOpen(true)} 
          services={services}
        />
        <CampaignsSection campaigns={campaigns} />
        <BarberAvailabilitySection 
          onOpenBarberModal={() => setIsBarberModalOpen(true)} 
          barbers={barbers}
        />
        <ExperienceSection />
        <LocationSection />
        <CtaSection />
      </main>
      <Footer />

      {/* Modals */}
      <ServicesModal 
        isOpen={isServicesModalOpen} 
        onClose={() => setIsServicesModalOpen(false)} 
        services={services}
      />
      <BarberModal 
        isOpen={isBarberModalOpen} 
        onClose={() => setIsBarberModalOpen(false)} 
        barbers={barbers}
      />
    </div>
  )
}

export default LandingPage
