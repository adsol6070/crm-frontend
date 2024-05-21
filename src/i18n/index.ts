import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translationGr from '@/locales/gr/translation.json'
import translationIt from '@/locales/it/translation.json'
import translationRs from '@/locales/rs/translation.json'
import translationSp from '@/locales/sp/translation.json'
import translationEn from '@/locales/en/translation.json'
import translationHi from '@/locales/hi/translation.json'
import translationPa from '@/locales/pa/translation.json'

// Define the shape of the resources
const resources = {
	gr: {
		translation: translationGr,
	},
	it: {
		translation: translationIt,
	},
	rs: {
		translation: translationRs,
	},
	sp: {
		translation: translationSp,
	},
	en: {
		translation: translationEn,
	},
	hi: {
		translation: translationHi,
	},
	pa: {
		translation: translationPa,
	},
} as const

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: 'en',
		debug: true,
		interpolation: {
			escapeValue: false,
		},
	})

export default i18n
