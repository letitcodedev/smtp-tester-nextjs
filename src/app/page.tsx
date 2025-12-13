import SMTPTestForm from "@/components/SMTPTestForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              SMTP Connection Tester
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
              Test your SMTP server configuration by verifying connection, authentication,
              and optionally sending a test email.
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-lg bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 sm:p-8">
            <SMTPTestForm />
          </div>

          {/* Info Section */}
          <div className="mt-10 max-w-lg w-full">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
              Common SMTP Settings
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                provider="Gmail"
                host="smtp.gmail.com"
                ports="465 (SSL) / 587 (TLS)"
                note="Requires App Password"
              />
              <InfoCard
                provider="Outlook/Office 365"
                host="smtp.office365.com"
                ports="587 (TLS)"
                note="Use your email as username"
              />
              <InfoCard
                provider="Yahoo Mail"
                host="smtp.mail.yahoo.com"
                ports="465 (SSL) / 587 (TLS)"
                note="Requires App Password"
              />
              <InfoCard
                provider="SendGrid"
                host="smtp.sendgrid.net"
                ports="465 (SSL) / 587 (TLS)"
                note="Use 'apikey' as username"
              />
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <p>Your credentials are only used for testing and are not stored.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  provider,
  host,
  ports,
  note,
}: {
  provider: string;
  host: string;
  ports: string;
  note: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-800/50">
      <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{provider}</h3>
      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex">
          <dt className="text-zinc-500 dark:text-zinc-400 w-14">Host:</dt>
          <dd className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">{host}</dd>
        </div>
        <div className="flex">
          <dt className="text-zinc-500 dark:text-zinc-400 w-14">Ports:</dt>
          <dd className="text-zinc-700 dark:text-zinc-300">{ports}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{note}</p>
    </div>
  );
}
