# Compêndio de Magias D&D 2024

Um site estático simples (SSG) construído com **Vue 3**, **Vuetify 3** e **Vite**, projetado com um layout adaptativo estilo *Grid Masonry* de duas colunas para exibição rápida e organizada de magias do Dungeons & Dragons (regras atualizadas de 2024).

---

## ⚖️ Uso de Conteúdo e Licenciamento (SRD 5.2 / CC-BY-4.0)

O conteúdo de dados deste projeto (as magias e regras contidas no arquivo JSON) é baseado estritamente no **System Reference Document v5.2 (SRD)** disponibilizado pela *Wizards of the Coast* através do link oficial da [media.dndbeyond.com](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.pdf).

### O que isso significa?
* **Livre e Seguro para Estudos:** A Wizards of the Coast liberou o núcleo de regras do SRD sob a licença **Creative Commons Attribution 4.0 International (CC-BY-4.0)**. Isso garante que o conteúdo de texto de regras ali presente é público, livre para cópia, modificação e redistribuição, tornando este projeto 100% legal para fins de estudo, portfólio pessoal e desenvolvimento de ferramentas.
* **Limitações do SRD:** O material utilizado restringe-se ao conteúdo aberto. Elementos proprietários de Propriedade Intelectual da marca (como identidades visuais de marcas, imagens oficiais dos livros de capa dura e monstros/cenários muito específicos que não constam no PDF oficial) não fazem parte e não são distribuídos nesta aplicação.

---

## 📐 Layout Masonry Responsivo (2 Colunas Flexíveis)

O design da interface utiliza uma abordagem inteligente baseada em **CSS Grid** e **CSS Columns** no ecossistema do Vuetify para resolver o desafio de cards com alturas muito variantes (causadas pelo tamanho das descrições e tabelas de dados de cada magia):

1. **Visão Geral (2 Colunas):** Por padrão, em telas de desktop e tablets, o grid renderiza exatamente **duas colunas** paralelas de mesma largura.
2. **Dimensionamento Dinâmico por Caracteres:** No `App.vue`, uma função analisa o comprimento de caracteres combinados (`description` + `cantripUpgrade`). 
   * Se a magia possuir uma descrição compacta (como *Barkskin*), ela recebe a classificação `half` e ocupa **1 coluna**.
   * Se a magia possuir regras longas ou tabelas complexas em Markdown (como *Augury*), ela recebe a classificação `full` e expande sua largura para **ocupar o topo/toda a extensão das 2 colunas** (`grid-column: span 2`), evitando que o grid crie buracos ou deformações visuais.
3. **Multi-colunas Internas:** Quando um card longo se expande nas duas colunas, o texto de sua descrição é distribuído internamente em **duas colunas de leitura fluida** (`column-count: 2` no CSS), otimizando o espaço vertical.
4. **100% Mobile Friendly:** O layout colapsa automaticamente para **uma única coluna vertical** em dispositivos móveis, garantindo legibilidade perfeita.

---

## 🛠️ Tecnologias Utilizadas

* **Vue 3 (Composition API)**
* **Vuetify 3** (Componentes de UI & Sistema de Temas)
* **Markdown-It** & **Markdown-It-Multimd-Table** (Para renderização nativa e estilizada das tabelas de dados das magias inseridas via `v-html`)
* **Vite** / Ferramentas SSG

---

## 👥 Créditos e Atribuições

Este projeto foi construído respeitando o trabalho mecânico oficial e o esforço de tradução voluntária da comunidade:

1. **Regras e Dados Originais:** *System Reference Document 5.2 (SRD 5.2)* da **Wizards of the Coast LLC**, disponibilizado sob a licença *Creative Commons Attribution 4.0 International (CC-BY-4.0)*.
2. **Localização e Tradução:** * Mapeamento de ficheiros, pastas e termos técnicos adaptados a partir do repositório público [decito/dnd5e-pt-br](https://github.com/decito/dnd5e-pt-br) (módulo de tradução para Foundry VTT).
   * Padronização de nomes de magias baseada na tradução comunitária do grupo *Heróis Anônimos*.

---