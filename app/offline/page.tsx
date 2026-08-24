export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="text-5xl">📡</span>
      <h1 className="text-xl font-semibold">Vous êtes hors ligne</h1>
      <p className="max-w-sm text-muted-foreground">
        Vérifiez votre connexion Internet. Certaines pages déjà visitées restent disponibles.
      </p>
    </div>
  );
}
