"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const userId = "user_123"; // TODO: Get from auth context/session
  const { profile, stats, weeklyActivity, isLoading } = useDashboardData({ userId });

  const [selectedTime, setSelectedTime] = useState("15-20m");
  const [topicSelected, setTopicSelected] = useState("Data Structures");
  const [goalSelected, setGoalSelected] = useState("Review Concepts");
  const [currentFocus, setCurrentFocus] = useState({
    topic: "Data Structures",
    subtopic: "Linked Lists",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqDuzLhbeNhXroP5GCcRgIRk7ZunyQ4bZnBDUY6kg_8JRUyYDX-XofQ7chru2nulpTfwoe0FVqhexBP--juaIPcfpmQIt3G61s1g3JrTAMb6sU1c6NJ8VSdNhH70VpYXBP5WcdZLjQRvxCRczD4xcEmtKU30gZYAMCXF5OW8syG7yLUVpJsSgh7USpNxbP-CCF-CeAXfA_-Cx4AvJBqDrKynhKECUDfhqwcf-Osn6UjRzMfRy0ey6LymRt4ZZO3by_AyL9-OZggiw",
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Personalized Greeting */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold leading-tight">
            Hello, {isLoading ? "..." : profile?.name || "Learner"}.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Ready to dive back in?</p>
        </section>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-8">
            {/* Current Focus Card */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Current Focus</h3>
              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-8">
                <div className="flex justify-between items-center gap-8">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">{currentFocus.topic}</p>
                    <h4 className="text-3xl font-bold mb-3">
                      {currentFocus.subtopic}
                    </h4>
                    <p className="text-base text-slate-500 dark:text-slate-400 mb-8">Subtopic: Singly Linked Lists</p>
                    <Link href="/learning-session" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 active:scale-95 transition-transform w-fit text-lg">
                      <span className="material-symbols-outlined">play_arrow</span>
                      Resume Session
                    </Link>
                  </div>
                  <div className="w-48 h-48 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center bg-cover bg-center flex-shrink-0" style={{backgroundImage: `url('${currentFocus.image}')`}}></div>
                </div>
              </div>
            </section>

            {/* Session Configurator */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Micro-Session Config</h3>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                <div className="grid grid-cols-3 gap-6">
                  {/* Topic Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">I WANT TO STUDY...</label>
                    <div className="relative">
                      <select value={topicSelected} onChange={(e) => setTopicSelected(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 pl-4 pr-10 text-base appearance-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer text-slate-900 dark:text-white">
                        <option>Data Structures</option>
                        <option>Algorithms</option>
                        <option>Operating Systems</option>
                        <option>Computer Architecture</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Goal Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">MY GOAL IS...</label>
                    <div className="relative">
                      <select value={goalSelected} onChange={(e) => setGoalSelected(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 pl-4 pr-10 text-base appearance-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer text-slate-900 dark:text-white">
                        <option>Review Concepts</option>
                        <option>Solve Practice Problems</option>
                        <option>Deep Dive Lesson</option>
                        <option>Quick Knowledge Check</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Time Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">I HAVE...</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["5-10m", "15-20m", "30m+"].map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            selectedTime === time
                              ? "border-primary bg-primary/10 text-primary font-bold"
                              : "border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/5 hover:border-primary/30"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 mt-8 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-lg">
                  <span className="material-symbols-outlined">bolt</span>
                  Start Learning
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-1 space-y-8">
            {/* Weekly Activity Progress */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Weekly Activity</h3>
                <span className="text-sm font-medium text-primary">
                  {isLoading ? "..." : `${weeklyActivity.reduce((sum, day) => sum + day.minutes, 0)}m total`}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="space-y-4">
                  {isLoading ? (
                    <p className="text-slate-400">Loading activity...</p>
                  ) : (
                    weeklyActivity.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`text-xs font-medium w-20 ${item.percentage > 80 ? "font-bold text-primary" : "text-slate-400"}`}>
                          {item.day.slice(0, 3)}
                        </span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.percentage > 80 ? "bg-primary" : "bg-primary/40"}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{item.percentage}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Stats Card */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Your Stats</h3>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-xl border border-primary/20 p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Learning Streak</p>
                    <p className="text-2xl font-bold text-primary">{isLoading ? "..." : `${stats?.learningStreak || 0} days`}</p>
                  </div>
                  <div className="pt-4 border-t border-primary/20">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Topics Completed</p>
                    <p className="text-2xl font-bold text-primary">{isLoading ? "..." : stats?.topicsCompleted || 0}</p>
                  </div>
                  <div className="pt-4 border-t border-primary/20">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Quiz Average</p>
                    <p className="text-2xl font-bold text-primary">{isLoading ? "..." : `${stats?.quizAverage || 0}%`}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
