import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./i18n";
import { ContactFormProvider } from "./components/ContactForm";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <ContactFormProvider>
      <App />
    </ContactFormProvider>
  </LanguageProvider>
);
