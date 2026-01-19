import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Image as ImageIcon, 
  Search, 
  RefreshCcw, 
  Globe, 
  Settings, 
  History, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight, 
  Database, 
  Cpu, 
  Layers, 
  Download, 
  Printer,
  Info,
  ExternalLink
} from 'lucide-react';

const App = () => {
  // State Management
  const [backendUrl, setBackendUrl] = useState(""); 
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('diagnostics');

  // Handle Image Upload
  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
      setShowHeatmap(false);
    }
  };

  // Execute Analysis
  const runAnalysis = async () => {
    if (!file || !backendUrl) {
      setError("Missing image or Backend URL.");
      return;
    }
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const formattedUrl = backendUrl.replace(/\/$/, "");
      const response = await fetch(`${formattedUrl}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Connection failed. Status: " + response.status);
      
      const data = await response.json();
      if (data.status === "error") throw new Error(data.message);
      
      setResult(data);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError("Failed to reach AI Backend. Ensure the Cloudflare Tunnel is active and the URL is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] text-slate-900 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#0f172a] text-white hidden lg:flex flex-col border-r border-slate-800 flex-shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Patho<span className="text-blue-400">AI</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'diagnostics', label: 'Diagnostics', icon: LayoutDashboard },
            { id: 'history', label: 'History', icon: History },
            { id: 'database', label: 'Datasets', icon: Database },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2">System Health</p>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${backendUrl ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse'}`}></div>
              <span className="text-[11px] font-medium text-slate-300">{backendUrl ? 'Cloud Connected' : 'Offline Mode'}</span>
            </div>
            <button className="flex items-center gap-2 text-[11px] text-slate-500 hover:text-white transition-colors">
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN PANEL --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="bg-white h-20 border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="lg:hidden bg-blue-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">Lab Workstation</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Session • Dr. Specialist</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300 ${backendUrl ? 'bg-emerald-50 border-emerald-100 ring-4 ring-emerald-50/50' : 'bg-slate-50 border-slate-200'}`}>
              <Globe size={16} className={backendUrl ? 'text-emerald-500 animate-pulse' : 'text-slate-400'} />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Backend URL</span>
                <input 
                  type="text" 
                  placeholder="https://...trycloudflare.com" 
                  className="bg-transparent border-none outline-none text-xs font-bold w-48 text-slate-700 placeholder:text-slate-300"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          
          {error && (
            <div className="mb-8 bg-rose-50 border border-rose-100 p-5 rounded-2xl flex items-center gap-4 text-rose-700 shadow-sm animate-in fade-in slide-in-from-top-4">
              <AlertTriangle className="flex-shrink-0" />
              <div>
                <p className="font-black text-xs uppercase tracking-widest">Connection Error</p>
                <p className="text-sm font-medium opacity-80">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-12 gap-10">
            
            {/* SCANNER SECTION */}
            <div className="col-span-12 xl:col-span-7 space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden group">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <Layers className="text-blue-600 w-5 h-5" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Sample Viewport</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="text-slate-300 hover:text-slate-600 transition-colors"><Printer size={16} /></button>
                    <button className="text-slate-300 hover:text-slate-600 transition-colors"><ExternalLink size={16} /></button>
                  </div>
                </div>

                <div className="p-10">
                  {!preview ? (
                    <label className="border-4 border-dashed border-slate-100 rounded-[2rem] p-24 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all group-active:scale-[0.98]">
                      <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
                      <div className="bg-blue-600 p-6 rounded-[2rem] mb-6 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                        <ImageIcon className="text-white w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800">Load Histology Patch</h3>
                      <p className="text-sm text-slate-400 mt-2 font-medium tracking-tight">Drag and drop slide scan (.png, .jpg)</p>
                    </label>
                  ) : (
                    <div className="space-y-8 animate-in zoom-in-95 duration-500">
                      <div className="relative rounded-[2rem] overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border-8 border-white shadow-2xl">
                        <img 
                          src={showHeatmap && result?.heatmap ? result.heatmap : preview} 
                          alt="Pathology Scan" 
                          className={`max-h-full w-full object-contain transition-all duration-700 ${showHeatmap ? 'scale-110 blur-[1px]' : 'scale-100'}`}
                        />
                        {showHeatmap && (
                          <div className="absolute top-6 left-6 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full shadow-2xl border border-white/20 tracking-[0.2em] animate-pulse">
                            GRAD-CAM HEATMAP OVERLAY
                          </div>
                        )}
                        {loading && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center text-white p-12 text-center">
                            <div className="relative">
                              <RefreshCcw className="w-16 h-16 animate-spin text-blue-500 opacity-50" />
                              <Cpu className="absolute inset-0 m-auto w-6 h-6 text-white" />
                            </div>
                            <p className="font-black text-sm uppercase tracking-[0.4em] mt-8 text-blue-400">Processing Neural Tunnels</p>
                            <p className="text-xs text-slate-400 mt-2 italic font-serif">Extracting cellular morphological features...</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-4">
                        <button 
                          onClick={() => {setPreview(null); setFile(null); setResult(null); setError(null);}} 
                          className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
                        >
                          Clear Case
                        </button>
                        <button 
                          onClick={runAnalysis} 
                          disabled={loading || !!result || !backendUrl}
                          className="flex-[2] py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                        >
                          {loading ? 'Analyzing Neural Pathways...' : 'Initialize Diagnostic Run'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* TECHNICAL LOGS */}
              <div className="bg-[#0f172a] rounded-[2rem] p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Cpu size={16} className="text-blue-400" />
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">AI Pipeline Execution Status</span>
                </div>
                <div className="space-y-4 font-mono text-[11px]">
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full animate-ping"></div>
                      {'>'} System Nucleus Check
                    </span>
                    <span className="font-black">AUTHORIZED</span>
                  </div>
                  <div className={`flex justify-between items-center transition-colors duration-500 ${loading ? 'text-blue-400' : result ? 'text-slate-500' : 'text-slate-700'}`}>
                    <span>{'>'} Preprocessing: Wiener Spatial Filtering</span>
                    <span className="font-black">{result ? 'SUCCESS' : loading ? 'RUNNING' : 'PENDING'}</span>
                  </div>
                  <div className={`flex justify-between items-center transition-colors duration-500 ${loading ? 'text-blue-400' : result ? 'text-slate-500' : 'text-slate-700'}`}>
                    <span>{'>'} Feature Extraction: CNN Deep Layer Analysis</span>
                    <span className="font-black">{result ? 'STABLE' : loading ? 'RUNNING' : 'PENDING'}</span>
                  </div>
                  <div className={`flex justify-between items-center transition-colors duration-500 ${loading ? 'text-blue-400' : result ? 'text-slate-500' : 'text-slate-700'}`}>
                    <span>{'>'} XAI Protocol: Grad-CAM Activation Mapping</span>
                    <span className="font-black">{result ? 'COMPILED' : 'IDLE'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RESULTS PANEL */}
            <div className="col-span-12 xl:col-span-5 flex flex-col h-full min-h-[500px]">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex-1 flex flex-col overflow-hidden">
                <div className="px-8 py-5 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <FileText className="text-slate-400 w-4 h-4" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Diagnostic Transcript</span>
                  </div>
                </div>

                <div className="p-10 flex-1 flex flex-col justify-center">
                  {!result ? (
                    <div className="text-center space-y-6 py-20 animate-pulse">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] mx-auto flex items-center justify-center border border-slate-100 rotate-12">
                        <ImageIcon className="w-10 h-10 text-slate-200" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-black text-slate-300 uppercase tracking-widest">Awaiting Input</p>
                        <p className="text-xs text-slate-400 font-medium">Please select an image patch for classification.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                      
                      {/* DIAGNOSIS CARD */}
                      <div className={`p-8 rounded-[2.5rem] border-4 flex flex-col items-center text-center shadow-2xl ${result.prediction === 'Metastatic' ? 'bg-rose-50 border-rose-100 shadow-rose-200/50' : 'bg-emerald-50 border-emerald-100 shadow-emerald-200/50'}`}>
                        <div className={`p-5 rounded-[2rem] mb-8 shadow-xl ${result.prediction === 'Metastatic' ? 'bg-rose-600 shadow-rose-600/30' : 'bg-emerald-600 shadow-emerald-600/30'}`}>
                          {result.prediction === 'Metastatic' ? <AlertTriangle className="text-white w-10 h-10" /> : <ShieldCheck className="text-white w-10 h-10" />}
                        </div>
                        <h2 className={`text-5xl font-black tracking-tighter mb-2 ${result.prediction === 'Metastatic' ? 'text-rose-900' : 'text-emerald-900'}`}>
                          {result.prediction}
                        </h2>
                        <p className={`text-[11px] font-black uppercase tracking-[0.3em] opacity-50 ${result.prediction === 'Metastatic' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          Inference Conclusion
                        </p>
                        
                        <div className="mt-10 w-full space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Confidence</span>
                            <span className={`text-xl font-black ${result.prediction === 'Metastatic' ? 'text-rose-600' : 'text-emerald-600'}`}>{result.confidence}</span>
                          </div>
                          <div className="w-full bg-white h-5 rounded-full p-1.5 border border-slate-200 shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-[2000ms] ease-out shadow-[0_0_15px] ${result.prediction === 'Metastatic' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}
                              style={{ width: result.confidence }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* XAI INTERPRETATION */}
                      <div className="space-y-5">
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <Search size={14} className="text-blue-500" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Clinical Explanation</h4>
                          </div>
                          <button 
                            onClick={() => setShowHeatmap(!showHeatmap)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-[10px] font-black transition-all active:scale-95 shadow-lg ${showHeatmap ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                          >
                            {showHeatmap ? 'HIDE MAP' : 'VIEW GRAD-CAM MAP'}
                          </button>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 border-l-8 border-l-blue-500 shadow-sm">
                          <p className="text-sm text-slate-700 leading-relaxed italic font-serif opacity-80">
                            "{result.message}"
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-4">
                        <button className="w-full py-5 bg-slate-900 text-white font-black text-[10px] rounded-[1.5rem] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98]">
                          <Download size={16} /> Export High-Res Laboratory Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PROJECT ATTRIBUTION */}
              <div className="mt-8 px-6 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  AI HISTOPATHOLOGY SUITE
                </div>
                <span>DEC 2024 EDITION</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;