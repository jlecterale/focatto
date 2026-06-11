import type { CapacitorConfig } from "@capacitor/cli";

/**
 * O app mobile do Focatto usa a estrategia de "remote URL": o WebView nativo
 * carrega o site Next.js em producao (que roda no Firebase App Hosting, com
 * SSR e rotas dinamicas que inviabilizam um export estatico). O bridge do
 * Capacitor e injetado na pagina remota, entao os plugins nativos (Sign in
 * with Apple, Google, StatusBar, etc.) funcionam normalmente — desde que o
 * site em producao seja deste mesmo repositorio.
 *
 * `mobile/www` contem apenas um shell local exibido se o dispositivo estiver
 * sem conexao no primeiro carregamento.
 *
 * Para desenvolvimento local aponte para o seu dev server:
 *   CAP_SERVER_URL=http://192.168.0.10:3000 npx cap sync
 */
const PRODUCTION_URL = "https://focatto--focatto.us-central1.hosted.app";

const serverUrl = process.env.CAP_SERVER_URL || PRODUCTION_URL;

const config: CapacitorConfig = {
  appId: "br.com.focatto.app",
  appName: "Focatto",
  webDir: "mobile/www",
  server: {
    url: serverUrl,
    // Permite navegar para os dominios do Firebase (auth handler) sem abrir
    // o navegador externo.
    allowNavigation: [
      "focatto.firebaseapp.com",
      "*.hosted.app",
      "*.googleapis.com",
    ],
  },
  ios: {
    contentInset: "automatic",
    scheme: "Focatto",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: false,
      backgroundColor: "#0b0908",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0c0a09",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
    },
    FirebaseAuthentication: {
      // skipNativeAuth: false => o plugin tambem autentica a camada nativa,
      // e o codigo web sincroniza a sessao com o SDK JS via signInWithCredential.
      skipNativeAuth: false,
      providers: ["apple.com", "google.com"],
    },
  },
};

export default config;
