export default {
  "*": {
    deny: [
      "denied-word1",
      "denied-word2",
      /denied\-regexp\\d/,
    ],
    allow: [
      "allowed-word1",
      "allowed-word2",
      /allowed\-regexp\\d/,
    ],
  },
  "*.md": {
    deny: [
      "denied-md-word1",
      "denied-md-word2",
      /denied\-md\-regexp\\d/,
    ],
    allow: [
      "allowed-md-word1",
      "allowed-md-word2",
      /allowed\-md\-regexp\\d/,
    ],
  },
};
