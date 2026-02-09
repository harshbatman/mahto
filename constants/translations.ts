export type LanguageCode =
    | 'en' | 'hi' | 'ks' | 'ur' | 'rj' | 'pa' | 'hr' | 'mr'
    | 'kn' | 'te' | 'ml' | 'or' | 'bn' | 'ne' | 'bh' | 'mai';

export interface Translations {
    home: string;
    services: string;
    profile: string;
    settings: string;
    preferences: string;
    pushNotifications: string;
    aboutUs: string;
    termsConditions: string;
    privacyPolicy: string;
    postContract: string;
    postJob: string;
    hireContractor: string;
    hireWorker: string;
    logout: string;
    deleteAccount: string;
    selectLanguage: string;
    contractors: string;
    workers: string;
    materials: string;
    search: string;
    welcome: string;
    helpSupport: string;
}

export const LANGUAGES = [
    { id: 'en', name: 'English', local: 'English' },
    { id: 'hi', name: 'Hindi', local: 'हिंदी' },
    { id: 'ks', name: 'Kashmiri', local: 'کٲشُر' },
    { id: 'ur', name: 'Urdu', local: 'اردو' },
    { id: 'rj', name: 'Rajasthani', local: 'राजस्थानी' },
    { id: 'pa', name: 'Punjabi', local: 'ਪੰਜਾਬੀ' },
    { id: 'hr', name: 'Haryanvi', local: 'हरियाणवी' },
    { id: 'mr', name: 'Marathi', local: 'मराठी' },
    { id: 'kn', name: 'Kannada', local: 'ಕನ್ನಡ' },
    { id: 'te', name: 'Telugu', local: 'తెలుగు' },
    { id: 'ml', name: 'Malayalam', local: 'മലയാളം' },
    { id: 'or', name: 'Odiya', local: 'ଓଡ଼ିଆ' },
    { id: 'bn', name: 'Bengali', local: 'বাংলা' },
    { id: 'ne', name: 'Nepali', local: 'नेपाली' },
    { id: 'bh', name: 'Bhojpuri', local: 'भोजपुरी' },
    { id: 'mai', name: 'Maithili', local: 'मैथिली' },
];

export const translations: Record<LanguageCode, Translations> = {
    en: {
        home: "Home",
        services: "Services",
        profile: "Profile",
        settings: "Settings",
        preferences: "Preferences",
        pushNotifications: "Push Notifications",
        aboutUs: "About Us",
        termsConditions: "Terms & Conditions",
        privacyPolicy: "Privacy Policy",
        postContract: "Post Contract",
        postJob: "Post Job",
        hireContractor: "Hire Contractor",
        hireWorker: "Hire Worker",
        logout: "Logout",
        deleteAccount: "Permanently Delete Account",
        selectLanguage: "Select Language",
        contractors: "Contractors",
        workers: "Workers",
        materials: "Materials",
        search: "Search...",
        welcome: "Welcome",
        helpSupport: "Help & Support",
    },
    hi: {
        home: "होम",
        services: "सेवाएं",
        profile: "प्रोफ़ाइल",
        settings: "सेटिंग्स",
        preferences: "प्राथमिकताएं",
        pushNotifications: "पुश नोटिफिकेशन",
        aboutUs: "हमारे बारे में",
        termsConditions: "नियम एवं शर्तें",
        privacyPolicy: "गोपनीयता नीति",
        postContract: "कॉन्ट्रैक्ट पोस्ट करें",
        postJob: "जॉब पोस्ट करें",
        hireContractor: "ठेकेदार खोजें",
        hireWorker: "मजदूर खोजें",
        logout: "लॉगआउट",
        deleteAccount: "खाता हमेशा के लिए हटा दें",
        selectLanguage: "भाषा चुनें",
        contractors: "ठेकेदार",
        workers: "मजदूर",
        materials: "सामग्री",
        search: "खोजें...",
        welcome: "स्वागत है",
        helpSupport: "सहायता और समर्थन",
    },
    bh: {
        home: "घर",
        services: "सेवा",
        profile: "प्रोफाइल",
        settings: "सेटिंग",
        preferences: "पसंद",
        pushNotifications: "नोटिफिकेशन",
        aboutUs: "हमरे बारे में",
        termsConditions: "नियम अउर शर्त",
        privacyPolicy: "पॉलिसी",
        postContract: "ठेका डालीं",
        postJob: "काम डालीं",
        hireContractor: "ठेकेदार खोजीं",
        hireWorker: "मजदूर खोजीं",
        logout: "बाहर निकलीं",
        deleteAccount: "खाता हमेशा खातिर हटाईं",
        selectLanguage: "भाषा चुनीं",
        contractors: "ठेकेदार",
        workers: "मजदूर",
        materials: "सामान",
        search: "खोजीं...",
        welcome: "राउर स्वागत बा",
        helpSupport: "मदद अउर सहायता",
    },
    ks: { home: "گھر", services: "خدمات", profile: "پروفائل", settings: "سیٹنگ", preferences: "ترجیحات", pushNotifications: "اطلاعات", aboutUs: "ہمارے بارے میں", termsConditions: "شرائط و ضوابط", privacyPolicy: "رازداری کی پالیسی", postContract: "کنٹریکٹ پوسٹ کریں", postJob: "جاب پوسٹ کریں", hireContractor: "ٹھیکیدار ہائر کریں", hireWorker: "ورکر ہائر کریں", logout: "لاگ آؤٹ", deleteAccount: "اکاؤنٹ ختم کریں", selectLanguage: "زبان منتخب کریں", contractors: "ٹھیکیدار", workers: "ورکر", materials: "مٹیریل", search: "تلاش کریں", welcome: "خوش آمدید", helpSupport: "مدد اور مدد" },
    ur: { home: "گھر", services: "خدمات", profile: "پروفائل", settings: "سیٹنگز", preferences: "ترجیحات", pushNotifications: "اطلاعات", aboutUs: "ہمارے بارے में", termsConditions: "شرائط و ضوابط", privacyPolicy: "رازداری کی پالیسی", postContract: "کنٹریکٹ پوسٹ کریں", postJob: "جاب پوسٹ کریں", hireContractor: "ٹھیکیدار ہائر کریں", hireWorker: "ورکر ہائر کریں", logout: "لاگ آؤٹ", deleteAccount: "اکاؤنٹ ختم کریں", selectLanguage: "زبان منتخب کریں", contractors: "ٹھیکیدار", workers: "ورکر", materials: "مٹیریل", search: "تلاش کریں", welcome: "خوش آمدید", helpSupport: "مدد اور مدد" },
    rj: { home: "घर", services: "सेवा", profile: "प्रोफाइल", settings: "सेटिंग", preferences: "पसंद", pushNotifications: "सूचना", aboutUs: "म्हारे बारे में", termsConditions: "नियम और शर्त", privacyPolicy: "पॉलिसी", postContract: "ठेको डालो", postJob: "काम डालो", hireContractor: "ठेकेदार ढूंढो", hireWorker: "मजदूर ढूंढो", logout: "लॉगआउट", deleteAccount: "खातो हटाओ", selectLanguage: "भाषा चुणो", contractors: "ठेकेदार", workers: "मजदूर", materials: "सामान", search: "ढूंढो...", welcome: "पधारो सा", helpSupport: "मदद और सहायता" },
    pa: { home: "ਘਰ", services: "ਸੇਵਾਵਾਂ", profile: "ਪ੍ਰੋਫਾਈਲ", settings: "ਸੈਟਿੰਗਾਂ", preferences: "ਤਰਜੀਹਾਂ", pushNotifications: "ਨੋਟੀਫਿਕੇਸ਼ਨ", aboutUs: "ਸਾਡੇ ਬਾਰੇ", termsConditions: "ਨਿਯਮ ਅਤੇ ਸ਼ਰਤਾਂ", privacyPolicy: "ਪਰਦੇਦਾਰੀ ਨੀਤੀ", postContract: "ਕੰਟਰੈਕਟ ਪੋਸਟ ਕਰੋ", postJob: "ਨੌਕਰੀ ਪੋਸਟ ਕਰੋ", hireContractor: "ਠੇਕੇਦਾਰ ਲੱਭੋ", hireWorker: "ਮਜ਼ਦੂਰ ਲੱਭੋ", logout: "ਲੌਗਆਉਟ", deleteAccount: "ਖਾਤਾ ਮਿਟਾਓ", selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ", contractors: "ਠੇਕੇਦਾਰ", workers: "ਮਜ਼ਦੂਰ", materials: "ਸਮਾਨ", search: "ਖੋਜੋ...", welcome: "ਜੀ ਆਇਆਂ ਨੂੰ", helpSupport: "ਮਦਦ ਅਤੇ ਸਹਾਇਤਾ" },
    hr: { home: "घर", services: "सेवा", profile: "प्रोफाइल", settings: "सेटिंग", preferences: "पसंद", pushNotifications: "नोटिफिकेशन", aboutUs: "म्हारे बारे में", termsConditions: "नियम और शर्त", privacyPolicy: "पॉलिसी", postContract: "ठेका पोस्ट करो", postJob: "काम पोस्ट करो", hireContractor: "ठेकेदार ढूंढो", hireWorker: "मजदूर ढूंढो", logout: "लॉगआउट", deleteAccount: "खाता डिलीट करो", selectLanguage: "भाषा चुनो", contractors: "ठेकेदार", workers: "मजदूर", materials: "सामान", search: "ढूंढो...", welcome: "स्वागत सै", helpSupport: "मदद और सहायता" },
    mr: { home: "घर", services: "सेवा", profile: "प्रोफाइल", settings: "सेटिंग्स", preferences: "पसंती", pushNotifications: "सूचना", aboutUs: "आमच्याबद्दल", termsConditions: "अटी आणि शर्ती", privacyPolicy: "गोपनीयता धोरण", postContract: "कॉन्ट्रॅक्ट पोस्ट करा", postJob: "काम पोस्ट करा", hireContractor: "कंत्राटदार शोधा", hireWorker: "कामगार शोधा", logout: "लॉगआउट", deleteAccount: "खाते हटवा", selectLanguage: "भाषा निवडा", contractors: "कंत्राटदार", workers: "कामगार", materials: "साहित्य", search: "शोधा...", welcome: "स्वागत आहे", helpSupport: "मदद आणि समर्थन" },
    kn: { home: "ಮನೆ", services: "ಸೇವೆಗಳು", profile: "ಪ್ರೊಫೈಲ್", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", preferences: "ಆದ್ಯತೆಗಳು", pushNotifications: "ಅಧಿಸೂಚನೆಗಳು", aboutUs: "ನಮ್ಮ ಬಗ್ಗೆ", termsConditions: "ನಿಯಮಗಳು ಮತ್ತು ನಿಬಂಧನೆಗಳು", privacyPolicy: "ಗೌಪ್ಯತಾ ನೀತಿ", postContract: "ಗುತ್ತಿಗೆ ಪೋಸ್ಟ್ ಮಾಡಿ", postJob: "ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ", hireContractor: "ಗುತ್ತಿಗೆದಾರರನ್ನು ನೇಮಿಸಿ", hireWorker: "ಕೆಲಸಗಾರರನ್ನು ನೇಮಿಸಿ", logout: "ಲಾಗ್‌ಔಟ್", deleteAccount: "ಖಾತೆ ಅಳಿಸಿ", selectLanguage: "ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ", contractors: "ಗುತ್ತಿಗೆದಾರರು", workers: "ಕೆಲಸಗಾರರು", materials: "ವಸ್ತುಗಳು", search: "ಹುಡುಕಿ...", welcome: "ಸ್ವಾಗತ", helpSupport: "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ" },
    te: { home: "ఇల్లు", services: "సేవలు", profile: "ప్రొఫైల్", settings: "సెట్టింగులు", preferences: "ప్రాధాన్యతలు", pushNotifications: "నోటిఫికేషన్లు", aboutUs: "మన గురించి", termsConditions: "నిబంధనలు మరియు షరతులు", privacyPolicy: "గోప్యతా విధానం", postContract: "కాంట్రాక్ట్ పోస్ట్ చేయండి", postJob: "ఉద్యోగం పోస్ట్ చేయండి", hireContractor: "కాంట్రాక్టర్‌ను నియమించండి", hireWorker: "వర్కర్‌ను నియమించండి", logout: "లాగ్ అవుట్", deleteAccount: "ఖాతాను తొలగించండి", selectLanguage: "భాషను ఎంచుకోండి", contractors: "కాంట్రాక్టర్లు", workers: "వర్కర్లు", materials: "మెటీరియల్స్", search: "వెతకండి...", welcome: "స్వాగతం", helpSupport: "సహాయం మరియు మద్దతు" },
    ml: { home: "വീട്", services: "സേവനങ്ങൾ", profile: "പ്രൊഫൈൽ", settings: "ക്രമീകരണങ്ങൾ", preferences: "முൻഗണനകൾ", pushNotifications: "അറിയിപ്പുകൾ", aboutUs: "ഞങ്ങളെ കുറിച്ച്", termsConditions: "നിബന്ധനകളും വ്യവസ്ഥകളും", privacyPolicy: "സ്വകാര്യതാ നയം", postContract: "കരാർ പോസ്റ്റ് ചെയ്യുക", postJob: "ജോലി പോസ്റ്റ് ചെയ്യുക", hireContractor: "കരാറുകാരനെ നിയമിക്കുക", hireWorker: "തൊഴിലാളിയെ നിയമിക്കുക", logout: "ലോഗ് ഔട്ട്", deleteAccount: "അക്കൗണ്ട് ഇല്ലാതാക്കുക", selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക", contractors: "കരാറുകാർ", workers: "തൊഴിലാളികൾ", materials: "സാമഗ്രികൾ", search: "തിരയുക...", welcome: "സ്വാഗതം", helpSupport: "സഹായവും പിന്തുണയും" },
    or: { home: "ଘର", services: "ସେବା", profile: "ପ୍ରୋଫାଇଲ୍", settings: "ସେଟିଂସ", preferences: "ପସନ୍ଦ", pushNotifications: "ସୂਚନା", aboutUs: "ଆମ ବିଷୟରେ", termsConditions: "ନିୟମ ଏବଂ ସର୍ତ୍ତ", privacyPolicy: "ଗୋପନୀୟତା ନୀତି", postContract: "ଚୁକ୍ତିନାମା ପୋଷ୍ଟ କରନ୍ତୁ", postJob: "କାମ ପୋଷ୍ଟ କରନ୍ତୁ", hireContractor: "ଠିକାଦାର ନିଯୁକ୍ତି କରନ୍ତୁ", hireWorker: "ଶ୍ରਮିକ ନିଯୁକ୍ତି କରନ୍ତୁ", logout: "ଲଗ୍ ଆଉଟ୍", deleteAccount: "ଖାତା ବିଲୋପ କରନ୍ତୁ", selectLanguage: "ଭାଷା ବାଛନ୍ତୁ", contractors: "ଠିକାଦାର", workers: "ଶ୍ରਮିକ", materials: "ସାମଗ୍ରୀ", search: "ଖୋଜନ୍ତୁ...", welcome: "ସ୍ୱାਗତ", helpSupport: "ସାହାଯ୍ୟ ଏବଂ ସମର୍ଥନ" },
    bn: { home: "বাড়ি", services: "পরিষেবা", profile: "প্রোফাইল", settings: "সেটিংস", preferences: "পছন্দ", pushNotifications: "বিজ্ঞপ্তি", aboutUs: "আমাদের সম্পর্কে", termsConditions: "নিয়ম ও শর্তাবলী", privacyPolicy: "গোপনীয়তা নীতি", postContract: "চুক্তি পোস্ট করুন", postJob: "কাজ পোস্ট করুন", hireContractor: "ঠিকাদার নিয়োগ করুন", hireWorker: "শ্রমিক নিয়োগ করুন", logout: "লগ আউট", deleteAccount: "অ্যাকাউন্ট মুছুন", selectLanguage: "ভাষা নির্বাচন করুন", contractors: "ঠিকাদার", workers: "শ্রমিক", materials: "সরঞ্জাম", search: "খুঁজুন...", welcome: "স্বাগতম", helpSupport: "সাহায্য এবং সমর্থন" },
    ne: { home: "घर", services: "सेवा", profile: "प्रोफाइल", settings: "सेटिङ्हरू", preferences: "प्राथमिकताहरू", pushNotifications: "सूचनाहरू", aboutUs: "हाम्रो बारेमा", termsConditions: "नियम र शर्तहरू", privacyPolicy: "गोपनीयता नीति", postContract: "सम्झौता पोस्ट गर्नुहोस्", postJob: "काम पोस्ट गर्नुहोस्", hireContractor: "ठेकेदार नियुक्त गर्नुहोस्", hireWorker: "कामदार नियुक्त गर्नुहोस्", logout: "लगआउट", deleteAccount: "खाता हटाउनुहोस्", selectLanguage: "भाषा छान्नुहोस्", contractors: "ठेकेदार", workers: "कामदार", materials: "सामग्री", search: "खोज्नुहोस्...", welcome: "स्वागत छ", helpSupport: "मदत र समर्थन" },
    mai: { home: "घर", services: "सेवा", profile: "प्रोफाइल", settings: "सेटिंग", preferences: "पसंद", pushNotifications: "सूचना", aboutUs: "हमर बारे में", termsConditions: "नियम और शर्त", privacyPolicy: "पॉलिसी", postContract: "ठेका डाली", postJob: "काज डाली", hireContractor: "ठेकेदार खोजी", hireWorker: "मजदूर खोजी", logout: "बाहर निकली", deleteAccount: "खाता हमेशा लेल हटाबी", selectLanguage: "भाषा चुनी", contractors: "ठेकेदार", workers: "मजदूर", materials: "समान", search: "खोजू...", welcome: "अहाँक स्वागत अछि", helpSupport: "मदद और सहायता" },
};
