# Focatto Mobile (Capacitor)

App nativo Android e iOS do Focatto, construído com [Capacitor 7](https://capacitorjs.com) sobre o mesmo código web Next.js deste repositório.

## Arquitetura

O site Focatto usa Next.js com SSR e rotas dinâmicas (`/anuncio/[id]`, `/vendedor/[id]`), o que inviabiliza um export estático. Por isso o app usa a estratégia **remote URL** do Capacitor:

- O WebView nativo carrega o site em produção (`server.url` em `capacitor.config.ts`).
- O bridge do Capacitor é injetado na página remota, então os plugins nativos (Sign in with Apple/Google, StatusBar, SplashScreen, botão voltar) funcionam normalmente — **desde que o site em produção seja deste repositório** (o código web detecta o ambiente nativo via `src/lib/native.ts`).
- `mobile/www/` contém apenas um shell offline mostrado quando não há conexão.

```
capacitor.config.ts   → configuração do app (appId: br.com.focatto.app)
mobile/www/           → shell offline local
android/              → projeto nativo Android (Gradle)
ios/App/              → projeto nativo iOS (Xcode + CocoaPods)
src/lib/native.ts     → helpers de detecção de plataforma
src/components/CapacitorInit.tsx → splash, status bar, botão voltar
src/contexts/AuthContext.tsx     → login nativo Google/Apple + exclusão de conta
```

## Comandos

```bash
npm install                      # instala dependências (web + capacitor)
npx cap sync                     # sincroniza plugins/config com android/ e ios/
npm run cap:android              # abre no Android Studio
npm run cap:ios                  # abre no Xcode (somente macOS)
npm run mobile:android:debug     # gera APK de debug
npm run mobile:android:release   # gera AAB de release (exige keystore)
npm run mobile:android:run       # builda, sobe o emulador/dispositivo e instala (cap run)
npm run mobile:emulator          # sobe um AVD, espera o boot e instala o APK de debug

# Desenvolvimento apontando para o dev server local:
CAP_SERVER_URL=http://SEU_IP:3000 npx cap sync
```

O workflow `.github/workflows/mobile.yml` valida o build web, roda `cap sync` e gera o APK de debug a cada mudança no código.

## Toolchain Android (Gradle, JDK e SDK)

| Ferramenta | Versão | Onde fica |
| --- | --- | --- |
| Gradle | 9.0.0 | `android/gradle/wrapper/gradle-wrapper.properties` |
| Android Gradle Plugin (AGP) | 8.13.0 | `android/build.gradle` |
| JDK | **21 (obrigatório)** | `JAVA_HOME` / `org.gradle.java.home` |
| compileSdk / targetSdk | 35 | `android/variables.gradle` |

> Esses arquivos **não** são sobrescritos pelo `cap sync` (apenas `capacitor.build.gradle`, `capacitor.settings.gradle`, `public/` e `capacitor.config.json` são). Os bumps de Gradle/AGP persistem.

### JDK 21 é obrigatório

O Capacitor 7 fixa `sourceCompatibility`/`targetCompatibility = VERSION_21` nos seus próprios módulos (`@capacitor/android`, `@capacitor-firebase/authentication`). Compilar com um JDK mais antigo gera:

```
java.lang.IllegalArgumentException: error: invalid source release: 21
```

Isso acontece porque o Gradle está rodando num JDK < 21 (comum em máquinas com o JDK 17 dos projetos React Native). **Não dá para baixar o alvo para 17** — os módulos do Capacitor falhariam igual. Soluções:

```bash
# Opção A — usar o JDK 21 só para este projeto (recomendado), sem mexer no JDK padrão:
#   descomente e ajuste a linha em android/gradle.properties:
#   org.gradle.java.home=/caminho/para/jdk-21

# Opção B — exportar JAVA_HOME ao rodar o build:
export JAVA_HOME=/caminho/para/jdk-21
npm run mobile:android:debug

# Instalar o JDK 21 (exemplos):
sdk install java 21-tem            # SDKMAN
sudo apt install openjdk-21-jdk    # Debian/Ubuntu
brew install --cask temurin@21     # macOS
```

### Build sem Android Studio (só com o Android SDK)

Você **não precisa do Android Studio** — assim como em projetos React Native, basta o SDK por linha de comando + JDK 21. O `npm run mobile:android:debug` já chama o `gradlew` diretamente (o script `cap:android` apenas *abre* o Studio por conveniência; é opcional).

```bash
# 1. Instale o command-line tools do Android SDK e os pacotes necessários:
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

# 2. Aponte o SDK (uma das opções):
export ANDROID_HOME=$HOME/Android/Sdk          # ou ANDROID_SDK_ROOT
#   ou crie android/local.properties (gitignored) com:
#   sdk.dir=/caminho/para/Android/Sdk

# 3. Gere o APK de debug (usa o gradlew, sem Studio):
npm run mobile:android:debug
# APK em: android/app/build/outputs/apk/debug/app-debug.apk

# Instalar no aparelho conectado:
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Rodar no emulador e instalar o APK

Duas opções, ambas sem Android Studio:

```bash
# Opção 1 — caminho do Capacitor (interativo): builda, deixa você escolher o
# alvo (emulador ou aparelho), sobe o emulador e instala:
npm run mobile:android:run

# Opção 2 — script automático: sobe o primeiro AVD, espera o boot, instala o
# APK de debug e abre o app:
npm run mobile:emulator
npm run mobile:emulator -- Pixel_7   # escolhendo um AVD específico
```

Se você ainda não tem um emulador (AVD), crie um uma única vez:

```bash
sdkmanager "emulator" "platform-tools" "system-images;android-35;google_apis;x86_64"
avdmanager create avd -n Focatto_API35 \
  -k "system-images;android-35;google_apis;x86_64" -d pixel_7
```

### App abre mas não carrega nada (tela branca / preta)

Por usar a estratégia *remote URL*, o WebView carrega uma URL externa — se ela
não responder, a tela fica vazia. Causas e soluções:

1. **A URL de produção (`PRODUCTION_URL` em `capacitor.config.ts`) está errada.**
   O valor inicial é um palpite. Pegue a URL real no
   [Firebase Console → App Hosting](https://console.firebase.google.com/project/focatto/apphosting)
   (domínio do backend) ou via CLI:
   ```bash
   firebase apphosting:backends:list   # ou: firebase hosting:sites:list
   ```
   Ajuste `PRODUCTION_URL` e rode `npx cap sync android`.

2. **O código novo do app ainda não está em produção.** A estratégia remote URL
   carrega o site publicado. Recursos desta branch (login Apple, exclusão de
   conta, `CapacitorInit`) só aparecem depois do deploy. Para desenvolver/testar
   **antes** do deploy, aponte para o seu dev server local:
   ```bash
   npm run dev   # Next.js na porta 3000 (host)
   # no emulador, o host é 10.0.2.2; cleartext é habilitado automaticamente p/ http:
   CAP_SERVER_URL=http://10.0.2.2:3000 npm run mobile:android:run
   # aparelho físico via USB na mesma rede: use o IP da sua máquina
   CAP_SERVER_URL=http://192.168.0.X:3000 npm run mobile:android:run
   ```

3. **Diagnóstico.** Veja o que o WebView está fazendo:
   ```bash
   adb logcat | grep -iE "Capacitor|chromium|WebView|ERR_"
   ```
   Ou inspecione o WebView no desktop em `chrome://inspect` (debugging já está
   habilitado em builds de debug via `webContentsDebuggingEnabled`).

> A splash screen tem `launchAutoHide: true`: ela some sozinha mesmo se o site
> não carregar, então você vê a página de erro do WebView (útil para diagnóstico)
> em vez de uma splash travada.

## Configuração obrigatória antes de publicar

### 1. Firebase (Google Sign-In nativo)

1. No [Firebase Console](https://console.firebase.google.com/project/focatto), registre:
   - App **Android** com pacote `br.com.focatto.app` e a impressão digital **SHA-1** (debug e release) — baixe o `google-services.json` real e substitua `android/app/google-services.json` (o atual é placeholder).
   - App **iOS** com bundle `br.com.focatto.app` — baixe o `GoogleService-Info.plist` real e substitua `ios/App/App/GoogleService-Info.plist`.
2. No iOS, copie o `REVERSED_CLIENT_ID` do plist real para `CFBundleURLTypes` em `ios/App/App/Info.plist` (há um placeholder marcado).

### 2. Sign in with Apple (obrigatório no iOS — guideline 4.8)

1. No [Apple Developer Portal](https://developer.apple.com/account), habilite a capability **Sign in with Apple** para o App ID `br.com.focatto.app` (o entitlement já está em `ios/App/App/App.entitlements`).
2. No Firebase Console → Authentication → Sign-in method, habilite o provedor **Apple**.
3. O botão "Entrar com Apple" aparece automaticamente no app iOS (`LoginModal`).

### 3. URL de produção

`capacitor.config.ts` aponta para `https://focatto--focatto.us-central1.hosted.app`. Se o domínio de produção for outro (ex.: domínio próprio), atualize `PRODUCTION_URL` e rode `npx cap sync`.

### 4. Ícones e splash screens

Gere os assets a partir de uma arte 1024×1024 com [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets):

```bash
npx @capacitor/assets generate --iconBackgroundColor '#0b0908' --splashBackgroundColor '#0b0908'
```

## Checklist de publicação

### Google Play

- [ ] Substituir `google-services.json` pelo real (com SHA-1 de release).
- [ ] Criar keystore de upload e configurar signing em `android/app/build.gradle` (nunca commitar a keystore; use GitHub Secrets no CI).
- [ ] Incrementar `versionCode`/`versionName` em `android/app/build.gradle`.
- [ ] Gerar AAB: `npm run mobile:android:release`.
- [ ] Preencher **Data safety** no Play Console (coleta: e-mail, nome, telefone, endereço, fotos — sem tracking de terceiros).
- [ ] Declarar a **exclusão de conta**: o app permite excluir a conta e todos os dados em Perfil → Zona de Perigo (exigência da política de contas do Google Play). Informe também uma URL web (a página `/profile` do site).
- [ ] Política de privacidade publicada (URL obrigatória).
- [ ] Classificação etária e declarações de conteúdo.

### App Store

- [ ] Substituir `GoogleService-Info.plist` pelo real + `REVERSED_CLIENT_ID` no `Info.plist`.
- [ ] Capability Sign in with Apple ativa no provisioning profile.
- [ ] `MARKETING_VERSION`/`CURRENT_PROJECT_VERSION` incrementados.
- [ ] Arquivar e subir via Xcode/Transporter (exige macOS).
- [ ] **App Privacy** no App Store Connect coerente com `ios/App/App/PrivacyInfo.xcprivacy` (e-mail, nome, telefone, endereço, fotos — vinculados ao usuário, sem tracking).
- [ ] Exclusão de conta in-app (guideline 5.1.1(v)) — já implementada em Perfil → Zona de Perigo.
- [ ] Sign in with Apple visível sempre que o login Google for oferecido (guideline 4.8) — já implementado.
- [ ] Importante para a review: o app usa WebView com conteúdo próprio + recursos nativos (login nativo, push futuro). Descreva isso nas notas de review para evitar rejeição por guideline 4.2 (minimum functionality).

## Solução de problemas

| Problema | Causa provável |
| --- | --- |
| Login Google falha no Android | `google-services.json` placeholder ou SHA-1 não cadastrado no Firebase |
| Login Google falha no iOS | `GoogleService-Info.plist` placeholder ou `REVERSED_CLIENT_ID` ausente no `Info.plist` |
| Login Apple falha | Capability/provedor Apple não habilitados (Apple Developer + Firebase) |
| App abre mas não carrega nada (tela branca) | `PRODUCTION_URL` errada ou código novo ainda não deployado — ver seção "App abre mas não carrega nada" |
| App abre tela offline com internet | `PRODUCTION_URL` incorreta em `capacitor.config.ts` |
| Mudanças no config não refletem | Rodar `npx cap sync` após editar `capacitor.config.ts` |
| `invalid source release: 21` | Gradle rodando em JDK < 21; aponte para um JDK 21 (ver "JDK 21 é obrigatório") |
| `SDK location not found` | Defina `ANDROID_HOME`/`ANDROID_SDK_ROOT` ou crie `android/local.properties` com `sdk.dir=` |
| `Could not resolve com.android.tools.build:gradle` | Sem acesso ao `dl.google.com` (Maven do Google) na rede do build |
