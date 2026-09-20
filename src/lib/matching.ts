import "server-only";
import { parseTags } from "@/lib/validation";
import type { ProviderTrack, RequirementCategory } from "@/generated/prisma/enums";

export type MatchCandidate = {
  providerUserId: string;
  name: string;
  track: ProviderTrack;
  headline: string;
  tags: string;
  hourlyRate: number | null;
  yearsExperience: number | null;
};

export type ScoredCandidate = MatchCandidate & {
  score: number;
  matchedTags: string[];
  reason: string;
};

const TRACK_BY_CATEGORY: Record<RequirementCategory, ProviderTrack> = {
  DEV: "DEV",
  TEST: "TEST",
  OPS: "OPS",
};

/**
 * Rule-based matching: track alignment (60%) + tag overlap (30%) + experience (10%).
 * Always available, no external dependency. This is the fallback used whenever the
 * optional LLM-assisted pass (see `explainMatchesWithAI`) is unavailable or fails.
 */
export function rankCandidates(
  requirement: { category: RequirementCategory; tags: string; budgetMin: number | null; budgetMax: number | null },
  candidates: MatchCandidate[]
): ScoredCandidate[] {
  const requirementTags = new Set(parseTags(requirement.tags));
  const targetTrack = TRACK_BY_CATEGORY[requirement.category];

  return candidates
    .map((candidate) => {
      const candidateTags = parseTags(candidate.tags);
      const matchedTags = candidateTags.filter((tag) => requirementTags.has(tag));
      const tagScore =
        requirementTags.size === 0 ? 0.5 : matchedTags.length / requirementTags.size;
      const trackScore = candidate.track === targetTrack ? 1 : 0;
      const experienceScore = candidate.yearsExperience
        ? Math.min(candidate.yearsExperience / 8, 1)
        : 0.2;

      const budgetFit = scoreBudgetFit(requirement, candidate.hourlyRate);

      const score =
        trackScore * 0.5 + tagScore * 0.3 + experienceScore * 0.1 + budgetFit * 0.1;

      const reason = buildReason({ trackScore, matchedTags, candidate });

      return {
        ...candidate,
        score: Math.round(score * 100) / 100,
        matchedTags,
        reason,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export type ScoredRequirement<T> = T & { score: number; matchedTags: string[]; reason: string };

/**
 * Same scoring model as `rankCandidates`, viewed from a single provider's side: given one
 * candidate, ranks a list of open requirements by fit. Used for the provider's "recommended
 * for you" dashboard feed.
 */
export function rankRequirementsForCandidate<
  T extends { category: RequirementCategory; tags: string; budgetMin: number | null; budgetMax: number | null }
>(candidate: MatchCandidate, requirements: T[]): ScoredRequirement<T>[] {
  return requirements
    .map((requirement) => {
      const [scored] = rankCandidates(requirement, [candidate]);
      return { ...requirement, score: scored.score, matchedTags: scored.matchedTags, reason: scored.reason };
    })
    .sort((a, b) => b.score - a.score);
}

function scoreBudgetFit(
  requirement: { budgetMin: number | null; budgetMax: number | null },
  hourlyRate: number | null
) {
  if (!hourlyRate || (!requirement.budgetMin && !requirement.budgetMax)) return 0.5;
  const max = requirement.budgetMax ?? Infinity;
  const min = requirement.budgetMin ?? 0;
  return hourlyRate >= min && hourlyRate <= max ? 1 : 0.2;
}

function buildReason({
  trackScore,
  matchedTags,
  candidate,
}: {
  trackScore: number;
  matchedTags: string[];
  candidate: MatchCandidate;
}) {
  const parts: string[] = [];
  parts.push(trackScore === 1 ? `方向匹配（${candidate.track}）` : "方向不完全匹配");
  if (matchedTags.length > 0) {
    parts.push(`技能重合：${matchedTags.join("、")}`);
  } else {
    parts.push("暂无重合技能标签");
  }
  if (candidate.yearsExperience) {
    parts.push(`经验 ${candidate.yearsExperience} 年`);
  }
  return parts.join(" · ");
}

/**
 * Optional LLM-assisted pass: asks Claude to extract structured skill tags and a short
 * estimate from a free-text requirement description. Returns null (caller should fall
 * back to manual tags) whenever ANTHROPIC_API_KEY is not configured or the call fails.
 */
export async function analyzeRequirementWithAI(input: {
  title: string;
  description: string;
  category: RequirementCategory;
}): Promise<{ tags: string[]; summary: string } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 400,
        system:
          "你是软件外包平台的需求分析助手。根据需求标题与描述，提取用于人才匹配的技能标签，并给出一句话的工作量/难度评估。只输出 JSON，不要输出其他内容。",
        messages: [
          {
            role: "user",
            content: `类别: ${input.category}\n标题: ${input.title}\n描述: ${input.description}\n\n请输出如下 JSON 格式：{"tags": ["tag1", "tag2"], "summary": "一句话评估"}`,
          },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = data.content?.find((block) => block.type === "text")?.text;
    if (!text) return null;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as { tags?: string[]; summary?: string };

    return {
      tags: Array.isArray(parsed.tags) ? parsed.tags.map((tag) => String(tag).toLowerCase()) : [],
      summary: parsed.summary ?? "",
    };
  } catch {
    return null;
  }
}
