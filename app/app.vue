<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import spells from './data/magias.json'
import SpellCard from './components/SpellCard.vue'

useHead({
  title: 'Magias D&D 2024',
  meta: [
    { name: 'description', content: 'Consulte magias do Dungeons & Dragons 2024 separadas por nível.' },
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


  htmlAttrs: { lang: 'pt-BR' }
})

const known = ref(new Set())
const onlyShowKnown = ref(false)
const selectedClass = ref('all')

const itemsPerPage = 20
const displayLimit = ref(itemsPerPage)

watch([selectedClass, onlyShowKnown], () => {
  displayLimit.value = itemsPerPage
  window.scrollTo({ top: 0 })
})

function handleScroll() {
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop
  const clientHeight = document.documentElement.clientHeight

  if (scrollHeight - scrollTop - clientHeight < 300) {
    displayLimit.value += itemsPerPage
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function toggleKnown(spellId) {
  const newSet = new Set(known.value)
  if (newSet.has(spellId)) {
    newSet.delete(spellId)
  } else {
    newSet.add(spellId)
  }
  known.value = newSet
}

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
  let renderedCount = 0

  const filtered = spells.filter(spell => {
    const matchesClass = selectedClass.value === 'all' || spell.classes.includes(selectedClass.value)
    const matchesKnown = !onlyShowKnown.value || known.value.has(spell.id)
    return matchesClass && matchesKnown
  })

  for (const spell of filtered) {
    if (renderedCount >= displayLimit.value) break

    const level = spell.level
    if (!groups[level]) {
      groups[level] = []
    }
    groups[level].push(spell)
    renderedCount++
  }

  return groups
})

const hasSpells = computed(() => Object.keys(spellsByLevel.value).length > 0)

function getCardLayout(spell) {
  const size = spell.description.length + (spell.cantripUpgrade?.length || 0)
  return size > 700 ? 'full' : 'half'
}

function getLevelTitle(level) {
  const lvl = Number(level)
  return lvl === 0 ? 'Truques' : `${lvl}º Nível`
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-6 max-width-container">
        <h1 class="text-h3 my-6 font-weight-bold text-center">Compêndio de Magias</h1>

        <v-row justify="center" class="mb-4">
          <v-col cols="12" sm="6" md="4">
            <v-select v-model="selectedClass" :items="classesOptions" item-title="title" item-value="value"
              label="Filtrar por Classe" variant="outlined" prepend-inner-icon="mdi-shield-account"
              hide-details></v-select>
          </v-col>
        </v-row>

        <v-row justify="center" class="mb-6">
          <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
            <v-switch label="Mostrar apenas conhecidas" v-model="onlyShowKnown" inset color="orange-darken-2"
              hide-details></v-switch>
          </v-col>
        </v-row>

        <v-alert v-if="!hasSpells" type="info" variant="tonal"
          text="Nenhuma magia encontrada para os filtros selecionados." class="mt-6"></v-alert>

        <section v-for="(group, level) in spellsByLevel" :key="level" class="level-section mb-10">
          <v-alert :title="getLevelTitle(level)"
            :text="`${group.length} ${group.length === 1 ? 'magia carregada' : 'magias carregadas'}`" variant="tonal"
            color="primary" class="mb-6"></v-alert>

          <div class="masonry-grid">
            <div v-for="spell in group" :key="spell.id" :class="['masonry-item', getCardLayout(spell)]">
              <SpellCard :spell="spell" :layout="getCardLayout(spell)" @toggleKnownSpell="toggleKnown" />
            </div>
          </div>
        </section>
      </v-container>
    </v-main>

    <v-footer border class="text-center d-flex flex-column pa-4 bg-surface">
      <div class="text-body-2 text-medium-emphasis max-width-container w-100">
        <p class="mb-2 font-weight-bold">Compêndio de Magias D&D 2024 &copy; {{ new Date().getFullYear() }}</p>
        <p class="text-caption text-disabled px-4 lh-sm">
          Este projeto utiliza material do System Reference Document 5.2 (SRD 5.2) por Wizards of the Coast LLC.
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