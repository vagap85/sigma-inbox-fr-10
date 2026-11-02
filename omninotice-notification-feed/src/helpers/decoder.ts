const ENTITIES: Record<string, string> = {
  "&nbsp;": "\u00A0",
  "&mdash;": "—",
  "&ndash;": "–",
  "&laquo;": "«",
  "&raquo;": "»",
  "&amp;": "&",
};

const ENTITY_RE = /&(?:nbsp|mdash|ndash|laquo|raquo|amp);/g;

export function decode(s: string): string;
export function decode(s: string | undefined): string | undefined;
export function decode(s: string | undefined) {
  return s?.replace(ENTITY_RE, (m) => ENTITIES[m]);
}
