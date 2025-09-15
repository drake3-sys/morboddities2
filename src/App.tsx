import React, { useMemo, useState, useRef, useEffect } from "react";

// Morboddities — Store, Lore & Adoption Hall (Nav wired + Back-to-top)

// ---------- Types
 type Product = { id: string; title: string; price: number; image?: string; tagline?: string };
 type CartLine = { product: Product; qty: number };
 type Monster = {
  id: string; name: string; price: number;
  rarity: "Common" | "Uncommon" | "Rare" | "Mythic";
  temperament: string; origin: string; traits: string[];
  blessing?: string; curse?: string; oath: string; lore: string;
  photo?: string; adopted?: boolean;
 };

// ---------- Mock Data
const PRODUCTS: Product[] = [
  { id: "skull-cameo-ring", title: "Skull Cameo Ring", price: 69, tagline: "Victorian memento mori, 925 silver." },
  { id: "crow-feather-quill", title: "Crow Feather Quill", price: 29, tagline: "For contracts you *must* keep." },
  { id: "ossuary-candle", title: "Ossuary Candle", price: 22, tagline: "Tallow & myrrh; whispers optional." },
  { id: "crypt-keeper-journal", title: "Crypt Keeper Journal", price: 34, tagline: "Black vellum, stitched in red." },
  { id: "curiosity-vial-set", title: "Curiosity Vial Set (6)", price: 48, tagline: "For specimens, tears, or moonlight." },
];

const MONSTERS: Monster[] = [
  { id: "mortiboo-001", name: "Mortiboo", price: 38, rarity: "Uncommon", temperament: "clingy, protective", origin: "stitched from a thundercloud's leftover static", traits: ["key-guardian","soft chittering at dawn"], blessing: "Keys mysteriously surface when you whisper its name.", oath: "Feed it a sliver of moonlight each Sunday.", lore: "Mortiboo nests in warm pockets and hums when danger nears. It remembers doors you forgot you locked." },
  { id: "snaggle-013", name: "Snaggle", price: 42, rarity: "Rare", temperament: "mischievous, loyal", origin: "fell out of a tangle of headphone cords", traits: ["unties knots","hoards shiny screws"], curse: "Earbuds may tie themselves in its absence.", oath: "Offer a single copper coin on the new moon.", lore: "Snaggle loves labyrinths and will always take the longer hallway if it means one more echo." },
  { id: "gloompuff-077", name: "Gloompuff", price: 35, rarity: "Common", temperament: "shy, easily startled", origin: "condensed from candle smoke during a midnight draft", traits: ["squeaks at meteor showers","warms palms"], blessing: "Tea tastes 3% better when it sits nearby.", oath: "Never blow out all candles at once in its presence.", lore: "Gloompuff prefers bookshelves and will guard dog-eared pages like a dragon guards gold." },
];

// ---------- Helpers & UI bits
const asUSD = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const GlassCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.04)] ${className}`}>{children}</div>
);
const GhostButton: React.FC<React.PropsWithChildren<{ onClick?: () => void; className?: string; type?: "button"|"submit" }>> = ({ onClick, className="", children, type="button" }) => (
  <button type={type} onClick={onClick} className={`px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 transition text-sm ${className}`}>{children}</button>
);
const SolidButton: React.FC<React.PropsWithChildren<{ onClick?: () => void; className?: string; type?: "button"|"submit" }>> = ({ onClick, className="", children, type="button" }) => (
  <button type={type} onClick={onClick} className={`px-5 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition ${className}`}>{children}</button>
);

const Sigil: React.FC<{ className?: string }> = ({ className="" }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <g opacity="0.9">
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M32 4v56M6 32h52M16 16l32 32M48 16L16 48" stroke="currentColor" strokeWidth="2" fill="none"/>
    </g>
  </svg>
);
const GridTexture = () => (
  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.35" /></pattern></defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);
const Logo = () => (
  <div className="flex items-center gap-3 select-none">
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white text-black font-black tracking-widest">M</span>
    <div className="leading-tight">
      <div className="font-serif text-lg">Morboddities</div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Cabinet of Curios</div>
    </div>
  </div>
);

// ---------- App
export default function App() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [monsters, setMonsters] = useState<Monster[]>(MONSTERS);
  const [activeMonster, setActiveMonster] = useState<Monster | null>(null);

  // Smooth-scroll helpers & section refs
  const shopRef = useRef<HTMLElement | null>(null);
  const adoptionRef = useRef<HTMLElement | null>(null);
  const loreRef = useRef<HTMLElement | null>(null);
  const newsletterRef = useRef<HTMLElement | null>(null);
  const scrollToRef = (ref: React.RefObject<HTMLElement>) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Back-to-top visibility
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(p => `${p.title} ${p.tagline ?? ""}`.toLowerCase().includes(q));
  }, [query]);

  const subtotal = cart.reduce((acc, l) => acc + l.product.price * l.qty, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const i = prev.findIndex(l => l.product.id === product.id);
      if (i >= 0) { const copy = [...prev]; copy[i] = { ...copy[i], qty: copy[i].qty + 1 }; return copy; }
      return [...prev, { product, qty: 1 }];
    });
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(l => l.product.id !== id));
  const decQty = (id: string) => setCart(prev => prev.map(l => l.product.id === id ? { ...l, qty: Math.max(1, l.qty - 1) } : l));
  const incQty = (id: string) => setCart(prev => prev.map(l => l.product.id === id ? { ...l, qty: l.qty + 1 } : l));

  const adoptMonster = (m: Monster) => {
    if (m.adopted) return;
    setMonsters(prev => prev.map(x => x.id === m.id ? { ...x, adopted: true } : x));
    addToCart({ id: `monster-${m.id}`, title: `${m.name} (Adoption)`, price: m.price, tagline: `${m.rarity} familiar` });
    generateCertificate(m);
  };

  const generateCertificate = (m: Monster) => {
    const date = new Date().toLocaleDateString();
    const html = `<!doctype html><html><head><meta charset='utf-8'><title>Adoption — ${m.name}</title>
    <style>body{font-family:ui-serif,Georgia,serif;background:#0b0b0b;color:#eee;margin:0}
    .wrap{max-width:900px;margin:40px auto;padding:40px;border:2px solid #fff3;border-radius:16px;background:linear-gradient(180deg,#111,#0b0b0b)}
    .title{font-size:40px;letter-spacing:2px;text-align:center}.rule{height:1px;background:linear-gradient(90deg,transparent,#aaa,transparent);margin:18px 0}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.badge{border:1px solid #fff3;border-radius:12px;padding:16px;text-align:center}
    .sig{margin-top:48px;display:flex;justify-content:space-between;gap:24px}.sig div{border-top:1px solid #fff3;padding-top:8px;text-align:center}
    @media print {.wrap{box-shadow:none}}</style></head><body>
    <div class='wrap'><div class='title'>Certificate of Adoption</div><div class='rule'></div>
    <p>This certifies that the bearer has adopted <strong>${m.name}</strong>, a ${m.rarity} familiar of ${m.temperament}, brought forth from ${m.origin}.</p>
    <div class='grid'><div class='badge'><div><strong>Traits</strong></div><div>${m.traits.join(", ")}</div></div>
    <div class='badge'><div><strong>Blessing/Curse</strong></div><div>${m.blessing ?? m.curse ?? "—"}</div></div></div>
    <p style='margin-top:16px'><em>Oath:</em> ${m.oath}</p>
    <div class='sig'><div>Keeper Signature</div><div>Adoption Date: ${date}</div><div>Seal of Morboddities</div></div>
    </div><script>window.print()</script></body></html>`;
    const w = window.open("", "_blank"); if (!w) return alert("Allow pop-ups to print the certificate."); w.document.write(html); w.document.close();
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black text-zinc-100">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur bg-black/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Logo />
          <div className="hidden md:flex items-center gap-6 text-sm opacity-90">
            <button onClick={() => scrollToRef(shopRef)} className="hover:opacity-100 transition">Shop</button>
            <button onClick={() => scrollToRef(adoptionRef)} className="hover:opacity-100 transition">Adoption Hall</button>
            <button onClick={() => scrollToRef(loreRef)} className="hover:opacity-100 transition">Lore</button>
            <button onClick={() => scrollToRef(newsletterRef)} className="hover:opacity-100 transition">Ledger</button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search curios…" className="w-48 md:w-72 rounded-xl bg-white/5 border border-white/10 px-4 py-2 pr-10 outline-none focus:border-white/30 placeholder:text-zinc-400" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">⌘K</span>
            </div>
            <GhostButton onClick={()=>setShowCart(true)}>Cart <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/10">{cart.reduce((a,l)=>a+l.qty,0)}</span></GhostButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]"><GridTexture /></div>
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-serif tracking-wide">MORBODDITIES</h1>
          <p className="mt-4 text-zinc-300 max-w-2xl mx-auto">A digital wunderkammer of gothic curios, occult utilities, and handcrafted familiars.</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <SolidButton onClick={() => scrollToRef(shopRef)}>Enter the Cabinet</SolidButton>
            <GhostButton onClick={() => { scrollToRef(adoptionRef); const first = monsters.find(m => !m.adopted); if (first) setTimeout(() => setActiveMonster(first), 500); }}>Adopt a Familiar</GhostButton>
          </div>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" ref={shopRef} className="scroll-mt-24 max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-serif">The Cabinet</h2>
          <p className="text-sm text-zinc-400">{filtered.length} item{filtered.length===1?"":"s"} found</p>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map(p => (
            <GlassCard key={p.id} className="group">
              <div className="aspect-square rounded-t-2xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-zinc-600">
                <Sigil className="w-20 h-20 opacity-60 group-hover:opacity-90 transition" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-medium">{p.title}</h3><p className="text-sm text-zinc-400 mt-1">{p.tagline}</p></div>
                  <span className="shrink-0 text-sm opacity-90">{asUSD(p.price)}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <SolidButton onClick={()=>addToCart(p)} className="w-full">Add to Cart</SolidButton>
                  <GhostButton className="w-11" onClick={()=>alert(`Quick view: ${p.title}`)}>👁️</GhostButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Adoption Hall */}
      <section id="adoption" ref={adoptionRef} className="scroll-mt-24 max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-serif">Adoption Hall</h2>
          <p className="text-sm text-zinc-400">{monsters.filter(m=>!m.adopted).length} available</p>
        </div>
        <p className="text-sm text-zinc-400 mt-2">One-of-a-kind monster keychain stuffys (familiars). When adopted, they pass into grayscale in our records and will not return.</p>
        <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {monsters.map(m => (
            <GlassCard key={m.id} className={`group ${m.adopted ? "opacity-60" : ""}`}>
              <div className="aspect-square rounded-t-2xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-zinc-600">
                <Sigil className="w-20 h-20 opacity-60 group-hover:opacity-90 transition" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-medium">{m.name}</h3><p className="text-sm text-zinc-400 mt-1">{m.rarity} • {m.temperament}</p></div>
                  <span className="shrink-0 text-sm opacity-90">{m.adopted ? "Adopted" : asUSD(m.price)}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <SolidButton onClick={()=>setActiveMonster(m)} className="w-full">Learn More</SolidButton>
                  <GhostButton className="w-28" onClick={()=>adoptMonster(m)}>{m.adopted ? "Adopted" : "Adopt"}</GhostButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Book of Keepers */}
        <div className="mt-10">
          <h3 className="font-serif text-xl">The Book of Keepers</h3>
          <p className="text-sm text-zinc-400">A ledger of familiars and their fates. (Public wall optional.)</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
            {monsters.filter(m=>m.adopted).length===0 ? <span>No entries yet. The page waits.</span> :
              monsters.filter(m=>m.adopted).map(m => (<span key={m.id} className="px-3 py-1 rounded-full border border-white/10">{m.name} — Adopted</span>))}
          </div>
        </div>
      </section>

      {/* Monster Modal */}
      {activeMonster && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={()=>setActiveMonster(null)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] sm:w-[40rem] bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div><h3 className="text-xl font-serif">{activeMonster.name}</h3><p className="text-sm text-zinc-400">{activeMonster.rarity} • {activeMonster.temperament}</p></div>
                <GhostButton onClick={()=>setActiveMonster(null)}>Close</GhostButton>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center h-48"><Sigil className="w-16 h-16 opacity-70" /></div>
                <div className="text-sm text-zinc-300 space-y-2">
                  <p><span className="text-zinc-400">Origin:</span> {activeMonster.origin}</p>
                  <p><span className="text-zinc-400">Traits:</span> {activeMonster.traits.join(", ")}</p>
                  {activeMonster.blessing && <p><span className="text-zinc-400">Blessing:</span> {activeMonster.blessing}</p>}
                  {activeMonster.curse && <p><span className="text-zinc-400">Curse:</span> {activeMonster.curse}</p>}
                  <p><span className="text-zinc-400">Lore:</span> {activeMonster.lore}</p>
                  <p><span className="text-zinc-400">Adoption Oath:</span> {activeMonster.oath}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="text-zinc-400 text-sm">{activeMonster.adopted ? "Already adopted" : asUSD(activeMonster.price)}</div>
                <div className="flex items-center gap-2">
                  <GhostButton onClick={()=>generateCertificate(activeMonster)}>Preview Certificate</GhostButton>
                  <SolidButton onClick={()=>adoptMonster(activeMonster)}>{activeMonster.adopted ? "Adopted" : "Adopt"}</SolidButton>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">By adopting, you agree to keep your familiar safe from dust, fire, and loneliness.</p>
            </div>
          </div>
        </div>
      )}

      {/* Lore */}
      <section id="lore" ref={loreRef} className="scroll-mt-24 max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-serif mb-6">Lore & Provenance</h2>
        <div className="space-y-4">
          <LoreBlock title="The Ledger" teaser="Before there was a store, there was a book bound in night-black vellum.">
            Within its pages, inventory appeared on its own — sketches of artifacts, margins annotated by an unfamiliar hand. Items that were sold would fade from the illustrations; others would materialize when a customer merely *dreamed* of them.
          </LoreBlock>
          <LoreBlock title="The Keeper" teaser="Some say the shop keeps itself. Others say a curatorship passes down as a vow.">
            The title is given but not spoken. You will know you are the Keeper when doors open for you that refuse all others, and when clocks tick backwards while you set prices.
          </LoreBlock>
          <LoreBlock title="The Return Policy" teaser="Every object yearns to return — to a place, a person, or a purpose.">
            Returns are accepted on the final night of a waning moon, accompanied by an explanation penned in iron gall. Exchanges require a story of equal weight.
          </LoreBlock>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" ref={newsletterRef} className="scroll-mt-24 max-w-5xl mx-auto px-4 pb-24">
        <GlassCard className="p-6 md:p-8">
          <div className="md:flex items-center gap-8">
            <div className="md:w-2/3">
              <h3 className="text-xl font-serif">Join the Ledger of Oddities</h3>
              <p className="text-sm text-zinc-400 mt-2">Occasional dispatches: new arrivals, apocrypha, and limited drops. No spam — only specters.</p>
            </div>
            <form className="mt-4 md:mt-0 md:flex items-center gap-3 md:w-1/3" onSubmit={(e)=>{e.preventDefault(); alert("Subscribed. Check your coffin— er, inbox.");}}>
              <input required type="email" placeholder="you@midnight.io" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-white/30 placeholder:text-zinc-400" />
              <SolidButton type="submit" className="shrink-0">Subscribe</SolidButton>
            </form>
          </div>
        </GlassCard>
      </section>

      {/* Back to Top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 px-3 py-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur hover:border-white/40"
          aria-label="Back to top"
        >
          ↑ Top
        </button>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setShowCart(false)} />
          <aside className="absolute right-0 top-0 h-full w-[92%] sm:w-[28rem] bg-zinc-950 border-l border-white/10 p-5 flex flex-col">
            <div className="flex items-center justify-between"><h3 className="text-lg font-serif">Your Cabinet</h3><GhostButton onClick={()=>setShowCart(false)}>Close</GhostButton></div>
            <div className="mt-4 space-y-4 overflow-auto">
              {cart.length===0 && <p className="text-zinc-400">The cabinet is empty. For now.</p>}
              {cart.map(line => (
                <GlassCard key={line.product.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center"><Sigil className="w-8 h-8 opacity-70" /></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="font-medium leading-tight">{line.product.title}</p><p className="text-xs text-zinc-400 mt-1">{asUSD(line.product.price)}</p></div>
                        <GhostButton onClick={()=>removeFromCart(line.product.id)}>Remove</GhostButton>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <GhostButton onClick={()=>decQty(line.product.id)}>-</GhostButton>
                        <span className="w-10 text-center">{line.qty}</span>
                        <GhostButton onClick={()=>incQty(line.product.id)}>+</GhostButton>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm"><span className="text-zinc-400">Subtotal</span><span className="font-medium">{asUSD(subtotal)}</span></div>
              <SolidButton className="w-full mt-4" onClick={()=>alert("Proceeding to checkout — connect your Storefront API.")}>Checkout</SolidButton>
              <p className="text-[11px] text-zinc-500 mt-2">Taxes & shipping calculated at checkout.</p>
            </div>
          </aside>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-zinc-400 flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-start justify-between">
          <p>© {new Date().getFullYear()} Morboddities. All rites reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-200">Terms</a>
            <a href="#" className="hover:text-zinc-200">Privacy</a>
            <a href="#lore" className="hover:text-zinc-200">Lore</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ---------- Small bits
const LoreBlock: React.FC<{ title: string; teaser: string; children: React.ReactNode }> = ({ title, teaser, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard>
      <button onClick={()=>setOpen(o=>!o)} className="w-full text-left p-4 flex items-start justify-between gap-4">
        <div><h4 className="font-medium">{title}</h4><p className="text-sm text-zinc-400 mt-1">{teaser}</p></div>
        <span className="opacity-70">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-zinc-300">{children}</div>}
    </GlassCard>
  );
};
