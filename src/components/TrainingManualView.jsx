import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, Button, Badge } from './common';
import { Book, UserCheck, ShieldCheck, Zap, Info, ChevronRight, Download, MessageSquare } from 'lucide-react';
import manualContent from '../../TRAINING_MANUAL.md?raw';

export const TrainingManualView = () => {
  const [activeTab, setActiveTab] = useState('master');

  // Split content into Master and Operator sections manually for better UI control
  const parts = manualContent.split('---');
  const masterContent = parts.find(p => p.includes('## Master Agent Guide')) || '';
  const operatorContent = parts.find(p => p.includes('## Operator Guide')) || '';

  const FeatureItem = ({ icon: Icon, title, children }) => (
    <div className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="bg-blue-100 text-blue-600 p-2 rounded-xl h-fit shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
        <div className="text-sm text-slate-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="relative p-8 md:p-12 bg-blue-900 rounded-3xl text-white overflow-hidden shadow-2xl shadow-blue-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-800/50 rounded-full border border-blue-700/50 text-blue-200 text-xs font-bold uppercase tracking-widest">
              <Book className="w-3 h-3" /> Help Center
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Documentation</h1>
            <p className="text-blue-200 font-medium max-w-lg">Everything you need to know about managing and operating the Float Tracker platform.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" /> Print PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Role Selection Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit mx-auto shadow-inner">
        <button
          onClick={() => setActiveTab('master')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${
            activeTab === 'master' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Master Agent Guide
        </button>
        <button
          onClick={() => setActiveTab('operator')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${
            activeTab === 'operator' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Operator Guide
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <Card className="p-8 md:p-12 shadow-xl shadow-slate-200/50 border-white/50 min-h-[600px]">
            <article className="prose prose-slate max-w-none 
              prose-headings:tracking-tighter prose-headings:font-black
              prose-h2:text-2xl prose-h2:text-slate-800 prose-h2:mt-12 prose-h2:mb-6 prose-h2:flex prose-h2:items-center prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-4
              prose-h3:text-lg prose-h3:text-blue-700 prose-h3:mt-8
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-strong:text-slate-900
              prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-900 prose-pre:rounded-2xl
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeTab === 'master' ? masterContent : operatorContent}
              </ReactMarkdown>
            </article>
          </Card>
        </div>

        {/* Sidebar Quick References */}
        <div className="lg:col-span-4 space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Key Workflows</h3>
            <Card className="p-2 border-slate-100 divide-y divide-slate-50">
              <FeatureItem icon={Zap} title="Float Issuance">
                Select agent, enter amount, confirm terms, and send WhatsApp.
              </FeatureItem>
              <FeatureItem icon={UserCheck} title="Agent Returns">
                Verify funds, select payment type, and clear outstanding debt.
              </FeatureItem>
              <FeatureItem icon={Info} title="Liquidity Sync">
                Enter actual balances daily to ensure books match reality.
              </FeatureItem>
            </Card>
          </section>

          <Card className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-lg shadow-blue-200">
            <MessageSquare className="w-8 h-8 text-blue-200 mb-4" />
            <h3 className="text-xl font-bold mb-2">Need Support?</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">If you encounter any issues not covered in this manual, please contact your system administrator.</p>
            <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black py-3 rounded-xl border-none">
              Contact Admin
            </Button>
          </Card>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Pro Tip</h4>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              "Always use the **WhatsApp Confirmation** feature. It builds trust with your agents and provides a clear record of every transaction for both parties."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
