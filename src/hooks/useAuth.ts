// Hook de conveniencia para consumir el contexto de auth.

import { useAuthCtx } from "../contexts/Authcontext";
export const useAuth = () => useAuthCtx();
