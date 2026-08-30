import { Metadata } from "next";
import { leaderboard } from "@/data/cp";
import "../cp-hub.css"; // Reuse the existing leaderboard CSS

export const metadata: Metadata = {
  title: "Leaderboard | CP Hub | MEC Computer Club",
};

export default function LeaderboardPage() {
  return (
    <main className="section container">
      <div className="section-header text-center">
        <span className="kicker">CP Hub</span>
        <h2>Leaderboard</h2>
        <p className="cp-leaderboard-subtitle" style={{ textAlign: "center" }}>Codeforces ratings, updated weekly.</p>
      </div>
      
      <div className="cp-leaderboard" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="cp-leaderboard__header">
          <span>#</span>
          <span>Member</span>
          <span>Handle</span>
          <span>Rating</span>
          <span>Solved</span>
        </div>
        {leaderboard.map((entry) => (
          <div key={entry.rank} className={`cp-leaderboard__row ${entry.rank <= 3 ? `cp-leaderboard__row--top-${entry.rank}` : ""}`}>
            <span className="cp-leaderboard__rank">
              #{entry.rank}
            </span>
            <span className="cp-leaderboard__name">{entry.name}</span>
            <span className="cp-leaderboard__handle">@{entry.handle}</span>
            <span className="cp-leaderboard__rating">{entry.rating}</span>
            <span className="cp-leaderboard__solved">{entry.solved}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
