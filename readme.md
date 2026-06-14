# Apice Odontologia Frontend

Front-end em Angular para o sistema de gestao de consultas odontologicas Apice Odontologia.

## Requisitos

- Node.js 24.13.0 ou superior compativel com Angular 20
- npm 11 ou superior

## Instalacao

```bash
npm install
```

## Execucao

Para iniciar o servidor de desenvolvimento:

```bash
npm start
```

A aplicacao ficara disponivel em:

```text
http://localhost:4200/
```

O servidor de desenvolvimento usa `proxy.conf.json` para encaminhar chamadas como
`/auth/login`, `/pacientes` e `/consultas` para o backend em `http://localhost:8080`.
Assim o navegador nao bloqueia as chamadas por CORS durante o desenvolvimento local.

## Build

Para gerar uma build de producao:

```bash
npm run build
```

Os arquivos compilados serao gerados em `dist/apice-odontologia-frontend`.

## Tecnologias

- Angular 20
- Angular Router
- Angular Material
- SCSS
