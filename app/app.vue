<script setup>
import { computed } from 'vue'
import spells from './data/magias.json'
import SpellCard from './components/SpellCard.vue'

useHead({
  title: 'Magias D&D 2024',
  meta: [
    {
      name: 'description',
      content: 'Consulte magias do Dungeons & Dragons 2024 separadas por nível.'
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

const selectedClass = ref('all')

// Lista de classes disponíveis para o filtro (mapeadas para exibição amigável)
const classesOptions = [
  { title: 'Todas as Classes', value: 'all' },
  { title: 'Bardo', value: 'bard' },
  { title: 'Bruxo', value: 'warlock' },
  { title: 'Clérigo', value: 'cleric' },
  { title: 'Drúida', value: 'druid' },
  { title: 'Feiticeiro', value: 'sorcerer' },
  { title: 'Mago', value: 'wizard' },
  { title: 'Paladino', value: 'paladin' },
  { title: 'Patrulheiro', value: 'ranger' }
]



const spellsByLevel = computed(() => {
  const groups = {}

  // 1. Filtragem por classe
  const filteredSpells = spells.filter(spell => {
    if (selectedClass.value === 'all') return true
    return spell.classes.includes(selectedClass.value)
  })

  // 2. Agrupamento por nível
  filteredSpells.forEach(spell => {
    const level = spell.level
    if (!groups[level]) {
      groups[level] = []
    }
    groups[level].push(spell)
  })

  return groups
})

const hasSpells = computed(() => Object.keys(spellsByLevel.value).length > 0)

function getCardLayout(spell) {
  const size = spell.description.length + (spell.cantripUpgrade?.length || 0)
  return size > 450 ? 'full' : 'half'
}

// Helper para definir o título visual de cada nível
function getLevelTitle(level) {
  const lvl = Number(level)
  if (lvl === 0) return 'Truques'
  return `${lvl}º Nível`
}


</script>

<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-6 max-width-container">
        <h1 class="text-h3 my-6 font-weight-bold text-center">Compêndio de Magias</h1>

        <!-- Barra de Filtros -->
        <v-row justify="center" class="mb-6">
          <v-col cols="12" sm="6" md="4">
            <v-select v-model="selectedClass" :items="classesOptions" item-title="title" item-value="value"
              label="Filtrar por Classe" variant="outlined" prepend-inner-icon="mdi-shield-account"
              hide-details></v-select>
          </v-col>
        </v-row>


        <!-- Loop pelas seções de níveis (ex: 0, 1, 2...) -->
        <section v-for="(group, level) in spellsByLevel" :key="level" class="level-section mb-10">
          <!-- Título da Seção Dinâmico -->


          <v-alert color="teal-lighten-2" :text="`${group.length}  ${group.length === 1 ? 'magia' : 'magias'}`"
            :title="getLevelTitle(level)"></v-alert>

          <v-divider class="mb-6"></v-divider>

          <!-- Grid Masonry específico deste nível -->
          <div class="masonry-grid">
            <div v-for="spell in group" :key="spell.name" :class="['masonry-item', getCardLayout(spell)]">
              <SpellCard :spell="spell" :layout="getCardLayout(spell)" />
            </div>
          </div>
        </section>
      </v-container>
    </v-main>

    <v-footer border class="text-center d-flex flex-column pa-4 bg-surface">
      <div class="text-body-2 text-medium-emphasis max-width-container w-100">
        <p class="mb-2 font-weight-bold">
          Compêndio de Magias D&D 2024 &copy; {{ new Date().getFullYear() }}
        </p>
        <p class="text-caption text-disabled px-4 lh-sm">
          Este projeto utiliza material do System Reference Document 5.2 (SRD 5.2) por Wizards of the Coast LLC,
          disponibilizado sob os termos da licença Creative Commons Attribution 4.0 International (CC-BY-4.0).
          Desenvolvido estritamente para fins de estudo, consulta pessoal e portfólio de programação.
        </p>
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
.max-width-container {
  max-width: 1400px;
  margin: 0 auto;
}

.level-section {
  scroll-margin-top: 20px;

}

.masonry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: start;
}

.masonry-item {
  width: 100%;
}

.masonry-item.half {
  grid-column: span 1;
}

.masonry-item.full {
  grid-column: span 2;
}

.lh-sm {
  line-height: 1.4;
}

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