# 🤖 Registro de Atividades e Diretrizes dos Agentes (agents.md)

Este documento registra o histórico de intervenções dos agentes de Inteligência Artificial no projeto **Focatto**, mantendo uma trilha clara de modificações, decisões de design e tarefas pendentes.

> [!IMPORTANT]
> **DIRETRIZ OBRIGATÓRIA PARA TODOS OS AGENTES:**
> Sempre que concluir uma tarefa ou alteração no código, você **DEVE** atualizar este arquivo (`agents.md`) com o resumo das alterações efetuadas, arquivos modificados e o estado atual da aplicação. Isso garante a continuidade do desenvolvimento em sessões futuras.

---

## 📅 Histórico de Intervenções

### 15/06/2026 — Correção do app que abria no emulador sem carregar (remote URL)
*   **Objetivo**: Resolver o app abrindo no emulador com tela em branco.
*   **Causa**: `SplashScreen.launchAutoHide: false` dependia de `SplashScreen.hide()` (em `CapacitorInit`), mas a estratégia remote URL carrega o site **publicado**, que ainda não tem esse código — então a splash ficava presa. Some-se a isso a `PRODUCTION_URL` ser um palpite (não há a URL real no repo).
*   **Arquivos Modificados**:
    *   `capacitor.config.ts` — `launchAutoHide: true` (+ spinner), `webContentsDebuggingEnabled: true` no Android e `server.cleartext` automático quando `CAP_SERVER_URL` é `http://` (permite testar contra o dev server local; `10.0.2.2` é o host no emulador).
    *   `mobile/README.md` / `CLAUDE.md` — seção "App abre mas não carrega nada" (verificar `PRODUCTION_URL` no Firebase App Hosting, testar com dev server local, diagnóstico via `adb logcat`/`chrome://inspect`).
*   **Pendência do usuário**: confirmar a `PRODUCTION_URL` real (Firebase Console → App Hosting) ou desenvolver apontando para o dev server local até o deploy do código novo.
*   **Estado**: Concluído; `cap sync` validado (cleartext alterna conforme o esquema da URL).

### 15/06/2026 — Upgrade do Android para Gradle 9 + JDK 21 e build sem Android Studio
*   **Objetivo**: Atualizar o projeto Android para Gradle 9, resolver o erro `invalid source release: 21` no `mobile:android:debug` e documentar o build sem Android Studio (apenas com o Android SDK).
*   **Arquivos Modificados**:
    *   `android/gradle/wrapper/gradle-wrapper.properties` — Gradle `8.11.1` → `9.0.0`.
    *   `android/build.gradle` — AGP `8.7.2` → `8.13.0` (mínimo compatível com Gradle 9); `task clean` migrado para `tasks.register('clean', Delete)` usando `rootProject.layout.buildDirectory` (o `Project.buildDir` foi removido no Gradle 9).
    *   `android/gradle.properties` — `-Xmx2048m`, encoding UTF-8 e dica comentada de `org.gradle.java.home` para JDK 21.
    *   `mobile/README.md` — nova seção "Toolchain Android" (Gradle/AGP/JDK), "JDK 21 é obrigatório", "Build sem Android Studio" e novos itens na tabela de troubleshooting; `CLAUDE.md` — seção "Toolchain Android".
*   **Causa do erro `invalid source release: 21`**: o Capacitor 7 fixa `VERSION_21` nos próprios módulos (`@capacitor/android`, `@capacitor-firebase/authentication`), então o build exige JDK 21; baixar o alvo para 17 não resolve. A correção é rodar o Gradle num JDK 21 (`org.gradle.java.home`/`JAVA_HOME`).
*   **Build sem Android Studio**: `npm run mobile:android:debug` já usa o `gradlew` diretamente — basta Android SDK (`ANDROID_HOME`/`local.properties`) + JDK 21; `cap:android` (abrir o Studio) é opcional.
*   **Emulador/instalação**: adicionados `npm run mobile:android:run` (`cap run android`: builda, sobe o alvo e instala) e `npm run mobile:emulator` (`scripts/android-emulator.sh`: sobe um AVD, espera o boot, instala o APK de debug e abre o app).
*   **Verificação**: Gradle 9.0.0 baixado e executado sobre JDK 21 com sucesso; `build.gradle` avaliado sem erros sob Gradle 9. A resolução do AGP/Google Maven não roda no sandbox (egress bloqueado para `dl.google.com`); validação completa do APK fica para o CI (que usa JDK 21 e tem acesso ao Maven).
*   **Estado**: Concluído; verificação final do APK pelo workflow.

### 11/06/2026 — App Mobile Android/iOS com Capacitor
*   **Objetivo**: Criar o app mobile do Focatto (Android e iOS) com Capacitor 7 no mesmo repositório, seguindo os requisitos de publicação da Play Store e App Store: Sign in with Apple no iOS (guideline 4.8), exclusão completa de conta no perfil (App Store 5.1.1(v) e política do Google Play), workflow de CI e documentação.
*   **Arquitetura**: Estratégia *remote URL* — o WebView nativo carrega o site Next.js em produção (SSR e rotas dinâmicas inviabilizam export estático) e o bridge do Capacitor é injetado para os plugins nativos funcionarem. `mobile/www/` contém apenas o shell offline.
*   **Arquivos Criados/Modificados**:
    *   `capacitor.config.ts` — Configuração do app (`br.com.focatto.app`, remote URL, splash, status bar, FirebaseAuthentication).
    *   `android/`, `ios/App/` — Projetos nativos gerados (`npx cap add`), com `google-services.json`/`GoogleService-Info.plist` placeholders, entitlement de Sign in with Apple, `PrivacyInfo.xcprivacy` e strings de privacidade no `Info.plist`.
    *   `src/lib/native.ts` — Helpers de detecção de plataforma.
    *   `src/lib/accountService.ts` — Exclusão completa da conta: produtos, favoritos, propostas, chats, avaliações, notificações, verificações, perfis de professor/luthier, arquivos do Storage, doc do usuário e credencial do Firebase Auth (com reautenticação quando exigida).
    *   `src/contexts/AuthContext.tsx` — `loginWithApple`, login Google nativo via `@capacitor-firebase/authentication` e `deleteAccount`.
    *   `src/components/LoginModal.tsx` — Botão "Entrar com Apple" (exibido no app iOS).
    *   `src/app/profile/page.tsx` — "Zona de Perigo" com modal de exclusão de conta (confirmação digitada + senha quando aplicável).
    *   `src/components/CapacitorInit.tsx` + `src/app/layout.tsx` — Inicialização nativa (splash, status bar, botão voltar do Android) e viewport com `viewport-fit=cover`.
    *   `.github/workflows/mobile.yml` — CI: build web, `cap sync` e APK de debug a cada mudança.
    *   `mobile/README.md` — Setup do Firebase e checklist de publicação nas lojas; `CLAUDE.md` — guia do app para o Claude Code; `.npmrc` — `legacy-peer-deps` (peer firebase@^11 vs firebase@12).
*   **Pendências manuais**: registrar os apps Android/iOS no Firebase Console e substituir os arquivos de config placeholders; habilitar capability Sign in with Apple; gerar ícones/splash com `@capacitor/assets`; configurar keystore de release.
*   **Estado**: Concluído e validado com build de produção web; APK validado no CI.

### 10/06/2026 — Chat Interno e Opção de Ligação Direta para Anunciantes
*   **Objetivo**: Implementar um sistema de chat interno em tempo real via Firestore e adicionar um botão de ligação direta (protocolo `tel:`), além do WhatsApp existente, em todas as páginas de contato com anunciantes. Adicionar o botão `<ChatHeaderButton />` em todos os cabeçalhos para acesso rápido às conversas com badge de mensagens não lidas.
*   **Arquivos Criados/Modificados**:
    *   [`src/lib/chatService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/chatService.ts) — Novo serviço Firebase: criação/busca de chats (`createOrGetChat`), envio de mensagens (`sendMessage`), escuta em tempo real (`listenToMessages`, `listenToUserChats`), contagem de não lidas.
    *   [`src/components/ChatHeaderButton.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/components/ChatHeaderButton.tsx) — Botão de cabeçalho com badge de contagem de mensagens não lidas em tempo real.
    *   [`src/app/chat/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/chat/page.tsx) — Página completa de chat: lista de conversas à esquerda, área de mensagens à direita, responsiva para mobile.
    *   [`src/app/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/page.tsx) — Adicionados botões WhatsApp, Ligar e Chat Interno no card de detalhe do anúncio; `<ChatHeaderButton />` no header.
    *   [`src/app/anuncio/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/anuncio/[id]/page.tsx) — Botões de WhatsApp, Ligação e Chat Interno no painel lateral; `<ChatHeaderButton />` no header.
    *   [`src/app/vendedor/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/vendedor/[id]/page.tsx) — Botões de WhatsApp, Ligação e Chat Interno na sidebar de contato; `<ChatHeaderButton />` no header.
    *   [`src/app/meus-anuncios/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/meus-anuncios/page.tsx) — `<ChatHeaderButton />` adicionado ao header.
    *   [`src/app/profile/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/profile/page.tsx) — `<ChatHeaderButton />` adicionado ao header.
    *   Painel admin: [`src/app/admin/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/admin/page.tsx), [`admin/produtos/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/admin/produtos/page.tsx), [`admin/usuarios/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/admin/usuarios/page.tsx), [`admin/verificacoes/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/admin/verificacoes/page.tsx) — `<ChatHeaderButton />` adicionado a todos os cabeçalhos administrativos.
*   **Schema Firestore**:
    *   `chats/{chatId}`: `participants[]`, `participantNames{}`, `participantPhotos{}`, `unreadCount{}`, `lastMessage`, `lastMessageAt`, `relatedProduct?{}`.
    *   `chats/{chatId}/messages/{msgId}`: `senderId`, `text`, `createdAt`.
*   **Estado**: Concluído e validado com build de produção (zero erros TypeScript).

### 10/06/2026 — Notificações em Tempo Real para Anúncios Favoritados
*   **Objetivo**: Configurar o Firebase e a aplicação para notificar em tempo real quando um anúncio de um usuário for favoritado por outra pessoa. A notificação deve ser exibida através de um painel dropdown no cabeçalho (com badge de contagem de não lidas) e alertas de toast imediatos em tempo real.
*   **Arquivos Criados/Modificados**:
    *   [`firestore.rules`](file:///c:/Users/USER%201/Desktop/focatto/firestore.rules) — Regras de leitura, criação, atualização e exclusão para a coleção `/notifications`.
    *   [`firestore.indexes.json`](file:///c:/Users/USER%201/Desktop/focatto/firestore.indexes.json) — Índice composto para buscas de notificações por `userId` ordenadas por `createdAt` desc.
    *   [`src/lib/roles.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/roles.ts) — Definição do tipo `NotificationData`.
    *   [`src/lib/notificationService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/notificationService.ts) — Novo módulo de serviço para criação, leitura, atualização e subscrição a notificações.
    *   [`src/lib/productService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/productService.ts) — Integração com o serviço de notificações ao favoritar anúncios.
    *   [`src/components/NotificationBell.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/components/NotificationBell.tsx) — Componente premium glassmorphic com badge de notificação e alertas em tempo real.
    *   [`src/index.css`](file:///c:/Users/USER%201/Desktop/focatto/src/index.css) — Adicionada animação swing para o ícone de sino.
    *   Headers das páginas: `src/app/page.tsx`, `src/app/profile/page.tsx`, `src/app/meus-anuncios/page.tsx`, `src/app/anuncio/[id]/page.tsx`, `src/app/vendedor/[id]/page.tsx`, e painel administrativo (`src/app/admin/page.tsx`, `produtos/page.tsx`, `usuarios/page.tsx`, `verificacoes/page.tsx`) — Integração do componente `<NotificationBell />`.
*   **Estado**: Concluído e verificado com build de produção.

### 10/06/2026 — Hub de Painel e Modo de Edição no Perfil do Usuário
*   **Objetivo**: Transformar a tela de Perfil (`/profile`) em um painel central limpo que exibe por padrão as seções: "Meus Anúncios", "Favoritos", "Atividades" e "Propostas Recebidas". Ocultar todos os formulários e configurações de edição de perfil (dados pessoais, endereço, luthier, professor, premium, verificação) atrás de um modo de edição toggle ("Editar Perfil"), melhorando significativamente a experiência de uso (UX) e organização.
*   **Arquivos Modificados**:
    *   [`src/lib/productService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/productService.ts) — Adicionado método `getUserFavorites` para carregar anúncios favoritados pelo usuário logado.
    *   [`src/app/profile/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/profile/page.tsx) — Refatorado layout para usar um painel com abas por padrão (`!isEditing`). Adicionado carregamento paralelo dos anúncios do usuário e dos detalhes de seus favoritos (com foto, preço, local). Adicionado atalhos para desfavoritar itens e excluir anúncios.
*   **Estado**: Concluído e validado com build de produção.

### 10/06/2026 — Correção de Consultas e Índices do Firestore (Painel Admin e Meus Anúncios)
*   **Objetivo**: Resolver problemas de anúncios ativos que não apareciam no Dashboard do Admin e de anúncios do próprio usuário (pendentes por padrão) que não eram exibidos na página "Meus Anúncios".
*   **Arquivos Modificados**:
    *   [`firestore.indexes.json`](file:///c:/Users/USER%201/Desktop/focatto/firestore.indexes.json) — Adicionados índices compostos obrigatórios para busca de Luthiers, Professores e Verificações pendentes, além de indexação geral por categoria.
    *   [`src/lib/productService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/productService.ts) — Ajuste das funções `getProductsByCategory` e `getProductsByCategories` para filtrar apenas anúncios `status == 'approved'`, correspondendo aos anúncios ativos e prevenindo erros de indexação/regras.
*   **Estado**: Concluído, implantado em produção e validado com build local.

### 10/06/2026 — Correção de Índices do Firestore e Exibição de Status de Anúncios
*   **Objetivo**: Corrigir erro em que anúncios de usuários não eram exibidos na página "Meus Anúncios" devido a índice incorreto no Firestore (que usava `sellerId` em vez de `userId`). Adicionar a exibição de tag "Ativo" ou "Pendente" para que o usuário saiba o andamento do anúncio. Corrigir carregamento de anúncios no perfil do vendedor para evitar erros de leitura.
*   **Arquivos Modificados**:
    *   [`firestore.indexes.json`](file:///c:/Users/USER%201/Desktop/focatto/firestore.indexes.json) — Substituição de `sellerId` por `userId` no índice composto de produtos e adição de índice para `userId` + `status` + `createdAt`.
    *   [`src/lib/productService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/productService.ts) — Criação da função `getUserApprovedProducts` para carregamento público seguro.
    *   [`src/app/vendedor/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/vendedor/[id]/page.tsx) — Ajuste da chamada para `getUserApprovedProducts`.
    *   [`src/app/meus-anuncios/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/meus-anuncios/page.tsx) — Exibição do status badge como `"Ativo"` para anúncios aprovados.
*   **Estado**: Concluído e validado com build de produção.

### 10/06/2026 — Avaliações de Perfil e Aprovamento do Administrador
*   **Objetivo**: Remover o sistema de avaliação individual de anúncios, mantendo apenas avaliações ao nível do perfil do vendedor. Adicionar a exibição das estrelas de avaliação logo abaixo do nome do vendedor na página do anúncio. Implementar um fluxo de aprovação das avaliações pelo administrador antes de se tornarem visíveis.
*   **Arquivos Modificados**:
    *   [`firestore.rules`](file:///c:/Users/USER%201/Desktop/focatto/firestore.rules) — Atualização das regras de escrita e leitura de avaliações.
    *   [`src/app/admin/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/admin/page.tsx) — Painel administrativo com listagem de avaliações pendentes e botões de aprovação/rejeição.
    *   [`src/app/anuncio/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/anuncio/[id]/page.tsx) — Exibição das estrelas de avaliação do perfil do vendedor e redirecionamento.
    *   [`src/app/vendedor/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/vendedor/[id]/page.tsx) — Exibição e cálculo das avaliações apenas no perfil, com formulário de envio de avaliações.
    *   [`src/lib/ratingService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/ratingService.ts) — Funções Firebase para submissão de avaliações com `status = 'pending'`, listagem de pendentes e ação de aprovação.
    *   [`src/lib/roles.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/roles.ts) — Verificação de permissões do painel administrativo.
*   **Estado**: Concluído e verificado.

### 10/06/2026 — Métricas de Visualização, Favoritos e Propostas
*   **Objetivo**: Adicionar contagem de visualizações nos anúncios e rastreamento de favoritos. Implementar painel no perfil do vendedor exibindo as métricas dos seus anúncios e permitindo enviar propostas diretamente aos usuários que favoritaram seus anúncios.
*   **Arquivos Modificados**:
    *   [`firestore.rules`](file:///c:/Users/USER%201/Desktop/focatto/firestore.rules)
    *   [`src/app/anuncio/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/anuncio/[id]/page.tsx)
    *   [`src/app/meus-anuncios/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/meus-anuncios/page.tsx)
    *   [`src/app/profile/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/profile/page.tsx)
    *   [`src/lib/productService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/productService.ts)
    *   [`src/lib/roles.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/roles.ts)
*   **Estado**: Concluído.

### 10/06/2026 — Guia e Painel de Integração de Pagamentos no Brasil
*   **Objetivo**: Criar um painel interativo de informações sobre métodos de pagamento brasileiros (Pix, cartões, etc.), regras de integração, taxas e passos para homologação.
*   **Arquivos Criados/Modificados**:
    *   [`meios-pagamento.html`](file:///c:/Users/USER%201/Desktop/focatto/meios-pagamento.html) — Dashboard interativo completo de opções de pagamento brasileiras.
    *   [`funcionamento-pagamentos.html`](file:///c:/Users/USER%201/Desktop/focatto/funcionamento-pagamentos.html) — Guia detalhado da arquitetura de checkout e webhooks.
*   **Estado**: Concluído.

### 10/06/2026 — Sistema de Notificações de Pendências para Administradores
*   **Objetivo**: Adicionar badges e contagens visuais no cabeçalho e menu de administração para alertar sobre perfis de professores, luthiers ou produtos que aguardam aprovação do admin.
*   **Arquivos Modificados**:
    *   [`src/app/admin/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/admin/page.tsx)
    *   [`src/app/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/page.tsx)
    *   [`src/app/profile/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/profile/page.tsx)
    *   [`src/lib/roles.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/roles.ts)
    *   [`src/lib/userService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/userService.ts)
*   **Estado**: Concluído.

### 09/06/2026 — Categorias de Faixa Etária e Registro OMB para Professores de Música
*   **Objetivo**: Implementar a seleção de faixa etária atendida (crianças, adultos, idosos, todas as idades) e o número de registro na Ordem dos Músicos do Brasil (OMB) no cadastro de professores.
*   **Arquivos Modificados**:
    *   [`src/app/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/page.tsx)
    *   [`src/app/profile/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/profile/page.tsx)
    *   [`src/app/vendedor/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/vendedor/[id]/page.tsx)
    *   [`src/lib/roles.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/roles.ts)
*   **Estado**: Concluído.

### 09/06/2026 — Busca Automática de CEP com ViaCEP API
*   **Objetivo**: Adicionar preenchimento automático de endereço (bairro, cidade, estado, logradouro) a partir do CEP inserido pelo usuário no painel de perfil.
*   **Arquivos Modificados**:
    *   [`src/app/profile/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/profile/page.tsx)
    *   [`src/lib/validation.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/validation.ts)
*   **Estado**: Concluído.

### 09/06/2026 — Correção no Redirecionamento de Logout
*   **Objetivo**: Impedir que usuários visualizem uma tela preta/branca vazia ao realizar logout em páginas protegidas (como perfil ou painéis). Configurado redirecionamento limpo para a Home (`/`).
*   **Arquivos Modificados**:
    *   [`src/app/meus-anuncios/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/meus-anuncios/page.tsx)
    *   [`src/app/profile/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/profile/page.tsx)
    *   [`src/components/admin/AdminGuard.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/components/admin/AdminGuard.tsx)
*   **Estado**: Concluído.

### 08/06/2026 — Responsividade Mobile e Tablet
*   **Objetivo**: Corrigir vazamento de contêineres horizontais (`overflow-x`), ajustar paddings de grades e colunas flexíveis, além de truncar ou abreviar textos longos no header e cards.
*   **Arquivos Modificados**:
    *   [`src/app/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/page.tsx)
    *   [`src/app/plans/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/plans/page.tsx)
    *   [`src/app/profile/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/profile/page.tsx)
    *   [`src/index.css`](file:///c:/Users/USER%201/Desktop/focatto/src/index.css)
*   **Estado**: Concluído.

### 08/06/2026 — Carrossel de Banners Patrocinados e Simulador de ROI
*   **Objetivo**: Criar banner rotativo no topo para usuários pagantes específicos. Criar painel interativo offline detalhando o modelo de precificação e ROI para captação comercial.
*   **Arquivos Criados/Modificados**:
    *   [`src/components/BannerCarousel.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/components/BannerCarousel.tsx) — Componente do carrossel no topo.
    *   [`plano-banner-carrossel.html`](file:///c:/Users/USER%201/Desktop/focatto/plano-banner-carrossel.html) — Simulador de ROI e dashboard comercial.
    *   [`monetizacao.html`](file:///c:/Users/USER%201/Desktop/focatto/monetizacao.html) — Modelo geral de monetização.
*   **Estado**: Concluído.

### 10/06/2026 — Propostas de Troca com Descrição Livre, Fotos (10MB) e Notificação ao Comprador
*   **Objetivo**: Adicionar suporte a propostas de troca (além das propostas de valor existentes) quando um vendedor envia proposta para um usuário que favoritou seu anúncio. O vendedor pode descrever livremente o item de troca, selecionar categoria/condição, fazer upload de até 4 fotos (limite de 10MB cada via Firebase Storage) e opcionalmente definir um valor de diferença. O comprador agora também recebe notificação em tempo real quando uma proposta é criada.
*   **Arquivos Modificados**:
    *   [`src/lib/roles.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/roles.ts) — Adicionados campos `type`, `tradeDescription`, `tradeCategory`, `tradeCondition`, `tradePhotos`, `tradeValue` ao `ProposalData`.
    *   [`src/lib/productService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/productService.ts) — Refatorado `createProposal` para aceitar `type` e campos de troca, upload de fotos para `storage/proposals/`, e criação de notificação `type:"proposal"` para o receiver.
    *   [`src/app/meus-anuncios/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/meus-anuncios/page.tsx) — Modal de proposta com toggle Valor/Troca, campos dinâmicos, upload de fotos com validação de 10MB, preview e remoção. Badge de status exibe "Troca" ou "R$ X".
    *   [`src/app/profile/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/profile/page.tsx) — Aba "Propostas" agora exibe badge "Valor"/"Troca", detalhes do item de troca (descrição, categoria, condição, fotos clicáveis) e valor de referência.
*   **Estado**: Concluído, build validado, rules/indexes em produção.
*   **Objetivo**: Diagnosticar e corrigir falha no chat interno que impedia sua inicialização. Causa raiz: security rule `allow read` em `chats` negava leitura quando o documento não existia (primeiro acesso via `getDoc`), gerando `Missing or insufficient permissions`. Também corrigido loading infinito nos listeners do Firestore por falta de chamada ao callback em caso de erro.
*   **Arquivos Modificados**:
    *   [`firestore.rules`](file:///c:/Users/USER%201/Desktop/focatto/firestore.rules) — Regra de leitura em `/chats/{chatId}` alterada para `allow read: if isAuth() && (resource == null || request.auth.uid in resource.data.participants)`, permitindo `getDoc()` em documentos inexistentes.
    *   [`src/lib/chatService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/chatService.ts) — Adicionado `callback([])` no error handler de `listenToUserChats`, `listenToChatMessages` e `callback(0)` em `listenToUnreadChatsCount` para evitar loading infinito quando a query do Firestore falha.
*   **Estado**: Concluído e validado com build de produção + deploy das rules e índices.

---

## 🛠️ Status Tecnológico e Arquitetural

*   **Framework**: Next.js v16.2.7 (App Router), React 19.
*   **Estilização**: Tailwind CSS v4.0.0-alpha, PostCSS.
*   **Banco de Dados/Autenticação**: Firebase Client SDK (Firestore + Auth).
*   **Mobile**: Capacitor 7 (Android + iOS) com estratégia remote URL; login nativo Google/Apple via `@capacitor-firebase/authentication`. Ver `mobile/README.md` e `CLAUDE.md`.
*   **Design**: Ícones do Phosphor React e Lucide React. UI moderna com foco em responsividade e UX para o público musical.

---

## 🧰 Skills Sugeridas para Agentes/LLMs

Sugestões de "skills" (procedimentos reutilizáveis) que qualquer LLM/agente pode seguir ao trabalhar neste repositório. Cada skill lista o gatilho, os passos e os critérios de pronto.

### Skill: `web-feature`
*   **Quando usar**: criar/alterar páginas, componentes ou serviços do site.
*   **Passos**: (1) localizar serviços existentes em `src/lib/*Service.ts` antes de criar novos; (2) seguir o padrão visual dark (`#0b0908`/`#141211`, accent `#ef7c2c`→`#d4ae12`, cantos `rounded-xl/2xl`); (3) textos de UI em pt-BR; (4) toasts via `sonner`; (5) rodar `npm run build` (zero erros TypeScript).
*   **Pronto quando**: build de produção passa e o histórico em `agents.md` foi atualizado.

### Skill: `firestore-schema`
*   **Quando usar**: criar coleção ou campo novo no Firestore.
*   **Passos**: (1) atualizar `firestore.rules` e `firestore.indexes.json`; (2) tipar em `src/lib/roles.ts`; (3) criar funções de acesso no service correspondente; (4) **adicionar a limpeza da nova coleção em `src/lib/accountService.ts` (`deleteUserAccount`)** — exigência das lojas de apps; (5) validar com os emuladores (`firebase emulators:start`).
*   **Pronto quando**: regras, índices, tipos e exclusão de conta cobrem a nova coleção.

### Skill: `mobile-sync`
*   **Quando usar**: qualquer mudança em `capacitor.config.ts`, instalação/remoção de plugin Capacitor ou alteração que afete o app nativo.
*   **Passos**: (1) `npx cap sync`; (2) commitar as mudanças geradas em `android/` e `ios/`; (3) conferir que o workflow `mobile.yml` continua verde; (4) código que usa plugin nativo deve passar por `src/lib/native.ts` e `await import(...)`.
*   **Pronto quando**: `cap sync` roda sem erros e o APK de debug compila no CI.

### Skill: `native-auth`
*   **Quando usar**: mexer em login, logout, registro ou exclusão de conta.
*   **Passos**: (1) toda mudança vai em `src/contexts/AuthContext.tsx` (web e nativo compartilham o fluxo); (2) no nativo, OAuth usa `@capacitor-firebase/authentication` + `signInWithCredential` (popups não funcionam em WebView); (3) Apple Sign-In mantém `skipNativeAuth: true`; (4) tratar `auth/requires-recent-login` com reautenticação; (5) testar os três provedores: senha, Google e Apple.
*   **Pronto quando**: web e app continuam autenticando e `onAuthStateChanged` reflete a sessão.

### Skill: `store-compliance`
*   **Quando usar**: antes de qualquer release nas lojas ou mudança que toque dados do usuário.
*   **Passos**: (1) revisar o checklist de `mobile/README.md`; (2) garantir exclusão de conta funcional (Perfil → Zona de Perigo); (3) Sign in with Apple visível sempre que houver login Google no iOS; (4) atualizar `PrivacyInfo.xcprivacy` e o Data Safety do Play Console se a coleta de dados mudou; (5) incrementar versões (`versionCode`/`MARKETING_VERSION`).
*   **Pronto quando**: checklist completo sem pendências novas.

### Skill: `release-android` / `release-ios`
*   **Quando usar**: gerar builds de release.
*   **Passos Android**: substituir `google-services.json` real → keystore configurada → `npm run mobile:android:release` → AAB no Play Console.
*   **Passos iOS** (exige macOS): substituir `GoogleService-Info.plist` real + `REVERSED_CLIENT_ID` no `Info.plist` → `npx cap sync ios` → `pod install` → arquivar no Xcode → App Store Connect.
*   **Pronto quando**: build assinado e enviado, com notas de review descrevendo os recursos nativos.

---

## 📌 Próximos Passos e Backlog

1.  **Validação Completa**: Realizar auditorias contínuas de segurança nas regras do Firestore (`firestore.rules`) para garantir que os status das avaliações e perfis não possam ser editados por usuários não autorizados.
2.  **Monitoramento**: Validar se o carregamento dinâmico de CEPs e as chamadas ao ViaCEP não causam lentidão no cadastro.
3.  **Atualização de agents.md**: Lembrar os agentes de SEMPRE adicionar novos tópicos ao histórico ao concluir qualquer alteração.
