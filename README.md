# Vote.io - Portal de Ideias

Vote.io é uma plataforma interativa de compartilhamento e votação de ideias, desenvolvida com React e TypeScript. O projeto está atualmente disponível em [http://148.113.172.140:3000/](http://148.113.172.140:3000/).

## Sobre o Projeto

Vote.io permite que usuários cadastrem-se, façam login, publiquem suas ideias, votem em ideias de outros usuários e comentem nas propostas. A plataforma oferece uma experiência de usuário dinâmica e responsiva, utilizando animações suaves e um design moderno.

## Estrutura do Projeto

O projeto segue uma estrutura típica de uma aplicação React:

- `/src`: Contém o código-fonte principal
  - `/components`: Componentes React reutilizáveis
  - `/styles`: Arquivos CSS para estilização
  - `/utils`: Funções utilitárias, como autenticação
- `/public`: Arquivos públicos, incluindo o `index.html`

## Principais Tecnologias Utilizadas

- React
- TypeScript
- Material-UI
- Framer Motion (para animações)
- Axios (para requisições HTTP)
- Socket.io (para comunicação em tempo real)
- JWT (para autenticação)

## Funcionalidades Principais

1. Autenticação de usuários (cadastro e login)
2. Publicação de ideias
3. Sistema de votação (upvote/downvote)
4. Comentários em ideias
5. Atualização em tempo real de votos e comentários
6. Interface responsiva e animada

## Como foi Desenvolvido

O projeto foi desenvolvido utilizando práticas modernas de desenvolvimento web, incluindo:

- Componentes funcionais React com Hooks
- Gerenciamento de estado local com useState e useEffect
- Estilização com Material-UI e CSS personalizado
- Animações fluidas com Framer Motion
- Integração com backend via API RESTful
- Implementação de websockets para atualizações em tempo real

## Executando o Projeto Localmente

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Execute o projeto com `npm start`

O projeto estará disponível em `http://localhost:3000`
