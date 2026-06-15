# CLAUDE.md — App Mobile Focatto (Capacitor)

Guia para o Claude Code trabalhar no app mobile Android/iOS do Focatto. Para o histórico geral do projeto e diretrizes de outros agentes, consulte `agents.md`.

## Visão geral

- **Focatto** é um marketplace de instrumentos musicais (Next.js 16 + React 19 + Tailwind 4 + Firebase: Auth, Firestore, Storage), hospedado no Firebase App Hosting.
- O **app mobile** é um wrapper Capacitor 7 com estratégia **remote URL**: o WebView carrega o site de produção e o bridge nativo é injetado nele. Não há build web separado para o app — o código em `src/` serve web e mobile ao mesmo tempo.
- `mobile/www/` é só um shell offline. Os projetos nativos ficam em `android/` e `ios/App/`.
- Documentação completa do app (setup do Firebase, checklist das lojas): `mobile/README.md`.

## Comandos essenciais

```bash
npm run build                    # build web — SEMPRE rode antes de finalizar mudanças em src/
npm run lint                     # lint
npx cap sync                     # após mudar capacitor.config.ts ou instalar plugin
npm run mobile:android:debug     # APK de debug (exige Android SDK)
npm run mobile:android:run       # builda + sobe emulador/dispositivo + instala (cap run)
npm run mobile:emulator          # sobe um AVD, espera o boot e instala o APK
npm run cap:ios                  # abre Xcode (somente macOS)
```

## Regras específicas do app

1. **Detecção de plataforma**: use os helpers de `src/lib/native.ts` (`isNativeApp()`, `isIosApp()`, `isAndroidApp()`). Nunca chame `Capacitor.getPlatform()` direto em componentes.
2. **Plugins Capacitor**: importe sempre com `await import("...")` dentro de caminhos que só executam no nativo (evita problemas de SSR do Next.js e mantém o bundle web leve).
3. **Autenticação**:
   - No nativo, popups OAuth não funcionam (WebView). O fluxo usa `@capacitor-firebase/authentication` e sincroniza com o SDK JS via `signInWithCredential` (`src/contexts/AuthContext.tsx`).
   - Apple Sign-In usa `skipNativeAuth: true` por chamada (token da Apple é de uso único).
   - O botão Apple só aparece no app iOS (`LoginModal.tsx`) — exigência da guideline 4.8.
4. **Exclusão de conta** (`src/lib/accountService.ts` + Perfil → Zona de Perigo): exigida pela App Store 5.1.1(v) e pelo Google Play. Se criar novas coleções no Firestore vinculadas ao usuário, **adicione a limpeza correspondente em `deleteUserAccount`**.
5. **Hidratação SSR**: qualquer UI condicional por plataforma deve usar `useState` + `useEffect` (ver `showAppleLogin` no `LoginModal`) para não divergir entre servidor e cliente.
6. **Arquivos placeholder**: `android/app/google-services.json` e `ios/App/App/GoogleService-Info.plist` são placeholders públicos — não inserir segredos neles; os reais vêm do Firebase Console.
7. **Não edite código gerado** dentro de `android/` e `ios/` que o `cap sync` sobrescreve (`capacitor.config.json`, `public/`, `capacitor.build.gradle`, `Podfile` gerenciado). Configurações persistentes ficam em `capacitor.config.ts`, `AndroidManifest.xml`, `Info.plist`, `App.entitlements` e `build.gradle` do app.
8. **CI**: `.github/workflows/mobile.yml` builda web + APK debug a cada push. Mantenha-o verde.
9. **agents.md**: ao concluir uma tarefa, registre o resumo da alteração no histórico do `agents.md` (diretriz do repositório).

## Toolchain Android

- **Gradle 9.0.0** (`android/gradle/wrapper/gradle-wrapper.properties`) + **AGP 8.13.0** (`android/build.gradle`). Esses arquivos não são sobrescritos pelo `cap sync`, então os bumps persistem.
- **JDK 21 é obrigatório**: o Capacitor 7 fixa `VERSION_21` nos próprios módulos. Rodar o Gradle num JDK < 21 gera `invalid source release: 21`. Não adianta baixar o alvo para 17. Aponte o Gradle para um JDK 21 via `org.gradle.java.home` (em `android/gradle.properties`) ou `JAVA_HOME`. O CI já usa `java-version: 21`.
- **Build sem Android Studio**: `npm run mobile:android:debug` chama o `gradlew` direto — só precisa do Android SDK (`ANDROID_HOME`/`local.properties`) + JDK 21. `cap:android` só abre o Studio (opcional).
- No Gradle 9, `Project.buildDir` foi removido; o `clean` usa `rootProject.layout.buildDirectory`. Não reintroduza `buildDir`.

## Armadilhas conhecidas

- `.npmrc` tem `legacy-peer-deps=true` porque `@capacitor-firebase/authentication` declara peer `firebase@^11` e o projeto usa `firebase@12` (compatível). Não remova sem testar `npm ci`.
- O Next.js usa `experimental.serverActions` no config mas não há server actions em uso; o app depende disso continuar assim (remote URL exige o site no ar).
- Mudou `PRODUCTION_URL` ou plugins? Rode `npx cap sync` e commite as alterações geradas em `android/` e `ios/`.
- Rotas dinâmicas impedem `output: "export"`; se um dia o site virar estático, o app pode passar a embarcar os assets (mudar `webDir` e remover `server.url`).
