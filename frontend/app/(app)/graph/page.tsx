"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./graph.css";
import dagre from "@dagrejs/dagre";
import { apiClient } from "@/lib/api-client";
import type { KGNode, KGEdge, EdgeType, GoalSummary } from "@/lib/types";

// ── Dagre layout ──────────────────────────────────────────────────────────

function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 80 });
  for (const n of nodes) g.setNode(n.id, { width: 180, height: 64 });
  for (const e of edges) g.setEdge(e.source, e.target);
  dagre.layout(g);
  return nodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - 90, y: pos.y - 32 } };
  });
}

// ── Edge style config ─────────────────────────────────────────────────────

const EDGE_STYLES: Record<EdgeType, { color: string; dashed: boolean; label: string }> = {
  prerequisite: { color: "#1D9E75", dashed: false, label: "prerequisite" },
  related:      { color: "#64748b", dashed: true,  label: "related" },
  part_of:      { color: "#7c3aed", dashed: false, label: "part of" },
  example_of:   { color: "#d97706", dashed: true,  label: "example of" },
};

// ── Mastery helpers ───────────────────────────────────────────────────────

function masteryColor(score: number): string {
  if (score >= 70) return "#1D9E75";
  if (score > 0)   return "#f59e0b";
  return "#334155";
}

function masteryLabel(score: number): string {
  if (score >= 70) return "mastered";
  if (score > 0)   return "in progress";
  return "not started";
}

// ── Custom concept node ───────────────────────────────────────────────────

function ConceptNode({ data }: NodeProps) {
  const score = data.mastery_score as number;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.setProperty("--node-color", masteryColor(score));
    ref.current.style.setProperty("--node-pct", `${score}%`);
  }, [score]);

  return (
    <div
      ref={ref}
      className="concept-node px-3 py-2.5 rounded-xl border bg-[#0d1117] w-[180px] shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
    >
      <Handle type="target" position={Position.Top} />
      <p className="text-xs font-semibold text-slate-100 leading-tight truncate mb-1">
        {data.label as string}
      </p>
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1 rounded-full bg-slate-700 overflow-hidden">
          <div className="concept-bar-fill h-full rounded-full transition-all" />
        </div>
        <span className="concept-score text-[9px] font-medium">{score}%</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const NODE_TYPES = { concept: ConceptNode };

// ── Node detail tooltip ───────────────────────────────────────────────────

function NodeTooltip({
  node,
  goalId,
  onClose,
}: {
  node: KGNode;
  goalId: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const color = masteryColor(node.mastery_score);
    ref.current.style.setProperty("--tip-color", color);
    ref.current.style.setProperty("--tip-color-bg", `${color}20`);
    ref.current.style.setProperty("--tip-pct", `${node.mastery_score}%`);
  }, [node.mastery_score]);

  return (
    <div
      ref={ref}
      className="node-tooltip absolute top-4 right-4 z-10 w-72 rounded-xl border border-slate-700/60 bg-[#0d1117]/95 backdrop-blur-sm p-4 shadow-2xl"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-100">{node.name}</p>
          <span className="tooltip-badge text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full">
            {masteryLabel(node.mastery_score)}
          </span>
        </div>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs">
          ✕
        </button>
      </div>
      {node.description && (
        <p className="text-xs text-slate-400 leading-relaxed mb-3">{node.description}</p>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div className="tooltip-bar-fill h-full rounded-full transition-all" />
        </div>
        <span className="tooltip-score text-xs font-semibold">{node.mastery_score}%</span>
      </div>
      {goalId && (
        <button
          type="button"
          onClick={() => router.push(`/paths/current?goal_id=${goalId}`)}
          className="w-full flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
        >
          Go to Learning path
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2 5.5h7M6.5 3l2 2.5-2 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Filter + legend config ────────────────────────────────────────────────

const FILTERS: { value: EdgeType | "all"; label: string; activeCls: string; dotCls: string }[] = [
  { value: "all",          label: "All edges",     activeCls: "filter-active-slate",  dotCls: "" },
  { value: "prerequisite", label: "Prerequisites", activeCls: "filter-active-teal",   dotCls: "bg-[#1D9E75]" },
  { value: "related",      label: "Related",       activeCls: "filter-active-slate",  dotCls: "bg-[#64748b]" },
  { value: "part_of",      label: "Part of",       activeCls: "filter-active-violet", dotCls: "bg-[#7c3aed]" },
  { value: "example_of",   label: "Example of",    activeCls: "filter-active-amber",  dotCls: "bg-[#d97706]" },
];

const LEGEND = [
  { cls: "legend-dot-teal",  label: "Mastered ≥70%" },
  { cls: "legend-dot-amber", label: "In progress >0%" },
  { cls: "legend-dot-slate", label: "Not started" },
];

// ── Main page ─────────────────────────────────────────────────────────────

export default function GraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [rawNodes, setRawNodes] = useState<KGNode[]>([]);
  const [rawEdges, setRawEdges] = useState<KGEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<EdgeType | "all">("all");
  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | "all">("all");

  const buildGraph = useCallback(
    (kgNodes: KGNode[], kgEdges: KGEdge[], edgeFilter: EdgeType | "all") => {
      const nodeIds = new Set(kgNodes.map((n) => n.id));
      const filtered = (edgeFilter === "all" ? kgEdges : kgEdges.filter((e) => e.type === edgeFilter))
        .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

      const rfNodes: Node[] = kgNodes.map((n) => ({
        id: n.id,
        type: "concept",
        position: { x: 0, y: 0 },
        data: { label: n.name, mastery_score: n.mastery_score },
      }));

      const rfEdges: Edge[] = filtered.map((e, i) => {
        const s = EDGE_STYLES[e.type] ?? EDGE_STYLES.related;
        return {
          id: `e-${i}`,
          source: e.source,
          target: e.target,
          label: s.label,
          labelStyle: { fill: s.color, fontSize: 9, fontWeight: 500 },
          labelBgStyle: { fill: "#0d1117", fillOpacity: 0.8 },
          style: { stroke: s.color, strokeWidth: 1.5, strokeDasharray: s.dashed ? "5 3" : undefined },
          markerEnd: { type: MarkerType.ArrowClosed, color: s.color, width: 12, height: 12 },
          animated: e.type === "prerequisite",
        };
      });

      setNodes(applyDagreLayout(rfNodes, rfEdges));
      setEdges(rfEdges);
    },
    [setNodes, setEdges],
  );

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const [graphRes, goalsRes] = await Promise.all([
        apiClient.getGraph(),
        apiClient.listGoals(),
      ]);
      if (!graphRes.success || !graphRes.data) {
        setError(graphRes.error ?? "Failed to load graph");
        setIsLoading(false);
        return;
      }
      setRawNodes(graphRes.data.nodes);
      setRawEdges(graphRes.data.edges);
      if (goalsRes.success && goalsRes.data && goalsRes.data.length > 0) {
        setGoals(goalsRes.data);
        setSelectedGoalId(goalsRes.data[0].id);
      } else {
        buildGraph(graphRes.data.nodes, graphRes.data.edges, "all");
      }
      setIsLoading(false);
    })();
  }, [buildGraph]);

  const displayNodes = useMemo(() => {
    if (selectedGoalId === "all") return rawNodes;
    const goal = goals.find((g) => g.id === selectedGoalId);
    if (!goal || !goal.source_ids?.length) return rawNodes;
    return rawNodes.filter((n) => goal.source_ids.includes(n.source_id ?? ""));
  }, [rawNodes, goals, selectedGoalId]);

  useEffect(() => {
    if (rawNodes.length === 0) return;
    buildGraph(displayNodes, rawEdges, filter);
  }, [filter, displayNodes, rawEdges, buildGraph]);

  function onNodeClick(_: React.MouseEvent, node: Node) {
    setSelectedNode(rawNodes.find((n) => n.id === node.id) ?? null);
  }

  const activeGoalId = selectedGoalId === "all" ? null : selectedGoalId;

  return (
    <div className="flex flex-col h-screen">
      {/* ── Header ── */}
      <div className="px-8 py-5 border-b border-slate-800 flex-shrink-0 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Concept Map</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {displayNodes.length} concept{displayNodes.length !== 1 ? "s" : ""} — click a node to explore
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {goals.length > 0 && (
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="h-8 px-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:border-slate-600 focus:outline-none focus:border-primary transition-colors max-w-[200px]"
            >
              <option value="all">All paths</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.goal_text.length > 38 ? `${g.goal_text.slice(0, 38)}…` : g.goal_text}
                </option>
              ))}
            </select>
          )}

          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  active
                    ? `${f.activeCls} text-white border-transparent`
                    : "border-slate-700 text-slate-400 hover:border-slate-600",
                ].join(" ")}
              >
                {f.dotCls && (
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? "bg-white" : f.dotCls}`} />
                )}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="px-8 py-2 border-b border-slate-800/50 flex items-center gap-6 flex-shrink-0 bg-slate-900/40">
        <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">Mastery</span>
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${item.cls}`} />
            <span className="text-[10px] text-slate-500">{item.label}</span>
          </div>
        ))}
        <span className="ml-auto text-[10px] text-slate-600">Scroll to zoom · Drag to pan</span>
      </div>

      {/* ── Canvas ── */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        )}
        {!isLoading && !error && displayNodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <p className="text-sm text-slate-400">No concepts yet.</p>
            <p className="text-xs text-slate-600">Upload documents to build your concept map.</p>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          className="graph-canvas"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={24} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(n) => masteryColor((n.data?.mastery_score as number) ?? 0)}
            maskColor="rgba(0,0,0,0.6)"
          />
        </ReactFlow>

        {selectedNode && (
          <NodeTooltip node={selectedNode} goalId={activeGoalId} onClose={() => setSelectedNode(null)} />
        )}
      </div>
    </div>
  );
}
