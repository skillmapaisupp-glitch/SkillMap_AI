import PricingCards from "@/components/landing/PricingCards";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const PricingPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-20">
      <PricingCards />
    </div>
    <Footer />
  </div>
);

export default PricingPage;
