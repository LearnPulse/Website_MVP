"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function LearningSession() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">System Design Basics</h1>
              <p className="text-slate-500 dark:text-slate-400">Module 2 of 12 • Last updated 2 hours ago</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined">bookmark</span>
              </button>
              <button className="p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Session Progress</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">35%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: "35%" }}></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Load Balancer Architecture</h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
                Imagine a busy restaurant with a single host. A load balancer acts as that host, sitting in front of your server fleet and routing incoming client requests to the most appropriate backend server. This ensures no single server becomes overwhelmed.
              </p>

              {/* Diagram Placeholder */}
              <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8 shadow-sm">
                <div className="aspect-video w-full bg-center bg-no-repeat bg-cover" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAVXZmDRT4TAgsGPfogoETn-qevhipQg2XXJegFH2DnVHeVEVUgyNSaFi4Sl2i7q9ekZ8aO1WrIXuplY76OlEqgn-9RBobUNdzFzgOZy0sKmUIBD6PMyr9QOCevkJFx5MwvKH8IptzrPS2jCzywmbSOTz7j0Bm5yA9a_DvlFG8lKbzqN7MCRFZxeFL6QwE-TEHUT2aTSsRkxqmxhcM4YcMu1VOG_OMqzK8p8qt_uMHvA3Dgv8I54yL11wFUUmGPCXQ1QaKQAGdRu_I')"}}></div>
                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 italic">Figure 1.1: Standard Load Balancer Topology</span>
                </div>
              </div>

              {/* Key Takeaways Card */}
              <div className="bg-primary/5 dark:bg-primary/10 border-l-4 border-primary rounded-r-lg p-6 mb-8">
                <h4 className="text-primary font-bold text-base uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">stars</span>
                  Key Takeaways
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                    <span className="text-base text-slate-900 dark:text-slate-100"><strong>Scalability:</strong> Easily add or remove servers as traffic grows.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                    <span className="text-base text-slate-900 dark:text-slate-100"><strong>Reliability:</strong> Automatically detects unhealthy servers and routes around them.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                    <span className="text-base text-slate-900 dark:text-slate-100"><strong>Efficiency:</strong> Distributes load based on server capacity or active connections.</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Types of Routing</h3>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                There are several algorithms used to determine which server receives the next request:
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <p className="font-bold text-primary text-lg mb-2">Round Robin</p>
                  <p className="text-slate-600 dark:text-slate-400">Sequentially goes through the list of servers.</p>
                </div>
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <p className="font-bold text-primary text-lg mb-2">Least Connections</p>
                  <p className="text-slate-600 dark:text-slate-400">Routes to the server with the fewest active sessions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-6">
            {/* Continue Button */}
            <button className="w-full h-16 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-colors active:scale-[0.98] text-lg">
              Continue to Quiz
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            {/* Study Materials Button */}
            <Link
              href="/artifacts"
              className={`w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-primary hover:bg-primary/5 font-semibold flex items-center justify-center gap-2 transition-all`}
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              Generate Study Materials
            </Link>

            {/* Related Topics */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Related Topics</p>
              <div className="space-y-2">
                <a href="#" className="text-sm text-primary hover:underline flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">arrow_right</span>
                  Caching Strategies
                </a>
                <a href="#" className="text-sm text-primary hover:underline flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">arrow_right</span>
                  Database Replication
                </a>
              </div>
            </div>

            {/* Related Topics */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Related Topics</p>
              <div className="space-y-2">
                <a href="#" className="text-sm text-primary hover:underline flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">arrow_right</span>
                  Caching Strategies
                </a>
                <a href="#" className="text-sm text-primary hover:underline flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">arrow_right</span>
                  Database Sharding
                </a>
                <a href="#" className="text-sm text-primary hover:underline flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">arrow_right</span>
                  Distributed Systems
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
