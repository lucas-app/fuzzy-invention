import { I18n } from 'i18n-js';
import en from './translations/en';

const i18n = new I18n({
  en,
});

i18n.enableFallback = true;
i18n.defaultLocale = 'en';
i18n.locale = 'en';

export default i18n;