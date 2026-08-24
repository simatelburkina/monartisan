export function RatingStars({
  value,
  count,
  size = 16,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex" aria-label={`${value.toFixed(1)} sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill={i < rounded ? "#f59e0b" : "#e7e0d4"}
            aria-hidden="true"
          >
            <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.79L10 14.9l-5.21 2.6 1-5.79-4.21-4.1 5.82-.85L10 1.5z" />
          </svg>
        ))}
      </span>
      {typeof count === "number" && (
        <span className="text-sm text-muted-foreground">
          {value > 0 ? value.toFixed(1) : "Nouveau"} {count > 0 && `(${count})`}
        </span>
      )}
    </span>
  );
}
