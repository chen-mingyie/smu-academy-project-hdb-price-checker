# Singapore HDB Resale Flat Price Tracker

An interactive web application for tracking and analyzing Singapore Housing & Development Board (HDB) resale flat transactions, powered by the official **Data.gov.sg** datastore API.

Developed as a project for SMU Academy.

---

## Features

- **Estate Town & Flat Type Filtering**:
  - Filter across all 26 official Singapore HDB towns grouped by region (Central, East, North, North-East, West) or islandwide.
  - Filter by flat types: 1 Room, 2 Room, 3 Room, 4 Room, 5 Room, Executive, and Multi-Generation.
  - Search by block or street name.

- **5 Most Recent Transactions**:
  - Highlighted 5 latest resale transactions with complete attributes:
    - Transacted Price (SGD)
    - Block & Street Name
    - Flat Model & Storey Range
    - Floor Area (sqm and sqft)
    - Remaining Lease (years & months) with a 99-year visual lease meter
    - Unit Rate ($/sqm and $/sqft)
    - Delta vs. cohort mean
  - Toggle between visual **Cards View** and compact **Table View**.
  - Click-to-inspect modal with complete transaction details.

- **Core Benchmark Statistics**:
  - **Mean (Average)** Resale Price
  - **Highest** Transacted Price
  - **Lowest** Transacted Price
  - **Median** Price & Spread
  - **Mean Unit Price** ($/sqm and $/sqft)
  - Color-coded **Price Distribution Spectrum**

- **Value-Added Analytics**:
  - **5-Transaction Attribute Comparison**: Side-by-side breakdown comparing flat models, remaining lease, floor area, and unit rates.
  - **Price Distribution Chart**: Interactive visualization showing individual sale prices relative to the cohort mean.
  - **HDB Mortgage & Affordability Estimator**: Calculates estimated monthly loan installments (HDB 2.6% vs. Bank 3.0%) and progressive IRAS Buyer's Stamp Duty (BSD).
  - **Developer API & Response Inspector**: View active `cURL` commands and inspect the raw Data.gov.sg JSON payload with 1-click copy buttons.

---

## Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js & Express (`/api/hdb` proxying Data.gov.sg with data normalization, stats computation, and fallback cache)
- **Tooling**: Vite 8, tsx
- **Data Source**: Data.gov.sg Datastore Search API (`resource_id=d_8b84c4ee58e3cfc0ece0d773c8ca6abc`)

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun

### Installation

```bash
npm install
```

### Development

Run both the Express API and Vite frontend server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## API Reference

### `GET /api/hdb`

Query parameters:
- `town`: (e.g. `TAMPINES`, optional)
- `flat_type`: (e.g. `4 ROOM`, optional)
- `limit`: (e.g. `5` or `100`, optional, default `100`)
- `sort`: (e.g. `month desc`, optional)

Example cURL:

```bash
curl -G "http://localhost:3000/api/hdb" \
  --data-urlencode "town=TAMPINES" \
  --data-urlencode "flat_type=4 ROOM" \
  --data-urlencode "limit=5"
```
