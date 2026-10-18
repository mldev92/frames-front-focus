import { useCityStore } from "@/lib/store/city";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { submitCallback } from "@/lib/api/bitrix";
import { toast } from "sonner";

interface CallbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: string;
}

export function CallbackModal({ open, onOpenChange, subject }: CallbackModalProps) {
  const city = useCityStore((state) => state.city);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [schedule, setSchedule] = useState<"now" | "later">("now");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const comment = [subject, schedule === "later" ? `Удобное время: ${date} ${time}` : undefined]
        .filter(Boolean)
        .join(". ");
      await submitCallback({ name, phone, comment: comment || undefined, city: city === "nvk" ? "Новокузнецк" : "Санкт-Петербург", requestedTime: schedule === "later" ? `${date} ${time} (местное время салона)` : "В ближайшее рабочее время" });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setName("");
        setPhone("");
        setSchedule("now");
        setDate("");
        setTime("");
        onOpenChange(false);
      }, 2000);
    } catch {
      toast.error("Не удалось отправить заявку. Позвоните нам напрямую.");
    } finally { setSending(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-7 rounded-2xl">
        <DialogTitle className="font-serif text-[22px] font-medium leading-tight mb-1">
          Заказать обратный звонок
        </DialogTitle>
        {subject && <p className="text-sm font-medium text-foreground">{subject}</p>}
        <p className="text-[13px] text-muted-foreground mb-4">
          {schedule === "now" ? "Перезвоним в течение 5 минут в рабочее время." : "Перезвоним в выбранные дату и время."}
        </p>
        {sent ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {schedule === "now" ? "Заявка сохранена. Менеджер свяжется с вами в рабочее время." : "Заявка сохранена. Указанное время передано для согласования."}
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
              <div className="grid grid-cols-2 gap-1.5">
                {([ ["now", "Сейчас"], ["later", "Выбрать дату и время"] ] as const).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setSchedule(value)}
                    aria-pressed={schedule === value}
                    className={cn("text-xs border rounded-md px-2 py-2 transition-colors", schedule === value
                      ? "bg-ink text-primary-foreground border-ink" : "border-border hover:border-ink/50")}>{label}</button>
                ))}
              </div>
              {schedule === "later" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label htmlFor="cb-date">Дата звонка</Label><Input id="cb-date" type="date" required min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`} value={date} onChange={(e) => setDate(e.target.value)} /></div>
                  <div className="space-y-1"><Label htmlFor="cb-time">Время звонка</Label><Input id="cb-time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} /></div>
                </div>
              )}
            </div>
            <button
              type="submit" disabled={sending}
              className="w-full bg-ink text-primary-foreground rounded-full py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Жду звонка
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
