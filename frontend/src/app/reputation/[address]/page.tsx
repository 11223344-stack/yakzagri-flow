"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, type ReputationResponse } from "@/lib/api";
import { t as translateCopy } from "@/lib/i18n";

export default function UserReputationPage() {
  const params = useParams<{ address: string }>();
  const address = params.address;
  const [data, setData] = useState<ReputationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.reputation.getUserReputation(address)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch(() => {
        if (!cancelled) setError("Reputation details could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  // Only the outcome text and timestamp are shown, never counterparty details (#406).
  const disputeResolutions = (data?.history ?? []).filter((item) => item.type === "dispute_resolved");
  const resolvedPercent =
    data && data.disputedTrades > 0
      ? Math.min(100, Math.round((disputeResolutions.length / data.disputedTrades) * 100))
      : 0;

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <Link href="/reputation" className="text-sm text-text-secondary hover:text-text-primary">
        {translateCopy("ui.back_to_reputation")}
      </Link>
      <div>
        <h1 className="text-xl font-semibold text-text-primary">{translateCopy("ui.trader_reputation")}</h1>
        <p className="mt-1 break-all font-mono text-sm text-text-secondary">{address}</p>
      </div>
      {error ? (
        <p role="alert" className="rounded-lg border border-status-danger/40 px-4 py-3 text-sm text-status-danger">
          {error}
        </p>
      ) : data ? (
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            [translateCopy("ui.trust_score_2c7902e"), `${data.trustScore}%`],
            [translateCopy("ui.rep_total_trades"), data.totalTrades],
            [translateCopy("ui.completed"), data.completedTrades],
            [translateCopy("ui.disputed"), data.disputedTrades],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border-default bg-bg-card p-4">
              <dt className="text-xs text-text-muted">{label}</dt>
              <dd className="mt-2 text-xl font-semibold text-text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p role="status" className="text-sm text-text-secondary">{translateCopy("ui.reputation_loading")}</p>
      )}
      {data && (
        <div className="space-y-4 rounded-lg border border-border-default bg-bg-card p-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Past Dispute Resolutions</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {data.disputedTrades} disputed {data.disputedTrades === 1 ? "trade" : "trades"},{" "}
              {disputeResolutions.length} resolved ({resolvedPercent}%)
            </p>
          </div>
          {disputeResolutions.length === 0 ? (
            <p className="text-sm text-text-secondary">No resolved disputes yet.</p>
          ) : (
            <ol className="space-y-3">
              {disputeResolutions.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-primary">
                    {item.event}
                  </span>
                  <time dateTime={item.timestamp} className="text-xs text-text-muted">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}