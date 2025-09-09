# Brasileirão Fanfarrões ⚽

Um aplicativo web mobile para gerenciar campeonatos internos de futebol, inspirado no formato do Brasileirão Série A.

## 🚀 Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Banco de dados**: PostgreSQL via Neon.db
- **ORM**: Prisma
- **Ícones**: Lucide React
- **Autenticação**: Simples (admin/senha)

## 📱 Funcionalidades

### Para usuários (visualização):
- **Classificação**: Tabela completa igual ao Brasileirão (pontos, jogos, vitórias, empates, derrotas, gols, saldo, últimos 5 jogos)
- **Jogos**: Lista de partidas (agendadas, em andamento, finalizadas)
- **Rankings**: Artilheiros, assistências, melhores goleiros
- **Times**: Lista de times com seus jogadores e posições

### Para administradores:
- **Gestão de times**: Cadastrar times com escudo, nome e jogadores
- **Gestão de jogos**: Criar partidas e inserir resultados
- **Registro de gols**: Incluir quem fez gol, assistência e minuto
- **Sistema de pontuação**: Vitória = 3 pontos, Empate = 1 ponto cada

## 🎯 Regras do campeonato

- Sistema de pontos corridos
- Vitória = 3 pontos
- Empate = 1 ponto para cada time
- Derrota = 0 pontos
- Classificação por: pontos → saldo de gols → gols marcados

## 🛠️ Configuração

### 1. Pré-requisitos
- Node.js (versão 18+)
- pnpm
- Conta no Neon.db (PostgreSQL)

### 2. Instalação
```bash
# Clone o repositório
git clone <seu-repositorio>
cd brasileirao-fanforroes

# Instale as dependências
pnpm install
```

### 3. Configuração do banco de dados

#### 3.1. Criar conta no Neon.db
1. Acesse [Neon.db](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a string de conexão PostgreSQL

#### 3.2. Configurar variáveis de ambiente
```bash
# Renomeie .env.example para .env
cp .env.example .env

# Edite o arquivo .env e substitua pela sua string de conexão
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

#### 3.3. Executar migrações
```bash
# Executar migrações do banco
npx prisma migrate dev --name init

# Gerar o cliente Prisma
npx prisma generate
```

### 4. Iniciar o desenvolvimento
```bash
# Iniciar o servidor de desenvolvimento
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📐 Design

### Cores
- **Principal**: #007fcc (azul)
- **Fundo**: Branco
- **Texto**: Preto/cinza

### Layout
- Design mobile-first
- Navegação fixa no rodapé
- Interface limpa e intuitiva
- Componentes Shadcn/ui

## 🔐 Administração

### Acesso administrativo
- URL: `/administrador`
- Usuário: `admin`
- Senha: `escolha sua senha`

### Funcionalidades admin:
- Cadastrar/editar times
- Criar partidas
- Inserir resultados
- Gerenciar gols e assistências

## 📊 Estrutura do banco

### Entidades principais:
- **Teams**: Times (nome, escudo)
- **Players**: Jogadores (nome, posição, número)
- **Matches**: Partidas (times, data, placar)
- **Goals**: Gols (jogador, assistência, minuto)
- **Admins**: Administradores

## 🎮 Como usar

### 1. Configurar times
1. Acesse `/administrador`
2. Faça login
3. Vá em "Times"
4. Cadastre os times com escudos e jogadores

### 2. Criar partidas
1. Acesse "Jogos" na área admin
2. Crie as partidas com data e times
3. Os jogos aparecerão como "Agendados"

### 3. Inserir resultados
1. Clique em uma partida agendada
2. Insira o placar
3. Adicione os gols (jogador, assistente, minuto)
4. Marque como "Finalizada"

### 4. Acompanhar classificação
- A tabela é atualizada automaticamente
- Rankings são calculados em tempo real
- Estatísticas são atualizadas após cada jogo

## 🔧 Scripts úteis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar produção
pnpm start

# Lint
pnpm lint

# Reset do banco (cuidado!)
npx prisma migrate reset

# Visualizar banco
npx prisma studio
```

## 📱 Navegação

- **/** - Classificação (tabela principal)
- **/jogos** - Lista de partidas
- **/rankings** - Rankings de jogadores
- **/times** - Times e jogadores
- **/administrador** - Área administrativa

## 🎨 Personalização

### Modificar cores
Edite `app/globals.css`:
```css
:root {
  --primary: oklch(0.528 0.134 252.84); /* #007fcc */
}
```

### Adicionar funcionalidades
1. Crie novas rotas em `app/`
2. Adicione funções em `lib/`
3. Crie componentes em `components/`

## 🚀 Deploy

### Vercel (recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras plataformas
- Certifique-se que suporta Next.js 14
- Configure DATABASE_URL
- Execute `pnpm build`

## 📝 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Faça um push para a branch
5. Abra um Pull Request

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique a documentação
2. Confira se o banco está configurado
3. Verifique os logs do console
4. Abra uma issue no GitHub

---

Feito com ⚽ para o Brasileirão Fanfarrões!