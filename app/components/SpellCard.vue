<script setup>
import escolas from '~/data/escolas.json';
import MarkdownIt from 'markdown-it';



defineProps({
  spell: {
    type: Object,
    required: true
  },
  layout: {
    type: String,
    default: 'half' // 'half' ou 'full'
  },
  known: {
    type: Boolean,
    default: false
  }
});

function formatAction(action) {
  const types = {
    action: 'Ação',
    bonusAction: 'Ação Bônus',
    reaction: 'Reação',
    minute: 'Minuto(s)',
    hour: 'Hora(s)'
  };
  return types[action] || action;
}

const emit = defineEmits(['toggleKnownSpell']);

function onToggleKnown(spellId) {
  emit('toggleKnownSpell', spellId);
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true
});


</script>

<template>
  <v-card variant="outlined" class="v-card-spell border-md">
    <v-card-item>


      <v-row class="justify-space-between">

        <v-col>

          <v-card-title class="text-h5 font-weight-bold">
            {{ spell.name }}
          </v-card-title>
          <v-card-subtitle class="text-capitalize pt-1">

            {{ spell.level === 0 ? 'Truque' : `${spell.level}º Nível` }}
            •
            {{ escolas[spell.school] || spell.school }}
            <p><strong v-if="spell.concentration">Concentração</strong></p>
          </v-card-subtitle>
        </v-col>

        <v-col cols="3">



          <v-switch label="Conhece" inset color="red-darken-2" :model-value="known" @click="onToggleKnown(spell.id)" />

        </v-col>
      </v-row>
    </v-card-item>

    <v-card-text>

      <v-row density="comfortable" class="text-caption">
        <v-col cols="6" sm="4">
          <strong>Conjuração:</strong> <br>
          {{ formatAction(spell.actionType) }} {{ spell.castingTime ? `(${spell.castingTime})` : '' }}
        </v-col>

        <v-col cols="6" sm="4">
          <strong>Alcance:</strong> <br>
          {{ spell.range }}
        </v-col>

        <v-col cols="6" sm="4">
          <strong>Duração:</strong> <br>
          {{ spell.duration }}
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <div :class="['spell-description text-body-2 mb-4', { 'two-columns': layout === 'full' }, 'markdown-body']"
        v-html="md.render(spell.description)" />




      <div class="mt-4">
        <span v-if="spell.components.length > 0" class="text-caption font-weight-bold">Componentes:</span>
        <div class="d-flex align-center flex-wrap gap-1 mt-1">
          <v-chip v-for="component in spell.components" :key="component" size="x-small" variant="tonal"
            class="mr-1 font-weight-bold">
            {{ component.toUpperCase() }}
          </v-chip>

          <span v-if="spell.material" class="text-grey text-caption d-block mt-1 style-italic">
            ({{ spell.material }})
          </span>
        </div>
      </div>

      <div v-if="spell.ritual || spell.concentration" class="d-flex gap-2 mt-4">
        <v-chip v-if="spell.ritual" color="blue" size="small" variant="flat" class="mr-2">
          Ritual
        </v-chip>


      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.markdown-body {
  font-size: 0.95rem;
  line-height: 1.6;
}

.markdown-body :deep(p) {
  margin-bottom: 12px;
}

.markdown-body :deep(strong) {
  margin-top: 20px;
  display: block;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin-bottom: 12px;
  padding-left: 20px;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 0.85rem;
}

.markdown-body :deep(th) {
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-weight: bold;
  text-align: left;
  padding: 8px;
  border-bottom: 2px solid rgb(var(--v-theme-primary));
}

.markdown-body :deep(td) {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
}

/* Linhas alternadas na tabela (Zebrado) */
.markdown-body :deep(tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Destaques em negrito (dados de dano, dados de jogada) */
.markdown-body :deep(strong) {
  color: black;
  /* Laranja escuro para destacar no texto */
}

.v-card-spell {
  background-color: rgb(var(--v-theme-surface));
  max-height: 700px;
}

.style-italic {
  font-style: italic;
}

.two-columns {
  column-count: 2;
  column-gap: 24px;

}

.two-columns :deep(table),
.two-columns :deep(p) {
  break-inside: avoid;
}

/* Tabelas injetadas no HTML interno */
:deep(.spell-description) table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 0.85rem;
}

:deep(.spell-description) th {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  font-weight: bold;
}

:deep(.spell-description) th,
:deep(.spell-description) td {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  padding: 6px 10px;
  text-align: left;
}

:deep(.spell-description) p {
  margin-bottom: 8px;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .two-columns {
    column-count: 1;

  }
}
</style>