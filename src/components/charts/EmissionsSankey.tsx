"use client";

import { useMemo } from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import type { SankeyNode, SankeyLink } from "d3-sankey";
import { CATEGORY_COLOR, SCOPE_COLOR } from "@/lib/domain/constants";
import type { SankeyInput, SankeyNodeDatum, SankeyLinkDatum } from "@/lib/domain/aggregate";
import type { ActivityType, Scope } from "@/types";

const VIEW_W = 960;
const VIEW_H = 300;
const NODE_W = 14;
const NODE_PAD = 14;
const LEFT_MARGIN = 130;
const RIGHT_MARGIN = 110;

const pathGen = sankeyLinkHorizontal<SankeyNodeDatum, SankeyLinkDatum>();

type LayoutNode = SankeyNode<SankeyNodeDatum, SankeyLinkDatum>;
type LayoutLink = SankeyLink<SankeyNodeDatum, SankeyLinkDatum>;

function resolveNodeColor(node: LayoutNode): string {
  if (node.kind === "activity") return "var(--fg-4)";
  if (node.kind === "category") return CATEGORY_COLOR[node.id as ActivityType] ?? "var(--fg-3)";
  if (node.kind === "scope") return SCOPE_COLOR[node.id as Scope] ?? "var(--fg-3)";
  return "var(--fg-2)";
}

function resolveActivityLabelSize(height: number): number {
  if (height >= 28) return 10;
  if (height >= 18) return 9;
  if (height >= 12) return 8;
  return 7;
}

function renderCategoryLabel(node: LayoutNode): React.ReactElement | null {
  const x0 = node.x0 ?? 0;
  const x1 = node.x1 ?? 0;
  const y0 = node.y0 ?? 0;
  const y1 = node.y1 ?? 0;
  const height = y1 - y0;
  if (height <= 12) return null;
  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  return (
    <text
      x={midX}
      y={midY}
      textAnchor="middle"
      fontSize={10}
      fill="black"
      dominantBaseline="middle"
      fontWeight={500}
    >
      {node.label}
    </text>
  );
}

function renderActivityLabel(node: LayoutNode): React.ReactElement {
  const x0 = node.x0 ?? 0;
  const y0 = node.y0 ?? 0;
  const y1 = node.y1 ?? 0;
  const height = y1 - y0;
  const midY = (y0 + y1) / 2;
  const value = node.value ?? 0;
  const fontSize = resolveActivityLabelSize(height);
  const lineOffset = fontSize * 0.7;
  return (
    <>
      <text
        x={x0 - 8}
        y={midY - lineOffset}
        textAnchor="end"
        fontSize={fontSize}
        fill="var(--fg-2)"
        dominantBaseline="middle"
      >
        {node.label}
      </text>
      <text
        x={x0 - 8}
        y={midY + lineOffset}
        textAnchor="end"
        fontSize={fontSize}
        fill="var(--fg-4)"
        dominantBaseline="middle"
        fontFamily="var(--font-mono)"
      >
        {value.toFixed(2)} t
      </text>
    </>
  );
}

function renderScopeLabel(node: LayoutNode, total: number): React.ReactElement | null {
  const x0 = node.x0 ?? 0;
  const x1 = node.x1 ?? 0;
  const y0 = node.y0 ?? 0;
  const y1 = node.y1 ?? 0;
  const height = y1 - y0;
  if (height <= 12) return null;
  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  const value = node.value ?? 0;
  const showPercent = height > 24;
  return (
    <>
      <text
        x={midX}
        y={showPercent ? midY - 7 : midY}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
        fill="black"
        dominantBaseline="middle"
      >
        {node.label}
      </text>
      {showPercent && (
        <text
          x={midX}
          y={midY + 7}
          textAnchor="middle"
          fontSize={9}
          fill="rgba(0,0,0,0.6)"
          dominantBaseline="middle"
          fontFamily="var(--font-mono)"
        >
          {total > 0 ? ((value / total) * 100).toFixed(0) : 0}%
        </text>
      )}
    </>
  );
}

function renderTotalLabel(node: LayoutNode): React.ReactElement {
  const x1 = node.x1 ?? 0;
  const y0 = node.y0 ?? 0;
  const y1 = node.y1 ?? 0;
  const midY = (y0 + y1) / 2;
  const value = node.value ?? 0;
  return (
    <>
      <text x={x1 + 12} y={midY - 16} fontSize={10} fill="var(--fg-3)" dominantBaseline="middle">
        Total PCF
      </text>
      <text
        x={x1 + 12}
        y={midY}
        fontSize={22}
        fontWeight={700}
        fill="var(--fg)"
        dominantBaseline="middle"
        fontFamily="var(--font-mono)"
      >
        {value.toFixed(1)}
      </text>
      <text x={x1 + 12} y={midY + 16} fontSize={10} fill="var(--fg-4)" dominantBaseline="middle">
        tCO₂e
      </text>
    </>
  );
}

function renderNodeLabel(node: LayoutNode, total: number): React.ReactElement | null {
  switch (node.kind) {
    case "category":
      return renderCategoryLabel(node);
    case "activity":
      return renderActivityLabel(node);
    case "scope":
      return renderScopeLabel(node, total);
    case "total":
      return renderTotalLabel(node);
    default:
      return null;
  }
}

interface EmissionsSankeyProps {
  data: SankeyInput;
}

export default function EmissionsSankey({ data }: EmissionsSankeyProps): React.ReactElement {
  const graph = useMemo(() => {
    if (data.nodes.length === 0) return null;

    const gen = sankey<SankeyNodeDatum, SankeyLinkDatum>()
      .nodeId((d) => d.id)
      .nodeWidth(NODE_W)
      .nodePadding(NODE_PAD)
      .extent([
        [LEFT_MARGIN, 8],
        [VIEW_W - RIGHT_MARGIN, VIEW_H - 8],
      ]);

    return gen({
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.links.map((l) => ({ ...l })),
    });
  }, [data]);

  const colorByNodeId = useMemo(() => {
    if (!graph) return new Map<string, string>();
    return new Map(graph.nodes.map((n) => [n.id, resolveNodeColor(n)]));
  }, [graph]);

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="muted text-[length:var(--t-sm)]">데이터 없음</p>
      </div>
    );
  }

  const { total } = data;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full h-auto"
      role="img"
      aria-label="PCF Sankey 차트"
    >
      {graph.links.map((link: LayoutLink) => {
        const sourceId = (link.source as LayoutNode).id;
        const targetId = (link.target as LayoutNode).id;
        return (
          <path
            key={`${sourceId}-${targetId}`}
            d={pathGen(link) ?? ""}
            fill="none"
            stroke={colorByNodeId.get(sourceId) ?? "var(--fg-3)"}
            strokeOpacity={0.25}
            strokeWidth={Math.max(1, link.width ?? 0)}
          />
        );
      })}

      {graph.nodes.map((node: LayoutNode) => (
        <g key={node.id}>
          <rect
            x={node.x0 ?? 0}
            y={node.y0 ?? 0}
            width={(node.x1 ?? 0) - (node.x0 ?? 0)}
            height={(node.y1 ?? 0) - (node.y0 ?? 0)}
            fill={colorByNodeId.get(node.id) ?? "var(--fg-3)"}
            rx={2}
          />
          {renderNodeLabel(node, total)}
        </g>
      ))}
    </svg>
  );
}
