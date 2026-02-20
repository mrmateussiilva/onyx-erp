import { useCallback, useEffect, useRef, useState } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { toast } from "@/components/ui/sonner";

interface UpdaterState {
    isChecking: boolean;
    updateAvailable: boolean;
    isInstalling: boolean;
    update: Update | null;
    error: string | null;
    lastChecked: Date | null;
}

export function useUpdater() {
    const [state, setState] = useState<UpdaterState>({
        isChecking: false,
        updateAvailable: false,
        isInstalling: false,
        update: null,
        error: null,
        lastChecked: null,
    });

    const hasCheckedRef = useRef(false);

    const checkForUpdates = useCallback(async (silent = false) => {
        setState((s) => ({ ...s, isChecking: true, error: null }));
        try {
            const update = await check();
            const hasUpdate = !!update?.available;

            setState((s) => ({
                ...s,
                isChecking: false,
                updateAvailable: hasUpdate,
                update: update ?? null,
                lastChecked: new Date(),
            }));

            if (hasUpdate && update) {
                toast(`🆕 Nova versão disponível: ${update.version}`, {
                    description: update.body ?? "Uma atualização está disponível.",
                    duration: 10000,
                    action: {
                        label: "Ver agora",
                        onClick: () => {
                            // Navegar para a aba de atualizações nas configurações
                            window.location.hash = "/configuracoes?tab=atualizacoes";
                        },
                    },
                });
            } else if (!silent) {
                toast.success("Sistema atualizado!", {
                    description: `Você está usando a versão mais recente.`,
                });
            }

            return hasUpdate;
        } catch (err: any) {
            const errorMsg = err?.toString() ?? "Erro desconhecido";
            setState((s) => ({
                ...s,
                isChecking: false,
                error: errorMsg,
                lastChecked: new Date(),
            }));
            if (!silent) {
                toast.error("Erro ao verificar atualizações", {
                    description: "Verifique sua conexão com a internet.",
                });
            }
            return false;
        }
    }, []);

    const installUpdate = useCallback(async () => {
        if (!state.update?.available) return;
        setState((s) => ({ ...s, isInstalling: true }));
        try {
            toast.loading("Baixando atualização...", { id: "update-install" });
            await state.update.downloadAndInstall((event) => {
                if (event.event === "Started") {
                    toast.loading(
                        `Baixando... 0 / ${((event.data.contentLength ?? 0) / 1024 / 1024).toFixed(1)} MB`,
                        { id: "update-install" }
                    );
                } else if (event.event === "Progress") {
                    // progresso disponível via event.data.chunkLength
                } else if (event.event === "Finished") {
                    toast.success("Download concluído! Reiniciando...", { id: "update-install" });
                }
            });
            // O app irá reiniciar automaticamente após a instalação
        } catch (err: any) {
            setState((s) => ({ ...s, isInstalling: false }));
            toast.dismiss("update-install");
            toast.error("Erro ao instalar atualização", {
                description: err?.toString(),
            });
        }
    }, [state.update]);

    // Verificação automática ao iniciar (silent = não mostra toast "sistema atualizado")
    useEffect(() => {
        if (hasCheckedRef.current) return;
        hasCheckedRef.current = true;
        // Aguarda 3s para o app terminar de carregar antes de verificar
        const timer = setTimeout(() => {
            checkForUpdates(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, [checkForUpdates]);

    return {
        ...state,
        checkForUpdates,
        installUpdate,
    };
}
