# Projeto Final - Sistema de Gestao de Consultas Odontologicas

## Nome do Sistema

**Ápice Odontologia**

## Como Vamos Estudar e Desenvolver .

Este documento será usado como guia de estudo do projeto, avançando item por item.

Para cada item desenvolvido:

1. Implementar a funcionalidade no código.
2. Adicionar comentários curtos e objetivos no código explicando a intenção da solução.
3. Registrar no próprio checklist o status do item.
4. Preferir soluções simples, legíveis e fáceis de manter.
5. Justificar no código ou no documento o motivo da abordagem escolhida quando houver mais de uma forma possível de programar.

Exemplo de comentário no código:

```java
// Valida conflito de horário antes de salvar a consulta.
```

Esse padrão ajuda no estudo porque deixa claro:

- O que está sendo feito.
- Por que a solução foi escolhida.
- Como cada parte se conecta com o escopo do sistema.

## Estrutura Recomendada do Projeto

Sim, o ideal é trabalhar com **2 projetos separados e 2 repositórios GitHub**:

1. `apice-odontologia-backend` para a API em Java Spring Boot.
2. `apice-odontologia-frontend` para o front-end em Angular.

Essa separação é a forma mais organizada para:

- Versionar cada camada de forma independente.
- Fazer deploy separado no futuro.
- Simplificar manutenção e evolução.
- Facilitar a subida na VPS depois.

## Observação Sobre a VPS

A VPS é uma boa decisão para o futuro, porque ela pode hospedar:

- O backend como API.
- O frontend como aplicação web estática ou servida por proxy.
- O banco de dados, se for o caso e se o ambiente permitir.

Mais adiante, será importante definir se a VPS vai hospedar tudo no mesmo servidor ou se o banco ficará em serviço separado.

## Configuração Futura da VPS

A VPS da Oracle já foi considerada como ambiente futuro do projeto e o PostgreSQL já teve a porta `5432` liberada para teste.

Quando formos preparar o sistema para produção, ainda precisaremos validar e/ou configurar:

1. Criar o banco `sistema_gestao_consultas`, caso ainda não exista no ambiente final.
2. Garantir que o usuário da aplicação exista com permissão no banco.
3. Confirmar a string de conexão JDBC do backend.
4. Definir variáveis de ambiente para usuário, senha, URL e chave JWT.
5. Conferir `listen_addresses` no PostgreSQL para aceitar conexões externas.
6. Revisar o `pg_hba.conf` para liberar apenas os IPs necessários.
7. Manter a regra de rede da Oracle Cloud aberta apenas para a porta `5432`.
8. Ajustar o firewall da VPS para não bloquear o acesso ao banco.
9. Separar ambiente de desenvolvimento e produção, se necessário.
10. Preparar o deploy do backend na VPS antes de subir o front-end.

Esses passos vão deixar o ambiente mais pronto para a publicação sem depender de configurações improvisadas depois.

## Validação do Escopo com Base no Anexo

O PDF anexado confirma que o projeto é realmente um **Sistema de Gestão de Consultas Odontológicas** com:

- Front-end em Angular.
- Back-end em Spring Boot REST.
- Banco relacional.
- Dois repositórios separados.
- Cadastro de usuários, pacientes, dentistas, especialidades e consultas.
- Regras de negócio de agenda e permissões.
- Relatórios e dashboard como parte do escopo.

O checklist atual está **alinhado com o anexo** na maior parte dos itens.

### Itens que estão claramente no escopo obrigatório

- Nome e identidade visual do sistema.
- Dois repositórios GitHub separados.
- Banco `sistema_gestao_consultas`.
- CRUDs principais.
- Autenticação e autorização.
- Regras de negócio de agendamento.
- Telas de consulta, pacientes, dentistas, especialidades, login e relatórios.
- Documentação e testes básicos.

### Itens que aparecem como opcionais ou melhorias

- Gráficos mais avançados.
- Tema claro e escuro.
- WebSockets.
- Upload de arquivos.
- Social login.
- Docker, CI/CD e deploy automatizado.

### Pontos de atenção

- O anexo fala em um sistema "simples" de agendamento; então recursos avançados devem ficar como extras, não como prioridade.
- O texto do PDF reforça que o essencial é o fluxo funcional completo.
- A futura VPS não substitui o desenvolvimento do sistema, mas entra como etapa posterior de publicação.

## Identificacao do Projeto

1. [X] Nome do sistema definido.

2. [X] Identidade de marca criada.

3. [X] Logotipo criado.

4. [X] Paleta de cores definida.

5. [X] {FRONT-END} Repositorio GitHub do front-end Angular criado.

6. [X] Repositorio GitHub do back-end Java Spring Boot criado.

7. [X] Banco relacional configurado.

8. [X] Banco criado com o nome `sistema_gestao_consultas`.

## Tecnologias Obrigatorias

9. [X] {FRONT-END} Frontend desenvolvido com Angular 19 ou superior.

10. [X] Backend desenvolvido com Java Spring Boot REST.

11. [X] Banco de dados relacional usado no projeto.

12. [X] Versionamento colaborativo usando Git/GitHub.

13. [ ] {FRONT-END} API integrada com o front-end.

## Configuracao do Banco de Dados

### Tabela `usuarios`

14. [X] Campo `id` criado como chave primaria com auto incremento.

15. [X] Campo `nome` criado como texto obrigatorio.

16. [X] Campo `cpf` criado como texto unico e obrigatorio.

17. [X] Campo `email` criado como texto unico e obrigatorio.

18. [X] Campo `senha` criado como texto obrigatorio, armazenado com hash usando BCrypt ou alternativa segura.

19. [X] Campo `data_criacao` criado como data e hora do registro.

20. [X] Campo `ultimo_login` criado como data e hora do ultimo acesso.

21. [X] Campo `perfil` criado como texto, por exemplo `ADMIN` ou `DENTISTA`.

22. [X] Campo `ativo` criado para indicar se o usuario esta ativo.

### Tabela `pacientes`

23. [X] Campo `id` criado como chave primaria com auto incremento.

24. [X] Campo `nome` criado como texto obrigatorio.

25. [X] Campo `email` criado como texto unico e obrigatorio.

26. [X] Campo `cpf` criado como texto unico e obrigatorio.

27. [X] Campo `data_criacao` criado como data e hora do registro.

28. [X] Campo `telefone` criado como texto ou numero.

### Tabela `dentistas`

29. [X] Campo `id` criado como chave primaria com auto incremento.

30. [X] Campo `nome` criado como texto obrigatorio.

31. [X] Campo `cpf` criado como texto unico e obrigatorio.

32. [X] Campo `email` criado como texto unico e obrigatorio.

33. [X] Campo `cro` criado como texto obrigatorio.

34. [X] Campo `data_criacao` criado como data e hora do registro.

35. [X] Campo `ativo` criado para indicar se o dentista esta ativo.

### Tabela `especialidades`

36. [X] Campo `id` criado como chave primaria com auto incremento.

37. [X] Campo `nome` criado como texto obrigatorio.

### Tabela `dentista_especialidade`

38. [X] Campo `id` criado como chave primaria com auto incremento.

39. [X] Campo `id_dentista` criado como chave estrangeira para `dentistas`.

40. [X] Campo `id_especialidade` criado como chave estrangeira para `especialidades`.

41. [X] Relacionamento muitos-para-muitos entre dentistas e especialidades implementado.

### Tabela `consultas`

42. [X] Campo `id` criado como chave primaria com auto incremento.

43. [X] Campo `id_paciente` criado como chave estrangeira para `pacientes`.

44. [X] Campo `id_dentista` criado como chave estrangeira para `dentistas`.

45. [X] Campo `id_usuario` criado como chave estrangeira para `usuarios`, indicando quem marcou a consulta.

46. [X] Campo `descricao` criado como texto obrigatorio.

47. [X] Campo `motivo_cancelamento` criado como texto opcional, obrigatorio quando `status = CANCELADA`.

48. [X] Campo `data_inicio` criado como data e hora obrigatoria.

49. [X] Campo `data_fim` criado como data e hora obrigatoria.

50. [X] Campo `data_registro` criado como data e hora em que a consulta foi marcada.

51. [X] Campo `status` criado como texto, por exemplo `AGENDADA`, `CANCELADA` ou `FINALIZADA`.

### Scripts SQL

52. [X] Script DDL criado para inicializacao das tabelas.

53. [X] Script DML criado com dados de exemplo.

54. [X] Scripts SQL versionados no repositorio da API.

## Regras de Negocio Obrigatorias

55. [X] Nao permitir conflito de horario para o mesmo dentista.

56. [X] Nao permitir agendamento em datas passadas.

57. [X] Exigir motivo para cancelar consultas.

58. [X] Permitir que um dentista tenha varias especialidades.

59. [X] Permitir que uma especialidade pertenca a varios dentistas.

60. [X] Permitir que somente o perfil `ADMIN` gerencie usuarios.

61. [X] Bloquear outros perfis de gerenciarem usuarios.

62. [X] Permitir que dentista veja somente as consultas relacionadas a ele.

63. [X] Permitir que perfil `ADMIN` veja todas as consultas do sistema.

64. [X] Validar que `data_fim` seja posterior a `data_inicio`.

## Back-End Java Spring Boot

### Configuracao Inicial

65. [X] Projeto Spring Boot iniciado.

66. [X] `pom.xml` ou `build.gradle` configurado.

67. [X] Dependencia Spring Data JPA adicionada.

68. [X] Driver Postgres, MySQL ou outro banco relacional adicionado.

69. [X] Dependencia Spring Security adicionada.

70. [X] Configuracao de conexao com banco adicionada.

### Entidades JPA/Hibernate

71. [X] Entidade `Usuario` mapeada.

72. [X] Entidade `Paciente` mapeada.

73. [X] Entidade `Dentista` mapeada.

74. [X] Entidade `Especialidade` mapeada.

75. [X] Entidade `Consulta` mapeada.

76. [X] Relacionamentos entre entidades mapeados corretamente.

### Repositories

77. [X] `UsuarioRepository` criado.

78. [X] `PacienteRepository` criado.

79. [X] `DentistaRepository` criado.

80. [X] `EspecialidadeRepository` criado.

81. [X] `ConsultaRepository` criado.

### Services

82. [X] `UsuarioService` criado.

83. [X] `PacienteService` criado.

84. [X] `DentistaService` criado.

85. [X] `EspecialidadeService` criado.

86. [X] `ConsultaService` criado.

87. [X] Regras de negocio implementadas nos services.

### Endpoints Obrigatorios

88. [X] Endpoints de autenticacao implementados.

89. [X] Endpoints de usuarios implementados com acesso apenas para `ADMIN`.

90. [X] Endpoints de pacientes implementados.

91. [X] Endpoints de dentistas implementados.

92. [X] Endpoints de especialidades implementados.

93. [X] Endpoints de consultas implementados.

94. [X] Endpoint de cancelamento de consultas implementado.

95. [X] Endpoints de relatorios filtrados ou dashboard implementados.

96. [X] Filtro por usuario implementado em relatorios.

97. [X] Filtro por paciente implementado em relatorios.

98. [X] Filtro por especialidade implementado em relatorios.

99. [X] Filtro por data implementado em relatorios.

### Seguranca

100. [X] Autenticacao com JWT implementada.

101. [X] Autorizacao por perfil implementada.

102. [X] Rotas sensiveis protegidas pelo Spring Security.

103. [X] Senhas armazenadas com hash seguro.

104. [X] Validacao de permissao para `ADMIN` implementada.

105. [X] Validacao de permissao para `DENTISTA` implementada.

### Validacoes

106. [X] Bean Validation configurado.

107. [X] Campos obrigatorios validados com anotacoes como `@NotNull`, `@NotBlank` ou equivalentes.

108. [X] Tamanho de campos validado com anotacoes como `@Size`.

109. [X] E-mails validados com `@Email`.

110. [X] Regras de data e horario validadas.

111. [X] Respostas de erro padronizadas.

### Testes e Documentacao do Back-End

112. [X] Endpoints testados com Postman ou Insomnia.

113. [X] Rotas documentadas no repositorio do back-end.

114. [X] Exemplos de requisicoes documentados.

115. [X] Exemplos de respostas documentados.

116. [X] Instrucoes de configuracao e execucao do back-end documentadas.

## Front-End Angular

### Configuracao Inicial

117. [X] {FRONT-END} Projeto Angular criado com `ng new`.

118. [X] {FRONT-END} Projeto criado na versao 19 ou superior.

119. [X] {FRONT-END} Dependencias de UI instaladas e configuradas, como Angular Material, Bootstrap ou alternativa.

120. [X] {FRONT-END} Estrutura de pastas organizada.

121. [ ] {FRONT-END} Configuracao de ambiente da API criada.

### Paginas e Componentes

122. [X] {FRONT-END} Pagina de Login criada.

123. [X] {FRONT-END} Pagina de Gerenciamento de Usuarios criada.

124. [X] {FRONT-END} Perfis e permissoes considerados na tela de usuarios.

125. [X] {FRONT-END} Dashboard criado com visao geral de consultas, pacientes e profissionais.

126. [X] {FRONT-END} Pagina de Consultas criada.

127. [X] {FRONT-END} Listagem de consultas implementada.

128. [X] {FRONT-END} Criacao de consultas implementada.

129. [X] {FRONT-END} Edicao de consultas implementada.

130. [X] {FRONT-END} Cancelamento de consultas implementado.

131. [ ] {FRONT-END} Pagina de Pacientes criada.

132. [ ] {FRONT-END} Listagem de pacientes implementada.

133. [ ] {FRONT-END} Criacao de pacientes implementada.

134. [ ] {FRONT-END} Edicao de pacientes implementada.

135. [ ] {FRONT-END} Pagina de Dentistas criada.

136. [ ] {FRONT-END} Listagem de dentistas implementada.

137. [ ] {FRONT-END} Criacao de dentistas implementada.

138. [ ] {FRONT-END} Edicao de dentistas implementada.

139. [ ] {FRONT-END} Desativacao de dentistas implementada.

140. [ ] {FRONT-END} Pagina de Especialidades criada.

141. [ ] {FRONT-END} Listagem de especialidades implementada.

142. [ ] {FRONT-END} Criacao de especialidades implementada.

143. [ ] {FRONT-END} Pagina de Relatorios criada.

144. [ ] {FRONT-END} Filtro de relatorio por paciente implementado.

145. [ ] {FRONT-END} Filtro de relatorio por profissional implementado.

146. [ ] {FRONT-END} Filtro de relatorio por especialidade implementado.

147. [ ] {FRONT-END} Filtro de relatorio por usuario implementado.

### Roteamento e Integracao

148. [X] {FRONT-END} Angular Router configurado.

149. [ ] {FRONT-END} Navegacao entre paginas implementada.

150. [X] {FRONT-END} Consumo da API configurado com `HttpClient`, Fetch API, Axios ou alternativa.

151. [X] {FRONT-END} Services Angular criados para comunicacao com a API.

152. [ ] {FRONT-END} Interceptor HTTP configurado para envio do JWT, se aplicavel.

153. [ ] {FRONT-END} Tratamento de erros da API implementado.

### Autenticacao no Front-End

154. [X] {FRONT-END} Fluxo de login implementado.

155. [X] {FRONT-END} Token JWT armazenado de forma definida, como `localStorage`, `sessionStorage` ou cookie HttpOnly.

156. [X] {FRONT-END} Protecao de rotas com guards implementada.

157. [X] {FRONT-END} Controle de acesso por perfil implementado no front-end.

158. [ ] {FRONT-END} Logout implementado.

### Experiencia do Usuario

159. [ ] {FRONT-END} Mensagens de sucesso exibidas.

160. [X] {FRONT-END} Mensagens de erro exibidas.

161. [ ] {FRONT-END} Formularios com validacoes visuais.

162. [X] {FRONT-END} Estados de carregamento implementados.

163. [ ] {FRONT-END} Interface responsiva implementada.

## Integracao e Testes

164. [ ] {FRONT-END} Comunicacao entre front-end e back-end validada.

165. [X] Rotas protegidas testadas.

166. [ ] CRUD de usuarios testado.

167. [ ] CRUD de pacientes testado.

168. [ ] CRUD de dentistas testado.

169. [ ] CRUD de especialidades testado.

170. [ ] CRUD de consultas testado.

171. [ ] Cancelamento de consultas testado.

172. [ ] Relatorios testados.

173. [X] Permissoes de administrador validadas.

174. [X] Permissoes de dentista validadas.

175. [ ] Regras de negocio validadas manualmente.

## Documentacao e Apresentacao

176. [X] {FRONT-END} README do front-end criado com instrucoes de instalacao.

177. [X] {FRONT-END} README do front-end criado com instrucoes de execucao.

178. [X] README do back-end criado com instrucoes de instalacao.

179. [X] README do back-end criado com instrucoes de execucao.

180. [X] Variaveis de ambiente documentadas.

181. [X] Endpoints documentados com metodo HTTP.

182. [X] Endpoints documentados com path.

183. [X] Endpoints documentados com parametros.

184. [X] Endpoints documentados com corpo da requisicao.

185. [X] Endpoints documentados com exemplos de resposta.

186. [ ] Guia de uso do sistema criado.

187. [ ] {FRONT-END} Fluxo de navegacao do front-end demonstrado.

188. [ ] Prints de tela ou video de demonstracao adicionados, se possivel.

## Extras Opcionais

189. [X] {FRONT-END} Graficos e visualizacoes com Chart.js ou biblioteca equivalente.

190. [ ] {FRONT-END} Grafico de consultas por paciente.

191. [ ] {FRONT-END} Grafico de consultas por profissional.

192. [ ] {FRONT-END} Grafico de consultas por especialidade.

193. [ ] {FRONT-END} Painel administrativo avancado.

194. [ ] Gerenciamento avancado de perfis.

195. [ ] Estatisticas administrativas.

196. [ ] Logs de atividade.

197. [ ] {FRONT-END} Upload de arquivos nos cadastros ou consultas.

198. [ ] {FRONT-END} Suporte a PDF.

199. [ ] {FRONT-END} Suporte a imagens.

200. [ ] {FRONT-END} Notificacoes em tempo real com WebSockets, Socket.IO ou alternativa.

201. [ ] {FRONT-END} Tema claro e escuro.

202. [ ] {FRONT-END} Responsividade aprimorada com Flexbox, Grid ou framework de UI.

203. [ ] {FRONT-END} Autenticacao social com Google, GitHub ou alternativa.

204. [ ] {FRONT-END} Deploy do front-end.

205. [ ] Deploy do back-end.

206. [ ] Configuracao de dominio personalizado.

## Observacoes do Prazo de Entrega

{STATUS: INFORMACAO} Data final de entrega: `15/06/2026`.

{STATUS: INFORMACAO} Data da apresentacao: `16/06/2026`.

207. [ ] Participar das tutorias para revisar o progresso.

208. [ ] Garantir conclusao do projeto ate `15/06/2026`.

209. [ ] Enviar links dos repositorios GitHub do back-end e front-end por e-mail.

210. [ ] E-mails de envio: `luciano.brum@wises.com.br`, `alafhi.silva@wises.com.br`, `erica.almeida@wises.com.br`.

211. [ ] Titulo do e-mail: `Projeto Final - [nome_completo] - Wise Start`.

## Modelo de Controle de Status

Use os status abaixo para atualizar este documento conforme o projeto evoluir:

212. [ ] Item ainda nao iniciado.

213. [ ] Item iniciado, mas ainda nao concluido.

214. [ ] Item concluido no projeto.

215. [ ] Item concluido e testado.

216. [ ] Item nao sera usado no projeto, com justificativa.

217. [ ] Item informativo, sem necessidade de implementacao.

## Melhorias Possiveis para o Projeto

218. [ ] Criar testes unitarios para services e regras de negocio.

219. [ ] Criar testes de integracao para endpoints REST.

220. [ ] Usar Flyway ou Liquibase para versionamento profissional do banco de dados.

221. [X] Criar DTOs para entrada e saida de dados, evitando expor entidades diretamente.

222. [X] Criar tratamento global de excecoes com `@ControllerAdvice`.

223. [X] Padronizar respostas de erro com codigo, mensagem e detalhes.

224. [ ] Adicionar Swagger/OpenAPI para documentacao automatica da API.

225. [ ] Implementar refresh token para sessoes mais seguras.

226. [ ] Implementar auditoria de criacao, atualizacao e exclusao de registros.

227. [ ] Implementar exclusao logica para usuarios, dentistas e pacientes.

228. [ ] Criar logs estruturados para facilitar manutencao.

229. [ ] Adicionar paginacao, ordenacao e filtros nos endpoints de listagem.

230. [ ] Validar CPF com regra real de digitos verificadores.

231. [ ] Validar CRO com regras de formato definidas pelo projeto.

232. [ ] Adicionar envio de e-mail para confirmacao de consulta.

233. [ ] Adicionar lembrete automatico antes da consulta.

234. [ ] Criar endpoint para reagendamento de consultas.

235. [ ] Criar historico de alteracoes da consulta.

236. [ ] Criar controle de disponibilidade por dentista.

237. [ ] Impedir consultas fora do horario de atendimento da clinica.

238. [ ] Impedir agendamento com dentista inativo.

239. [ ] Impedir agendamento com paciente inativo, se o campo for adicionado.

240. [ ] Adicionar exportacao de relatorios em CSV ou PDF.

241. [ ] {FRONT-END} Criar layout responsivo para desktop, tablet e celular.

242. [ ] {FRONT-END} Criar menu lateral com opcoes por perfil.

243. [ ] {FRONT-END} Criar cabecalho com usuario logado e opcao de logout.

244. [ ] {FRONT-END} Criar calendario visual para consultas.

245. [ ] {FRONT-END} Adicionar filtros avancados em listagens.

246. [ ] {FRONT-END} Adicionar paginacao nas tabelas.

247. [ ] {FRONT-END} Adicionar ordenacao nas colunas das tabelas.

248. [ ] {FRONT-END} Adicionar mascaras para CPF, telefone, datas e horarios.

249. [ ] {FRONT-END} Adicionar validacao visual em tempo real nos formularios.

250. [ ] {FRONT-END} Adicionar componentes de confirmacao antes de cancelar ou desativar registros.

251. [ ] {FRONT-END} Criar tela de perfil do usuario.

252. [ ] {FRONT-END} Criar tela de alteracao de senha.

253. [ ] {FRONT-END} Criar modo claro e escuro.

254. [ ] {FRONT-END} Criar notificacoes com toast/snackbar.

255. [ ] {FRONT-END} Criar skeleton loading para carregamentos.

256. [ ] {FRONT-END} Criar tela de erro 404.

257. [ ] {FRONT-END} Criar tela de acesso negado 403.

258. [X] {FRONT-END} Criar dashboard com cards de indicadores.

259. [X] {FRONT-END} Criar graficos de consultas por status, especialidade e periodo.

260. [ ] {FRONT-END} Criar filtros persistentes por usuario usando storage local.

261. [ ] {FRONT-END} Melhorar acessibilidade com labels, contraste, foco visivel e navegacao por teclado.

262. [ ] Criar indices para campos pesquisados com frequencia, como `cpf`, `email`, `data_inicio` e `status`.

263. [X] Criar constraints para evitar dados duplicados.

264. [X] Criar constraints para status permitidos.

265. [ ] Criar integridade referencial com `ON DELETE` e `ON UPDATE` planejados.

266. [X] Criar dados iniciais para perfis, especialidades e usuario administrador.

267. [ ] Criar Dockerfile para o back-end.

268. [ ] {FRONT-END} Criar Dockerfile para o front-end.

269. [ ] Criar `docker-compose.yml` com front-end, back-end e banco.

270. [ ] Criar pipeline de CI no GitHub Actions.

271. [ ] Rodar testes automaticamente no CI.

272. [ ] {FRONT-END} Configurar build automatico do front-end.

273. [ ] Configurar deploy automatico.

274. [ ] Criar README principal explicando arquitetura geral.

275. [ ] Criar diagrama entidade-relacionamento.

276. [ ] Criar diagrama de arquitetura.

277. [X] Criar colecao Postman ou Insomnia versionada.

278. [ ] Criar roteiro de apresentacao.

279. [ ] Criar checklist de demonstracao para o dia `16/06/2026`.

280. [ ] {FRONT-END} Armazenar JWT em cookie HttpOnly quando possivel.

281. [ ] Configurar CORS apenas para origens permitidas.

282. [X] Evitar retorno de dados sensiveis, como senha ou hash.

283. [ ] Implementar bloqueio temporario apos muitas tentativas de login.

284. [ ] Implementar politica de senha minima.

285. [X] Usar variaveis de ambiente para segredos, credenciais e chaves JWT.

286. [X] Criar mensagens claras para conflitos de horario.

287. [X] Criar mensagens claras para falta de permissao.

288. [ ] {FRONT-END} Criar busca rapida de paciente e dentista ao marcar consulta.

289. [ ] {FRONT-END} Criar visualizacao por dia, semana e mes.

290. [ ] {FRONT-END} Criar destaque visual para consultas canceladas e finalizadas.

291. [ ] {FRONT-END} Criar confirmacao visual de consulta agendada com sucesso.
