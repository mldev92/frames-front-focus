import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IS_PRIVATE_BETA } from "@/lib/runtime";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CallbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIMES = ["Сейчас", "Через час", "Завтра 10:00"] as const;

export function CallbackModal({ open, onOpenChange }: CallbackModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState<string>("Сейчас");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (IS_PRIVATE_BETA) {
      toast.info("Заказ звонка недоступен в бета-версии", {
        description: "Контактные данные не отправлены.",
      });
      return;
    }
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName("");
      setPhone("");
      setTime("Сейчас");
      onOpenChange(false);
    }, 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-7 rounded-2xl">
        <DialogTitle className="font-serif text-[22px] font-medium leading-tight mb-1">
          Заказать обратный звонок
        </DialogTitle>
        <p className="text-[13px] text-muted-foreground mb-4">
          Перезвоним в течение 5 минут в рабочее время.
        </p>
        {sent ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Спасибо! Перезвоним вам скоро.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="cb-name">Имя</Label>
              <Input
                id="cb-name"
                placeholder="Анна"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cb-phone">Телефон</Label>
              <Input
                id="cb-phone"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <p className="text-[10.5px] uppercase tracking-[0.06em] font-mono text-muted-foreground mb-2">
                Удобное время
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={cn(
                      "font-mono text-[11px] border rounded-md px-2 py-2 cursor-pointer transition-colors",
                      time === t
                        ? "bg-ink text-primary-foreground border-ink"
                        : "bg-transparent border-border text-foreground hover:border-ink/50",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-ink text-primary-foreground rounded-full py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {IS_PRIVATE_BETA ? "Недоступно в бета" : "Жду звонка"}
            </button>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
