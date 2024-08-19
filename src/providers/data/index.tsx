// O provider é a forma como o Refine vai conectar o front com o back para fazer as infos se atualizarem
// aqui estamos definindo qual a url vamos utilizar e como o front deve interpertar od dados do backend
import graphqlDataProvider, { GraphQLClient, liveProvider as graphqlLiveProvider } from "@refinedev/nestjs-query";
import { fetchWrapper } from "./fetch-wrapper";
import { createClient } from "graphql-ws";

export const API_BASE_URL = 'https://api.crm.refine.dev'
export const API_URL = `${API_BASE_URL}/graphql`
export const WS_URL = 'wss://api.crm.refine.dev/graphql'

export const client = new GraphQLClient(API_URL,{
    fetch: (url: string, options: RequestInit) => {
        try {
            // essa função funciona igualmente ao axios
            // no arquivo fetch-wrapper explico melhor o que ele faz
            return fetchWrapper(url, options)
        } catch (error) {
            return Promise.reject(error as Error)
        }
    }
})
// esse ws significa Web Socket, recomendo dar uma estudada sobre
export const wsClient = typeof window !== "undefined"
    ? createClient({
        url: WS_URL,
        connectionParams: () => {
            const accessToken = localStorage.getItem("access_token")
            return{
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        }
    })
    : undefined


export const dataProvider = graphqlDataProvider(client)
export const liveProvider = wsClient ? graphqlLiveProvider(wsClient) : undefined

