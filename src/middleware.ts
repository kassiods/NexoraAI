export const config = {
  matcher: []
};

// Middleware desativado no modo mock. Ao integrar backend real, reabilite regras de proteção
// e tokens (cookies ou headers) para /dashboard e /hubs.
export function middleware() {
  return;
}
