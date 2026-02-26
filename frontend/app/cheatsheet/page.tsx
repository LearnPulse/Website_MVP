"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function CheatsheetPage() {
  const [activeTab, setActiveTab] = useState("definitions");

  const tabs = ["definitions", "concepts", "examples", "pitfalls"];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex gap-8 items-start bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
            <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center">
              <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwa-6_rThcfj7ggbNerWDvBDD5nnbvM2E8kB97-5Rn2p_6vxJs4MSPPv8rS49_OfP2kkgA86dZ5VlcTZjpb32THVELQmKafszSH4-Om4CDhYGZ-HNxpD5FQpzl8Wnv4XaV_TrU_pfbcRnvEUU5P9uF0sP68ZgMzNiKZy5DkFAxiuCioApQt1XcolxHZwf6tVtucDxxSW2RiObpO20dhK5b0qKNcnqhanYo-f09DAegjRP_t0z-6KNKeX2poNT55mbLc_C6qajRw_U')"}}></div>
            </div>
            <div className="flex-1">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded w-fit mb-3 uppercase tracking-wide inline-block">Computer Science</span>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Python List Methods</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-2">Intermediate Cheat Sheet</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                <p className="text-slate-600 dark:text-slate-400 text-sm">5 min read • Updated Today</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800 px-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 text-lg font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-primary"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
          {/* Definitions Section */}
          {activeTab === "definitions" && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
                <h2 className="text-3xl font-bold">Definitions</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-l-4 border-primary">
                  <p className="text-primary text-xs font-bold uppercase mb-2">List</p>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    An ordered, <span className="text-primary font-semibold">mutable</span> collection of items that can contain multiple data types.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-l-4 border-primary/40">
                  <p className="text-primary text-xs font-bold uppercase mb-2">Indexing</p>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    Accessing elements via their position, starting from <span className="bg-primary/10 px-2 py-1 rounded text-primary font-mono font-bold">0</span>.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Key Concepts Section */}
          {activeTab === "concepts" && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
                <h2 className="text-3xl font-bold">Key Concepts</h2>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">check</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold mb-2">Mutations</p>
                    <p className="text-slate-600 dark:text-slate-400">Unlike strings, lists can be changed in place (adding, removing, or updating).</p>
                  </div>
                </div>
                <div className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">check</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold mb-2">Slicing</p>
                    <p className="text-slate-600 dark:text-slate-400">Use <code className="bg-primary/10 px-2 py-1 rounded font-mono font-bold text-primary">[start:stop:step]</code> to extract sub-sections.</p>
                  </div>
                </div>
                <div className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">check</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold mb-2">Length</p>
                    <p className="text-slate-600 dark:text-slate-400">The <code className="bg-primary/10 px-2 py-1 rounded font-mono font-bold text-primary">len()</code> function returns the count of items.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Examples Section */}
          {activeTab === "examples" && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary text-2xl">code</span>
                <h2 className="text-3xl font-bold">Code Examples</h2>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-900 text-slate-200 p-6 rounded-xl font-mono text-base overflow-x-auto">
                  <p className="text-slate-500 mb-4"># Adding elements</p>
                  <p className="mb-2">fruits = [<span className="text-yellow-400">'apple'</span>]</p>
                  <p className="mb-2">fruits<span className="text-primary">.</span><span className="text-blue-400">append</span>(<span className="text-yellow-400">'banana'</span>)</p>
                  <p>fruits<span className="text-primary">.</span><span className="text-blue-400">insert</span>(<span className="text-green-400">0</span>, <span className="text-yellow-400">'cherry'</span>)</p>
                  <p className="mt-4 text-slate-500"># Result: ['cherry', 'apple', 'banana']</p>
                </div>
                <div className="bg-slate-900 text-slate-200 p-6 rounded-xl font-mono text-base overflow-x-auto">
                  <p className="text-slate-500 mb-4"># Removing elements</p>
                  <p className="mb-2">fruits<span className="text-primary">.</span><span className="text-blue-400">pop</span>() <span className="text-slate-500"># removes 'banana'</span></p>
                  <p>fruits<span className="text-primary">.</span><span className="text-blue-400">remove</span>(<span className="text-yellow-400">'apple'</span>)</p>
                </div>
                <div className="flex justify-center">
                  <button className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-8 py-3 rounded-full hover:bg-primary/20 transition-colors active:scale-95">
                    <span className="material-symbols-outlined">copy_all</span>
                    Copy Snippets
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Pitfalls Section */}
          {activeTab === "pitfalls" && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
                <h2 className="text-3xl font-bold">Pitfalls</h2>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-6 rounded-xl">
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold text-xl">•</span>
                    <p className="text-lg text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-red-600 dark:text-red-400">IndexError:</span> Accessing an index beyond the list size (<code className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded font-mono">len-1</code>).
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold text-xl">•</span>
                    <p className="text-lg text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-red-600 dark:text-red-400">Aliasing:</span> Assigning <code className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded font-mono">a = b</code> doesn't copy the list; both point to the same data.
                    </p>
                  </li>
                </ul>
              </div>
            </section>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-primary to-primary/80 p-12 rounded-2xl text-white shadow-lg shadow-primary/20">
          <h3 className="text-2xl font-bold mb-3">Ready to test yourself?</h3>
          <p className="text-lg opacity-90 mb-6">Take a 2-minute quiz on Python Lists to solidify your learning.</p>
          <button className="bg-white text-primary font-bold py-4 px-8 rounded-xl hover:bg-slate-100 transition-colors active:scale-[0.98]">
            Start Quick Quiz
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}