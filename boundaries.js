export const boundaries = [
  {
    identifier: "@interface",
    dir: "interface",
    alias: "@interface",
    allowImportsFrom: ["@domain", "@infrastructure"],
  },
  {
    identifier: "@application",
    dir: "application",
    alias: "@application",
    allowImportsFrom: ["@domain"],
  },
  {
    identifier: "@domain",
    dir: "domain",
    alias: "@domain",
  },
  {
    identifier: "@infrastructure",
    dir: "infrastructure",
    alias: "@infrastructure",
    allowImportsFrom: ["@domain"],
  },
];
