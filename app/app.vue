<script setup>
import spells from './data/magias.json'
import SpellCard from './components/SpellCard.vue'

useHead({
  title: 'Magias D&D 2024',
  meta: [
    {
      name: 'description',
      content: 'Consulte magias do Dungeons & Dragons 2024. Busque por nível, escola e componentes.'
    }
  ],
  htmlAttrs: {
    lang: 'pt-BR'
  }
})

// Função para determinar o tipo de layout do card baseado no tamanho do texto
function getCardLayout(spell) {
  const size = spell.description.length + (spell.cantripUpgrade?.length || 0)

  // Se o texto for muito longo (como Augury com tabela), ocupa a largura total
  return size > 450 ? 'full' : 'half'
}
</script>

<template>
  <v-container fluid class="pa-6 max-width-container">
    <h1 class="text-h3 mb-6 font-weight-bold text-center">Compêndio de Magias</h1>

    <!-- Grid Masonry controlado por classes CSS -->
    <div class="masonry-grid">
      <div v-for="spell in spells" :key="spell.name" :class="['masonry-item', getCardLayout(spell)]">
        <!-- Passamos o layout como prop para o card saber se deve dividir o texto interno -->
        <SpellCard :spell="spell" :layout="getCardLayout(spell)" />
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.max-width-container {
  max-width: 1400px;
  margin: 0 auto;
}

.masonry-grid {
  display: grid;
  /* Cria exatamente 2 colunas de tamanhos iguais */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: start;
}

.masonry-item {
  width: 100%;
}

/* Se for metade, ocupa apenas 1 coluna do grid */
.masonry-item.half {
  grid-column: span 1;
}

/* Se for muito grande, quebra a linha e ocupa as 2 colunas */
.masonry-item.full {
  grid-column: span 2;
}

/* Responsividade: em celulares tudo vira 1 coluna só */
@media (max-width: 800px) {
  .masonry-grid {
    grid-template-columns: 1fr;
  }

  .masonry-item.full,
  .masonry-item.half {
    grid-column: span 1;
  }
}
</style>