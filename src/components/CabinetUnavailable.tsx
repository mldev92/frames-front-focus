export function CabinetUnavailable() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center" role="alert">
      <h1 className="font-serif text-3xl font-semibold">Личный кабинет временно недоступен</h1>
      <p className="mt-4 text-muted-foreground">Не удалось проверить вход. Пожалуйста, повторите попытку через минуту.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 rounded-full bg-brand px-6 py-3 font-semibold text-white"
      >
        Повторить
      </button>
    </main>
  );
}
