import { Hero } from "@/components/sections/Hero";
import { Gallery } from "@/components/sections/Gallery";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Gallery />
      <About />
      <Contact />
    </>
  );
}
