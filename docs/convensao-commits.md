# Convenção de Commits

Este projeto usa commits curtos, claros e padronizados.

## Formato

```text
tipo: descrição curta
```

## Tipos recomendados

- `feat` - nova funcionalidade
- `fix` - correção de bug
- `chore` - manutenção, organização ou tarefas de apoio
- `refactor` - refatoração sem mudar comportamento
- `docs` - documentação
- `test` - testes
- `build` - configuração de build, dependências ou ambiente
- `ci` - automação de integração e entrega contínua

## Regras

- Use descrições curtas e objetivas.
- Comece com verbo no infinitivo quando fizer sentido.
- Escreva em minúsculo.
- Evite commits genéricos como `update` ou `changes`.
- Prefira um commit por mudança lógica.

## Exemplos

- `chore: criar estrutura inicial do backend`
- `feat: configurar spring boot inicial`
- `docs: adicionar padrao de commits`
- `fix: corrigir configuracao do application properties`
- `refactor: organizar pacotes base do projeto`

## Sugestao para este projeto

Para o backend do sistema, a sequência inicial pode seguir algo assim:

1. `chore: criar estrutura inicial do backend`
2. `feat: configurar projeto spring boot`
3. `docs: adicionar documentacao inicial do backend`
4. `build: ajustar dependencias do pom`

Essa padronização ajuda a entender rapidamente o histórico do projeto.
