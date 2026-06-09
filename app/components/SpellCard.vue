<script setup>
defineProps({
  spell: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <v-card>
    <v-card-title>
      {{ spell.nome }}
    </v-card-title>

    <v-card-subtitle>
      Nível {{ spell.nivel }} • {{ spell.escola }}
    </v-card-subtitle>

    <v-card-text>
      <p>{{ spell.descricao }}</p>

      <v-row>
        <v-col cols="12" sm="6">
          <strong>Conjuração:</strong>
          {{ spell.tempo_conjuracao }}
        </v-col>

        <v-col cols="12" sm="6">
          <strong>Alcance:</strong>
          {{ spell.alcance }}
        </v-col>

        <v-col cols="12" sm="6">
          <strong>Duração:</strong>
          {{ spell.duracao }}
        </v-col>

        <v-col cols="12" sm="6">
          <strong>Material:</strong>
          {{ spell.componentes.material || 'Nenhum' }}
        </v-col>
      </v-row>

      <v-chip-group>
        <v-chip v-if="spell.ritual">
          Ritual
        </v-chip>

        <v-chip v-if="spell.concentracao">
          Concentração
        </v-chip>

        <v-chip v-if="spell.componentes.verbal">
          Verbal
        </v-chip>

        <v-chip v-if="spell.componentes.somatic">
          Somático
        </v-chip>
      </v-chip-group>
    </v-card-text>
  </v-card>
</template>