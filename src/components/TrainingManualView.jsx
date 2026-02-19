import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, Button, Badge } from './common';
import { Book, UserCheck, ShieldCheck, Zap, Info, ChevronRight, Download, MessageSquare, Star, CheckCircle2 } from 'lucide-react';
import manualContent from '../../TRAINING_MANUAL.md?raw';

export const TrainingManualView = () => {
  const [activeTab, setActiveTab] = useState('master');

  // Split content into Master and Operator sections manually for better UI control
  const parts = manualContent.split('---');
  const masterContent = parts.find(p => p.includes('# Master Agent Guide')) || '';
  const operatorContent = parts.find(p => p.includes('# Operator Guide')) || '';

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
      {/* Header */}
      <header className="relative p-8 md:p-12 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full -ml-20 -mb-20 blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
              <Book className="w-3.5 h-3.5" /> Knowledge Base
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              User Manual
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
              Master the art of liquidity management and network coordination with our comprehensive platform guide.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/20 rounded-2xl px-6" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Role Selection Tabs */}
      <div className="flex p-2 bg-slate-200/50 backdrop-blur-sm rounded-[2rem] w-fit mx-auto shadow-inner border border-slate-200">
        <button
          onClick={() => setActiveTab('master')}
          className={`flex items-center gap-2 px-10 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-300 ${
            activeTab === 'master' 
              ? 'bg-white text-blue-600 shadow-xl shadow-blue-100 translate-y-[-1px]' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className={`w-5 h-5 ${activeTab === 'master' ? 'animate-pulse' : ''}`} /> Master Agent & Managers
        </button>
        <button
          onClick={() => setActiveTab('operator')}
          className={`flex items-center gap-2 px-10 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-300 ${
            activeTab === 'operator' 
              ? 'bg-white text-blue-600 shadow-xl shadow-blue-100 translate-y-[-1px]' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className={`w-5 h-5 ${activeTab === 'operator' ? 'animate-pulse' : ''}`} /> Operator Staff
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <Card className="p-8 md:p-16 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border-white/50 bg-white/80 backdrop-blur-md">
            <article className="prose prose-slate max-w-none 
              prose-headings:tracking-tight prose-headings:font-black
              prose-h1:text-4xl prose-h1:text-slate-900 prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b-2 prose-h1:border-slate-100
              prose-h2:text-2xl prose-h2:text-slate-800 prose-h2:mt-12 prose-h2:mb-6 prose-h2:flex prose-h2:items-center prose-h2:gap-3
              prose-h3:text-lg prose-h3:text-blue-600 prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-slate-600 prose-p:text-lg prose-p:leading-relaxed
              prose-strong:text-slate-900 prose-strong:font-bold
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-6 prose-blockquote:rounded-2xl prose-blockquote:not-italic prose-blockquote:text-blue-900 prose-blockquote:font-medium
              prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none
              prose-li:text-slate-600 prose-li:text-lg
              prose-table:border-collapse prose-table:w-full prose-table:rounded-2xl prose-table:overflow-hidden
              prose-th:bg-slate-50 prose-th:p-4 prose-th:text-slate-900 prose-th:font-black prose-th:uppercase prose-th:text-xs prose-th:tracking-widest
              prose-td:p-4 prose-td:border-b prose-td:border-slate-100
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-bold
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeTab === 'master' ? masterContent : operatorContent}
              </ReactMarkdown>
            </article>
          </Card>
        </div>

        {/* Sidebar Quick References */}
        <div className="lg:col-span-4 space-y-8 sticky top-28">
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">Core Procedures</h3>
            <Card className="p-3 rounded-3xl border-slate-100 shadow-xl shadow-slate-100 divide-y divide-slate-50">
              <FeatureItem icon={Zap} title="Outbound Flow">
                Issue float via various channels and secure legal digital agreement.
              </FeatureItem>
              <FeatureItem icon={CheckCircle2} title="Inbound Flow">
                Reconcile agent returns and clear debt logs instantly.
              </FeatureItem>
              <FeatureItem icon={Info} title="EOD Audit">
                Daily liquidity sync to maintain 100% accounting accuracy.
              </FeatureItem>
            </Card>
          </section>

          <Card className="p-8 bg-gradient-to-br from-blue-600 to-indigo-900 text-white rounded-[2rem] border-none shadow-2xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Direct Support</h3>
              <p className="text-blue-100/80 text-sm mb-8 leading-relaxed font-medium">
                Need specialized assistance? Our technical team is available for system configurations and business scaling advice.
              </p>
              <Button className="w-full bg-white text-blue-900 hover:bg-blue-50 font-black py-4 rounded-2xl border-none shadow-xl">
                Contact Support
              </Button>
            </div>
          </Card>

          <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Star className="w-6 h-6 text-amber-200 fill-amber-200" />
            </div>
            <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4">Pro Tip</h4>
            <p className="text-sm text-amber-900/70 leading-relaxed italic font-medium">
              "The most successful agents reconcile their books **twice daily**—once at mid-day and once at close. This eliminates 99% of reporting errors."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
