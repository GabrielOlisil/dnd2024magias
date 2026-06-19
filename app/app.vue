<script setup>
import { ref, onMounted, watch } from 'vue';
import spells from './data/spells.json';
import SpellCard from './components/SpellCard.vue';

const knownLocalStorageKey = 'dnd-magias-knownMagics';

useHead({
  title: 'Magias D&D 2024 em Português | Compêndio SRD 5.2',
  meta: [
    { name: 'description', content: 'Todas as magias de D&D 2024 em português. Consulte truques e magias dos níveis 1 ao 9 para Mago, Clérigo, Druida, Bardo, Bruxo, Feiticeiro, Patrulheiro e Paladino.' },
    {
      name: 'robots',
      content: 'noindex, nofollow'
    },
    {
      name: 'keywords',
      content:
        'D&D 2024, Dungeons and Dragons, magias, spells, spellbook, compêndio, SRD, wizard, cleric, bard, warlock, RPG'
    },
    {
      property: 'og:title',
      content: 'Magias DnD 2024'
    },
    {
      property: 'og:description',
      content:
        'Referência rápida de magias do DnD 2024 com filtros, componentes, escolas e níveis.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:site_name',
      content: 'Compêndio de Magias DnD 2024'
    },
    {
      name: 'twitter:card',
      content: 'summary'
    },
    {
      name: 'twitter:title',
      content: 'Magias DnD 2024'
    },
    {
      name: 'twitter:description',
      content:
        'Explore magias do D&D 2024 por nível, escola e componentes.'
    }
  ],


  htmlAttrs: { lang: 'pt-BR' }
});

const known = ref(new Set());
const onlyShowKnown = ref(false);
const selectedClass = ref('all');

const hasSpells = ref(true);


const staticSpellsByLevel = (() => {
  const groups = {};

  const sortedSpells = [...spells].sort((a, b) => Number(a.level) - Number(b.level));

  for (const spell of sortedSpells) {
    const level = spell.level;
    if (!groups[level]) { groups[level] = []; }
    groups[level].push(spell);
  }
  return groups;
})();

function isSpellVisible(spell) {
  const matchesClass = selectedClass.value === 'all' || spell.classes.includes(selectedClass.value) || (onlyShowKnown.value === true && known.value.has(spell.id));


  const matchesKnown = !onlyShowKnown.value || known.value.has(spell.id);

  return matchesClass && matchesKnown;
}

function toggleKnown(spellId) {
  const newSet = new Set(known.value);
  if (newSet.has(spellId)) {
    newSet.delete(spellId);
  } else {
    newSet.add(spellId);
  }
  known.value = newSet;
  localStorage.setItem(knownLocalStorageKey, JSON.stringify([...known.value]));
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
];

function getCardLayout(spell) {
  const size = (spell.description?.length || 0) + (spell.cantripUpgrade?.length || 0);
  return size > 1200 ? 'full' : 'half';
}

function getLevelTitle(level) {
  const lvl = Number(level);
  return lvl === 0 ? 'Truques' : `${lvl}º Nível`;
}


watch([onlyShowKnown, selectedClass], async ([newOnlyShowKnow]) => {
  if (newOnlyShowKnow === true && known.value.size === 0) {
    hasSpells.value = false;
    return;

  }
  hasSpells.value = true;

});

onMounted(() => {

  const _known = localStorage.getItem(knownLocalStorageKey);

  if (_known == null) { return; }

  const parsedItem = JSON.parse(_known);
  known.value = new Set(parsedItem);

});

</script>

<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-6 max-width-container">
        <h1 class="text-h3 my-6 font-weight-bold text-center">Magias D&D 2024 em Português</h1>

        <p>
          tradução feita por <a href="https://sites.google.com/view/heroisanonimos" target="_blank">Heróis Anônimos</a>
        </p>

        <v-row justify="center" class="mb-4">
          <v-col cols="12" sm="6" md="4">
            <v-select
v-model="selectedClass" :items="classesOptions" item-title="title" item-value="value"
              label="Filtrar por Classe" variant="outlined" prepend-inner-icon="mdi-shield-account" hide-details />
          </v-col>
        </v-row>

        <v-row justify="center" class="mb-6">
          <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
            <v-switch
v-model="onlyShowKnown" label="Mostrar apenas conhecidas" inset color="orange-darken-2"
              hide-details />
          </v-col>
        </v-row>

        <v-alert
v-if="!hasSpells" type="info" variant="tonal"
          text="Nenhuma magia encontrada para os filtros selecionados." class="mt-6" />

        <section v-for="(group, level) in staticSpellsByLevel" :key="level" class="level-section mb-10">
          <v-alert v-if="hasSpells" :title="getLevelTitle(level)" variant="tonal" color="primary" class="mb-6" />

          <div class="masonry-grid">
            <div
v-for="spell in group" v-show="isSpellVisible(spell)" :key="spell.id"
              :class="['masonry-item', getCardLayout(spell)]">
              <SpellCard
:spell="spell" :known="known.has(spell.id)" :layout="getCardLayout(spell)"
                @toggle-known-spell="toggleKnown" />
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
        </p>
        <p class="text-caption text-disabled px-4 lh-sm mt-1">
          <strong>Créditos de Tradução:</strong> Nomes das magias e localização de termos técnicos baseados no compêndio
          comunitário
          <a
href="https://github.com/decito/dnd5e-pt-br" target="_blank" rel="noopener"
            class="text-grey-darken-1 decoration-underline">decito/dnd5e-pt-br</a>
          e no grupo Heróis Anônimos.
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
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}

.masonry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-gap: 10px;
  align-items: start;



}

.masonry-item {
  /* width: 100%; */
  content-visibility: auto;



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