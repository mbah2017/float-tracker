import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, Button, Badge } from './common';
import { 
  Book, 
  UserCheck, 
  ShieldCheck, 
  Zap, 
  Info, 
  Download, 
  MessageSquare, 
  Star, 
  CheckCircle2,
  List,
  Edit3,
  Save,
  X,
  Type,
  Palette,
  RefreshCw
} from 'lucide-react';
import { hasPermission, PERMISSIONS } from '../constants/permissions';
import { useLanguage } from '../context/LanguageContext';
import defaultManualContent from '../../TRAINING_MANUAL.md?raw';

export const TrainingManualView = ({ user, rootId }) => {
  const { t } = useLanguage();
  // Persistence logic for manual content and styles
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem(`float_manual_content_${rootId}`);
    return saved || defaultManualContent;
  });

  const [styleSettings, setStyles] = useState(() => {
    const saved = localStorage.getItem(`float_manual_styles_${rootId}`);
    return saved ? JSON.parse(saved) : {
      fontFamily: 'font-sans',
      fontSize: 'text-lg',
      themeColor: 'blue'
    };
  });

  const [activeTab, setActiveTab] = useState('master');
  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState(content);
  const [toc, setToc] = useState([]);

  const canManageManual = hasPermission(user, PERMISSIONS.MANAGE_MANUAL);

  // Robustly split content by identifying the start of the major sections
  const getSection = (titleEn, titleFr) => {
    const rx = new RegExp(`# (?:${titleEn}|${titleFr})[\\s\\S]*?(?=# (?:Master Agent Guide|Operator Guide|Guide Maître|Guide Opérateur)|$)`, 'i');
    const match = content.match(rx);
    return match ? match[0] : '';
  };

  const masterContent = getSection('Master Agent Guide', 'Guide Maître');
  const operatorContent = getSection('Operator Guide', 'Guide Opérateur');
  
  const currentContent = activeTab === 'master' ? masterContent.trim() : operatorContent.trim();

  // Extract TOC dynamically from current content
  useEffect(() => {
    const headings = currentContent.split('\n')
      .filter(line => line.trim().startsWith('## '))
      .map(line => {
        const text = line.replace('## ', '').trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        return { text, id };
      });
    setToc(headings);
  }, [currentContent, activeTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleSave = () => {
    setContent(editBuffer);
    localStorage.setItem(`float_manual_content_${rootId}`, editBuffer);
    setIsEditing(false);
  };

  const handleReset = () => {
    if (!confirm(t('reset_confirm') || 'Reset manual to original default content?')) return;
    setContent(defaultManualContent);
    setEditBuffer(defaultManualContent);
    localStorage.removeItem(`float_manual_content_${rootId}`);
    setIsEditing(false);
  };

  const updateStyle = (key, value) => {
    const newStyles = { ...styleSettings, [key]: value };
    setStyles(newStyles);
    localStorage.setItem(`float_manual_styles_${rootId}`, JSON.stringify(newStyles));
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  const FeatureItem = ({ icon: Icon, title, children }) => (
    <div className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
      <div className={`bg-${styleSettings.themeColor}-100 text-${styleSettings.themeColor}-600 p-2 rounded-xl h-fit shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
        <div className="text-sm text-slate-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );

  const Heading2 = ({ children }) => {
    const getText = (node) => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return node.map(getText).join('');
      if (node.props && node.props.children) return getText(node.props.children);
      return '';
    };
    
    const text = getText(children);
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
      
    return (
      <h2 id={id} className="group relative flex items-center gap-3">
        <span className="absolute -left-8 opacity-0 group-hover:opacity-100 text-slate-300 transition-opacity">#</span>
        {children}
      </h2>
    );
  };

  return (
    <div className={`space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 ${styleSettings.fontFamily}`}>
      {/* Header */}
      <header className={`relative p-10 md:p-16 bg-slate-900 rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-slate-200`}>
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-${styleSettings.themeColor}-500/10 rounded-full -mr-40 -mt-40 blur-[120px]`}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-6">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-${styleSettings.themeColor}-500/20 rounded-full border border-${styleSettings.themeColor}-500/30 text-${styleSettings.themeColor}-300 text-[10px] font-black uppercase tracking-[0.2em]`}>
              <Book className="w-3.5 h-3.5" /> {t('knowledge_base')}
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white">
              {t('platform_manual').split(' ')[0]} <span className={`text-${styleSettings.themeColor}-500`}>{t('platform_manual').split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl text-xl leading-relaxed">
              {t('manual_desc')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canManageManual && (
              <Button 
                variant={isEditing ? 'success' : 'outline'} 
                className="bg-white/5 border-white/10 text-white hover:bg-white/20 rounded-2xl px-8 py-4 font-bold"
                onClick={() => {
                  if (isEditing) handleSave();
                  else {
                    setEditBuffer(content);
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? <><Save className="w-4 h-4 mr-2" /> {t('save_changes_btn')}</> : <><Edit3 className="w-4 h-4 mr-2" /> {t('customize_manual')}</>}
              </Button>
            )}
            {!isEditing && (
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/20 rounded-2xl px-8 py-4 font-bold" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" /> {t('export_pdf')}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Editor Controls */}
      {isEditing && (
        <Card className="p-6 border-blue-200 bg-blue-50/50 backdrop-blur-md rounded-3xl sticky top-24 z-30 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Type className="w-4 h-4" /></div>
                <select 
                  className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={styleSettings.fontFamily}
                  onChange={(e) => updateStyle('fontFamily', e.target.value)}
                >
                  <option value="font-sans">Modern Sans</option>
                  <option value="font-serif">Classic Serif</option>
                  <option value="font-mono">Technical Mono</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Palette className="w-4 h-4" /></div>
                <div className="flex gap-2">
                  {['blue', 'indigo', 'purple', 'emerald', 'slate'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateStyle('themeColor', color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${styleSettings.themeColor === color ? 'border-white ring-2 ring-blue-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: color === 'emerald' ? '#10b981' : color === 'slate' ? '#64748b' : color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="danger" onClick={handleReset} icon={RefreshCw}>{t('reset_default')}</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)} icon={X}>{t('cancel')}</Button>
              <Button variant="primary" onClick={handleSave} icon={Save}>{t('save_changes_btn')}</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-2 md:px-0">
        {/* Navigation Sidebar */}
        {!isEditing && (
          <div className="hidden lg:block lg:col-span-3 sticky top-48 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <List className="w-3.5 h-3.5" /> {t('navigation')}
                </h3>
                <Badge color={styleSettings.themeColor}>{activeTab === 'master' ? t('master_guide').split(' ')[0] : t('operator_guide').split(' ')[0]}</Badge>
              </div>
              <nav className="space-y-1">
                {toc.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 group hover:bg-slate-50`}
                  >
                    <span className={`text-${styleSettings.themeColor}-400 opacity-40 group-hover:opacity-100`}>#</span>
                    <span className="text-slate-600 group-hover:text-slate-900">{item.text.replace(/^[0-9.]+\s*/, '')}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-2 p-2 bg-slate-100 rounded-[2rem]">
              <button
                onClick={() => setActiveTab('master')}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black transition-all ${
                  activeTab === 'master' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> {t('master_guide')}
              </button>
              <button
                onClick={() => setActiveTab('operator')}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black transition-all ${
                  activeTab === 'operator' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                <UserCheck className="w-4 h-4" /> {t('operator_guide')}
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={isEditing ? 'lg:col-span-12' : 'lg:col-span-9'}>
          {isEditing ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <Edit3 className="w-4 h-4" /> {t('markdown_editor')}
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                  <Info className="w-3 h-3" /> {t('editor_tip')}
                </div>
              </div>
              <textarea
                value={editBuffer}
                onChange={(e) => setEditBuffer(e.target.value)}
                className="w-full h-[800px] p-10 rounded-[3rem] border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-2xl font-mono text-sm leading-relaxed outline-none"
                placeholder="Paste your markdown here..."
              />
            </div>
          ) : (
            <Card className="p-8 md:p-20 rounded-[3rem] shadow-2xl shadow-slate-200/60 border-white/50 bg-white/90 backdrop-blur-md">
              <article className={`prose prose-slate max-w-none 
                prose-headings:tracking-tight prose-headings:font-black
                prose-h1:text-5xl prose-h1:text-slate-900 prose-h1:mb-12
                prose-h2:text-3xl prose-h2:text-slate-800 prose-h2:mt-20 prose-h2:mb-8 prose-h2:pt-8 prose-h2:border-t prose-h2:border-slate-50
                prose-h3:text-lg prose-h3:text-${styleSettings.themeColor}-600 prose-h3:mt-10 prose-h3:mb-4 prose-h3:font-black prose-h3:uppercase prose-h3:tracking-widest
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-slate-900 prose-strong:font-black
              `}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-12">{children}</h1>,
                    h2: Heading2,
                    h3: ({children}) => <h3 className={`text-xl font-black uppercase tracking-widest text-${styleSettings.themeColor}-600 mt-12 mb-6`}>{children}</h3>,
                    h4: ({children}) => <h4 className="text-lg font-bold text-slate-800 mt-8 mb-4">{children}</h4>,
                    p: ({children}) => <p className="text-slate-600 text-lg leading-relaxed mb-6">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-outside ml-6 mb-8 space-y-3">{children}</ul>,
                    li: ({children}) => <li className="text-slate-600 text-lg">{children}</li>,
                    blockquote: ({children}) => (
                      <blockquote className={`border-l-4 border-${styleSettings.themeColor}-500 bg-${styleSettings.themeColor}-50/50 p-8 rounded-3xl not-italic text-${styleSettings.themeColor}-900 font-medium my-10`}>
                        {children}
                      </blockquote>
                    ),
                    table: ({children}) => (
                      <div className="overflow-x-auto my-10 rounded-3xl border border-slate-100 shadow-sm">
                        <table className="w-full border-collapse">{children}</table>
                      </div>
                    ),
                    thead: ({children}) => <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>,
                    tbody: ({children}) => <tbody className="divide-y divide-slate-200">{children}</tbody>,
                    th: ({children}) => <th className="p-5 text-left text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] border-r border-slate-200 last:border-r-0">{children}</th>,
                    td: ({children}) => <td className="p-5 text-slate-600 text-sm font-medium border-r border-slate-100 last:border-r-0">{children}</td>
                  }}
                >
                  {currentContent}
                </ReactMarkdown>
              </article>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
