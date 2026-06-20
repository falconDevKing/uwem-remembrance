export default function EventDetails() {
  return (
    <div className="mt-6 space-y-4 text-center lg:text-left">
      <div className="flex justify-center lg:justify-start">
        <div className="h-px w-16 bg-gold" />
      </div>

      <h2 className="font-display text-2xl font-semibold text-foreground">
        In Loving Memory
      </h2>
      <p className="text-lg text-muted">
        Wife, Mother, Sister, Colleague and Mentor
      </p>

      <div className="space-y-2 text-base text-foreground">
        <div className="flex items-center justify-center gap-2 lg:justify-start">
          <svg
            className="h-5 w-5 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
          <span>Saturday, July 4th, 2026</span>
        </div>

        <div className="flex items-center justify-center gap-2 lg:justify-start">
          <svg
            className="h-5 w-5 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <span>11:00 AM</span>
        </div>

        <div className="flex items-center justify-center gap-2 lg:justify-start">
          <svg
            className="h-5 w-5 text-gold flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <span>Amen Event Center, Abesan Estate Gate, Ipaja, Lagos</span>
        </div>
      </div>
    </div>
  );
}
