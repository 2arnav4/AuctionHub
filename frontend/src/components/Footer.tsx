const techStack = [
  "React",
  "TypeScript",
  "Express",
  "Socket.IO",
  "MongoDB",
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <p className="text-xs text-text-muted">
          Mini Realtime Auction Room
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-border bg-surface-raised px-2.5 py-1 text-xs text-text-secondary"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
