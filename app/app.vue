<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import spells from './data/spells.json';
import SpellCard from './components/SpellCard.vue';
import { printSpells } from './utils/print-spells';

const knownLocalStorageKey = 'dnd-magias-knownMagics';
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const sortedSpells = [...spells].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name, 'pt-BR'));
const searchNames = new Map(sortedSpells.map(spell => [spell.id, normalize(spell.name)]));
const spellIds = new Set(sortedSpells.map(spell => spell.id));
// The catalog and its groups stay static. Filters only change visibility, never rebuild cards.
const spellGroups = Array.from({ length: 10 }, (_, level) => ({
  level,
  title: level === 0 ? 'Truques' : `${level}º nível`,
  spells: sortedSpells.filter(spell => spell.level === level)
}));
const classesOptions = [
  { title: 'Todas as classes', value: 'all' },
  { title: 'Bardo', value: 'bard' },
  { title: 'Bruxo', value: 'warlock' },
  { title: 'Clérigo', value: 'cleric' },
  { title: 'Druida', value: 'druid' },
  { title: 'Feiticeiro', value: 'sorcerer' },
  { title: 'Mago', value: 'wizard' },
  { title: 'Paladino', value: 'paladin' },
  { title: 'Patrulheiro', value: 'ranger' }
];

const known = shallowRef(new Set());
const onlyShowKnown = ref(false);
const selectedClass = ref('all');
const selectedLevel = ref('all');
const searchTerm = ref('');
const visibleSpellIds = shallowRef(new Set(spellIds));
const levelCounts = shallowRef(spellGroups.map(group => group.spells.length));
const catalog = ref(null);
const isPrinting = ref(false);
const printError = ref('');
const storageNotice = ref('');

useHead({
  title: 'Magias D&D 2024 em Português | Compêndio SRD 5.2',
  htmlAttrs: { lang: 'pt-BR' },
  meta: [
    { name: 'description', content: 'Consulte, selecione e imprima as magias de D&D 2024 em português. Cards com filtros por classe e nível, em um compêndio baseado no SRD 5.2.' },
    { name: 'robots', content: 'noindex, nofollow' },
    { property: 'og:title', content: 'Compêndio de Magias D&D 2024' },
    { property: 'og:description', content: 'Suas magias à mão. Consulte e imprima cards em português.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' }
  ]
});

function updateVisibility() {
  const query = normalize(searchTerm.value);
  const visible = new Set();
  const counts = Array(10).fill(0);
  for (const spell of sortedSpells) {
    if (selectedClass.value !== 'all' && !spell.classes.includes(selectedClass.value)) { continue; }
    if (selectedLevel.value !== 'all' && spell.level !== selectedLevel.value) { continue; }
    if (onlyShowKnown.value && !known.value.has(spell.id)) { continue; }
    if (query && !searchNames.get(spell.id).includes(query)) { continue; }
    visible.add(spell.id);
    counts[spell.level]++;
  }
  visibleSpellIds.value = visible;
  levelCounts.value = counts;
}

watch([searchTerm, selectedClass, selectedLevel, onlyShowKnown, known], updateVisibility);

function toggleKnown(spellId) {
  const nextKnown = new Set(known.value);
  if (nextKnown.has(spellId)) { nextKnown.delete(spellId); }
  else { nextKnown.add(spellId); }
  known.value = nextKnown;
  try {
    localStorage.setItem(knownLocalStorageKey, JSON.stringify([...nextKnown]));
    storageNotice.value = '';
  } catch {
    storageNotice.value = 'Suas escolhas ficam disponíveis nesta sessão. O navegador não permitiu salvá-las.';
  }
}

function clearFilters() {
  searchTerm.value = '';
  selectedClass.value = 'all';
  selectedLevel.value = 'all';
  onlyShowKnown.value = false;
}

async function printVisibleSpells() {
  if (isPrinting.value || visibleSpellIds.value.size === 0) { return; }
  isPrinting.value = true;
  printError.value = '';
  try {
    await nextTick();
    const elements = [...catalog.value.querySelectorAll('.spell-card[data-spell-id]')]
      .filter(element => visibleSpellIds.value.has(element.dataset.spellId));
    await printSpells(elements);
  } catch {
    printError.value = 'Não foi possível preparar a impressão. Tente novamente.';
  } finally {
    isPrinting.value = false;
  }
}

function handlePrintShortcut(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
    event.preventDefault();
    printVisibleSpells();
  }
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(knownLocalStorageKey) || '[]');
    if (Array.isArray(saved)) {
      known.value = new Set(saved.filter(id => spellIds.has(id)));
    }
  } catch {
    storageNotice.value = 'Não foi possível recuperar suas magias salvas. Você pode selecioná-las novamente.';
  }
  window.addEventListener('keydown', handlePrintShortcut);
});
onBeforeUnmount(() => window.removeEventListener('keydown', handlePrintShortcut));
</script>

<template>
  <div class="compendium">
    <a class="skip-link screen-only" href="#spell-catalog">Ir para as magias</a>
    <header class="site-header screen-only">
      <div class="page-width header-inner">
        <a class="brand" href="./" aria-label="Compêndio de magias, início">
          <svg class="brand-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="m16 2 12 7v14l-12 7L4 23V9L16 2Z" stroke="currentColor" stroke-width="1.4" />
            <path d="m16 2 7 14-7 14L9 16 16 2Zm-12 7 19 7L4 23m24-14L9 16l19 7" stroke="currentColor" stroke-width="1.1" />
          </svg>
          <span>GRIMÓRIO <span class="brand-edition">D&D 2024</span></span>
        </a>
        <a class="source-link" href="https://sites.google.com/view/heroisanonimos" target="_blank" rel="noopener noreferrer">
          Tradução: Heróis Anônimos <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>

    <main class="page-width main-content">
      <section class="intro screen-only" aria-labelledby="page-title">
        <div>
          <p class="eyebrow">REFERÊNCIA PARA A SUA PRÓXIMA AVENTURA</p>
          <h1 id="page-title">Compêndio de magias<span class="title-period">.</span></h1>
          <p class="intro-description">Encontre suas magias. Prepare seu grimório. Leve para a mesa.</p>
          <div class="edition-details"><span>{{ spells.length }} magias</span><span>SRD 5.2</span><span>Português</span></div>
        </div>
        <div class="print-action">
          <button class="button button-primary" type="button" :disabled="isPrinting || !visibleSpellIds.size" @click="printVisibleSpells">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7v-7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /><path d="M16 11h1" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
            {{ isPrinting ? 'Preparando impressão…' : 'Imprimir magias' }}
          </button>
          <span>A4 · preto e branco · cards inteiros</span>
        </div>
      </section>

      <section class="filter-panel screen-only" aria-label="Filtros de magias">
        <div class="filter-fields">
          <div class="search-field field">
            <label for="spell-search">BUSCAR MAGIA</label>
            <div class="input-wrap">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.6" /><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
              <input id="spell-search" v-model="searchTerm" type="search" placeholder="Qual magia você procura?" autocomplete="off">
            </div>
          </div>
          <div class="class-field field">
            <label for="spell-class">CLASSE</label>
            <select id="spell-class" v-model="selectedClass">
              <option v-for="option in classesOptions" :key="option.value" :value="option.value">{{ option.title }}</option>
            </select>
          </div>
          <label class="known-filter" for="known-only">
            <input id="known-only" v-model="onlyShowKnown" type="checkbox">
            <span>Somente conhecidas<small>Seu grimório pessoal</small></span>
            <span class="known-count">{{ known.size }}</span>
          </label>
        </div>
        <div class="level-filter" role="group" aria-label="Filtrar por nível">
          <span class="level-filter-label">NÍVEL</span>
          <div class="level-options">
            <button type="button" :aria-pressed="selectedLevel === 'all'" @click="selectedLevel = 'all'">Todos</button>
            <button v-for="group in spellGroups" :key="group.level" type="button" :aria-pressed="selectedLevel === group.level" @click="selectedLevel = group.level">
              {{ group.level === 0 ? 'Truques' : `${group.level}º` }}
            </button>
          </div>
        </div>
      </section>

      <p v-if="storageNotice" class="notice screen-only" role="status">{{ storageNotice }}</p>
      <p v-if="printError" class="notice screen-only" role="alert">{{ printError }}</p>
      <div class="results-bar screen-only">
        <p role="status" aria-live="polite"><strong>{{ visibleSpellIds.size }}</strong> {{ visibleSpellIds.size === 1 ? 'magia encontrada' : 'magias encontradas' }}<span class="results-hint"> · organizadas por nível e nome</span></p>
        <button v-if="searchTerm || selectedClass !== 'all' || selectedLevel !== 'all' || onlyShowKnown" class="text-button" type="button" @click="clearFilters">Limpar filtros <span aria-hidden="true">×</span></button>
        <span v-else class="bookmark-hint">Marque os cards para salvar suas magias</span>
      </div>

      <div id="spell-catalog" ref="catalog" tabindex="-1" aria-label="Catálogo de magias">
        <div v-if="!visibleSpellIds.size" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
          <h2>{{ onlyShowKnown && known.size === 0 ? 'Seu grimório começa aqui' : 'Nenhuma magia por aqui' }}</h2>
          <p>{{ onlyShowKnown && known.size === 0 ? 'Marque as magias que você conhece para reuni-las neste espaço.' : 'Tente outro nome, classe ou nível para encontrar suas magias.' }}</p>
          <button class="button button-secondary" type="button" @click="clearFilters">{{ onlyShowKnown && known.size === 0 ? 'Explorar magias' : 'Limpar filtros' }}</button>
        </div>
        <section v-for="group in spellGroups" v-show="levelCounts[group.level] > 0" :key="group.level" class="level-section" :aria-labelledby="`level-${group.level}`">
          <div class="section-heading">
            <h2 :id="`level-${group.level}`">{{ group.title }}</h2>
            <span>{{ levelCounts[group.level] }} {{ levelCounts[group.level] === 1 ? 'magia' : 'magias' }}</span>
            <div class="section-rule" />
            <span class="section-index" aria-hidden="true">{{ String(group.level).padStart(2, '0') }}</span>
          </div>
          <div class="masonry-grid">
            <div v-for="spell in group.spells" v-show="visibleSpellIds.has(spell.id)" :key="spell.id" class="masonry-item">
              <SpellCard :spell="spell" :known="known.has(spell.id)" @toggle-known-spell="toggleKnown" />
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="site-footer screen-only">
      <div class="page-width footer-inner">
        <div class="footer-label">GRIMÓRIO <span>D&D 2024</span><p>Uma referência para ter sempre à mão.</p></div>
        <div class="credits">
          <p>Material do System Reference Document 5.2, por Wizards of the Coast LLC, sob a licença <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.</p>
          <p>Tradução e localização: <a href="https://sites.google.com/view/heroisanonimos" target="_blank" rel="noopener noreferrer">Heróis Anônimos</a> e <a href="https://github.com/decito/dnd5e-pt-br" target="_blank" rel="noopener noreferrer">decito/dnd5e-pt-br</a>.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
:root { color-scheme: light; font-family: Arial, Helvetica, sans-serif; color: #202020; background: #f7f7f5; font-synthesis: none; }
* { box-sizing: border-box; }
body { margin: 0; }
button, input, select { font: inherit; }
button, a, input, select { -webkit-tap-highlight-color: transparent; }
button { cursor: pointer; }
button:disabled { cursor: wait; opacity: .5; }
button:disabled:not(:has(svg)) { cursor: default; }
a { color: inherit; text-underline-offset: 3px; }
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid #111; outline-offset: 4px; }
svg { display: block; flex: none; }
.page-width { width: min(100% - 96px, 1480px); margin-inline: auto; }
.site-header { border-bottom: 1px solid #dcdcd8; }
.header-inner { height: 78px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.brand { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 700; letter-spacing: 2px; text-decoration: none; }
.brand-icon { width: 33px; height: 36px; }
.brand-edition { margin-left: 15px; padding-left: 16px; border-left: 1px solid #bcbcb8; color: #666; font-size: 11px; font-weight: 400; letter-spacing: 1px; }
.source-link { color: #61615e; font-size: 12px; text-decoration: none; }
.source-link span { margin-left: 8px; font-size: 18px; }
.source-link:hover { color: #111; text-decoration: underline; }
.intro { padding: 48px 0 34px; display: flex; align-items: center; justify-content: space-between; gap: 28px; }
.eyebrow { margin: 0 0 14px; color: #656560; font-size: 10px; font-weight: 700; letter-spacing: 1.7px; }
h1 { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(32px, 3.5vw, 51px); line-height: 1.12; font-weight: 400; letter-spacing: -1.7px; }
.title-period { color: #888; }
.intro-description { margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #64645f; }
.edition-details { display: flex; gap: 0; margin-top: 22px; color: #575753; font-size: 10px; letter-spacing: .5px; }
.edition-details span + span::before { content: '·'; margin: 0 12px; }
.print-action { display: flex; flex-direction: column; align-items: center; gap: 12px; flex-shrink: 0; padding-top: 24px; }
.print-action > span { font-size: 10px; color: #777771; }
.button { min-height: 44px; padding: 12px 20px; border: 1px solid #222; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; font-size: 12px; font-weight: 600; transition: background .15s; }
.button svg { width: 18px; height: 18px; }
.button-primary { background: #202020; color: white; }
.button-primary:hover:not(:disabled) { background: #444; }
.button-secondary { color: #222; background: white; }
.button-secondary:hover { background: #eee; }
.filter-panel { border: 1px solid #d7d7d2; border-radius: 6px; background: #fff; }
.filter-fields { display: grid; grid-template-columns: minmax(200px, 1fr) minmax(180px, .6fr) minmax(220px, .6fr); align-items: end; gap: 24px; padding: 22px 24px; }
.field label { display: block; margin-bottom: 9px; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; }
.input-wrap { position: relative; }
.input-wrap svg { position: absolute; left: 12px; top: 12px; width: 17px; height: 17px; color: #777; pointer-events: none; }
.field input, .field select { width: 100%; height: 42px; border: 1px solid #d8d8d3; border-radius: 3px; color: #222; background: #fff; font-size: 12px; }
.field input { padding: 0 12px 0 38px; }
.field input::placeholder { color: #8a8a84; opacity: 1; }
.field select { padding: 0 34px 0 12px; }
.known-filter { display: flex; align-items: center; gap: 10px; min-height: 42px; padding-left: 22px; border-left: 1px solid #e2e2dd; font-size: 12px; cursor: pointer; }
.known-filter input { width: 16px; height: 16px; margin: 0; flex-shrink: 0; accent-color: #222; }
.known-filter small { display: block; margin-top: 5px; color: #85857e; font-size: 10px; }
.known-count { margin-left: auto; border: 1px solid #deded9; border-radius: 4px; padding: 4px 7px; font-size: 10px; color: #666; font-variant-numeric: tabular-nums; }
.level-filter { padding: 13px 24px; border-top: 1px solid #e6e6e1; display: flex; align-items: center; gap: 20px; }
.level-filter-label { font-size: 9px; letter-spacing: 1px; font-weight: 700; color: #72726c; }
.level-options { display: flex; flex-wrap: wrap; gap: 6px; }
.level-options button { min-height: 30px; min-width: 34px; padding: 5px 11px; border: 1px solid transparent; border-radius: 3px; background: transparent; font-size: 11px; color: #62625d; }
.level-options button:hover { border-color: #d4d4ce; color: #111; }
.level-options button[aria-pressed='true'] { background: #222; border-color: #222; color: #fff; }
.results-bar { min-height: 65px; display: flex; align-items: center; justify-content: space-between; gap: 16px; color: #74746e; font-size: 11px; }
.results-bar p { margin: 0; }
.results-bar strong { color: #333; font-weight: 600; }
.bookmark-hint { font-size: 10px; }
.text-button { border: 0; background: transparent; padding: 8px 0 8px 8px; color: #444; font-size: 11px; text-decoration: underline; text-underline-offset: 3px; }
.text-button span { margin-left: 8px; text-decoration: none; }
.level-section { margin-bottom: 40px; }
.section-heading { display: flex; align-items: center; gap: 13px; margin: 2px 0 18px; }
.section-heading h2 { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 25px; line-height: 1.2; font-weight: 400; letter-spacing: -.5px; }
.section-heading > span { color: #777771; font-size: 10px; white-space: nowrap; }
.section-rule { height: 1px; background: #d8d8d2; flex: 1; margin-left: 7px; }
.section-heading .section-index { font-family: Georgia, 'Times New Roman', serif; font-size: 18px; color: #999991; }
.masonry-grid { column-count: 3; column-gap: 18px; }
.masonry-item { break-inside: avoid; page-break-inside: avoid; margin: 0 0 18px; }
.empty-state { padding: 58px 20px 76px; text-align: center; border-top: 1px solid #ddd; }
.empty-state > svg { width: 36px; height: 36px; margin: 0 auto 20px; color: #777; }
.empty-state h2 { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; }
.empty-state p { margin: 14px auto 24px; color: #73736e; max-width: 360px; font-size: 13px; line-height: 1.6; }
.notice { padding: 12px 16px; border: 1px solid #aaa; border-radius: 4px; color: #444; font-size: 12px; line-height: 1.5; }
.site-footer { margin-top: 60px; border-top: 1px solid #d7d7d1; }
.footer-inner { padding-block: 28px 34px; display: flex; justify-content: space-between; gap: 40px; }
.footer-label { flex-shrink: 0; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
.footer-label > span { margin-left: 8px; color: #7a7a74; font-size: 9px; font-weight: 400; }
.footer-label p { margin: 10px 0 0; color: #7a7a74; font-size: 10px; font-weight: 400; letter-spacing: 0; }
.credits { max-width: 610px; font-size: 10px; color: #777771; line-height: 1.7; }
.credits p { margin: 0 0 4px; }
.skip-link { position: fixed; z-index: 100; top: -60px; left: 20px; padding: 10px 16px; background: #111; color: white; }
.skip-link:focus { top: 12px; }
@media (min-width: 1440px) { .masonry-grid { column-count: 4; } }
@media (max-width: 1099px) {
  .page-width { width: calc(100% - 56px); }
  .masonry-grid { column-count: 2; }
  .filter-fields { gap: 16px; grid-template-columns: minmax(180px, 1fr) minmax(150px, .7fr) minmax(180px, .8fr); padding: 20px; }
  .known-filter { padding-left: 15px; font-size: 11px; }
  .known-count { padding-inline: 5px; }
  .intro { gap: 20px; }
  .intro-description { font-size: 12px; }
}
@media (max-width: 760px) {
  .page-width { width: calc(100% - 36px); }
  .header-inner { height: 64px; }
  .brand { font-size: 13px; gap: 9px; }
  .brand-edition { margin-left: 9px; padding-left: 10px; font-size: 9px; }
  .brand-icon { width: 27px; height: 30px; }
  .source-link { font-size: 10px; }
  .intro { padding-top: 32px; align-items: flex-start; flex-direction: column; gap: 22px; }
  h1 { font-size: 39px; }
  .eyebrow { font-size: 8px; letter-spacing: 1.4px; }
  .print-action { padding-top: 0; flex-direction: row; flex-wrap: wrap; gap: 12px; }
  .filter-fields { grid-template-columns: 1fr 1fr; gap: 18px 16px; padding: 18px; }
  .search-field { grid-column: 1 / -1; }
  .known-filter { align-self: end; padding-left: 15px; }
  .known-count { display: none; }
  .level-filter { padding: 12px 18px; gap: 12px; align-items: baseline; }
  .level-options { gap: 4px; }
  .level-options button { padding-inline: 9px; min-width: 30px; }
  .bookmark-hint, .results-hint { display: none; }
  .footer-inner { flex-direction: column; gap: 20px; }
}
@media (max-width: 599px) {
  .masonry-grid { column-count: 1; }
  .masonry-item { margin-bottom: 16px; }
  .intro { padding-block: 24px; gap: 16px; }
  .edition-details { margin-top: 14px; }
  .filter-fields { grid-template-columns: minmax(0, 1fr); gap: 14px; }
  .known-filter { padding-left: 0; border-left: 0; min-height: 34px; }
  .known-count { display: inline-block; }
  .source-link { max-width: 98px; line-height: 1.5; text-align: right; }
  .source-link span { margin-left: 2px; font-size: 12px; }
  h1 { max-width: 320px; font-size: 38px; }
  .intro-description { max-width: 270px; }
  .print-action > span { font-size: 9px; }
  .level-filter-label { display: none; }
  .level-options { gap: 3px; }
  .level-options button { min-height: 34px; padding-inline: 9px; }
  .section-heading h2 { font-size: 25px; }
  .site-footer { margin-top: 36px; }
}
@page { size: A4; margin: 8mm; }
@media print {
  :root, body { background: #fff !important; color: #000 !important; }
  .screen-only { display: none !important; }
  .page-width { width: 100%; max-width: none; margin: 0; }
  .level-section { margin: 0; }
  .section-heading { display: none; }
  #spell-catalog { column-count: 2; column-gap: 4mm; }
  .level-section, .masonry-grid { display: contents; }
  .masonry-item { break-inside: avoid; page-break-inside: avoid; margin-bottom: 4mm; }
}
</style>
