"use client";

import { useMemo } from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import type { SankeyNode, SankeyLink } from "d3-sankey";
import { ACTIVITY_LABELS, LIFECYCLE_COLORS, LIFECYCLE_STAGE_LABEL } from "@/lib/domain/constants";
import type { LifecycleStage } from "@/lib/domain/constants";
import type { SankeyInput, SankeyNodeDatum, SankeyLinkDatum } from "@/lib/domain/aggregate";
import type { ActivityType } from "@/types";

const VIEW_W = 920;
const VIEW_H = 300;
const NODE_W = 14;
const NODE_PAD = 14;
const LEFT_MARGIN = 130;
const RIGHT_MARGIN = 110;

type LayoutNode = SankeyNode<SankeyNodeDatum, SankeyLinkDatum>;
type LayoutLink = SankeyLink<SankeyNodeDatum, SankeyLinkDatum>;

function resolveNodeColor(node: LayoutNode): string {
  if (node.kind === "activity") return "var(--fg-4)";
  if (node.kind === "total") return "var(--fg-2)";
  return LIFECYCLE_COLORS[node.id as LifecycleStage] ?? "var(--fg-3)";
}

function renderNodeLabel(node: LayoutNode, total: number): React.ReactElement | null {
  const x0 = node.x0 ?? 0;
  const x1 = node.x1 ?? 0;
  const y0 = node.y0 ?? 0;
  const y1 = node.y1 ?? 0;
  const midY = (y0 + y1) / 2;
  const height = y1 - y0;

  switch (node.kind) {
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
            {ACTIVITY_LABELS[node.id as ActivityType] ?? node.label}
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
    case "stage":
      if (height <= 28) return null;
      return (
        <>
          <text
            x={(x0 + x1) / 2}
            y={midY - 7}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="white"
            dominantBaseline="middle"
          >
            {LIFECYCLE_STAGE_LABEL[node.id as LifecycleStage] ?? node.id}
          </text>
          <text
            x={(x0 + x1) / 2}
            y={midY + 7}
            textAnchor="middle"
            fontSize={10}
            fill="rgba(255,255,255,0.75)"
            dominantBaseline="middle"
            fontFamily="var(--font-mono)"
          >
            {(node.value ?? 0).toFixed(1)} t ·{" "}
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
          {renderNodeLabel(node, total)}
        </g>
      ))}
    </svg>
  );
}
