<script setup>
import { shallowRef, watch } from 'vue';
import escolas from '~/data/escolas.json';
import { renderSpellMarkdown } from '~/utils/spell-content.js';

const props = defineProps({
  spell: {
    type: Object,
    required: true
  },
  known: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggleKnownSpell']);
const descriptionHtml = shallowRef('');
const upgradeHtml = shallowRef('');

// Only render when the text changes. Toggling a bookmark never reparses Markdown.
watch(
  [() => props.spell.description, () => props.spell.cantripUpgrade],
  ([description, upgrade]) => {
    descriptionHtml.value = renderSpellMarkdown(description);
    upgradeHtml.value = renderSpellMarkdown(upgrade);
  },
  { immediate: true }
);

const actionLabels = {
  action: 'Ação',
  bonusAction: 'Ação bônus',
  reaction: 'Reação',
  minute: 'Minuto(s)',
  hour: 'Hora(s)'
};
</script>

<template>
  <article class="spell-card" :data-spell-id="spell.id" :aria-labelledby="`spell-title-${spell.id}`">
    <header class="spell-card__header spell-header">
      <div class="spell-card__heading">
        <p class="spell-card__eyebrow">
          <span>{{ spell.level === 0 ? 'Truque' : `${spell.level}º círculo` }}</span>
          <span class="spell-card__separator" aria-hidden="true">·</span>
          <span>{{ escolas[spell.school] || spell.school }}</span>
        </p>
        <h2 :id="`spell-title-${spell.id}`" class="spell-card__title spell-title">{{ spell.name }}</h2>
      </div>
      <button
        type="button"
        class="spell-card__bookmark screen-only"
        :class="{ 'is-known': known }"
        :aria-pressed="known"
        :aria-label="`${known ? 'Remover' : 'Marcar'} ${spell.name} ${known ? 'das magias conhecidas' : 'como conhecida'}`"
        :title="known ? 'Remover das conhecidas' : 'Marcar como conhecida'"
        @click="emit('toggleKnownSpell', spell.id)"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
        </svg>
      </button>
    </header>

    <dl class="spell-card__details spell-meta">
      <div>
        <dt>Conjuração</dt>
        <dd>{{ spell.castingTime || actionLabels[spell.actionType] || spell.actionType }}</dd>
      </div>
      <div>
        <dt>Alcance</dt>
        <dd>{{ spell.range }}</dd>
      </div>
      <div>
        <dt>Duração</dt>
        <dd>{{ spell.duration }}</dd>
      </div>
    </dl>

    <!-- Descriptions are trusted local content rendered with raw HTML disabled. -->
    <!-- eslint-disable vue/no-v-html -->
    <div class="spell-card__description spell-description markdown-body" v-html="descriptionHtml" />
    <div v-if="upgradeHtml" class="spell-card__upgrade">
      <h3>Aprimoramento de truque</h3>
      <div class="markdown-body" v-html="upgradeHtml" />
    </div>
    <!-- eslint-enable vue/no-v-html -->

    <footer v-if="spell.components?.length || spell.material || spell.ritual || spell.concentration" class="spell-card__footer">
      <p v-if="spell.components?.length || spell.material" class="spell-card__components">
        <strong>Componentes</strong>
        <span v-if="spell.components?.length" class="spell-card__component-list">
          {{ spell.components.map(component => component.toUpperCase()).join(', ') }}
        </span>
        <span v-if="spell.material" class="spell-card__material">({{ spell.material }})</span>
      </p>
      <div v-if="spell.ritual || spell.concentration" class="spell-card__tags">
        <span v-if="spell.ritual" class="spell-card__tag">Ritual</span>
        <span v-if="spell.concentration" class="spell-card__tag">Concentração</span>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.spell-card {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 20px;
  border: 1px solid #b9b9b4;
  border-radius: 3px;
  background: #fff;
  color: #20201e;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  line-height: 1.6;
  break-inside: avoid;
  page-break-inside: avoid;
}

.spell-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
}

.spell-card__heading {
  min-width: 0;
}

.spell-card__eyebrow {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 7px;
  color: #62625e;
  font-size: 0.73em;
  font-weight: 600;
  letter-spacing: 0.075em;
  line-height: 1.4;
  text-transform: uppercase;
}

.spell-card__separator {
  font-size: 1.15em;
}

.spell-card__title {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.78em;
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.spell-card__bookmark {
  display: inline-flex;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: -5px -7px 0 0;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  color: #71716c;
  cursor: pointer;
  transition: color 120ms ease, background-color 120ms ease;
}

.spell-card__bookmark:hover {
  background: #f2f2ef;
  color: #111;
}

.spell-card__bookmark:focus-visible {
  outline: 2px solid #111;
  outline-offset: 2px;
}

.spell-card__bookmark.is-known {
  color: #20201e;
}

.spell-card__bookmark.is-known svg {
  fill: currentColor;
}

.spell-card__details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 15px;
  padding: 12px 0;
  border-top: 1px solid #d8d8d2;
  border-bottom: 1px solid #d8d8d2;
}

.spell-card__details dt {
  margin-bottom: 5px;
  color: #62625e;
  font-size: 0.68em;
  font-weight: 700;
  letter-spacing: 0.075em;
  line-height: 1.3;
  text-transform: uppercase;
}

.spell-card__details dd {
  margin: 0;
  font-size: 0.87em;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.markdown-body {
  overflow-wrap: anywhere;
}

.markdown-body :deep(p) {
  margin: 0 0 0.75em;
}

.markdown-body :deep(p:last-child),
.markdown-body :deep(ul:last-child),
.markdown-body :deep(ol:last-child),
.markdown-body :deep(table:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(strong) {
  font-weight: 700;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 0.8em;
  padding-left: 1.45em;
}

.markdown-body :deep(li + li) {
  margin-top: 0.35em;
}

.markdown-body :deep(table) {
  width: 100%;
  margin: 1em 0;
  border-collapse: collapse;
  font-size: 0.8em;
  line-height: 1.4;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 0.4em 0.25em;
  border: 1px solid #c5c5bf;
  text-align: left;
  vertical-align: top;
  overflow-wrap: anywhere;
}

.markdown-body :deep(th) {
  font-weight: 700;
  overflow-wrap: normal;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  margin: 1em 0 0.4em;
  font-size: 1em;
  line-height: 1.4;
}

.markdown-body :deep(hr) {
  margin: 1em 0;
  border: 0;
  border-top: 1px solid #d8d8d2;
}

.markdown-body :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.markdown-body :deep(blockquote) {
  margin: 0.8em 0;
  padding-left: 0.8em;
  border-left: 2px solid #777;
}

.spell-card__upgrade {
  margin-top: 1em;
}

.spell-card__upgrade h3 {
  margin: 0 0 0.3em;
  font-size: 1em;
}

.spell-card__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 17px;
  padding-top: 12px;
  border-top: 1px solid #d8d8d2;
}

.spell-card__components {
  flex: 1 1 150px;
  margin: 0;
  color: #62625e;
  font-size: 0.82em;
  line-height: 1.5;
}

.spell-card__components strong {
  margin-right: 5px;
  color: #30302d;
  font-weight: 600;
}

.spell-card__component-list {
  white-space: nowrap;
}

.spell-card__material {
  margin-left: 3px;
  font-style: italic;
}

.spell-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.spell-card__tag {
  padding: 2px 6px;
  border: 1px solid #999994;
  border-radius: 2px;
  font-size: 0.67em;
  font-weight: 600;
  letter-spacing: 0.025em;
  line-height: 1.4;
}

@media (prefers-reduced-motion: reduce) {
  .spell-card__bookmark {
    transition: none;
  }
}

@media print {
  .spell-card {
    padding: 3.5mm;
    border: 0.5pt solid #000;
    border-radius: 0;
    background: #fff;
    color: #000;
    font-size: 9pt;
    line-height: 1.4;
    box-shadow: none;
  }

  .screen-only {
    display: none !important;
  }

  .spell-card__header {
    margin-bottom: 2.5mm;
  }

  .spell-card__eyebrow {
    margin-bottom: 1.5mm;
  }

  .spell-card__title {
    font-size: 1.55em;
  }

  .spell-card__details {
    gap: 2mm;
    margin-bottom: 2.5mm;
    padding: 2mm 0;
  }

  .spell-card__details dt {
    margin-bottom: 1mm;
  }

  .spell-card__footer {
    gap: 2mm;
    margin-top: 2.5mm;
    padding-top: 2mm;
  }

  .spell-card__eyebrow,
  .spell-card__details dt,
  .spell-card__components,
  .spell-card__components strong {
    color: #000;
  }

  .spell-card__details,
  .spell-card__footer,
  .spell-card__tag,
  .markdown-body :deep(th),
  .markdown-body :deep(td),
  .markdown-body :deep(hr) {
    border-color: #777;
  }
}
</style>
