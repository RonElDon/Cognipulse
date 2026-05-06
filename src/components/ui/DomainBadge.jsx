import { DOMAINS } from '@/lib/exercises';

export default function DomainBadge({ domain, size = 'sm' }) {
  const d = DOMAINS[domain];
  if (!d) return null;
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizes[size]} ${d.bgLight} ${d.textColor} border ${d.borderColor}`}>
      {d.icon} {d.name}
    </span>
  );
}