import { useUpdater } from "@/hooks/use-updater";

/**
 * Componente invisível que dispara a verificação de atualização
 * ao montar no App. O toast é mostrado pelo próprio hook.
 */
export function UpdateChecker() {
    useUpdater();
    return null;
}
