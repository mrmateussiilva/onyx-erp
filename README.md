# AquaGás Flow - App Desktop

Sistema de gerenciamento para distribuidoras de água e gás, transformado em uma aplicação desktop de alta performance usando **Tauri 2.0**.

## 🚀 Tecnologias Utilizadas

Este projeto combina o melhor do ecossistema web com a performance nativa do Rust:

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn-ui.
- **Backend Nativo:** Rust (Tauri 2.0).
- **Banco de Dados:** SQLite (local).
- **ORM:** Sea-ORM.
- **Build Tool:** Vite.

## 📦 Como rodar localmente

### Pré-requisitos
- **Node.js** e **pnpm** (ou npm/yarn).
- **Rust** instalado ([instruções aqui](https://www.rust-lang.org/tools/install)).
- Dependências de sistema para o Tauri (veja a [documentação do Tauri](https://tauri.app/v1/guides/getting-started/prerequisites)).

### Passo a Passo

```sh
# 1. Clone o repositório
git clone <URL_DO_REPO>

# 2. Acesse a pasta do projeto
cd aquagas-flow

# 3. Instale as dependências do frontend
pnpm install

# 4. Inicie o ambiente de desenvolvimento desktop
pnpm tauri dev
```

## 🛠️ Comandos Disponíveis

- `pnpm tauri dev`: Inicia o app em modo de desenvolvimento com Hot Reload.
- `pnpm tauri build`: Gera os instaladores nativos (.deb, .appImage, .exe, .msi, etc).
- `pnpm dev`: Inicia apenas o servidor de desenvolvimento do frontend (Vite).

## 🗄️ Estrutura do Projeto

- `src/`: Todo o código da interface em React.
- `src-tauri/`: Código backend em Rust, configurações nativas e modelos do banco de dados.
- `src-tauri/src/db/`: Lógica de persistência e entidades do Sea-ORM.

## 📄 Licença

Este projeto é privado e de uso restrito conforme permissões do repositório.
