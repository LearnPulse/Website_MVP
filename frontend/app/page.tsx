"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

console.log("API base:", apiBase);

export default function Home() {
  const [topic, setTopic] = useState("System Design");
  const [goal, setGoal] = useState("Learn caching strategies");
  const [userId, setUserId] = useState("demo-user");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [output, setOutput] = useState<string>("");

  const handleIngest = async () => {
    if (!file) {
      setStatus("Please select a document to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("topic", topic);
    formData.append("user_id", userId);

    setStatus("Uploading and ingesting...");
    const res = await fetch(`${apiBase}/ingest`, { method: "POST", body: formData });
    const data = await res.json();
    setStatus(`Ingested: ${data.status} (chunks: ${data.chunks || 0})`);
  };

  const handleLearn = async () => {
    setStatus("Generating learning output...");
    const res = await fetch(`${apiBase}/learn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, goal, user_id: userId, format: "cheat_sheet" })
    });
    const data = await res.json();
    setOutput(data.output || "");
    setStatus("Done.");
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
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

          <Card className="glow">
            <CardHeader>
              <h2 className="text-xl font-display">Learning Request</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" />
                <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
              </div>
              <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={4} />
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleLearn}>Generate Output</Button>
                <Button variant="ghost" onClick={() => setOutput("")}>Clear Output</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glow">
            <CardHeader>
              <h2 className="text-xl font-display">Document Ingestion</h2>
            </CardHeader>
            <CardContent>
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

          <Card className="glow">
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
