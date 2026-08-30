import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { leaderboard, contests, cpResources } from "@/data/cp";
import "./cp-hub.css";

export const metadata: Metadata = {
  title: "CP Hub",
  description: "MEC Computer Club Competitive Programming hub — leaderboard, contest calendar, resources, and editorials.",
};

export default function CPHubPage() {
  return (
    <>
      <section className="section cp-hero">
        <div className="container">
          <span className="kicker">Competitive Programming</span>
          <h1>CP Hub</h1>
          <p className="cp-hero__subtitle">
            Leaderboard, contest calendar, and curated resources — everything
            the CP team needs in one place.
          </p>
        </div>
      </section>

      {/* Contest Calendar */}
      <section className="section" id="contests">
        <div className="container">
          <h2>Scheduled Contests</h2>
          <div className="cp-contests">
            {contests.map((c) => {
              const isPast = new Date(c.date) < new Date();
              return (
                <div key={c.id} className="cp-contest">
                  <div className="cp-contest__date">
                    <span className="cp-contest__month">
                      {new Date(c.date).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="cp-contest__day">
                      {new Date(c.date).getDate()}
                    </span>
                  </div>
                  <div className="cp-contest__info">
                    <div className="cp-contest__header">
                      <h4>{c.name}</h4>
                      <Badge variant={isPast ? "past" : "upcoming"} size="sm">
                        {isPast ? "Past" : "Upcoming"}
                      </Badge>
                    </div>
                    <span className="cp-contest__platform">{c.platform}</span>
                    {c.results && (
                      <p className="cp-contest__results">{c.results.highlights}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="section section--alt" id="leaderboard">
        <div className="container">
          <h2>Leaderboard</h2>
          <p className="cp-leaderboard-subtitle">Codeforces ratings, updated weekly.</p>
          <div className="cp-leaderboard">
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
        </div>
      </section>

      {/* Resources */}
      <section className="section" id="resources">
        <div className="container">
          <h2>Docs, Algorithms & Editorials</h2>
          <div className="cp-resources">
            {cpResources.map((r) => (
              <a key={r.id} href={r.url} className="cp-resource">
                <div className="cp-resource__type">
                  <Badge variant={r.difficulty === "beginner" ? "active" : r.difficulty === "intermediate" ? "info" : "pending"} size="sm">
                    {r.difficulty}
                  </Badge>
                  <Badge variant="default" size="sm">{r.type}</Badge>
                </div>
                <h4 className="cp-resource__title">{r.title}</h4>
                {r.author && <span className="cp-resource__author">by {r.author}</span>}
                <div className="cp-resource__tags">
                  {r.tags.map((tag) => (
                    <span key={tag} className="cp-resource__tag">{tag}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
