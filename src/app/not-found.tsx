import { MagneticButton } from "@/components/ui/MagneticButton";

export default function NotFound() {
  return (
    <section className="flex min-h-[100svh] flex-col items-center justify-center gap-10 px-5 text-center">
      <p className="text-sm tracking-[0.2em] text-muted uppercase">Erreur 404</p>
      <h1 className="font-sans text-[22vw] leading-[0.8] font-medium tracking-[-0.06em] md:text-[14vw]">
        Oups<span className="text-iris font-serif font-normal italic">.</span>
      </h1>
      <p className="max-w-[36ch] text-lg text-muted">Cette page s&apos;est perdue quelque part entre deux dimensions.</p>
      <MagneticButton href="/">Retour à l&apos;accueil</MagneticButton>
    </section>
  );
}
