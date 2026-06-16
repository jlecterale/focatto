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

// Quando aponta para um dev server local (http), o Android bloqueia cleartext
// por padrão. Habilita cleartext só nesse caso para o desenvolvimento funcionar
// (ex.: CAP_SERVER_URL=http://10.0.2.2:3000 — 10.0.2.2 é o host no emulador).
const isLocalHttp = serverUrl.startsWith("http://");

const config: CapacitorConfig = {
  appId: "br.com.focatto.app",
  appName: "Focatto",
  webDir: "mobile/www",
  server: {
    url: serverUrl,
    cleartext: isLocalHttp,
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
    // Permite inspecionar o WebView via chrome://inspect em builds de debug.
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SplashScreen: {
      // launchAutoHide: true para a splash sumir sozinha. Como o app carrega o
      // site remoto, NÃO dependa de SplashScreen.hide() no JS — se o site
      // deployado não tiver esse código (ou a URL estiver errada), a splash
      // ficaria presa para sempre.
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0b0908",
      showSpinner: true,
      spinnerColor: "#ef7c2c",
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
