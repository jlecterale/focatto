# 🤖 Registro de Atividades e Diretrizes dos Agentes (agents.md)

Este documento registra o histórico de intervenções dos agentes de Inteligência Artificial no projeto **Focatto**, mantendo uma trilha clara de modificações, decisões de design e tarefas pendentes.

> [!IMPORTANT]
> **DIRETRIZ OBRIGATÓRIA PARA TODOS OS AGENTES:**
> Sempre que concluir uma tarefa ou alteração no código, você **DEVE** atualizar este arquivo (`agents.md`) com o resumo das alterações efetuadas, arquivos modificados e o estado atual da aplicação. Isso garante a continuidade do desenvolvimento em sessões futuras.

---

## 📅 Histórico de Intervenções

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
