"use client";

import { useSyncExternalStore } from "react";
import { Quote } from "lucide-react";

const QUOTES: { text: string; author: string }[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
  { text: "Procrastination is the thief of time.", author: "Edward Young" },
  { text: "A little progress each day adds up to big results.", author: "Unknown" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
];

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function getQuoteOfDay(): { text: string; author: string } {
  // Use day-of-year as seed for consistent daily rotation
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
}

export function MotivationQuote() {
  const mounted = useMounted();
  if (!mounted) return null;

  const quote = getQuoteOfDay();

  return (
    <div
      className="paper-pop"
      style={{
        marginBottom: "1.25rem",
        padding: "0.85rem 1rem",
        border: "2px dashed #8b8612",
        background:
          "repeating-linear-gradient(45deg, #fbf6d8, #fbf6d8 10px, #f5f0c6 10px, #f5f0c6 20px)",
        display: "flex",
        gap: "0.7rem",
        alignItems: "flex-start",
        boxShadow: "2px 2px 0 rgba(139,134,18,0.15)",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "32px",
          height: "32px",
          border: "2px solid #8b8612",
          background: "#fffdf7",
        }}
      >
        <Quote size={16} color="#8b8612" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: "'Neucha', cursive",
            fontSize: "0.95rem",
            color: "#5a5308",
            lineHeight: 1.4,
            fontStyle: "italic",
          }}
        >
          &ldquo;{quote.text}&rdquo;
        </p>
        <small
          style={{
            display: "block",
            marginTop: "0.25rem",
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "0.8rem",
            color: "#8b8612",
            textAlign: "right",
          }}
        >
          - {quote.author}
        </small>
      </div>
    </div>
  );
}
