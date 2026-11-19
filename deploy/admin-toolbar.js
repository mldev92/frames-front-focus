(() => {
  const sessionUrl = "/api/store/admin_shortcuts.php";
  const toolbar = document.createElement("nav");
  toolbar.setAttribute("aria-label", "Управление сайтом");
  toolbar.className = "flex flex-wrap items-center gap-2 border-b border-border bg-muted px-2 text-sm";

  const makeLink = (text, href) => {
    const link = document.createElement("a");
    link.textContent = text;
    link.href = href;
    link.className = "inline-flex min-h-11 items-center px-2 underline";
    return link;
  };
  const editor = makeLink("Редактировать товар", sessionUrl);
  toolbar.append(makeLink("Админка Битрикс", "/bitrix/admin/"));

  function syncProduct() {
    const productId = document.querySelector("main [data-catalog-product-id]")?.dataset.catalogProductId;
    if (!/^[1-9][0-9]*$/.test(productId ?? "")) {
      editor.remove();
      return;
    }
    editor.href = `${sessionUrl}?productId=${productId}`;
    if (!editor.isConnected) toolbar.append(editor);
  }

  const observer = new MutationObserver(syncProduct);
  let request = 0;
  async function refresh() {
    const check = ++request;
    let isAdmin = false;
    try {
      const response = await fetch(sessionUrl, { cache: "no-store" });
      isAdmin = response.ok && (await response.json()).isAdmin === true;
    } catch {
      // Сбой проверки сессии скрывает панель.
    }
    if (check !== request) return;
    if (!isAdmin) {
      observer.disconnect();
      toolbar.remove();
      return;
    }
    if (!toolbar.isConnected) document.body.prepend(toolbar);
    syncProduct();
    const main = document.querySelector("main");
    if (main) observer.observe(main, {
      attributes: true, attributeFilter: ["data-catalog-product-id"], childList: true, subtree: true,
    });
  }

  function start() {
    void refresh();
    // Повторная проверка нужна после возврата из Битрикс с другой сессией.
    window.addEventListener("focus", () => { if (toolbar.isConnected) void refresh(); });
    window.addEventListener("pageshow", (event) => { if (event.persisted) void refresh(); });
  }

  // Файлы разметки принадлежат текущей сборке React. Панель появляется после её загрузки.
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
})();
