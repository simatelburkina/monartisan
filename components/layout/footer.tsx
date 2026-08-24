export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">MON ARTISAN — Votre artisan, à portée de main</p>
        <p>© {new Date().getFullYear()} MON ARTISAN. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
