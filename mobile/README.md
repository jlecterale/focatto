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

# Desenvolvimento apontando para o dev server local:
CAP_SERVER_URL=http://SEU_IP:3000 npx cap sync
```

O workflow `.github/workflows/mobile.yml` valida o build web, roda `cap sync` e gera o APK de debug a cada mudança no código.

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
| App abre tela offline com internet | `PRODUCTION_URL` incorreta em `capacitor.config.ts` |
| Mudanças no config não refletem | Rodar `npx cap sync` após editar `capacitor.config.ts` |
