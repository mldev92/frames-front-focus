import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { X, MessageCircle, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { CallbackModal } from "./CallbackModal";

const CHANNELS = [
  {
    name: "Telegram",
    handle: "@optika100",
    href: "https://t.me/optika100",
    bg: "bg-[oklch(0.6_0.18_230)]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.94 4.84L18.78 19.7c-.24 1.05-.86 1.31-1.74.82l-4.81-3.55-2.32 2.24c-.26.26-.47.47-.97.47l.34-4.91 8.94-8.08c.39-.35-.08-.54-.6-.19l-11.05 6.96-4.76-1.49c-1.03-.32-1.05-1.03.21-1.52l18.62-7.18c.86-.32 1.62.19 1.34 1.57z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    handle: "+7 (812) 100-00-00",
    href: "https://wa.me/78121000000",
    bg: "bg-[oklch(0.65_0.18_150)]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.6-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 3 1.2 3.2c.1.2 2.1 3.2 5.2 4.5 1.9.8 2.7.9 3.6.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 0C5.4 0 0 5.4 0 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.6c1.7 1 3.7 1.5 5.7 1.5 6.6 0 12-5.4 12-12S18.6 0 12 0z" />
      </svg>
    ),
  },
  {
    name: "ВКонтакте",
    handle: "vk.com/optika100",
    href: "https://vk.com/optika100",
    bg: "bg-[oklch(0.5_0.12_260)]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.2 18.4c-7 0-11.1-4.9-11.3-13H4.4c.1 5.9 2.7 8.5 4.8 9V5.4h3.3v5.1c2-.2 4.1-2.6 4.8-5.1H20.7c-.5 3-2.6 5.4-4 6.4 1.4.8 3.8 2.9 4.7 6.6h-3.6c-.7-2.2-2.6-3.9-4.6-4.2v4.2h-1z" />
      </svg>
    ),
  },
  {
    name: "Viber",
    handle: "+7 (812) 100-00-00",
    href: "viber://chat?number=78121000000",
    bg: "bg-[oklch(0.5_0.18_310)]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.4 1.5c-2.1.1-6.6.5-9 2.9C.5 6.2.2 9 .2 12.4c0 3.5.4 6.3 2.3 8.1.3.3.6.5.9.7l-.8 2.8 3-.8c.5 0 1 .1 1.5.1 4.1 0 8.6-.9 11.2-3.5 1.8-1.7 2.2-4.5 2.2-8 0-3.5-.4-6.2-2.2-7.9-2.6-2.7-7.2-2.5-9.2-2.4zm6.9 16.3c-.7.7-1.9 1.2-3.2 1.4-1.3.2-2.7.2-4 .1l-.5.5-.5-.7c-.6-.5-1.1-1.2-1.4-2 .3-.1.7-.3 1-.5.2.2.5.3.7.5 1.1.6 2.3.9 3.6.9.7 0 1.5-.1 2.2-.3 2.1-.6 3-2.5 3.2-4.4.1-1 .1-2 0-3-.1-.8-.4-1.5-.9-2.1-1.2-1.4-3-1.8-4.8-1.8H14c-.5 0-.9.4-.9.9s.4.9.9.9c1.7 0 3.1.7 3.9 2.1.3.6.4 1.3.4 2 0 1.5-.6 2.7-2 3.1-1 .3-2 .3-3 0-.5-.1-1-.4-1.4-.7-.4-.3-.7-.7-1-1.1-.2-.4-.5-.4-.8-.2-.3.2-.4.5-.2.9.4.8 1 1.5 1.7 2 .5.3 1 .6 1.6.8.6.2 1.2.3 1.8.3.7 0 1.5-.1 2.2-.3.4-.1.8-.3 1.1-.5l-.1.1c-1 .9-2 1.4-3 1.7z" />
      </svg>
    ),
  },
] as const;

export function MessengerFAB() {
  const [open, setOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isProductPage = /^\/catalog_s\/[^/]+\/[^/]+\/?$/.test(pathname);

  return (
    <>
      {/* FAB */}
      <div
        className={cn(
          "fixed right-6 z-50 flex flex-col items-end gap-3 transition-[bottom]",
          isProductPage ? "bottom-24 lg:bottom-6" : "bottom-6",
        )}
      >
        {/* Panel */}
        {open && (
          <div className="w-[340px] bg-card border border-border rounded-[18px] shadow-xl overflow-hidden origin-bottom-right animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-surface border-0 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Закрыть"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="px-[22px] py-5 border-b border-border bg-cream">
              <h4 className="font-serif text-[19px] font-medium">Чем мы можем помочь?</h4>
              <p className="text-[12.5px] text-muted-foreground mt-1">
                Ответим за 5 минут в рабочее время
              </p>
            </div>
            <ul className="p-2 grid gap-0.5 list-none m-0">
              {CHANNELS.map((ch) => (
                <li key={ch.name}>
                  <a
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-foreground no-underline hover:bg-surface transition-colors"
                  >
                    <span
                      className={cn(
                        "w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-white shrink-0",
                        ch.bg,
                      )}
                    >
                      {ch.icon}
                    </span>
                    <span className="flex-1 min-w-0 grid gap-0.5">
                      <span className="text-[14px] font-medium">{ch.name}</span>
                      <span className="font-mono text-[11.5px] text-muted-foreground">
                        {ch.handle}
                      </span>
                    </span>
                    <span className="text-muted-foreground text-sm">→</span>
                  </a>
                </li>
              ))}
              <li className="border-t border-border mt-1 pt-1">
                <a
                  href="tel:+78121000000"
                  className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-foreground no-underline hover:bg-surface transition-colors"
                >
                  <span className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-white bg-ink shrink-0">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <span className="flex-1 min-w-0 grid gap-0.5">
                    <span className="text-[14px] font-medium">Позвонить</span>
                    <span className="font-mono text-[11.5px] text-muted-foreground">
                      +7 (812) 100-00-00
                    </span>
                  </span>
                  <span className="text-muted-foreground text-sm">→</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@optika100.com"
                  className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-foreground no-underline hover:bg-surface transition-colors"
                >
                  <span className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-white bg-[oklch(0.55_0.14_60)] shrink-0">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <span className="flex-1 min-w-0 grid gap-0.5">
                    <span className="text-[14px] font-medium">Email</span>
                    <span className="font-mono text-[11.5px] text-muted-foreground">
                      hello@optika100.com
                    </span>
                  </span>
                  <span className="text-muted-foreground text-sm">→</span>
                </a>
              </li>
            </ul>
            <div className="px-[22px] pb-[18px] pt-3 border-t border-border text-[11.5px] text-muted-foreground leading-relaxed">
              <div className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-success before:animate-pulse">
                сегодня работаем до 22:00
              </div>
              <div className="mt-1.5">
                В нерабочее время — оставьте сообщение, мы ответим утром.
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setCallbackOpen(true);
                }}
                className="mt-3 text-brand hover:underline cursor-pointer bg-transparent border-0 p-0 text-[11.5px]"
              >
                Заказать обратный звонок →
              </button>
            </div>
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Связаться"
          className="relative w-[60px] h-[60px] rounded-full bg-brand text-brand-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200"
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
          {!open && (
            <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-success border-[2.5px] border-brand" />
          )}
        </button>
      </div>

      <CallbackModal open={callbackOpen} onOpenChange={setCallbackOpen} />
    </>
  );
}
