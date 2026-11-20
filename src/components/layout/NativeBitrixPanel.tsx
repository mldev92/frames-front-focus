import { useEffect, useRef, useState } from "react";

const endpoint = "/api/store/admin_panel.php";

type BitrixRuntime = {
  ready: (callback: () => void) => void;
  admin: {
    dynamic_mode: boolean;
    panel: { Init: () => void };
  };
};

function bitrixAsset(value: string) {
  const url = new URL(value, window.location.origin);
  if (url.origin !== window.location.origin || !url.pathname.startsWith("/bitrix/")) {
    throw new Error("Unexpected Bitrix panel asset");
  }
  return url.href;
}

async function insertScript(source: HTMLScriptElement, parent: Element, signal: AbortSignal) {
  signal.throwIfAborted();
  const script = document.createElement("script");
  for (const attribute of source.attributes) {
    if (attribute.name !== "src") script.setAttribute(attribute.name, attribute.value);
  }
  if (!source.hasAttribute("src")) {
    script.textContent = source.textContent;
    parent.append(script);
    return;
  }
  script.src = bitrixAsset(source.getAttribute("src")!);
  await new Promise<void>((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Bitrix panel script could not load"));
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    parent.append(script);
  });
}

export function NativeBitrixPanel({
  page,
  productId,
  onReady,
  onEditModeChange,
}: {
  page: string;
  productId: number | undefined;
  onReady: (ready: boolean) => void;
  onEditModeChange: (editing: boolean) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [initialContext] = useState(() => ({ page, productId }));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Панель Битрикс и её диалоги используют единственный набор глобальных обработчиков.
    if (ready && page !== initialContext.page) window.location.reload();
  }, [ready, page, initialContext]);

  useEffect(() => {
    const mount = root.current!;
    const controller = new AbortController();
    const { signal } = controller;
    const assets = document.createElement("div");
    assets.hidden = true;
    const html = document.documentElement;
    let modeObserver: MutationObserver | undefined;
    let sizeObserver: ResizeObserver | undefined;

    function cleanup() {
      sizeObserver?.disconnect();
      modeObserver?.disconnect();
      html.style.removeProperty("--o100-admin-panel-offset");
      mount.replaceChildren();
      assets.remove();
    }

    async function load() {
      const query = new URLSearchParams({ page: initialContext.page });
      if (initialContext.productId) query.set("productId", String(initialContext.productId));
      const response = await fetch(`${endpoint}?${query}`, { cache: "no-store", redirect: "error", signal });
      if (!response.ok || response.headers.get("X-O100-Bitrix-Panel") !== "1") return;
      const fragment = new DOMParser().parseFromString(await response.text(), "text/html");
      const panel = fragment.getElementById("bx-panel");
      const edit = fragment.getElementById("bx-panel-toggle");
      if (!panel || !edit) return;
      signal.throwIfAborted();

      // Стили и скрипты выдаёт тот же Битрикс, который проверил текущую сессию.
      // Сначала загружаем ядро, затем монтируем панель и выполняем её настройки в исходном порядке.
      mount.before(assets);
      for (const sheet of fragment.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')) {
        sheet.href = bitrixAsset(sheet.getAttribute("href")!);
        assets.append(sheet);
      }
      const scripts = [...fragment.querySelectorAll<HTMLScriptElement>("script")];
      const bootstrap = scripts.filter((script) => panel.compareDocumentPosition(script) & Node.DOCUMENT_POSITION_PRECEDING);
      for (const script of bootstrap) {
        await insertScript(script, assets, signal);
        script.remove();
      }
      const bx = (window as Window & { BX?: BitrixRuntime }).BX;
      if (!bx?.admin?.panel) throw new Error("Bitrix panel runtime is unavailable");
      await new Promise<void>((resolve) => bx.ready(resolve));
      signal.throwIfAborted();

      // Сброс кеша управляет кешем Битрикс; опубликованные страницы витрины — отдельный выпуск.
      const cache = fragment.querySelector<HTMLAnchorElement>("#bx-panel-clear-cache");
      if (cache) {
        cache.removeAttribute("onclick");
        cache.href = "/bitrix/admin/cache.php?lang=ru";
        cache.title = "Управление кешем Битрикс";
      }
      const logout = fragment.querySelector<HTMLAnchorElement>("#bx-panel-logout");
      if (logout) {
        const token = new URL(logout.getAttribute("href")!, location.origin).searchParams.get("sessid");
        logout.addEventListener("click", async (event) => {
          event.preventDefault();
          if (!token) return;
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              body: new URLSearchParams({ action: "logout", sessid: token }),
            });
            if (response.ok || response.status === 403) window.location.reload();
          } catch {
            window.alert("Не удалось выйти из Битрикс. Повторите попытку.");
          }
        });
      }
      mount.append(...fragment.body.childNodes);
      for (const script of scripts.filter((node) => !bootstrap.includes(node))) {
        await insertScript(script, script.parentElement!, signal);
        script.remove();
      }
      bx.admin.dynamic_mode = true;
      bx.admin.panel.Init();

      function updateOffset() {
        html.style.setProperty("--o100-admin-panel-offset", `${panel!.classList.contains("bx-panel-fixed") ? panel!.offsetHeight : 0}px`);
      }
      function updateMode() {
        onEditModeChange(edit!.classList.contains("bx-panel-toggle-on"));
        updateOffset();
      }
      modeObserver = new MutationObserver(updateMode);
      modeObserver.observe(edit, { attributes: true, attributeFilter: ["class"] });
      modeObserver.observe(panel, { attributes: true, attributeFilter: ["class"] });
      sizeObserver = new ResizeObserver(updateOffset);
      sizeObserver.observe(panel);
      updateMode();
      setReady(true);
      onReady(true);
    }

    void load().catch(() => {
      if (!signal.aborted) cleanup();
    });
    return () => {
      controller.abort();
      cleanup();
    };
  }, [initialContext, onReady, onEditModeChange]);

  return <div ref={root} />;
}
