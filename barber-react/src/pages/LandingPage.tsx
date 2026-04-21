import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import ServicesSection from '../components/ServicesSection'
import BarberAvailabilitySection from '../components/BarberAvailabilitySection'
import ExperienceSection from '../components/ExperienceSection'
import LocationSection from '../components/LocationSection'
import CtaSection from '../components/CtaSection'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <div className="dark bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <BarberAvailabilitySection />
        <ExperienceSection />
        <LocationSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
