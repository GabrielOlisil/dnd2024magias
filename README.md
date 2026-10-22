# Compêndio de Magias D&D 2024

(SSG) construído com **Nuxt**

---


## Créditos e Atribuições

Este projeto foi construído respeitando o trabalho mecânico oficial e o esforço de tradução voluntária da comunidade:

1. **Regras e Dados Originais:** *System Reference Document 5.2 (SRD 5.2)* da **Wizards of the Coast LLC**, disponibilizado sob a licença *Creative Commons Attribution 4.0 International (CC-BY-4.0)*.
2. **Localização e Tradução:** *Heróis Anônimos* https://sites.google.com/view/heroisanonimos.

---

## Desenvolvimento

```bash
npm ci
npm run dev
```

`npm run generate` gera o site estático em `.output/public`. Use `npm run lint` e `npm test` para verificar o código e o encaixe das páginas de impressão.

## Cards e impressão

- O masonry usa colunas CSS responsivas, de uma a quatro colunas. A leitura segue de cima para baixo em cada coluna.
- O catálogo é agrupado uma vez, sem `computed`. Os filtros alternam a visibilidade dos cards existentes; o Markdown é renderizado com cache compartilhado.
- A busca ignora acentos. Classe, nível e magias conhecidas podem ser combinados. As conhecidas são salvas localmente no navegador.
- **Imprimir magias** (ou `Ctrl/Cmd + P` com a página em foco) imprime somente os cards que correspondem aos filtros atuais.
- A impressão é preparada em A4 retrato, com margens de 8 mm e duas colunas. Os cards são reorganizados por tamanho para aproveitar a folha; magias longas ocupam a largura inteira. Se necessário, um card maior que a folha é reduzido proporcionalmente para permanecer inteiro, sem ocultar conteúdo.
- Use A4, escala de 100% e desative os cabeçalhos e rodapés do navegador. O menu de impressão do próprio navegador usa o CSS de impressão básico; prefira o botão do site para obter a paginação com cards inteiros.
