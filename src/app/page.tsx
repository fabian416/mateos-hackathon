import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Comparison from "@/components/Comparison";
import ContinuousImprovement from "@/components/ContinuousImprovement";
import ThreeOptions from "@/components/ThreeOptions";
import AgentTypes from "@/components/AgentTypes";
import Process from "@/components/Process";
import Security from "@/components/Security";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Comparison />
        <ContinuousImprovement />
        <ThreeOptions />
        <AgentTypes />
        <Process />
        <Security />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
