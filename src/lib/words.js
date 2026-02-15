export const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "great", "between", "need", "large", "under", "never", "city", "tree", "cross", "farm",
  "hard", "start", "might", "story", "far", "sea", "draw", "left", "late", "run",
  "while", "press", "close", "night", "real", "life", "few", "north", "open", "seem",
  "together", "next", "white", "children", "begin", "got", "walk", "example", "ease", "paper",
  "group", "always", "music", "those", "both", "mark", "often", "letter", "until", "mile",
  "river", "car", "feet", "care", "second", "book", "carry", "took", "rain", "eat",
  "room", "friend", "began", "idea", "fish", "mountain", "stop", "once", "base", "hear",
  "horse", "cut", "sure", "watch", "color", "face", "wood", "main", "enough", "plain",
  "girl", "usual", "young", "ready", "above", "ever", "red", "list", "though", "feel",
  "talk", "bird", "soon", "body", "dog", "family", "direct", "pose", "leave", "song",
  "measure", "door", "product", "black", "short", "numeral", "class", "wind", "question", "happen",
  "complete", "ship", "area", "half", "rock", "order", "fire", "south", "problem", "piece",
  "told", "knew", "pass", "since", "top", "whole", "king", "space", "heard", "best",
  "hour", "better", "true", "during", "hundred", "five", "remember", "step", "early", "hold",
  "west", "ground", "interest", "reach", "fast", "verb", "sing", "listen", "six", "table",
];

export const CODE_WORDS = [
  "function", "return", "const", "let", "var", "class", "import", "export", "default",
  "async", "await", "promise", "callback", "array", "object", "string", "number", "boolean",
  "null", "undefined", "typeof", "instanceof", "interface", "type", "enum", "module",
  "render", "component", "state", "props", "effect", "context", "reducer", "dispatch",
  "fetch", "response", "request", "server", "client", "route", "middleware", "handler",
  "database", "query", "schema", "model", "migration", "index", "primary", "foreign",
  "docker", "container", "image", "volume", "network", "deploy", "build", "test",
  "git", "commit", "branch", "merge", "rebase", "push", "pull", "clone",
  "algorithm", "binary", "tree", "graph", "stack", "queue", "hash", "sort",
  "debug", "error", "warning", "log", "trace", "config", "environment", "variable",
];

export function generateText(wordList, count = 30) {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(wordList[Math.floor(Math.random() * wordList.length)]);
  }
  return words;
}
