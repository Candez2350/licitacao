import MarketDashboard from '@/src/components/MarketDashboard';
import Link from 'next/link';

export default function InteligenciaPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Decorative Header Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center text-primary font-black text-xs uppercase tracking-[0.2em] mb-4 hover:opacity-70 transition-opacity">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              Voltar ao Painel
            </Link>
            <h1 className="text-4xl font-black text-foreground tracking-tight sm:text-6xl">
              Inteligência de <span className="text-primary">Mercado</span>
            </h1>
            <p className="text-muted mt-3 text-lg max-w-2xl font-medium leading-relaxed">
              Explore oportunidades através de filtros avançados baseados em IA. <br className="hidden md:block" />
              Encontre exatamente o que sua empresa fornece através do mapeamento automático de itens.
            </p>
          </div>
          
          <div className="hidden lg:block bg-card border border-card-border px-6 py-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">✨</div>
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Tecnologia</p>
                <p className="text-sm font-bold text-foreground">NLP & IA Categorização</p>
              </div>
            </div>
          </div>
        </header>

        <MarketDashboard />
      </div>
    </main>
  );
}
