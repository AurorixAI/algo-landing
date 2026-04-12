import { createContext, useContext, useState, type ReactNode } from "react";
import { useTranslation } from "@/i18n";
import { X, CheckCircle2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ContactType = "demo" | "pitchDeck" | "connect";

interface ContactFormContextType {
  open: (type: ContactType) => void;
}

const ContactFormContext = createContext<ContactFormContextType>({ open: () => {} });

export const useContactForm = () => useContext(ContactFormContext);

export function ContactFormProvider({ children }: { children: ReactNode }) {
  const [contactType, setContactType] = useState<ContactType | null>(null);

  return (
    <ContactFormContext.Provider value={{ open: (type) => setContactType(type) }}>
      {children}
      <ContactDialog
        type={contactType}
        onClose={() => setContactType(null)}
      />
    </ContactFormContext.Provider>
  );
}

function ContactDialog({ type, onClose }: { type: ContactType | null; onClose: () => void }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const typeLabels: Record<ContactType, string> = {
    demo: t.contact.typeDemo,
    pitchDeck: t.contact.typePitchDeck,
    connect: t.contact.typeConnect,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, type }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setStatus("idle"), 300);
  };

  return (
    <AnimatePresence>
      {type !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label={t.contact.close}
            >
              <X className="h-5 w-5" />
            </button>

            {status === "success" ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mb-2 text-2xl font-black text-slate-900">{t.contact.successTitle}</h3>
                <p className="text-slate-500 font-medium">{t.contact.successMessage}</p>
                <button
                  onClick={handleClose}
                  className="mt-8 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-black"
                >
                  {t.contact.close}
                </button>
              </div>
            ) : (
              <>
                <h3 className="mb-1 text-2xl font-black text-slate-900">{t.contact.title}</h3>
                <p className="mb-6 text-sm text-slate-500 font-medium">{t.contact.subtitle}</p>

                <div className="mb-6 inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700">
                  {typeLabels[type]}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{t.contact.nameLabel}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.contact.namePlaceholder}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{t.contact.emailLabel}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.contact.emailPlaceholder}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{t.contact.messageLabel}</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.contact.messagePlaceholder}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-sm font-medium text-red-600">{t.contact.errorMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-60"
                  >
                    {status === "submitting" ? (
                      t.contact.submitting
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t.contact.submit}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
