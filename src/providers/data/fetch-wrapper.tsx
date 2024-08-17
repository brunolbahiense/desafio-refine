// Resumindo aqui: é a conexão do front com o back, funciona igual a quando fazemos com o axios, 
// a única diferença é que já estamos setando coisas para quando der erro
import { GraphQLFormattedError } from "graphql"


// Kauã, em TypeScript nós sempre iremos definir o tipo das coisas, então aqui é um exemplo de definir de forma global:
type Error = {
    message: string,
    statusCode: string
}
// alguns tipos são: string, number, boolean, float, any (qualquer um).

// quando temos essa estrutura -> url:string , estamos dizendo o tipo que o parametro vai receber na função, 
// se dentro da url colocarmos um numero, o codigo nem roda e ja aparece erro
const customFetch = async (url: string, options: RequestInit) => {
    const accessToken = localStorage.getItem('access_Token')
    const headers = options.headers as Record<string, string>
    // caso queira comparar com os outros projetos, veja la no axios do safra ou will, é bem semelhante
    return await fetch(url, {
        ...options,
            headers: {
                ...headers, 
                Authorization: headers?.Authorization || `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Apollo-Require-Preflight": "true"
            }
        }
    )
}

// Aqui vamos definir os padrões dos erros, assim garantimos que os erros do back aparecem no front
// além de: se tiver um erro desconhecido, ele retorna como status 500 
const getGraphQLErrors = (body: Record<"errors", GraphQLFormattedError[] | undefined>): Error | null => {
    if(!body){
        return{
            message: 'Unknown error', 
            statusCode: 'INTERNAL_SERVER_ERROR'
        }
    }
    if("errors" in body){
        const errors = body?.errors
        const messages = errors?.map(error => error?.message)?.join("")
        const code = errors?.[0]?.extensions?.code

        return{
            message: messages || JSON.stringify(errors),
            statusCode: code || 500
        }
    }
    return null
}


// aqui basicamente estamos exportanto a funcao que vai fazer tudo que ta acima e passar as conexões para todo o fluxo do sistema
export const fetchWrapper = async(url: string, options:RequestInit) => {
    const response = await customFetch(url, options)
    const responseClone = response.clone()
    const body = await responseClone.json()
    const error = getGraphQLErrors(body)
    if (error) throw error
    return response
}