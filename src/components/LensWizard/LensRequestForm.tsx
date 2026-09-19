import { useRef, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  submitLensSelectionRequest,
  type LensSelectionRequestDraft,
} from "@/lib/api/lens-selection";

// Prescription upload (Ошибки 2.3, п.7): JPG/PNG/PDF up to 8 MB. Kept in sync
// with the server's own limits in lens_selection_request.php.
const RX_MAX_BYTES = 8 * 1024 * 1024;
const RX_ACCEPT = "image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf";

export function LensRequestForm({ draft }: { draft: LensSelectionRequestDraft }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [rxLater, setRxLater] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");

  function clearFile() {
    setFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null;
    setFileError("");
    if (!picked) {
      setFile(null);
      return;
    }
    const typeOk =
      ["image/jpeg", "image/png", "application/pdf"].includes(picked.type) ||
      /\.(jpe?g|png|pdf)$/i.test(picked.name);
    if (!typeOk) {
      clearFile();
      setFileError("Допустимы только JPG, PNG или PDF.");
      return;
    }
    if (picked.size > RX_MAX_BYTES) {
      clearFile();
      setFileError("Файл больше 8 МБ. Сфотографируйте с меньшим разрешением или сожмите.");
      return;
    }
    setFile(picked);
    setRxLater(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const result = await submitLensSelectionRequest(
        draft,
        {
          name,
          phone,
          email: email || undefined,
          comment: comment || undefined,
          consent,
          website: website || undefined,
        },
        { file, prescriptionLater: rxLater },
      );
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

        <div className="space-y-2">
          <Label htmlFor="lens-request-rx">Фото или скан рецепта</Label>
          <p className="text-xs text-muted-foreground">
            Необязательно. JPG, PNG или PDF до 8 МБ — приложите сейчас или передайте позже.
          </p>
          {!rxLater && (
            <>
              <input
                ref={fileInputRef}
                id="lens-request-rx"
                type="file"
                accept={RX_ACCEPT}
                onChange={handleFile}
                className="block w-full cursor-pointer text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand hover:file:bg-brand/15"
              />
              {file && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="shrink-0 font-medium text-brand hover:underline"
                  >
                    Убрать
                  </button>
                </div>
              )}
              {fileError && <p className="text-sm text-destructive">{fileError}</p>}
            </>
          )}
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={rxLater}
              onChange={(event) => {
                setRxLater(event.target.checked);
                if (event.target.checked) clearFile();
              }}
              className="h-4 w-4 shrink-0"
            />
            Загружу рецепт позже
          </label>
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
