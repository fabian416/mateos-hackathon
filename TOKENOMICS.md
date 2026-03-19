# $MATEOS Tokenomics

> Token del protocolo MateOS — Zero Human Factory

---

## Token Overview

| Parameter | Value |
|---|---|
| **Name** | $MATEOS |
| **Chain** | Base (Ethereum L2) |
| **Supply** | 100,000,000,000 (fixed, no minting) |
| **Launch Platform** | Bankr |
| **Pool** | Uniswap V4 on Base |
| **Swap Fee** | 1.2% per trade |

---

## Revenue Distribution (del 1.2% swap fee)

Cada vez que alguien compra o vende $MATEOS, se cobra 1.2%. Ese fee se distribuye:

| Recipient | % del Fee | Para qué |
|---|---|---|
| **MateOS Treasury** | 57% | Operaciones, LLM compute, growth (configurable via fee redirect) |
| **Bankr** | 36.1% | Platform fee |
| **Bankr Ecosystem** | 1.9% | Ecosystem fund |
| **Protocol (Doppler)** | 5% | Infrastructure |

### Uso del 57% del Treasury

El 57% que recibe MateOS se redistribuye internamente así:

| Allocation | % del Treasury (57%) | Destino |
|---|---|---|
| **LLM Compute** | 40% | Pagar inference de agentes via Bankr LLM Gateway |
| **Agent Operations** | 30% | Gas fees, attestations onchain, infraestructura |
| **LenClaw Vault Bootstrap** | 20% | Seed liquidity para nuevos vaults de squads |
| **Team** | 10% | Desarrollo y mantenimiento |

---

## Utilidad del Token

### 1. Acceso al protocolo
- Staking de $MATEOS para acceder a vaults de LenClaw como backer
- Holders de $MATEOS tienen prioridad en vaults de squads con mejor performance

### 2. Pago de inference
- Los agentes de MateOS pagan LLM calls via Bankr Gateway
- El treasury usa fees de $MATEOS para fondear el compute de los agentes
- "The agents fund their own inference from trading fees"

### 3. Governance (futuro)
- Votación sobre parámetros del protocolo
- Aprobación de nuevos squads
- Ajustes de credit scoring en LenClaw

---

## Flywheel

```
Más PyMEs usan MateOS
    ↓
Más squads operando → más revenue → más attestations
    ↓
Mejor credit scoring → más crédito via LenClaw
    ↓
Squads escalan → generan más revenue
    ↓
Revenue compra $MATEOS para pagar LLM inference
    ↓
Buy pressure → precio sube → más atención
    ↓
Más PyMEs se registran
    ↓
(ciclo se repite)
```

---

## Comparación con modelos existentes

| Aspecto | ClawPump ($CLAW) | MateOS ($MATEOS) |
|---|---|---|
| **Chain** | Solana | Base |
| **Respaldo** | Trading fees de token launches | Revenue real de PyMEs |
| **Revenue source** | Speculation (trading) | Operación de negocios reales |
| **Fee to creator** | 65% | 57% (Bankr standard) |
| **Vesting** | Sí (4 años, 1 año cliff) | No (Bankr no lo soporta) |
| **Agentes** | Trading bots, snipers | Workforce operativa (soporte, ventas, billing) |

### Diferencial clave

$CLAW está respaldado por actividad especulativa (token launches, trading). $MATEOS está respaldado por **actividad económica real**: PyMEs que pagan $280/mes por agentes que operan sus negocios. El revenue no depende de que la gente tradee — depende de que las pizzerías atiendan clientes.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Baja liquidez inicial | Gas sponsoreado por Bankr + fee revenue atrae liquidity |
| No hay vesting (team puede dumpear) | Compromiso público: team no vende en los primeros 6 meses. Fee redirect a treasury, no a wallets personales. |
| Token sin utility si MateOS no crece | El token es complementario, no esencial. MateOS funciona sin él. El token amplifica, no sostiene. |
| Regulatorio (¿es un security?) | No hay pre-sale, no hay VC allocation, no hay promesa de retorno. Es un utility token lanzado en fair launch. |

---

## Notas

- Este documento describe la intención de distribución. Bankr no permite configurar vesting o allocations a nivel de smart contract — la distribución del treasury es un compromiso operativo del equipo.
- El token se lanza como parte del hackathon Synthesis (marzo 2026) para demostrar el flywheel MateOS + LenClaw.
- Post-hackathon se evaluará si consolidar en un solo token o mantener $MATEOS separado de cualquier token de LenClaw.
