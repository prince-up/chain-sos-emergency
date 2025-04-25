# ChainSOS - Instant Onchain Emergency Help Network

ChainSOS is a decentralized emergency response system built on Base that connects people in need with verified responders through blockchain technology.

## Features

- 🚨 One-Tap SOS Alerts
- 🗺️ Real-Time Location Sharing
- 🔐 Verified Responders
- ⛓️ Onchain Activity Logging
- 🏅 Responder Rewards System
- 🌍 Interactive Emergency Map

## Tech Stack

- **Frontend**: Next.js, TailwindCSS
- **Blockchain**: Base (Ethereum L2)
- **Wallet Integration**: WalletConnect
- **Maps**: Mapbox
- **Backend**: Supabase
- **Smart Contracts**: Solidity

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Web3 wallet (MetaMask, etc.)
- [WalletConnect](https://cloud.walletconnect.com/) Project ID
- [Mapbox](https://www.mapbox.com/) Access Token

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_CHAINSOS_ADDRESS=0x0000000000000000000000000000000000000000
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chainsos.git
   cd chainsos
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 