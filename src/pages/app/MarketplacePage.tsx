import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Store, Star, BadgeCheck, Heart, Share2, Filter, LayoutGrid, List, Sparkles, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { V12_MARKETPLACE_CATEGORIES, V12_MOCK_LISTINGS, type V12Listing } from "@/data/v12-mock";
import { comingSoon } from "@/lib/v12-coming-soon";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useIndustryStore } from "@/lib/industry-store";

const MarketplacePage = () => {
  const { userType = "solo" } = useIndustryStore();
  const [tab, setTab] = useState("discover");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [detail, setDetail] = useState<V12Listing | null>(null);
  const [minScore, setMinScore] = useState([820]);

  const filtered = useMemo(() => {
    return V12_MOCK_LISTINGS.filter((l) => {
      if (category && l.category !== category) return false;
      if (l.score < minScore[0]) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return l.title.toLowerCase().includes(q) || l.seller.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, category, minScore]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-[1600px] mx-auto pb-24">
      <div className="rounded-2xl border-2 border-primary/25 bg-primary/5 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Version 1.2 preview — Cynda Marketplace</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-4xl">
          Browse categories, filters, listing detail, packages, campaigns UI, and dashboards. Orders, payments, OAuth, promotions, and applications stay disabled until launch — use{" "}
          <span className="text-foreground font-semibold">Order now</span>, <span className="text-foreground font-semibold">Apply</span>, or <span className="text-foreground font-semibold">Promote</span> to see the coming-soon toast.
        </p>
        <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-wider">Workspace: {userType.replace("-", " ")} · guest browsing on marketing site will mirror this layout in v1.2</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="rounded-xl h-11 p-1 bg-secondary/50">
            <TabsTrigger value="discover" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-4">
              Discover
            </TabsTrigger>
            <TabsTrigger value="mine" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-4">
              My marketplace
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className={cn("rounded-xl", view === "grid" && "border-primary")} onClick={() => setView("grid")}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" className={cn("rounded-xl", view === "list" && "border-primary")} onClick={() => setView("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="discover" className="space-y-6 mt-0">
          {/* Hero */}
          <div className="rounded-2xl border-2 border-border overflow-hidden bg-gradient-to-br from-card to-accent/10 p-6 md:p-10 relative">
            <div className="relative z-10 max-w-xl space-y-4">
              <h2 className="font-display text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight">Hire and sell on verified performance</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Listings show real Cynda Performance Scores, completion rates, and tenure — not vanity stars alone. Featured carousel and trending searches rotate with live demand in v1.2.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search listings, sellers, campaigns…" className="pl-10 h-12 rounded-xl text-sm font-medium" />
              </div>
            </div>
            <Store className="absolute right-4 bottom-4 w-32 h-32 md:w-48 md:h-48 text-primary/10" />
          </div>

          <ScrollArea className="w-full whitespace-nowrap pb-2 -mx-1 no-scrollbar">
            <div className="flex gap-2 pb-1">
              <Button
                type="button"
                variant={category === null ? "default" : "outline"}
                size="sm"
                className="rounded-full text-[10px] font-black uppercase shrink-0 h-9 px-4"
                onClick={() => setCategory(null)}
              >
                All
              </Button>
              {V12_MARKETPLACE_CATEGORIES.map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={category === c ? "default" : "outline"}
                  size="sm"
                  className="rounded-full text-[10px] font-black uppercase shrink-0 h-9 px-4"
                  onClick={() => setCategory(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </ScrollArea>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
            <aside className="rounded-2xl border-2 border-border bg-card p-4 space-y-5 lg:sticky lg:top-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </p>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Min performance score</Label>
                <Slider value={minScore} onValueChange={setMinScore} min={600} max={980} step={5} />
                <p className="text-xs font-bold tabular-nums">{minScore[0]}+</p>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Service type</Label>
                {["Gig", "Hourly", "Campaign", "Project"].map((t) => (
                  <label key={t} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <Checkbox />
                    {t}
                  </label>
                ))}
              </div>
              <Button type="button" variant="outline" className="w-full rounded-xl text-[10px] font-black uppercase" onClick={() => comingSoon("Advanced marketplace filters")}>
                More filters
              </Button>
            </aside>

            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-muted-foreground">{filtered.length} results</p>
                <Badge variant="secondary" className="text-[9px] font-black uppercase">
                  Sort: relevance (live sort in v1.2)
                </Badge>
              </div>
              <div className={cn(view === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3")}>
                {filtered.map((l) => (
                  <Card
                    key={l.id}
                    className={cn("rounded-2xl border-2 transition-all hover:border-primary/40 hover:shadow-md cursor-pointer", view === "list" && "flex flex-row")}
                    onClick={() => setDetail(l)}
                  >
                    <CardContent className={cn("p-4 space-y-3", view === "list" && "flex flex-1 gap-4 items-center")}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-black text-primary">{l.seller}</p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-[9px] font-black tabular-nums">
                              Score {l.score}
                            </Badge>
                            {l.topRated && (
                              <Badge className="text-[8px] font-black uppercase">
                                Top rated
                              </Badge>
                            )}
                          </div>
                        </div>
                        <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                      </div>
                      <h3 className="font-display font-black text-sm leading-snug line-clamp-2">{l.title}</h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{l.description}</p>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-primary">From ${l.price}</span>
                        <span className="text-muted-foreground">{l.delivery}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {l.rating} <span className="text-muted-foreground font-medium">({l.reviews})</span>
                      </div>
                      <div className="flex gap-2 pt-1 opacity-0 hover:opacity-100 transition-opacity">
                        <Button type="button" size="sm" variant="secondary" className="text-[9px] font-black uppercase h-8" onClick={(e) => { e.stopPropagation(); comingSoon("Save listing"); }}>
                          Save
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="text-[9px] font-black uppercase h-8" onClick={(e) => { e.stopPropagation(); setDetail(l); }}>
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Campaigns
              </p>
              <p className="font-display font-black text-lg uppercase mt-1">Hiring & open calls</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">Post roles, shortlist applicants, and message candidates — UI ships in v1.2 with Performance-backed applications.</p>
            </div>
            <Button type="button" className="rounded-xl font-black text-[10px] uppercase tracking-widest shadow-glow" onClick={() => comingSoon("Post campaign")}>
              Post campaign
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="mine" className="mt-0 space-y-4">
          <div className="rounded-2xl border-2 border-border bg-card p-6 space-y-4">
            <p className="font-display font-black text-xl uppercase tracking-tight">My marketplace</p>
            <p className="text-sm text-muted-foreground">Tabs for My listings, Orders, Applications, Saved, and Promotions — fully interactive once v1.2 is live.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {["My listings", "My orders", "Applications", "Saved", "Promotions"].map((x) => (
                <Button key={x} type="button" variant="outline" className="rounded-xl h-auto py-4 text-[10px] font-black uppercase" onClick={() => comingSoon(x)}>
                  {x}
                </Button>
              ))}
            </div>
            <Button type="button" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2" onClick={() => comingSoon("Create listing wizard")}>
              <Sparkles className="w-4 h-4" /> Create listing
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={!!detail} onOpenChange={() => setDetail(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left font-display uppercase tracking-tight leading-snug">{detail?.title}</SheetTitle>
          </SheetHeader>
          {detail && (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl border-2 border-border p-4 space-y-2">
                <p className="text-xs font-black text-primary">{detail.seller}</p>
                <p className="text-sm text-muted-foreground">Verified Cynda member · {detail.verifiedMonths} months · Performance score {detail.score}</p>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Completion rate · live</span>
                  <span>·</span>
                  <span>Response time · live</span>
                  <span>·</span>
                  <span>On-time delivery · live</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{detail.description}</p>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Packages</p>
                {["Basic", "Standard", "Premium"].map((tier, i) => (
                  <div key={tier} className="rounded-xl border-2 border-border p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{tier}</p>
                      <p className="text-[11px] text-muted-foreground">{2 + i} revisions · {3 + i * 2} deliverables</p>
                    </div>
                    <Button type="button" size="sm" className="rounded-lg font-black text-[9px] uppercase" onClick={() => comingSoon(`Order · ${tier}`)}>
                      ${detail.price + i * 120}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="rounded-xl gap-2" onClick={() => comingSoon("Contact seller")}>
                  Contact seller
                </Button>
                <Button type="button" variant="outline" size="icon" className="rounded-xl" onClick={() => comingSoon("Share listing")}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" className="rounded-xl" onClick={() => comingSoon("Save listing")}>
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              <Button type="button" className="w-full rounded-xl font-black text-[10px] uppercase shadow-glow" onClick={() => comingSoon("Promote listing")}>
                Promote listing
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default MarketplacePage;
