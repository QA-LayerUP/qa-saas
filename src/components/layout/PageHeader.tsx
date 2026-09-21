export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-rosa uppercase dark:text-amarelo">
            {eyebrow}
          </p>
        )}
        <h1 className="font-mona font-semibold text-2xl uppercase text-foreground">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-foreground/65">{description}</p>}
      </div>
      {action}
    </div>
  );
}
