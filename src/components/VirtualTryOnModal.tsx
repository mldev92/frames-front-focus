import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  vtoSku: string;
}

export function VirtualTryOnModal({ open, onClose, vtoSku }: Props) {
  const placeHolderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Track whether the widget has ever been started so we keep the canvas in DOM.
  const [everOpened, setEverOpened] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Destroy widget while canvas is still mounted (open=false but DOM still present).
      import("jeelizvtowidget").then((mod) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mod as any).JEELIZVTOWIDGET?.destroy?.();
      }).catch(() => {});
      setStatus("idle");
      return;
    }

    setEverOpened(true);
    setStatus("loading");
    setErrorMsg(null);
    console.log("[VTO] opening, sku =", vtoSku);

    // rAF ensures canvas has real pixel dimensions before Jeeliz measures it.
    const rafId = requestAnimationFrame(async () => {
      try {
        console.log("[VTO] importing module…");
        const mod = await import("jeelizvtowidget");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const widget = (mod as any).JEELIZVTOWIDGET;
        console.log("[VTO] widget =", widget);

        if (!widget) throw new Error("JEELIZVTOWIDGET not found in module");
        if (!placeHolderRef.current || !canvasRef.current) throw new Error("refs not ready");

        console.log("[VTO] placeholder:", placeHolderRef.current.offsetWidth, "x", placeHolderRef.current.offsetHeight);

        widget.start({
          placeHolder: placeHolderRef.current,
          canvas: canvasRef.current,
          sku: vtoSku,
          searchImageMask: "https://appstatic.jeeliz.com/jeewidget/images/target512.jpg",
          searchImageColor: 0xeeeeee,
          searchImageRotationSpeed: -0.001,
          callbacks: {
            LOADING_START: () => setStatus("loading"),
            LOADING_END: () => setStatus("ready"),
          },
          callbackReady: () => {
            console.log("[VTO] ready");
            setStatus("ready");
          },
          onError: (label: string) => {
            console.error("[VTO] error:", label);
            setStatus("error");
            const msgs: Record<string, string> = {
              WEBCAM_UNAVAILABLE: "Камера недоступна. Разрешите доступ в браузере.",
              INVALID_SKU: "3D-модель не найдена.",
              PLACEHOLDER_NULL_WIDTH: "Ошибка размера контейнера.",
              PLACEHOLDER_NULL_HEIGHT: "Ошибка размера контейнера.",
            };
            setErrorMsg(msgs[label] ?? `Ошибка примерки: ${label}`);
          },
        });
        console.log("[VTO] start() called");
      } catch (e) {
        console.error("[VTO] init exception:", e);
        setStatus("error");
        setErrorMsg(`Не удалось запустить примерку: ${(e as Error).message}`);
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [open, vtoSku]);

  // Keep the canvas in DOM once ever opened so Jeeliz's resize timeouts
  // don't fire against a null canvas. Just hide it when closed.
  if (!everOpened) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ display: open ? undefined : "none" }}
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background w-full sm:max-w-3xl h-[90vh] sm:h-[80vh] max-h-[90vh] overflow-hidden rounded-t-lg sm:rounded-sm shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-serif text-xl">Виртуальная примерка</h2>
          <button onClick={onClose} aria-label="Закрыть" className="p-1 hover:bg-surface rounded-sm">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex-1 min-h-0 bg-black">
          <div
            ref={placeHolderRef}
            style={{ position: "absolute", inset: 0, minWidth: 2, minHeight: 2 }}
          >
            <canvas
              ref={canvasRef}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />
          </div>

          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-background/90 rounded-sm px-4 py-2 text-sm animate-pulse">
                Загрузка примерки…
              </div>
            </div>
          )}

          {status === "error" && errorMsg && (
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/80">
              <div className="bg-background rounded-sm px-5 py-4 text-sm max-w-sm text-center space-y-3">
                <p className="font-medium text-red-500">{errorMsg}</p>
                <button onClick={onClose} className="bg-ink text-primary-foreground text-sm px-4 py-2 rounded-sm w-full">
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-2.5 text-xs text-muted-foreground border-t border-border shrink-0">
          Поверните голову, чтобы увидеть оправу с разных сторон.
        </div>
      </div>
    </div>
  );
}
