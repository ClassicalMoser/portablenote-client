export const boundaries = [
  {
    identifier: "@interface",
    dir: "",
    alias: "@interface",
    allowImportsFrom: ["@application", "@composition", "@domain"],
  },
  {
    identifier: "@composition",
    dir: "composition",
    alias: "@composition",
    allowImportsFrom: ["@application", "@domain", "@infrastructure"],
  },
  {
    identifier: "@application",
    dir: "application",
    alias: "@application",
    allowImportsFrom: ["@domain", "@infrastructure"],
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
