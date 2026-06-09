<script setup>
import spells from './data/magias.json'

useHead({
  title: 'Magias D&D 2024',
  meta: [
    {
      name: 'description',
      content:
        'Consulte magias do Dungeons & Dragons 2024. Busque por nível, escola, componentes, ritual e concentração em uma referência rápida e organizada.'
    },
    {
      name: 'keywords',
      content:
        'D&D 2024, Dungeons and Dragons, magias, spells, spellbook, compêndio, SRD, wizard, cleric, bard, warlock, RPG'
    },
    {
      property: 'og:title',
      content: 'Compêndio de Magias D&D 2024'
    },
    {
      property: 'og:description',
      content:
        'Referência rápida de magias do D&D 2024 com filtros, componentes, escolas e níveis.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:site_name',
      content: 'Compêndio de Magias D&D 2024'
    },
    {
      name: 'twitter:card',
      content: 'summary'
    },
    {
      name: 'twitter:title',
      content: 'Compêndio de Magias D&D 2024'
    },
    {
      name: 'twitter:description',
      content:
        'Explore magias do D&D 2024 por nível, escola e componentes.'
    }
  ],
  htmlAttrs: {
    lang: 'pt-BR'
  }
})
</script>

<template>
  <v-container>
    <h1>Compêndio de Magias</h1>

    <div class="masonry-grid">
      <div
        v-for="spell in spells"
        :key="spell.id"
        :class="[
          'spell-item',
          spell.card_size === 'full' ? 'full' : 'half'
        ]"
      >
        <SpellCard :spell="spell" />
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.spell-item {
  min-width: 0;
}

.spell-item.full {
  grid-column: 1 / -1;
}

.spell-item.half {
  grid-column: span 1;
}

@media (max-width: 960px) {
  .masonry-grid {
    grid-template-columns: 1fr;
  }

  .spell-item.full,
  .spell-item.half {
    grid-column: 1;
  }
}
</style>