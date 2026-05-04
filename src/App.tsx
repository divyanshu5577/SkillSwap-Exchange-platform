import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Code, 
  Palette, 
  Music, 
  Globe, 
  Utensils, 
  Activity,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Skill, Category } from './types.ts';

// --- Components ---

const Navbar = ({ onPostClick }: { onPostClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 transition-all duration-300 ${
      isScrolled ? 'py-3.5 bg-navy/70 backdrop-blur-lg border-b border-lime/10' : 'py-5 bg-transparent'
    }`}>
      <div className="font-playfair text-2xl font-black tracking-tight cursor-default">
        Skill<span className="text-lime">Swap</span>
      </div>
      <div className="hidden md:flex items-center gap-9">
        {['Skills', 'How It Works', 'Categories'].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            className="text-sm font-medium text-muted hover:text-white transition-colors uppercase tracking-widest relative group"
          >
            {link}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime transition-all duration-300 group-hover:w-full" />
          </a>
        ))}
      </div>
      <button 
        onClick={onPostClick}
        className="bg-lime hover:bg-lime-2 text-navy px-6 py-2.5 rounded font-bold text-sm transition-all active:scale-95 shadow-lg shadow-lime/20"
      >
        Post a Skill
      </button>
    </nav>
  );
};

// --- Main App ---

export default function App() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; sub: string; type: 'success' | 'delete' } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    offer: '',
    category: '',
    want: '',
    bio: ''
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (title: string, sub: string, type: 'success' | 'delete' = 'success') => {
    setToast({ title, sub, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePostSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.offer || !formData.category || !formData.want) return;

    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newSkill = await response.json();
        setSkills([newSkill, ...skills]);
        setIsPostModalOpen(false);
        setFormData({ name: '', offer: '', category: '', want: '', bio: '' });
        showToast(`${formData.offer} posted!`, 'Your skill is now live for the community.');
      }
    } catch (error) {
      console.error('Error posting skill:', error);
    }
  };

  const handleDeleteSkill = async () => {
    if (!pendingDeleteId) return;

    try {
      const response = await fetch(`/api/skills/${pendingDeleteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSkills(skills.filter(s => s.id !== pendingDeleteId));
        setIsDeleteModalOpen(false);
        setPendingDeleteId(null);
        showToast('Skill deleted', 'Listing removed from the community.', 'delete');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const filteredSkills = useMemo(() => {
    return skills.filter(s => {
      const matchesFilter = activeFilter === 'all' || s.category === activeFilter;
      const matchesSearch = s.offer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           s.bio.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [skills, activeFilter, searchQuery]);

  const categories: { id: Category; label: string; icon: any }[] = [
    { id: 'all', label: 'All', icon: Globe },
    { id: 'tech', label: 'Tech', icon: Code },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'cooking', label: 'Cooking', icon: Utensils },
    { id: 'fitness', label: 'Fitness', icon: Activity },
  ];

  return (
    <div className="min-h-screen relative selection:bg-lime selection:text-navy">
      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] animate-pulse bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <Navbar onPostClick={() => setIsPostModalOpen(true)} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 md:px-16 overflow-hidden pt-20">
        <div className="absolute top-[-100px] right-[-80px] w-[520px] h-[520px] bg-lime/10 blur-[90px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-60px] left-[10%] w-[380px] h-[380px] bg-gold/5 blur-[90px] rounded-full" />
        
        <div className="relative z-10 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 border border-lime/20 rounded-full text-xs font-semibold text-lime uppercase tracking-widest mb-8 bg-lime/5"
          >
            <span className="w-1.5 h-1.5 bg-lime rounded-full animate-ping" />
            Now Live — Join 12,000+ Swappers
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-playfair text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6"
          >
            Trade <span className="text-lime">Skills,</span><br />
            Grow <span className="text-gold">Together.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted leading-relaxed max-w-lg mb-12"
          >
            No money. No hierarchy. Just humans exchanging what they know for what they need. 
            Teach design, learn to code. Swap cooking for guitar.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={() => setIsPostModalOpen(true)}
              className="bg-lime text-navy px-9 py-4 rounded font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-lime/20"
            >
              Start Swapping →
            </button>
            <button 
              onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-9 py-4 border border-white/20 rounded font-medium hover:bg-white/5 transition-all active:scale-95"
            >
              Browse Skills
            </button>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 px-6 md:px-16 container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <div className="text-xs font-bold text-lime uppercase tracking-widest mb-3">Community Skills</div>
            <h2 className="font-playfair text-4xl font-bold tracking-tight">Find Your Swap</h2>
          </div>
          
          <div className="w-full md:w-96 bg-navy-2 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-lime/50 transition-all">
            <Search className="text-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-white placeholder:text-muted"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === cat.id 
                    ? 'bg-lime text-navy' 
                    : 'bg-white/5 text-muted border border-white/5 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-navy-2 border border-white/10 rounded-2xl p-7 relative group hover:border-lime/30 transition-all hover:-translate-y-1 shadow-lg shadow-black/20 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-lime to-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                
                <button 
                  onClick={() => {
                    setPendingDeleteId(skill.id);
                    setIsDeleteModalOpen(true);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-muted hover:bg-red-500/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-navy-3 border border-lime/20 flex items-center justify-center text-xl shadow-inner">
                    🌟
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-0.5">{skill.name}</div>
                    <div className="font-playfair text-xl font-bold">{skill.offer}</div>
                  </div>
                </div>

                <p className="text-sm text-muted leading-relaxed mb-6 line-clamp-3">
                  {skill.bio}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-muted">
                    {skill.category}
                  </span>
                </div>

                <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                  <div className="text-sm text-muted">
                    Wants: <strong className="text-gold">{skill.want}</strong>
                  </div>
                  <button className="text-xs font-bold text-lime hover:underline underline-offset-4 decoration-2">
                    Connect
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredSkills.length === 0 && !isLoading && (
            <div className="col-span-full py-20 text-center text-muted">
              No skills match your search. Try another keyword.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-playfair text-xl font-black">
          Skill<span className="text-lime">Swap</span>
        </div>
        <div className="flex gap-8 text-sm text-muted underline-offset-4">
          <a href="#" className="hover:text-white hover:underline">About</a>
          <a href="#" className="hover:text-white hover:underline">Privacy</a>
          <a href="#" className="hover:text-white hover:underline">Terms</a>
        </div>
        <div className="text-xs text-muted/50">
          © 2026 SkillSwap. No rights reserved.
        </div>
      </footer>

      {/* --- Modals --- */}

      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPostModalOpen(false)}
              className="absolute inset-0 bg-navy/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-navy-2 border border-lime/20 w-full max-w-md rounded-2xl p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsPostModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="font-playfair text-2xl font-bold mb-2">Post Your Skill</h3>
              <p className="text-sm text-muted mb-8">Share what you can teach and what you'd love to learn.</p>
              
              <form onSubmit={handlePostSkill} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-lime/50 transition-all text-sm"
                    placeholder="e.g. Alex Moreno"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Skill Offer</label>
                    <input 
                      type="text" 
                      required
                      value={formData.offer}
                      onChange={(e) => setFormData({...formData, offer: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-lime/50 transition-all text-sm"
                      placeholder="UI/UX"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Category</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-lime/50 transition-all text-sm opacity-80"
                    >
                      <option value="">Select...</option>
                      {categories.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Skill You Want</label>
                  <input 
                    type="text" 
                    required
                    value={formData.want}
                    onChange={(e) => setFormData({...formData, want: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-lime/50 transition-all text-sm"
                    placeholder="Python"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Bio</label>
                  <textarea 
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-lime/50 transition-all text-sm resize-none"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
                <button type="submit" className="w-full bg-lime text-navy py-4 rounded-xl font-bold mt-4 hover:bg-lime-2 transition-all">
                  Post My Skill ✦
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-navy/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-navy-2 border border-red-500/20 w-full max-w-sm rounded-2xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-400 w-8 h-8" />
              </div>
              <h3 className="font-playfair text-2xl font-bold mb-2">Delete Skill?</h3>
              <p className="text-sm text-muted mb-8">This action cannot be undone. Are you sure?</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-medium transition-all"
                >
                  Keep It
                </button>
                <button 
                  onClick={handleDeleteSkill}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {toast && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-8 z-[200] bg-navy-3 border border-lime/20 rounded-xl p-5 shadow-2xl flex items-center gap-4 max-w-sm"
          >
            <div className={`p-2 rounded-lg ${toast.type === 'success' ? 'bg-lime/10 text-lime' : 'bg-red-500/10 text-red-400'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-sm leading-tight text-white mb-0.5">{toast.title}</div>
              <div className="text-xs text-muted leading-tight">{toast.sub}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
