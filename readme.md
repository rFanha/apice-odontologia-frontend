# Ápice Odontologia — Frontend

Front-end Angular do sistema de gestão de consultas odontológicas **Ápice Odontologia**.

Permite agendamento, edição e cancelamento de consultas, cadastro de pacientes, dentistas e especialidades, controle de acesso por perfil (ADMIN / DENTISTA) e relatórios com filtros.

> O back-end Java Spring Boot está em repositório separado: `apice-odontologia-backend`.

---

## Requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Node.js    | 24.x          |
| npm        | 11.x          |
| Angular CLI | 20.x         |
| Chrome     | qualquer (para testes headless) |

O back-end deve estar rodando em `http://localhost:8080` antes de iniciar o front-end.

---

## Instalação

```bash
npm install
```

---

## Execução

```bash
npm start
```

Acesse em `http://localhost:4200`.

O proxy em `proxy.conf.json` encaminha todas as chamadas `/api/*` para `http://localhost:8080`, evitando bloqueio de CORS no desenvolvimento local.

### Credenciais de teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | admin@apice.com.br | (configurada no backend) |
| Dentista | dentista@apice.com.br | (configurada no backend) |

---

## Testes

Rodar todos os testes uma vez (headless, sem abrir browser):

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Rodar em modo watch (re-executa ao salvar):

```bash
npm test
```

Rodar um arquivo específico:

```bash
npm test -- --include="**/usuarios.service.spec.ts" --watch=false --browsers=ChromeHeadless
```

### Cobertura dos testes

| Arquivo | O que testa |
|---------|-------------|
| `usuarios.service.spec.ts` | listar, criar, atualizar, excluir usuários |
| `pacientes.service.spec.ts` | listar, criar, atualizar pacientes |
| `dentistas.service.spec.ts` | listar, criar, atualizar dentistas |
| `especialidades.service.spec.ts` | listar (com e sem filtro), criar especialidades |
| `consultas.service.spec.ts` | carregar dados, criar, atualizar, cancelar consultas |
| `relatorios.service.spec.ts` | carregar relatório com e sem filtros |
| `perfil.guard.spec.ts` | acesso negado sem sessão, ADMIN, DENTISTA, rotas compartilhadas |

---

## Build de produção

```bash
npm run build
```

Arquivos gerados em `dist/apice-odontologia-frontend`.

Em produção, altere `apiUrl` em `src/environments/environment.prod.ts` para a URL real do backend.

---

## Estrutura de pastas

```
src/app/
├── core/
│   ├── auth/          # AuthService, authInterceptor, perfilGuard
│   ├── errors/        # Utilitário central de mensagens de erro da API
│   ├── consultas/     # ConsultasService
│   ├── dashboard/     # DashboardService
│   ├── dentistas/     # DentistasService
│   ├── especialidades/# EspecialidadesService
│   ├── pacientes/     # PacientesService
│   ├── relatorios/    # RelatoriosService
│   └── usuarios/      # UsuariosService
└── pages/
    ├── shell/         # Layout com sidebar e topbar (páginas autenticadas)
    ├── login/
    ├── dashboard/
    ├── consultas/
    ├── pacientes/
    ├── dentistas/
    ├── especialidades/
    ├── usuarios/
    ├── relatorios/
    └── acesso-negado/
```

---

## Tecnologias

- Angular 20 (standalone components, signals, lazy loading)
- Angular Router com guards de perfil
- Angular Material
- Chart.js (gráficos no dashboard)
- SCSS
- Karma + Jasmine (testes unitários)
