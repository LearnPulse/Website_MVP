"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// We dynamically import the graph library to prevent Next.js server-side rendering errors
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { 
  ssr: false 
});

export default function LearnPulseGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    // This fetches the JSON from your FastAPI backend
    fetch('http://localhost:8000/api/graph')
      .then(res => res.json())
      .then(data => setGraphData(data))
      .catch(err => console.error("Error fetching graph data:", err));
  }, []);

  return (
    <div className="h-[800px] w-full border border-gray-800 rounded-lg overflow-hidden">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name" // Shows the concept name when you hover
        nodeAutoColorBy="difficulty" // Colors nodes based on Beginner/Intermediate/Advanced
        linkDirectionalArrowLength={5} // Adds arrows to show prerequisites
        linkDirectionalArrowRelPos={1} // Puts the arrow at the end of the line
        nodeRelSize={8} // Makes the dots a bit bigger
        backgroundColor="#0a0a0a" // Cool dark mode background
      />
    </div>
  );
}