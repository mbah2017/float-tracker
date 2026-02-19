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
  ChevronRight, 
  Download, 
  MessageSquare, 
  Star, 
  CheckCircle2,
  List,
  ArrowRight
} from 'lucide-react';
import manualContent from '../../TRAINING_MANUAL.md?raw';

export const TrainingManualView = () => {
  const [activeTab, setActiveTab] = useState('master');
  const [toc, setToc] = useState([]);

  // Split content into Master and Operator sections manually
  const parts = manualContent.split('---');
  const masterContent = parts.find(p => p.includes('# Master Agent Guide')) || '';
  const operatorContent = parts.find(p => p.includes('# Operator Guide')) || '';
  const currentContent = activeTab === 'master' ? masterContent : operatorContent;

  // Extract TOC dynamically from current content
  useEffect(() => {
    const lines = currentContent.split('\n');
    const headings = lines
      .filter(line => line.startsWith('## '))
      .map(line => {
        const text = line.replace('## ', '').trim();
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        return { text, id };
      });
    setToc(headings);
  }, [currentContent]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const FeatureItem = ({ icon: Icon, title, children }) => (
    <div className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
      <div className="bg-blue-100 text-blue-600 p-2 rounded-xl h-fit shrink-0 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
          {title}
        </h4>
        <div className="text-sm text-slate-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <header className="relative p-10 md:p-16 bg-slate-900 rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full -mr-40 -mt-40 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full -ml-20 -mb-20 blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 rounded-full border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">
              <Book className="w-3.5 h-3.5" /> Documentation
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
              Platform <span className="text-blue-500">Manual</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl text-xl leading-relaxed">
              The essential guide for scaling your business and coordinating your agent network with precision.
            </p>
          </div>
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/20 rounded-2xl px-8 py-4 font-bold" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Print Summary
          </Button>
        </div>
      </header>

      {/* Role Selection */}
      <div className="flex p-2 bg-slate-200/50 backdrop-blur-md rounded-3xl w-fit mx-auto border border-slate-200 sticky top-24 z-20 shadow-lg">
        <button
          onClick={() => setActiveTab('master')}
          className={`flex items-center gap-2 px-10 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${
            activeTab === 'master' 
              ? 'bg-white text-blue-600 shadow-xl' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-5 h-5" /> Master Agent & Managers
        </button>
        <button
          onClick={() => setActiveTab('operator')}
          className={`flex items-center gap-2 px-10 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${
            activeTab === 'operator' 
              ? 'bg-white text-blue-600 shadow-xl' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-5 h-5" /> Operator Staff
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-2 md:px-0">
        {/* Sticky Table of Contents (Left) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-48 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <List className="w-3.5 h-3.5" /> On This Page
            </h3>
            <nav className="space-y-1">
              {toc.map((item, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSection(item.id)}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-2 group"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">#</span>
                  {item.text.replace(/^[0-9.]+\s*/, '')}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-900 text-white rounded-[2rem] border-none shadow-2xl shadow-blue-200 overflow-hidden relative group">
            <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
            <h4 className="text-xl font-black mb-2 relative z-10">Direct Help</h4>
            <p className="text-blue-100/80 text-xs mb-6 font-medium relative z-10">Need specialized advice? Contact our support team.</p>
            <Button className="w-full bg-white text-blue-900 hover:bg-blue-50 font-black py-3 rounded-xl border-none text-xs">
              Open Ticket
            </Button>
          </div>
        </div>

        {/* Main Content (Center) */}
        <div className="lg:col-span-9">
          <Card className="p-8 md:p-20 rounded-[3rem] shadow-2xl shadow-slate-200/60 border-white/50 bg-white/90 backdrop-blur-md overflow-visible">
            <article className="prose prose-slate max-w-none 
              prose-headings:tracking-tight prose-headings:font-black
              prose-h1:text-5xl prose-h1:text-slate-900 prose-h1:mb-12 prose-h1:font-black
              prose-h2:text-3xl prose-h2:text-slate-800 prose-h2:mt-20 prose-h2:mb-8 prose-h2:pt-8 prose-h2:border-t prose-h2:border-slate-50
              prose-h3:text-lg prose-h3:text-blue-600 prose-h3:mt-10 prose-h3:mb-4 prose-h3:font-black prose-h3:uppercase prose-h3:tracking-widest
              prose-p:text-slate-600 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
              prose-strong:text-slate-900 prose-strong:font-black
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:not-italic prose-blockquote:text-blue-900 prose-blockquote:font-medium prose-blockquote:my-10
              prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none prose-code:font-bold
              prose-li:text-slate-600 prose-li:text-lg prose-li:mb-2
              prose-table:border-collapse prose-table:w-full prose-table:rounded-3xl prose-table:overflow-hidden prose-table:shadow-sm prose-table:border prose-table:border-slate-100 prose-table:my-10
              prose-th:bg-slate-50 prose-th:p-5 prose-th:text-slate-900 prose-th:font-black prose-th:uppercase prose-th:text-[10px] prose-th:tracking-[0.2em]
              prose-td:p-5 prose-td:border-b prose-td:border-slate-50 prose-td:text-slate-600
              prose-img:rounded-3xl prose-img:shadow-2xl
            ">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({node, ...props}) => {
                    const id = props.children[0]?.toString().toLowerCase().replace(/[^\w]+/g, '-') || '';
                    return <h2 id={id} {...props} />;
                  }
                }}
              >
                {currentContent}
              </ReactMarkdown>
            </article>
          </Card>
        </div>
      </div>
    </div>
  );
};
