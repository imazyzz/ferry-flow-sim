## Simulação de Fila de Ferry

### Objetivo

Modelar operação diária de um sistema de ferry com múltiplos horários de pico, permitindo análise de formação de filas, utilização e impacto de parâmetros operacionais. Inclui aceleração de tempo fidedigna (1x, 2x, 5x, 10x) sem distorcer proporções dos processos internos.

### Dataset Padronizado (Unidades em Minutos)

| Parâmetro                     | Valor                      | Observação                               |
| ----------------------------- | -------------------------- | ---------------------------------------- |
| Ferries ativos                | 4                          | `ferryCount`                             |
| Capacidade por ferry          | 50 veículos                | `ferryCapacity`                          |
| Frequência referência         | 60 min                     | `departureFrequency` (não força partida) |
| Operação                      | 06:00–22:00                | `operationStart`/`operationEnd`          |
| Chegadas diárias              | 1200                       | `dailyArrivals`                          |
| Horários de pico              | 7–9 / 17–19                | `peakHours`                              |
| % chegadas no pico            | 40%                        | `peakPercentage`                         |
| Composição frota              | 80% carros / 20% caminhões | `carPercentage`                          |
| Tempo embarque por veículo    | 0.25 min (~15s)            | Interpretado (ver Assunções)             |
| Tempo travessia               | 80 min                     | `crossingTime`                           |
| Tempo desembarque por veículo | 0.25 min (~15s)            | `disembarkTimePerVehicle`                |
| Espera média fila normal      | 20 min                     | Métrica alvo (não hard-coded)            |
| Espera média fila pico        | 90 min                     | Métrica alvo                             |

### Assunções Importantes

1. Tempo de embarque/desembarque informado como “15 minutos” foi tratado como 15 segundos (0.25 min) para manter viabilidade operacional. Ajuste para `15` se deseja simular condição extrema.
2. Partida do ferry ocorre ao atingir ≥70% da capacidade carregada (heurística simples). Pode ser refinado para obedecer janelas fixas de 60 min.
3. Tempos médios de espera (20 / 90 min) são usados para comparação indireta; não são forçados no algoritmo.
4. Manutenção e falhas continuam probabilísticas conforme implementação original.

### Escala de Velocidade (Aceleração)

Você pode alternar entre 1x, 2x, 5x, 10x. A engine recebe `timeScale` e avança o relógio interno multiplicando o delta lógico, mantendo a fidelidade dos tempos de processo.

### Como Rodar

```sh
npm install
npm run dev
```

Ajuste parâmetros no painel lateral ou use cenários pré-definidos.

### Extensões Futuras Sugeridas

- Implementar partida forçada em intervalos exatos (cron) além do critério de 70%.
- Introduzir modelo de fila M/M/c analítico para comparação de métricas simuladas.
- Armazenar histórico de eventos (embarques, partidas) para exportação.

### Tecnologias

Vite • TypeScript • React • shadcn-ui • Tailwind CSS • Radix UI • React Query

### Licença

Uso interno educacional/demonstração. Ajuste conforme necessidade.
