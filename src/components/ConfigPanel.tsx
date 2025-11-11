import { Settings, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { SimulationConfig } from "@/types/simulation";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DEFAULT_CONFIG } from "@/lib/simulationEngine";

interface ConfigPanelProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
}

export function ConfigPanel({ config, onConfigChange }: ConfigPanelProps) {
  const updateConfig = (key: keyof SimulationConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  const applyPreset = (preset: SimulationConfig) => {
    onConfigChange(preset);
  };

  const collapsePreset: SimulationConfig = {
    ferryCount: 2,
    ferryCapacity: 40,
    departureFrequency: 60,
    operationStart: 6,
    operationEnd: 22,
    dailyArrivals: 2400,
    peakHours: [
      [7, 9],
      [17, 19],
    ],
    peakPercentage: 0.5,
    carPercentage: 0.8,
    embarkTimePerVehicle: 0.8,
    crossingTime: 100,
    disembarkTimePerVehicle: 0.8,
    maintenanceInterval: 30,
    maintenanceDuration: 240,
    downtimeProbability: 0.15,
  };

  const intermediatePreset: SimulationConfig = {
    ferryCount: 3,
    ferryCapacity: 50,
    departureFrequency: 60,
    operationStart: 6,
    operationEnd: 22,
    dailyArrivals: 1800,
    peakHours: [
      [7, 9],
      [17, 19],
    ],
    peakPercentage: 0.4,
    carPercentage: 0.8,
    embarkTimePerVehicle: 0.4,
    crossingTime: 80,
    disembarkTimePerVehicle: 0.4,
    maintenanceInterval: 30,
    maintenanceDuration: 240,
    downtimeProbability: 0.05,
  };

  const optimalPreset: SimulationConfig = {
    ferryCount: 5,
    ferryCapacity: 60,
    departureFrequency: 60,
    operationStart: 6,
    operationEnd: 22,
    dailyArrivals: 1200,
    peakHours: [
      [7, 9],
      [17, 19],
    ],
    peakPercentage: 0.3,
    carPercentage: 0.8,
    embarkTimePerVehicle: 0.2,
    crossingTime: 60,
    disembarkTimePerVehicle: 0.2,
    maintenanceInterval: 30,
    maintenanceDuration: 0,
    downtimeProbability: 0.0,
  };

  return (
    <Card className="p-6 space-y-6 bg-card border-2 border-primary/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Configurações</h3>
        </div>
      </div>

      <Separator className="bg-primary/20" />

      {/* Units notice */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Info className="w-4 h-4 text-primary mt-0.5" />
        <div className="text-xs text-muted-foreground">
          Todas as entradas de tempo estão em minutos. Para valores em segundos,
          use frações (ex.: 15s = 0.25 min). Os controles de velocidade (1x, 2x,
          5x, 10x) ficam no painel de controle acima.
        </div>
      </div>

      {/* Help Section */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                Como gerar o problema
              </p>
              <HelpTooltip
                title="Criando Congestionamento"
                content="Para gerar filas longas: reduza o número de ferries (1-2), aumente a taxa de chegada no pico (2-3 veículos/min), adicione manutenção frequente e aumente o tempo de embarque (0.5-1 min/veículo). Isso simula má gestão operacional."
              />
            </div>
            <p className="text-xs text-muted-foreground">
              ↓ Ferries ativos • ↑ Chegadas no pico • ↑ Tempo embarque
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                Como resolver o problema
              </p>
              <HelpTooltip
                title="Resolvendo Congestionamento"
                content="Para eliminar filas: aumente ferries ativos (3-4), reduza tempo de embarque (<0.3 min/veículo) com melhor organização, diminua tempo de travessia com rotas otimizadas, e mantenha manutenção preventiva programada. Base: teoria de filas M/M/c."
              />
            </div>
            <p className="text-xs text-muted-foreground">
              ↑ Ferries ativos • ↓ Tempo embarque • ↓ Tempo travessia
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-primary/20" />

      {/* Preset Scenarios */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          Cenários Pré-Definidos
        </h4>
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={() => applyPreset(DEFAULT_CONFIG)}
            variant="secondary"
            size="sm"
            className="justify-start"
          >
            Dataset Oficial (Solicitado)
          </Button>
          <Button
            onClick={() => applyPreset(collapsePreset)}
            variant="destructive"
            size="sm"
            className="justify-start"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Cenário de Colapso
          </Button>
          <Button
            onClick={() => applyPreset(intermediatePreset)}
            variant="outline"
            size="sm"
            className="justify-start"
          >
            Cenário Intermediário
          </Button>
          <Button
            onClick={() => applyPreset(optimalPreset)}
            variant="default"
            size="sm"
            className="justify-start"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Cenário Otimizado
          </Button>
        </div>
      </div>

      <Separator className="bg-primary/20" />

      {/* Configuration Controls */}
      <div className="space-y-5">
        {/* Ferry Count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Ferries Ativos</Label>
            <span className="text-sm font-bold text-primary">
              {config.ferryCount}
            </span>
          </div>
          <Slider
            value={[config.ferryCount]}
            onValueChange={([value]) => updateConfig("ferryCount", value)}
            min={1}
            max={6}
            step={1}
            className="w-full"
          />
        </div>

        {/* Ferry Capacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Capacidade/Ferry</Label>
            <span className="text-sm font-bold text-primary">
              {config.ferryCapacity}
            </span>
          </div>
          <Slider
            value={[config.ferryCapacity]}
            onValueChange={([value]) => updateConfig("ferryCapacity", value)}
            min={30}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Embark Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Tempo Embarque</Label>
            <span className="text-xs font-medium text-muted-foreground">
              {config.embarkTimePerVehicle.toFixed(2)} min •{" "}
              {(config.embarkTimePerVehicle * 60).toFixed(0)} s
            </span>
          </div>
          <Slider
            value={[config.embarkTimePerVehicle * 100]}
            onValueChange={([value]) =>
              updateConfig("embarkTimePerVehicle", value / 100)
            }
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Disembark Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Tempo Desembarque</Label>
            <span className="text-xs font-medium text-muted-foreground">
              {config.disembarkTimePerVehicle.toFixed(2)} min •{" "}
              {(config.disembarkTimePerVehicle * 60).toFixed(0)} s
            </span>
          </div>
          <Slider
            value={[config.disembarkTimePerVehicle * 100]}
            onValueChange={([value]) =>
              updateConfig("disembarkTimePerVehicle", value / 100)
            }
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Crossing Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Tempo Travessia (min)</Label>
            <span className="text-sm font-bold text-primary">
              {config.crossingTime}
            </span>
          </div>
          <Slider
            value={[config.crossingTime]}
            onValueChange={([value]) => updateConfig("crossingTime", value)}
            min={40}
            max={120}
            step={5}
            className="w-full"
          />
        </div>

        {/* Daily Arrivals */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Chegadas Diárias</Label>
            <span className="text-sm font-bold text-primary">
              {config.dailyArrivals}
            </span>
          </div>
          <Slider
            value={[config.dailyArrivals]}
            onValueChange={([value]) => updateConfig("dailyArrivals", value)}
            min={600}
            max={2400}
            step={100}
            className="w-full"
          />
        </div>

        {/* Peak Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">% Chegadas no Pico</Label>
            <span className="text-sm font-bold text-primary">
              {(config.peakPercentage * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[config.peakPercentage * 100]}
            onValueChange={([value]) =>
              updateConfig("peakPercentage", value / 100)
            }
            min={20}
            max={60}
            step={5}
            className="w-full"
          />
        </div>

        <Separator className="bg-primary/20" />

        {/* Maintenance Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Manutenção Programada</Label>
            <p className="text-xs text-muted-foreground">
              A cada 30 dias, 4h de duração
            </p>
          </div>
          <Switch
            checked={config.maintenanceDuration > 0}
            onCheckedChange={(checked) =>
              updateConfig("maintenanceDuration", checked ? 240 : 0)
            }
          />
        </div>

        {/* Downtime Probability */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Falha Não Programada (%)
            </Label>
            <span className="text-sm font-bold text-primary">
              {(config.downtimeProbability * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[config.downtimeProbability * 100]}
            onValueChange={([value]) =>
              updateConfig("downtimeProbability", value / 100)
            }
            min={0}
            max={20}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
}
