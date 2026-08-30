export interface CoverPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
}

export const coverPresets: CoverPreset[] = [
  {
    id: "terminal-matrix",
    name: "Terminal Core Matrix",
    category: "Cyberpunk Terminal",
    url: "/covers/cover-terminal-matrix.svg",
    description: "Linux kernel architecture, memory allocation, and glowing green code streams.",
  },
  {
    id: "circuit-blueprint",
    name: "RISC-V Circuit Blueprint",
    category: "Hardware & Architecture",
    url: "/covers/cover-circuit-blueprint.svg",
    description: "64-bit microchip CPU package, gold circuit traces, and telemetry clock lines.",
  },
  {
    id: "cyber-grid",
    name: "Cryptographic Mesh",
    category: "Cybersecurity & Networks",
    url: "/covers/cover-cyber-grid.svg",
    description: "AES-256 primitives, ECDH key exchange, and neon cyan polygonal topology.",
  },
  {
    id: "algorithm-tree",
    name: "Algorithmic Tree & Big-O",
    category: "Data Structures",
    url: "/covers/cover-algorithm-tree.svg",
    description: "Binary search tree node traversal, Dijkstra graph, and asymptotic complexity curves.",
  },
  {
    id: "retro-hacker",
    name: "x86_64 Disassembler",
    category: "Assembly & Low Level",
    url: "/covers/cover-retro-hacker.svg",
    description: "Amber phosphor CRT, assembly opcodes, syscalls, and general-purpose registers.",
  },
];
