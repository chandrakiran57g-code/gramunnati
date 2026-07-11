export default function AdminDetailTabNotice({ title, children }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-5">
      {title && <h4 className="mb-2 text-sm font-semibold">{title}</h4>}
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
