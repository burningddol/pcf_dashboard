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

type LayoutNode = SankeyNode<SankeyNodeDatum, SankeyLinkDatum>;
type LayoutLink = SankeyLink<SankeyNodeDatum, SankeyLinkDatum>;

function resolveNodeColor(node: LayoutNode): string {
  if (node.kind === "activity") return "var(--fg-4)";
  if (node.kind === "category") return CATEGORY_COLOR[node.label as ActivityType] ?? "var(--fg-3)";
  if (node.kind === "scope") return SCOPE_COLOR[node.id as Scope] ?? "var(--fg-3)";
  return "var(--fg-2)";
}

function renderNodeLabel(node: LayoutNode, total: number): React.ReactElement | null {
  const x0 = node.x0 ?? 0;
  const x1 = node.x1 ?? 0;
  const y0 = node.y0 ?? 0;
  const y1 = node.y1 ?? 0;
  const midY = (y0 + y1) / 2;
  const height = y1 - y0;

  switch (node.kind) {
    case "category":
      if (height <= 20) return null;
      return (
        <text
          x={(x0 + x1) / 2}
          y={midY}
          textAnchor="middle"
          fontSize={9}
          fill="white"
          dominantBaseline="middle"
          fontWeight={500}
        >
          {node.label}
        </text>
      );
    case "activity":
      return (
        <>
          <text
            x={x0 - 8}
            y={midY - 6}
            textAnchor="end"
            fontSize={11}
            fill="var(--fg-2)"
            dominantBaseline="middle"
          >
            {node.label}
          </text>
          <text
            x={x0 - 8}
            y={midY + 7}
            textAnchor="end"
            fontSize={10}
            fill="var(--fg-4)"
            dominantBaseline="middle"
            fontFamily="var(--font-mono)"
          >
            {(node.value ?? 0).toFixed(2)} t
          </text>
        </>
      );
    case "scope":
      if (height <= 28) return null;
      return (
        <>
          <text
            x={(x0 + x1) / 2}
            y={midY - 7}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill="white"
            dominantBaseline="middle"
          >
            {node.label}
          </text>
          <text
            x={(x0 + x1) / 2}
            y={midY + 7}
            textAnchor="middle"
            fontSize={9}
            fill="rgba(255,255,255,0.8)"
            dominantBaseline="middle"
            fontFamily="var(--font-mono)"
          >
            {total > 0 ? (((node.value ?? 0) / total) * 100).toFixed(0) : 0}%
          </text>
        </>
      );
    case "total":
      return (
        <>
          <text
            x={x1 + 12}
            y={midY - 16}
            fontSize={10}
            fill="var(--fg-3)"
            dominantBaseline="middle"
          >
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
            {(node.value ?? 0).toFixed(1)} t
          </text>
          <text
            x={x1 + 12}
            y={midY + 16}
            fontSize={10}
            fill="var(--fg-4)"
            dominantBaseline="middle"
          >
            tCO₂e
          </text>
        </>
      );
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

  if (!graph || graph.nodes.length === 0) {
    return (
      <div
        style={{
          height: VIEW_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p className="muted" style={{ fontSize: "var(--t-sm)" }}>
          데이터 없음
        </p>
      </div>
    );
  }

  const pathGen = sankeyLinkHorizontal<SankeyNodeDatum, SankeyLinkDatum>();
  const { total } = data;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      style={{ width: "100%", height: "auto" }}
      role="img"
      aria-label="PCF Sankey 차트"
    >
      {graph.links.map((link: LayoutLink, i: number) => {
        const color = resolveNodeColor(link.source as LayoutNode);
        return (
          <path
            key={i}
            d={pathGen(link) ?? ""}
            fill="none"
            stroke={color}
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
            fill={resolveNodeColor(node)}
            rx={2}
          />
          <g>{renderNodeLabel(node, total)}</g>
        </g>
      ))}
    </svg>
  );
}
