# Gerenciamento de tarefas

O projeto é um gerenciador de tarefas com integração a banco de dados relacional. A aplicação utiliza Node.js e Express, com suporte a autenticação via JSON Web Token e gerenciamento de cookies com cookie-parser. A validação de dados é feita com Joi, as senhas são tratadas com Bcrypt, e o controle de acesso é configurado por Cors. A camada de persistência usa Knex como query builder e PG como driver para PostgreSQL. As variáveis de ambiente são gerenciadas com Dotenv.

Link do deploy: <a href='https://tasks-management-back-end.cyclic.app/' target='_black'>Gerenciador de tarefas</a>


<details>
<summary><b>[Intermediário] Autenticação</b></summary>

<br>

Este middleware realiza a validação do token presente em `req.headers` e, após a verificação, popula `req.user` com os dados decodificados para uso nas requisições subsequentes.

### Exemplo de resposta em caso de erro

```javascript
// HTTP Status 400

{
    'message':'Acesso negado.'
}

```

<br/>

</details>

##### Para usuários:

<details>
<summary><b>[Usuário] Cadastrar</b></summary>

### Cadastrar usuário

#### `POST` `/user/register`

Este endpoint realiza o registro de um novo usuário no banco de dados. Antes da inserção, a senha é criptografada e o sistema verifica se o email fornecido já está associado a outra conta.


#### Exemplo de requisição

```javascript
{
    'name': 'exemplo de nome',
    'email': 'exemplo@email.com',
    'password': 'senha1234'
}
```

### Exemplo de resposta

```javascript
// HTTP Status 202
// Sem resposta no body

```

### Exemplo de resposta em caso de erro

```javascript
// HTTP Status 400

{
   'message': 'Email já cadastrado.'
}

```

<br/>
</details>

<details>
<summary><b>[Usuário] Logar</b></summary>

### Login de usuário

#### `POST` `/user/login`

Este endpoint realiza a autenticação na API, retornando um token JWT que é armazenado em cookie e necessário para todas as requisições relacionadas ao gerenciamento de tarefas e atualização dos dados do usuário.

O token possui validade de 24 horas, sendo necessário efetuar novo login após expirar.

### Exemplo de requisição

```javascript
{
    'email': 'exemplo@email.com',
    'password': 'senha1234'
}
```

### Exemplo de resposta

```javascript
// HTTP Status 200
// Sem resposta no body

```

### Exemplo de resposta em caso de erro

```javascript
// HTTP Status 400

{
    'message': 'Credenciais inválidas.'
}
```

<br/>
</details>

Todas as rotas listadas abaixo requerem o token JWT gerado no login para autorização.

<details>
<summary><b>[Usuário] Listar</b></summary>

### Listagem de dados do usuário logado

#### `GET` `/user`

Este endpoint retorna os dados do usuário autenticado, utilizando as informações presentes em `req.user`.

### Exemplo de requisição

```javascript
// Sem dados no body

```

### Exemplo de resposta

```javascript
// HTTP Status 200

{
	"id": 1,
    'name': 'exemplo de nome',
    'email': 'exemplo@email.com',
    "theme":"dark"
}

```

### Exemplo de resposta em caso de erro

```javascript
// HTTP Status 400

{
    'error': "InternalServerError",
    'message': "An unexpected error occurred. Please try again later."
}

```

<br/>
</details>

<details>
<summary><b>[Usuário] Atualizar</b></summary>

### Atualizar usuário

#### `PUT` `/user`

Este endpoint realiza a atualização dos dados do usuário autenticado. Se um novo e-mail for fornecido, o sistema verifica a existência prévia no banco. Para alteração de senha, é necessário informar a senha atual, e a nova senha é criptografada antes de ser armazenada.

### Exemplo de requisição

```javascript
{
    'name': 'exemplo de nome',
    'email': 'exemplo@email.com',
    'currentPassword':'senha1234',
    'newPassword': 'senha123456',
    'theme':'dark'
}
```

### Exemplo de resposta

```javascript
// HTTP Status 201
// Sem resposta no body

```

### Exemplo de resposta em caso de erro

```javascript
// HTTP Status 400

{
    'message': 'A senha atual está incorreta ou não foi fornecida.'
}
```

<br/>
</details>

<details>
<summary><b>[Usuário] Excluir</b></summary>

### Excluir conta do usuário

#### `DELETE` `/user`

Este endpoint realiza a exclusão da conta do usuário autenticado. Antes de remover o usuário, todas as tarefas (`tasks`) associadas a ele são deletadas, já que possuem `user_id` como chave estrangeira. Os dados necessários para a operação são obtidos a partir do token fornecido no login.

### Exemplo de requisição

```javascript
// Sem dados no body

```

### Exemplo de resposta

```javascript
// HTTP Status 200
// Sem resposta no body

```

### Exemplo de resposta em caso de erro

```javascript
// HTTP Status 400

{
    'error': "InternalServerError",
    'message': "An unexpected error occurred. Please try again later."
}

```

<br/>
</details>

##### Para tarefas:

<details>

<summary><b>[Tarefa] Cadastrar</b></summary>

### Cadastrar tarefa

#### `POST` `/task`

Este endpoint realiza a criação de uma nova tarefa no sistema.

#### Exemplo de requisição

```javascript
{
    'description':'teste',
    'completed':false
}
```

### Exemplo de resposta

```javascript
// HTTP Status 202
// Sem resposta no body

[
	{
		"id": 1,
		"description": "teste",
		"completed": false,
		"user_id": 2
	}
]

```

### Exemplo de resposta em caso de erro

```javascript
// HTTP Status 400

{
    'Essa tarefa já existe.'
}

```

<br/>

</details>


<details>

<summary><b>[Tarefa] Listar</b></summary>

### Listar tarefas

#### `GET` `/tasks`

Este endpoint retorna todas as tarefas do usuário autenticado. Os dados do usuário são obtidos a partir do token fornecido no login.

#### Exemplo de requisição

```javascript
// Sem dados no body

```

### Exemplo de resposta

```javascript
// HTTP Status 200

[
    {
     "id": 1,
     "description": "descrição de teste",
     "completed": false,
     "user_id": 1
    },
    {
     "id": 2,
     "description": "descrição de teste 2",
     "completed": false,
     "user_id": 1
    }
]

```

### Exemplo de resposta em caso de erro

```javascript
// HTTP Status 400

{
    'error': "InternalServerError",
    'message': "An unexpected error occurred. Please try again later."
}

```

<br/>

</details>

<details>
<summary><b>[Tarefa] Atualizar</b></summary>

### Atualizar tarefa

#### `PUT` `/task/:id`

Este endpoint realiza a atualização de uma tarefa específica do usuário autenticado. O `id` da tarefa é obtido via query params, enquanto o `id` do usuário é recuperado a partir de `req.user`.

#### Exemplo de requisição

```javascript
{
    'description':'tarefa',
    'completed':true
}

```

### Exemplo de resposta

```javascript
// HTTP Status 200
// Sem resposta no body

```

### Exemplo de resposta em caso de erro

```javascript
// HTTP Status 400

{
    'message': 'Tarefa não encontrada'
}

```

<br/>

</details> 


<details>
<summary><b>[Tarefa] Excluir</b></summary>

### Excluir tarefa

#### `DELETE` `/task/:id`

Este endpoint realiza a exclusão de uma tarefa específica do usuário autenticado. O `id` da tarefa é obtido via query params, e o `id` do usuário é recuperado a partir de `req.user`.

#### Exemplo de requisição

```javascript
// Sem dados no body

```

### Exemplo de resposta

```javascript
// HTTP Status 200
// Sem resposta no body

```

### Exemplo de resposta em caso de erro

```javascript
// HTTP Status 400

{
 'message': 'Tarefa não encontrada'
}

```

<br/>   

</details> 



