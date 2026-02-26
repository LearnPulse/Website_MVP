"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { apiClient } from "@/lib/api-client";

export default function ProfilePage() {
  const userId = "user_123"; // TODO: Get from auth context/session
  const { profile, stats, isLoading } = useDashboardData({ userId });

  const [skillLevel, setSkillLevel] = useState("beginner");
  const [learningStyle, setLearningStyle] = useState("visual");
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [cheatStyle, setCheatStyle] = useState("minimalist");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSavePreferences = async () => {
    await apiClient.upsertUserMemory(userId, {
      skillLevel,
      learningStyle,
      dailyMinutes,
      cheatStyle,
      notificationsEnabled,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-12">Profile & Preferences</h1>

        <div className="grid grid-cols-3 gap-12">
          {/* Left Column - Profile Section */}
          <div className="col-span-1">
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm sticky top-24">
              {/* Profile Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center overflow-hidden">
                    <img
                      alt="User Profile"
                      className="w-full h-full object-cover"
                      src={profile?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDi0OzyXdTB5Pu2r5fenujrHFqQGxJpLpC-L0q9575upN13u9hk03JgkXCLGSsMSr-YIhv-n6WT8jDVYBLcLUsKjixKxIHkcrVGnod05x51GDAv1d-rS7p5u-vIX8Gl0fu1WTpvPc-K5UhrB1PUevgti-nInRby6OkAq3a7sLYatvGtTe18deG9p23EuSY1JJUcumuMMaNdvtZlH248W-dVAODspbBQQ9WSIeUfcaC8dbYAFaFiT58vq7Up0xbcyVw-TgKwaTME1Uw"}
                    />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-4 border-white dark:border-slate-900 shadow-sm hover:bg-primary/90 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isLoading ? "..." : profile?.name || "User"}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {isLoading ? "..." : `Career Switcher Path • Member since ${profile?.joinedDate}`}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Learning Streak</p>
                  <p className="text-2xl font-bold text-primary">{isLoading ? "..." : `${stats?.learningStreak || 0} days`}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Topics Completed</p>
                  <p className="text-2xl font-bold text-primary">{isLoading ? "..." : stats?.topicsCompleted || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Quiz Average</p>
                  <p className="text-2xl font-bold text-primary">{isLoading ? "..." : `${stats?.quizAverage || 0}%`}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Settings */}
          <div className="col-span-2 space-y-8">
            {/* Skill Level Selection */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Where are you in your journey?</h3>
                <button className="text-primary hover:opacity-80 transition-opacity">
                  <span className="material-symbols-outlined text-2xl">info</span>
                </button>
              </div>
              <div className="flex gap-3">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <label key={level} className="flex-1">
                    <input
                      type="radio"
                      name="skill"
                      value={level}
                      checked={skillLevel === level}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="hidden"
                    />
                    <div className={`py-4 rounded-lg text-center font-semibold text-lg transition-all cursor-pointer border-2 ${skillLevel === level ? "border-primary bg-primary/10 text-primary" : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary"}`}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Learning Preferences */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-6">How do you learn best?</h3>
              <div className="grid grid-cols-3 gap-6">
                {/* Visual */}
                <label className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all cursor-pointer ${learningStyle === "visual" ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary"}`}>
                  <input
                    type="radio"
                    name="learning_style"
                    value="visual"
                    checked={learningStyle === "visual"}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    className="hidden"
                  />
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-primary mb-4">
                    <span className="material-symbols-outlined text-4xl">insights</span>
                  </div>
                  <p className="font-bold text-lg mb-2">Visual</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">Diagrams & flowcharts</p>
                  {learningStyle === "visual" && <span className="material-symbols-outlined text-primary text-3xl absolute top-4 right-4">check_circle</span>}
                </label>

                {/* Verbal */}
                <label className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all cursor-pointer ${learningStyle === "verbal" ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary"}`}>
                  <input
                    type="radio"
                    name="learning_style"
                    value="verbal"
                    checked={learningStyle === "verbal"}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    className="hidden"
                  />
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 mb-4">
                    <span className="material-symbols-outlined text-4xl">subject</span>
                  </div>
                  <p className="font-bold text-lg mb-2">Verbal</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">Clear explanations</p>
                  {learningStyle === "verbal" && <span className="material-symbols-outlined text-primary text-3xl absolute top-4 right-4">check_circle</span>}
                </label>

                {/* Practical */}
                <label className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all cursor-pointer ${learningStyle === "practical" ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary"}`}>
                  <input
                    type="radio"
                    name="learning_style"
                    value="practical"
                    checked={learningStyle === "practical"}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    className="hidden"
                  />
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                    <span className="material-symbols-outlined text-4xl">code</span>
                  </div>
                  <p className="font-bold text-lg mb-2">Practical</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">Hands-on coding</p>
                  {learningStyle === "practical" && <span className="material-symbols-outlined text-primary text-3xl absolute top-4 right-4">check_circle</span>}
                </label>
              </div>
            </section>

            {/* Time Commitment */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Your Daily Pulse</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">How much time can you commit?</p>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
                  <span className="text-xl font-bold">{dailyMinutes} Minutes / Day</span>
                </div>
                {dailyMinutes === 15 && <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">RECOMMENDED</span>}
              </div>

              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                title="Daily time commitment in minutes"
              />

              <div className="flex justify-between mt-4 text-sm text-slate-400 font-medium px-1">
                <span>5 MIN</span>
                <span>15 MIN</span>
                <span>30 MIN</span>
                <span>45 MIN</span>
                <span>1 HOUR</span>
              </div>
            </section>

            {/* Cheat Sheet Style */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-6">Review Style Preference</h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { id: "minimalist", title: "Minimalist", desc: "Quick Refreshes" },
                  { id: "detailed", title: "Detailed", desc: "Deep Dives" }
                ].map((style) => (
                  <label key={style.id}>
                    <input
                      type="radio"
                      name="cheat_style"
                      value={style.id}
                      checked={cheatStyle === style.id}
                      onChange={(e) => setCheatStyle(e.target.value)}
                      className="hidden"
                    />
                    <div className={`relative aspect-square rounded-xl border-2 p-6 flex flex-col justify-between cursor-pointer transition-all ${cheatStyle === style.id ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary"}`}>
                      <div className={`${style.id === "minimalist" ? "space-y-2" : "space-y-1.5"} opacity-40`}>
                        {style.id === "minimalist" ? (
                          <>
                            <div className="h-2 w-1/2 bg-slate-300 dark:bg-slate-600 rounded"></div>
                            <div className="h-2 w-3/4 bg-slate-300 dark:bg-slate-600 rounded"></div>
                          </>
                        ) : (
                          <>
                            <div className="h-1.5 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
                            <div className="h-1.5 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
                            <div className="h-1.5 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
                            <div className="h-1.5 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
                          </>
                        )}
                      </div>
                      <div className="text-sm font-bold">{style.title}</div>
                      {cheatStyle === style.id && <span className="material-symbols-outlined text-primary text-2xl absolute top-4 right-4">check_circle</span>}
                    </div>
                    <p className="text-sm text-center mt-3 text-slate-500">{style.desc}</p>
                  </label>
                ))}
              </div>
            </section>

            {/* Notifications */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">notifications</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Adaptive Pulse Reminders</p>
                    <p className="text-slate-600 dark:text-slate-400">Only nudge me during my learning window</p>
                  </div>
                </div>
                <label htmlFor="notifications-toggle" className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="notifications-toggle"
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="sr-only peer"
                    title="Enable adaptive pulse reminders"
                  />
                  <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-6 rtl:peer-checked:after:-translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </section>

            {/* Save Button */}
            <button
              onClick={handleSavePreferences}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] text-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}