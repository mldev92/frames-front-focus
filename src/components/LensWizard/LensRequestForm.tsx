import { useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  submitLensSelectionRequest,
  type LensSelectionRequestDraft,
} from "@/lib/api/lens-selection";

export function LensRequestForm({ draft }: { draft: LensSelectionRequestDraft }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const result = await submitLensSelectionRequest(draft, {
        name,
        phone,
        email: email || undefined,
        comment: comment || undefined,
        consent,
        website: website || undefined,
      });
      setRequestId(result.requestId);
      setStatus("sent");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Не удалось отправить заявку. Попробуйте ещё раз.",
      );
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <section
        id="lens-request-form"
        className="mt-6 rounded-xl border border-brand/25 bg-brand/5 p-6"
        aria-live="polite"
      >
        <CheckCircle2 className="h-8 w-8 text-brand" />
        <h2 className="mt-4 font-serif text-2xl">Заявка отправлена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Специалист проверит рецепт, выбранную оправу и доступные линзы, затем свяжется с вами.
        </p>
        {requestId && <p className="mt-3 text-xs text-muted-foreground">Номер: {requestId}</p>}
      </section>
    );
  }

  return (
    <section id="lens-request-form" className="mt-6 scroll-mt-24 rounded-xl border border-border p-5 sm:p-6">
      <h2 className="font-serif text-2xl">Передать подбор специалисту</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Отправим выбранные параметры вместе с рецептом. Менеджер уточнит модели и итоговую стоимость.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="lens-request-name">Имя *</Label>
            <Input
              id="lens-request-name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lens-request-phone">Телефон *</Label>
            <Input
              id="lens-request-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={40}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lens-request-email">E-mail</Label>
          <Input
            id="lens-request-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={160}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lens-request-comment">Комментарий</Label>
          <textarea
            id="lens-request-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            rows={3}
            className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Например, удобное время для звонка"
          />
        </div>

        <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <Label htmlFor="lens-request-website">Сайт</Label>
          <Input
            id="lens-request-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
          />
          <span>
            Я согласен(а) на обработку персональных данных согласно{" "}
            <a href="/politika-konfidentsialnosti/" target="_blank" rel="noreferrer" className="underline">
              политике конфиденциальности
            </a>
            .
          </span>
        </label>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
        >
          {status === "sending" && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {status === "sending" ? "Отправляем…" : "Отправить заявку"}
        </button>
      </form>
    </section>
  );
}
