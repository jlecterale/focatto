# 🤖 Registro de Atividades e Diretrizes dos Agentes (agents.md)

Este documento registra o histórico de intervenções dos agentes de Inteligência Artificial no projeto **Focatto**, mantendo uma trilha clara de modificações, decisões de design e tarefas pendentes.

> [!IMPORTANT]
> **DIRETRIZ OBRIGATÓRIA PARA TODOS OS AGENTES:**
> Sempre que concluir uma tarefa ou alteração no código, você **DEVE** atualizar este arquivo (`agents.md`) com o resumo das alterações efetuadas, arquivos modificados e o estado atual da aplicação. Isso garante a continuidade do desenvolvimento em sessões futuras.

---

## 📅 Histórico de Intervenções

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
