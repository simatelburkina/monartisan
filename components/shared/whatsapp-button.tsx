const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "22663250202";

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Bonjour, j'ai besoin d'aide sur MON ARTISAN."
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter l'administrateur sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 animate-wa-pulse items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.693 4.611 1.885 6.484L4 29l7.716-1.844A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.627 28 15S22.629 3 16.001 3Zm0 21.818a9.77 9.77 0 0 1-4.986-1.36l-.358-.213-4.583 1.095 1.12-4.464-.234-.366A9.78 9.78 0 0 1 5.182 15c0-5.965 4.854-10.818 10.819-10.818S26.818 9.035 26.818 15 21.965 24.818 16.001 24.818Zm5.605-8.146c-.307-.154-1.816-.897-2.098-.999-.281-.102-.486-.154-.69.154-.204.307-.792.998-.972 1.203-.179.204-.358.23-.665.077-.307-.154-1.296-.478-2.469-1.524-.913-.814-1.529-1.82-1.708-2.127-.179-.307-.019-.473.135-.626.139-.138.307-.358.46-.537.154-.18.205-.307.307-.512.102-.204.051-.384-.026-.537-.077-.154-.69-1.663-.946-2.278-.249-.598-.502-.517-.69-.527l-.588-.01c-.204 0-.537.077-.818.384-.281.307-1.073 1.048-1.073 2.557s1.098 2.966 1.251 3.171c.154.204 2.16 3.298 5.234 4.625.731.315 1.301.503 1.746.644.734.233 1.402.2 1.93.121.589-.088 1.816-.742 2.072-1.459.256-.716.256-1.331.179-1.459-.077-.128-.281-.204-.588-.358Z" />
      </svg>
    </a>
  );
}
