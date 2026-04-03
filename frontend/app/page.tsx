"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";

// 1. IMPORT YOUR NEW GRAPH COMPONENT
// Adjust this path if you put the file somewhere else

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
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
                      <select value={topicSelected} onChange={(e) => setTopicSelected(e.target.value)} aria-label="Topic to study" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 pl-4 pr-10 text-base appearance-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer text-slate-900 dark:text-white">
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
                      <select value={goalSelected} onChange={(e) => setGoalSelected(e.target.value)} aria-label="Learning goal" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 pl-4 pr-10 text-base appearance-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer text-slate-900 dark:text-white">
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

  return (
    // I added "space-y-12" here so there is a nice gap between your forms and the graph
    <main className="mx-auto max-w-6xl px-6 py-12 space-y-12"> 
      
      {/* YOUR ORIGINAL TOP SECTION - UNTOUCHED */}
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <header className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-ink/50">For students by students</p>
            <h1 className="text-4xl font-display text-ink">
              LearnPulse Foundation
            </h1>
            <p className="text-lg text-ink/70">
              Upload learning sources, set a goal, and generate microlearning artifacts grounded in
              your Knowledge Graph, RAG context, and user memory.
            </p>
          </header>

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
              <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={4} className="my-4" />
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleLearn}>Generate Output</Button>
                <Button variant="ghost" onClick={() => setOutput("")}>Clear Output</Button>
              </div>
            </section>

          <Card className="glow">
            <CardHeader>
              <h2 className="text-xl font-display">Document Ingestion</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Button onClick={handleIngest}>Upload + Ingest</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glow">
            <CardHeader>
              <h2 className="text-xl font-display">Status</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink/70">{status || "Waiting for input..."}</p>
            </CardContent>
          </Card>

          <Card className="glow h-full">
            <CardHeader>
              <h2 className="text-xl font-display">Learning Output</h2>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-ink/80">{output || "No output yet."}</pre>
            </CardContent>
          </Card>
        </div>
      </section>

    </main>
  );
}