import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join MEC Computer Club | Membership Recruitment & Access Keys",
  description:
    "Join the official computer club of Murari Chand College (MEC), Sylhet. Activate your student membership key or apply during open recruitment intakes.",
  keywords: [
    "Join MEC Computer Club",
    "MEC Computer Club registration",
    "MEC CC invitation key",
    "Murari Chand College club recruitment",
    "MEC CSE membership",
  ],
  alternates: {
    canonical: "https://meccomputerclub.org/join",
  },
  openGraph: {
    title: "Join MEC Computer Club | Membership Recruitment",
    description:
      "Become a member of MEC Computer Club. Compete in ICPC, build real-world software, and collaborate with 70+ student engineers in Sylhet.",
    url: "https://meccomputerclub.org/join",
    images: ["/mec-club-photo.jpg"],
  },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
