# 🤖 Registro de Atividades e Diretrizes dos Agentes (agents.md)

Este documento registra o histórico de intervenções dos agentes de Inteligência Artificial no projeto **Focatto**, mantendo uma trilha clara de modificações, decisões de design e tarefas pendentes.

> [!IMPORTANT]
> **DIRETRIZ OBRIGATÓRIA PARA TODOS OS AGENTES:**
> Sempre que concluir uma tarefa ou alteração no código, você **DEVE** atualizar este arquivo (`agents.md`) com o resumo das alterações efetuadas, arquivos modificados e o estado atual da aplicação. Isso garante a continuidade do desenvolvimento em sessões futuras.

---

## 📅 Histórico de Intervenções

### 19/07/2026 — Correção de Falhas de Segurança, Bugs de Runtime, Dependências e Relatório Atualizado
*   **Objetivo**: Mitigar e corrigir todas as 8 ocorrências apontadas no relatório de auditoria do Focatto. Implementar as correções ordenadas por importância, rodar testes redundantes de compilação (build) e lint, e atualizar o relatório interativo do Desktop.
*   **Arquivos Criados/Modificados**:
    *   [`src/app/api/cifraclub/route.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/app/api/cifraclub/route.ts) — Modificado. Adicionada validação de hostname contra domínio do Cifra Club contra ataques SSRF.
    *   [`firestore.rules`](file:///c:/Users/USER%201/Desktop/focatto/firestore.rules) — Modificado. Reforçada regra de criação de usuários para prevenir escalação de privilégios admin.
    *   [`src/contexts/AuthContext.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/contexts/AuthContext.tsx) — Modificado. Envolvido sync de usuário em try/catch/finally para evitar loading lock.
    *   [`src/lib/productService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/productService.ts) — Modificado. Adicionado deleteObject do storage na remoção de produtos contra vazamento de mídias.
    *   [`src/app/anuncio/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/anuncio/[id]/page.tsx) — Modificado. Acoplado o mapa interativo dinâmico Leaflet na barra lateral do anúncio.
    *   [`src/firebase.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/firebase.ts) — Modificado. Removidos fallbacks de credenciais do Firebase.
    *   [`package.json`](file:///c:/Users/USER%201/Desktop/focatto/package.json) & [`.eslintrc.json`](file:///c:/Users/USER%201/Desktop/focatto/.eslintrc.json) — Modificados. Instalado ESLint v8 e eslint-config-next. Adicionado overrides de postcss contra XSS.
    *   [`C:\Users\USER 1\Desktop\focatto auditoria 19-07.html`](file:///C:/Users/USER%201/Desktop/focatto%20auditoria%2019-07.html) — Modificado. Atualizado com status 100% resolvido.
*   **Estado**: Concluído com sucesso. Todos os testes (lint de zero erros e build de produção) validados com sucesso.

### 14/07/2026 — Ajuste de Impressão do Pitch Centelha Focatto e Inclusão de Jonatas Freire (CEO)
*   **Objetivo**: Reestruturar o arquivo do pitch HTML para corrigir a quebra de elementos e páginas na geração do PDF, exibir todas as tecnologias na versão impressa (ocultando abas dinâmicas) e incluir Jonatas Freire (CEO & Fundador) na equipe com sua respectiva foto circular e atribuições, além de atualizar as menções no Hero e rodapé. Remover também marcas rasuradas de membros antigos.
*   **Arquivos Criados/Modificados**:
    *   [`c:\Users\USER 1\Desktop\apresentacao focatto centelha\pitch_focatto_centelha.html`](file:///c:/Users/USER%201/Desktop/apresentacao%20focatto%20centelha/pitch_focatto_centelha.html) — Modificado. Remoção do texto de membro removido, modificação das regras CSS (adição de `@media print` específica com redimensionamentos, ocultamento de headers, quebras de páginas, exibição linear de abas de tecnologias, etc.) e adição de Jonatas Freire e Flávio Lima como co-autores da equipe.
    *   [`c:\Users\USER 1\Desktop\apresentacao focatto centelha\jonatas.jpg`](file:///c:/Users/USER%201/Desktop/apresentacao%20focatto%20centelha/jonatas.jpg) — Criado. Copiado da imagem oficial do Desktop.
    *   [`c:\Users\USER 1\Desktop\apresentacao focatto centelha\pitch_focatto_centelha.pdf`](file:///c:/Users/USER%201/Desktop/apresentacao%20focatto%20centelha/pitch_focatto_centelha.pdf) — Atualizado. Recriado com sucesso através da exportação headless do Chrome.
*   **Estado**: Concluído e verificado com sucesso.

### 08/07/2026 — Importação por URL Cifra Club, Edição de Cifras e Link do Deezer
*   **Objetivo**: Adicionar a capacidade de importar cifras inserindo URLs do Cifra Club (musicas individuais ou coleções/playlists completas em lote) com preenchimento de campos de forma automatizada. Fornecer editor direto de cifras no visualizador, opção de salvar tom transposto permanentemente na música e adicionar suporte para links e botões de áudio do Deezer.
*   **Arquivos Criados/Modificados**:
    *   [`src/app/api/cifraclub/route.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/app/api/cifraclub/route.ts) — Nova rota de API de raspagem com tratamento de cabeçalhos e suporte a listas de reprodução.
    *   [`src/app/agenda/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/agenda/page.tsx) — Inclusão de estados e handlers de importação por URL, checkboxes de seleção de lote, formulário de edição inline, gravação de tom transposto e campos de link do Deezer.
*   **Estado**: Concluído e verificado via build de produção com sucesso.

### 08/07/2026 — Ajuste de Cifras estilo Cifra Club e Auto-conversão de Pastes
*   **Objetivo**: Adequar a visualização de cifras na agenda para renderizar acordes sobre a letra (alinhados horizontalmente) sem quebras visuais nas palavras. Adicionar conversão inteligente e imediata no paste e blur do formulário para viabilizar o uso do Cifra Club como base das cifras do app, além de botão para busca direta facilitada.
*   **Arquivos Modificados**:
    *   [`src/app/agenda/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/agenda/page.tsx) — Implementação de rotinas de análise harmônica, interceptores no formulário e reformatação do pre container de exibição.
*   **Estado**: Concluído e verificado via build de produção com sucesso.

### 08/07/2026 — Splash Landing Page de Seleção e Módulo de Agenda Musical (Louve App)
*   **Objetivo**: Criar uma Landing Page premium como tela inicial do Focatto (`/`), direcionando o usuário para as verticais do app: Marketplace, Aulas de Música, Luthiers e Agenda Musical. O botão de Agenda Musical abre um modal de seleção rápida do tipo de grupo/banda (Ministério, GIG/Freelancer, Baile, Agência, Coral, Outros). Ao escolher, redireciona o usuário para o esqueleto funcional e personalizado da nova Agenda Musical (`/agenda?type=...`).
*   **Arquivos Criados/Modificados**:
    *   [`src/app/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/page.tsx) — Nova Landing Page premium com cards de glassmorphism, gradientes interativos e modal de tipos de bandas.
    *   [`src/app/explore/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/explore/page.tsx) — Antiga página inicial movida para cá, adaptada para ler query strings (`?tab=...`) para ativar dinamicamente a aba correspondente do marketplace/luthiers/professores, e envolta em `Suspense` para conformidade de build.
    *   [`src/app/agenda/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/agenda/page.tsx) — Nova página de Agenda com layouts, dicas e fluxos iniciais dedicados e personalizados para o tipo de banda escolhido, servindo como base para as funcionalidades de Escala e Cifras inspiradas no Louve App.
*   **Estado**: Concluído e verificado com sucesso via build de produção do Next.js.

### 24/06/2026 — Criação da Apresentação RecarGarage no Desktop
*   **Objetivo**: Criar uma pasta no Desktop com arquivos de texto (.txt) e apresentação interativa (.html) detalhando o ecossistema RecarGarage/Focatto, a stack tecnológica, a arquitetura de segurança (Security Rules) e os planos de evolução futura, destacando o impacto social (fomento à luthieria e rede social de músicos).
*   **Arquivos Criados**:
    *   [`C:\Users\USER 1\Desktop\Apresentacao Focatto\apresentacao.txt`](file:///C:/Users/USER%201/Desktop/Apresentacao%20Focatto/apresentacao.txt) — Explicação textual e aprofundada de toda a lógica do projeto.
    *   [`C:\Users\USER 1\Desktop\Apresentacao Focatto\apresentacao.html`](file:///C:/Users/USER%201/Desktop/Apresentacao%20Focatto/apresentacao.html) — Apresentação interativa de altíssima qualidade visual, incluindo simulador de ROI e explicação visual dinâmica do Ciclo Artístico Completo.
*   **Estado**: Concluído e disponibilizado diretamente na área de trabalho do usuário.

### 15/06/2026 — Restrição de Avaliação de Vendedor a Vendas Concluídas
*   **Objetivo**: Vincular o sistema de avaliação de vendedores à conclusão de uma venda (proposta de compra ou troca aceita), impedindo que qualquer usuário avalie perfis sem ter transacionado com eles.
*   **Arquivos Modificados**:
    *   [`src/lib/roles.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/roles.ts) — Adicionado campo `proposalId` à interface `RatingData`.
    *   [`src/lib/ratingService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/ratingService.ts) — Criada a função `getAcceptedProposal` para buscar propostas aceitas e atualizada `addRating` para receber e validar a proposta associada.
    *   [`src/app/vendedor/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/vendedor/[id]/page.tsx) — Carregamento de proposta aceita e condicionamento do formulário de avaliação à existência dessa transação.
    *   [`firestore.rules`](file:///c:/Users/USER%201/Desktop/focatto/firestore.rules) — Atualizada a regra de criação de `ratings` no Firestore para validar a proposta associada no servidor.
*   **Estado**: Concluído e verificado com build de produção (zero erros) e deploy das regras do Firestore concluído.

### 15/06/2026 — Rede Social Integrada e Gestão de Equipamentos no Perfil
*   **Objetivo**: Implementar uma rede social completa integrada aos perfis (com posts de fotos, vídeos do YouTube e áudios do SoundCloud), limite de upload de fotos por plano, reações com emojis, menções de usuários e locais, funcionalidade de seguir perfis com controle de notificações, aba Social de gerenciamento no Perfil privado e atalhos de integração no cabeçalho e páginas públicas.
*   **Arquivos Criados/Modificados**:
    *   [`src/app/social/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/social/page.tsx) — Feed Social Global com filtros dinâmicos de mídias, listagem de publicações, infinite scroll por cursor e sidebar de Perfis em Destaque.
    *   [`src/app/social/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/social/[id]/page.tsx) — Perfil Social Público do utilizador com banner, avatar, estatísticas (seguidores, seguindo, posts), e abas para Publicações, Equipamentos e Sobre.
    *   [`src/app/profile/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/profile/page.tsx) — Integração de nova aba "Perfil Social" contendo o `ContactPanel` (configurações) e o `EquipmentManager` (cadastro de equipamentos).
    *   [`src/app/vendedor/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/vendedor/[id]/page.tsx) — Reorganização de botões de contato, integração do botão de follow (`<FollowButton />`) e atalho "Ver Perfil Social".
    *   [`src/app/anuncio/[id]/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/anuncio/[id]/page.tsx) — Adicionado botão "Ver Perfil Social" no painel lateral do anunciante.
    *   [`src/app/page.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/app/page.tsx) — Adicionado link "Comunidade" (para `/social`) ao lado da logomarca no cabeçalho principal.
    *   [`src/lib/socialService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/socialService.ts) — Novo serviço social Firebase: posts, reações, seguir/unfollow, cotas de fotos por plano, pesquisa de tags.
    *   [`src/lib/roles.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/roles.ts) — Tipagem expandida com PostData, TaggedUser, ReactionType, UserFavoriteData, EquipmentItem, etc.
    *   [`src/lib/notificationService.ts`](file:///c:/Users/USER%201/Desktop/focatto/src/lib/notificationService.ts) — Suporte a notificações de `new_post` e `new_follower`.
    *   [`src/components/social/PostCard.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/components/social/PostCard.tsx) — Card com imagens/embeds, MapPin de local, marcações, e barra de 6 reações rápidas.
    *   [`src/components/social/CreatePostModal.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/components/social/CreatePostModal.tsx) — Modal para criar posts por tipo (Foto/YouTube/SoundCloud) com verificador de cotas.
    *   [`src/components/social/EquipmentManager.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/components/social/EquipmentManager.tsx) — Gestor de equipamentos com upload de imagem e limites baseados no plano.
    *   [`src/components/social/FollowButton.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/components/social/FollowButton.tsx) — Botão premium com controle granular de notificações por perfil seguido.
    *   [`src/components/social/ContactPanel.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/components/social/ContactPanel.tsx) — Painel dinâmico para início de chat interno, redirecionamento WhatsApp e ligação direta.
    *   [`src/components/social/UserSearchSelect.tsx`](file:///c:/Users/USER%201/Desktop/focatto/src/components/social/UserSearchSelect.tsx) — Input autocomplete com debounce para busca e marcação de pessoas.
    *   [`firestore.rules`](file:///c:/Users/USER%201/Desktop/focatto/firestore.rules) & [`storage.rules`](file:///c:/Users/USER%201/Desktop/focatto/storage.rules) — Regras de segurança para posts, equipamentos, fotos e favoritos.
    *   [`firestore.indexes.json`](file:///c:/Users/USER%201/Desktop/focatto/firestore.indexes.json) — 5 novos índices compostos para ordenação e filtragem das coleções sociais.
    *   [`src/index.css`](file:///c:/Users/USER%201/Desktop/focatto/src/index.css) — Novas animações para o motor social (reactionPulse, bounceIn, fadeSlideUp).
*   **Estado**: Concluído e verificado com build de produção (zero erros de compilação ou TypeScript).

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
*   **Design**: Ícones do Phosphor React e Lucide React. UI moderna com foco em responsividade e UX para o público musical.

---

## 📌 Próximos Passos e Backlog

1.  **Validação Completa**: Realizar auditorias contínuas de segurança nas regras do Firestore (`firestore.rules`) para garantir que os status das avaliações e perfis não possam ser editados por usuários não autorizados.
2.  **Monitoramento**: Validar se o carregamento dinâmico de CEPs e as chamadas ao ViaCEP não causam lentidão no cadastro.
3.  **Atualização de agents.md**: Lembrar os agentes de SEMPRE adicionar novos tópicos ao histórico ao concluir qualquer alteração.
