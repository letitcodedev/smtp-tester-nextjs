"use client";

import { useState, useEffect } from "react";

interface TestResult {
  success: boolean;
  message: string;
  details?: {
    connected: boolean;
    authenticated: boolean;
    testEmailSent?: boolean;
  };
  error?: string;
}

type SecurityType = "ssl" | "starttls" | "none";

const STORAGE_KEY = "smtp-tester-form";

interface SavedFormData {
  host: string;
  port: string;
  security: SecurityType;
  username: string;
  senderName: string;
  senderEmail: string;
  testRecipient: string;
}

export default function SMTPTestForm() {
  const [formData, setFormData] = useState({
    host: "",
    port: "587",
    security: "starttls" as SecurityType,
    username: "",
    password: "",
    senderName: "",
    senderEmail: "",
    testRecipient: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: SavedFormData = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          host: parsed.host || "",
          port: parsed.port || "587",
          security: parsed.security || "starttls",
          username: parsed.username || "",
          senderName: parsed.senderName || "",
          senderEmail: parsed.senderEmail || "",
          testRecipient: parsed.testRecipient || "",
          // Password is intentionally NOT restored for security
        }));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Save form data to localStorage when it changes (excluding password)
  useEffect(() => {
    const dataToSave: SavedFormData = {
      host: formData.host,
      port: formData.port,
      security: formData.security,
      username: formData.username,
      senderName: formData.senderName,
      senderEmail: formData.senderEmail,
      testRecipient: formData.testRecipient,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData.host, formData.port, formData.security, formData.username, formData.senderName, formData.senderEmail, formData.testRecipient]);

  const handleSecurityChange = (security: SecurityType) => {
    let defaultPort = "587";
    if (security === "ssl") {
      defaultPort = "465";
    } else if (security === "none") {
      defaultPort = "25";
    }
    setFormData((prev) => ({ ...prev, security, port: defaultPort }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/smtp-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: formData.host,
          port: parseInt(formData.port, 10),
          secure: formData.security === "ssl",
          username: formData.username,
          password: formData.password,
          senderName: formData.senderName || undefined,
          senderEmail: formData.senderEmail || undefined,
          testRecipient: formData.testRecipient || undefined,
        }),
      });

      const data: TestResult = await response.json();
      setResult(data);
    } catch {
      setResult({
        success: false,
        message: "Failed to connect to the server",
        error: "Network error or server unavailable",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SMTP Host */}
        <div>
          <label htmlFor="host" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            SMTP Host
          </label>
          <input
            type="text"
            id="host"
            placeholder="smtp.example.com"
            value={formData.host}
            onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>

        {/* Security Type */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Security / Encryption
          </label>
          <div className="flex gap-2">
            {(["starttls", "ssl", "none"] as SecurityType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleSecurityChange(type)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  formData.security === type
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                }`}
              >
                {type === "starttls" ? "STARTTLS" : type === "ssl" ? "SSL/TLS" : "None"}
              </button>
            ))}
          </div>
        </div>

        {/* Port */}
        <div>
          <label htmlFor="port" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Port
          </label>
          <input
            type="number"
            id="port"
            placeholder="587"
            value={formData.port}
            onChange={(e) => setFormData((prev) => ({ ...prev, port: e.target.value }))}
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Common ports: 25 (unencrypted), 465 (SSL/TLS), 587 (STARTTLS)
          </p>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="user@example.com or apikey"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            SMTP authentication username (often your email address)
          </p>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Your SMTP password or app password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              required
              className="block w-full rounded-lg border border-zinc-300 px-4 py-2.5 pr-12 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Sender Name (Optional) */}
        <div>
          <label htmlFor="senderName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Sender Name (Optional)
          </label>
          <input
            type="text"
            id="senderName"
            placeholder="My App"
            value={formData.senderName}
            onChange={(e) => setFormData((prev) => ({ ...prev, senderName: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Display name shown in the &quot;From&quot; field (e.g., &quot;My App&quot;)
          </p>
        </div>

        {/* Sender Email (Optional) */}
        <div>
          <label htmlFor="senderEmail" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Sender Email (From Address)
          </label>
          <input
            type="email"
            id="senderEmail"
            placeholder="noreply@example.com"
            value={formData.senderEmail}
            onChange={(e) => setFormData((prev) => ({ ...prev, senderEmail: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            The &quot;From&quot; address for test emails. Defaults to username if empty.
          </p>
        </div>

        {/* Test Recipient (Optional) */}
        <div>
          <label htmlFor="testRecipient" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Test Recipient Email (Optional)
          </label>
          <input
            type="email"
            id="testRecipient"
            placeholder="test@example.com"
            value={formData.testRecipient}
            onChange={(e) => setFormData((prev) => ({ ...prev, testRecipient: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            If provided, a test email will be sent to this address
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Testing Connection...
            </span>
          ) : (
            "Test SMTP Connection"
          )}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div
          className={`mt-6 rounded-lg p-4 ${
            result.success
              ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <svg
                className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <div className="flex-1">
              <h3
                className={`font-semibold ${
                  result.success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
                }`}
              >
                {result.success ? "Success" : "Failed"}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  result.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                }`}
              >
                {result.message}
              </p>

              {/* Details */}
              {result.details && (
                <div className="mt-3 space-y-1">
                  <StatusItem label="Connection" success={result.details.connected} />
                  <StatusItem label="Authentication" success={result.details.authenticated} />
                  {result.details.testEmailSent !== undefined && (
                    <StatusItem label="Test Email Sent" success={result.details.testEmailSent} />
                  )}
                </div>
              )}

              {/* Error Details */}
              {result.error && (
                <div className="mt-3 rounded bg-red-100 p-2 dark:bg-red-900/30">
                  <p className="text-xs font-mono text-red-800 dark:text-red-300 break-all">{result.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusItem({ label, success }: { label: string; success: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {success ? (
        <span className="text-green-600 dark:text-green-400">&#10003;</span>
      ) : (
        <span className="text-red-600 dark:text-red-400">&#10007;</span>
      )}
      <span className={success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
        {label}: {success ? "OK" : "Failed"}
      </span>
    </div>
  );
}
