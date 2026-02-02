# DevHire

**Plataforma de match entre desenvolvedores e empresas**

🔗 **Live Demo:** [https://github.com/Lordymine/devhire](https://github.com/Lordymine/devhire)

## 🎯 O que é?

DevHire é uma plataforma que conecta desenvolvedores com empresas de forma inteligente, similar ao Tinder mas para recrutamento tech.

### Funcionalidades

- 🔐 **Autenticação**: Login com Google ou email/senha (NextAuth)
- 👤 **Perfis**: Devs criam perfis com skills, experiência e pretensão salarial
- 🏢 **Empresas**: Cadastram vagas com requisitos e localização
- 💚 **Match**: Sistema de likes mútuos entre devs e empresas
- 💬 **Descoberta**: Feed personalizado baseado em skills e preferências

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| **Backend** | Next.js API Routes, Server Actions |
| **Banco** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js v5 |
| **Testes** | Vitest (54 testes) |

## 🏗️ Arquitetura

### Clean Architecture

```
src/
├── domains/           # Lógica de negócio pura
│   ├── user/         # User, DevProfile, CompanyProfile
│   ├── match/        # Likes, Matches
│   └── job/          # Vagas
├── app/api/          # API Routes
├── app/              # Frontend pages
├── lib/repositories/ # Implementações Prisma
└── components/ui/    # shadcn/ui components
```

## 🚀 Como rodar

```bash
# Clone
git clone https://github.com/Lordymine/devhire.git
cd devhire

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Rodar migrações
npx prisma migrate dev

# Iniciar desenvolvimento
npm run dev
```

## 📝 Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/devhire"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## ✅ Testes

```bash
# Rodar testes
npm test

# Build de produção
npm run build
```

**Status:** 54/54 testes passando ✅

## 📊 Estrutura do Banco

### Principais Tabelas

- **users**: Dados de autenticação (NextAuth)
- **dev_profiles**: Perfil de desenvolvedores
- **company_profiles**: Perfil de empresas
- **jobs**: Vagas publicadas
- **likes**: Curtidas (dev ↔ empresa)
- **matches**: Matches mútuos

## 🎯 Próximos Passos

- [ ] Deploy na Vercel
- [ ] WebSocket para notificações em tempo real
- [ ] Sistema de chat entre matches
- [ ] Upload de imagens (Cloudinary)
- [ ] Analytics dashboard

---

**Desenvolvido com:** Clean Architecture + TDD + PREVC workflow
