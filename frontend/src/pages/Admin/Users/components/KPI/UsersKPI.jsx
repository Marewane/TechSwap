import React from 'react';

const UsersKPI = () => {
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="relative overflow-hidden rounded-[var(--radius)] border border-border/50 bg-white/85 p-5 shadow-[0_18px_70px_rgba(46,47,70,0.16)]">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-white to-[#6d7aff22] opacity-90" />
        <div className="relative">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">Total registered users</h2>
          <p className="mt-3 text-3xl font-semibold text-foreground">6</p>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[var(--radius)] border border-border/50 bg-white/85 p-5 shadow-[0_18px_70px_rgba(46,47,70,0.16)]">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-white to-[#38f9d720] opacity-90" />
        <div className="relative">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">Active users</h2>
          <p className="mt-3 text-3xl font-semibold text-accent-foreground">4</p>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[var(--radius)] border border-border/50 bg-white/85 p-5 shadow-[0_18px_70px_rgba(46,47,70,0.16)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fda4af33] via-white to-[#fee2e240] opacity-90" />
        <div className="relative">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">Suspended users</h2>
          <p className="mt-3 text-3xl font-semibold text-destructive">2</p>
        </div>
      </div>
    </div>
  );
};

export default UsersKPI;
