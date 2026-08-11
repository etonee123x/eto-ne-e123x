'use client';

export default function GlobalError({
  error,
  retry,
}: Readonly<{ error: Error & { digest?: string }; retry: () => void }>) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button
          onClick={() => {
            retry();
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
