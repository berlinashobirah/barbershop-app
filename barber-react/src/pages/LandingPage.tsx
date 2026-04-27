import { useState, useEffect } from 'react'
import axios from 'axios'
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, barbersRes] = await Promise.all([
          axios.get('http://localhost:8000/api/services'),
          axios.get('http://localhost:8000/api/barbers')
        ]);
        setServices(servicesRes.data.data);
        setBarbers(barbersRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dark bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection 
          onOpenServicesModal={() => setIsServicesModalOpen(true)} 
          services={services}
        />
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
