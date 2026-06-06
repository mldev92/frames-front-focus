import { useState } from "react";
import { X } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function TBankWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Badge trigger */}
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex w-fit items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 transition-colors hover:bg-red-100"
      >
        <img src="/t_icon_red.webp" alt="Т" className="h-9 w-8 shrink-0" />
        <div className="text-left">
          <div className="text-sm text-gray-700">
            рассрочка <strong>0‑0‑3</strong> от Т‑банка
          </div>
          <span className="text-xs text-red-700 underline">Узнать подробнее</span>
        </div>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-[90%] max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/t_icon_red.webp" alt="Т" className="h-10 w-9" />
                <span className="text-xl font-bold tracking-widest">БАНК</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <hr className="mb-4 border-gray-200" />
            <h2 className="mb-4 text-lg font-bold">Т‑Банк Рассрочка</h2>
            {/* 2×2 grid */}
            <div className="mb-5 grid grid-cols-2 gap-2.5">
              {[
                { label: "Рассрочка гражданам РФ", val: "от 18 до 70 лет" },
                { label: "Срок рассрочки", val: "3 месяца" },
                { label: "Сумма рассрочки", val: "от 3 500 до 500 000 ₽" },
                { label: "Процентная ставка", val: "0%" },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-lg bg-gray-50 p-3">
                  <div className="mb-1 text-xs text-gray-500">{label}</div>
                  <div className="text-sm font-semibold">{val}</div>
                </div>
              ))}
            </div>
            <Link
              to="/tinkoff"
              onClick={() => setOpen(false)}
              className="block w-full rounded-lg bg-red-600 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Узнать подробнее
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
