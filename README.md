# 🚀 OrbitX

> **Connect Freely. Share Decentrally.**

A modern, premium decentralized social media platform built on **Base Sepolia** — where profiles, posts, likes, and follows live on-chain, and content is stored on IPFS.

> 📚 **Blockchain Technology Course Project**  
> This project was developed as part of a Blockchain Technology course, demonstrating end-to-end dApp development with smart contracts, frontend integration, decentralized storage, and testnet deployment.

---

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Foundry-FF3E00?style=for-the-badge&logo=foundry&logoColor=white" alt="Foundry" />
  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
  <img src="https://img.shields.io/badge/Wagmi-000000?style=for-the-badge&logo=wagmi&logoColor=white" alt="Wagmi" />
  <img src="https://img.shields.io/badge/RainbowKit-000000?style=for-the-badge&logo=rainbowkit&logoColor=white" alt="RainbowKit" />
  <img src="https://img.shields.io/badge/Base%20Sepolia-0052FF?style=for-the-badge&logo=base&logoColor=white" alt="Base Sepolia" />
  <img src="https://img.shields.io/badge/IPFS-65C2CB?style=for-the-badge&logo=ipfs&logoColor=white" alt="IPFS" />
</p>

---

## 📖 Overview

**OrbitX** is a decentralized social media platform that reimagines social networking on the blockchain. Unlike traditional social platforms where user data is controlled by centralized corporations, OrbitX puts ownership back in your hands:

- **Profiles, posts, likes, and follows** are recorded on-chain via smart contracts
- **Content (text, bios)** is stored on IPFS — immutable and censorship-resistant
- **Wallet-based identity** — your MetaMask address is your account
- **No ads, no tracking, no central authority**

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User (MetaMask)                          │
└──────────────────┬──────────────────────────────────────────────┘
                   │ Sign transactions
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (OrbitX)                    │
│  • React hooks (useSocial)  • IPFS gateway  • X-inspired UI    │
└──────────────────┬──────────────────────────────────────────────┘
                   │ Read events / Write calls
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Base Sepolia Testnet                         │
│              Social.sol Smart Contract                          │
│  • Profiles  • Posts  • Likes  • Follows                        │
└──────────────────┬──────────────────────────────────────────────┘
                   │ Content CIDs
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                         IPFS                                    │
│              Post text  •  User bios                            │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
decentralised-social-media/
├── packages/
│   ├── foundry/                          # Smart contracts (Foundry)
│   │   ├── contracts/
│   │   │   ├── Social.sol                # Core social contract (v2)
│   │   │   └── YourContract.sol
│   │   ├── script/
│   │   │   ├── Deploy.s.sol
│   │   │   └── DeploySocial.s.sol
│   │   ├── deployments/                  # Deployment artifacts
│   │   └── foundry.toml
│   └── nextjs/                           # Frontend (Next.js App Router)
│       ├── app/
│       │   ├── page.tsx                  # OrbitX main UI
│       │   ├── layout.tsx
│       │   └── api/upload/route.ts       # IPFS pinning endpoint
│       ├── components/
│       │   ├── social/
│       │   │   └── ui.tsx                # X-inspired components
│       │   └── ThemeProvider.tsx
│       ├── hooks/
│       │   └── useSocial.ts              # Social state hook
│       ├── contracts/
│       │   └── deployedContracts.ts      # Auto-generated ABI
│       └── scaffold.config.ts
├── documentation/                        # Course project docs & screenshots
├── .gitignore
├── README.md
└── AGENTS.md
```

## 🛠️ Smart Contract (`Social.sol`)

| Function | Purpose |
|----------|---------|
| `setProfile(handle, metadataCID)` | Register/update on-chain handle + bio |
| `post(contentCID, replyTo)` | Create a post (replyTo=0 = top-level) |
| `follow(user)` / `unfollow(user)` | Social graph edges |
| `like(postId)` / `unlike(postId)` | Like state, enforced on-chain |

### Key Design Decisions
- **Post IDs start at 1** — `replyTo = 0` unambiguously means "not a reply"
- **Storage vs Events** — Minimal data stored on-chain (addresses, CIDs, bools); heavy content (text) lives on IPFS
- **On-chain enforcement** — Users cannot like or follow twice (storage-backed, not event-only)

## 🎨 Frontend Features

- **X-inspired dark premium UI** — Black theme with blue accents, rounded cards, backdrop blur
- **Real-time feed** — Polls contract events every 6 seconds
- **Optimistic updates** — Like/follow states update instantly before confirmation
- **IPFS content loading** — Fetches post text/bios via multiple gateways
- **Who to follow** — Suggestions sorted by follower count
- **Threaded replies** — Navigate post threads with back navigation
- **Mobile responsive** — Bottom nav and collapsible sidebar

## 🚀 Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Yarn](https://yarnpkg.com/) (v4)
- [Git](https://git-scm.com/)
- [MetaMask](https://metamask.io/) wallet

### 1. Clone the repository

```bash
git clone https://github.com/Tanvir-7793/Decentralized-Social-Media-Platform-.git
cd decentralised-social-media
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Start local chain (optional, for local testing)

```bash
# Terminal 1
yarn chain
```

### 4. Deploy contracts

```bash
# Terminal 2
yarn deploy --network baseSepolia
```

### 5. Start the frontend

```bash
# Terminal 3
cd packages/nextjs
yarn start
```

Visit `http://localhost:3000` and connect MetaMask on **Base Sepolia**.

## 🧪 How to Use OrbitX

1. **Connect Wallet** — Click the connect button in the header
2. **Create Profile** — Choose a handle (3–20 chars) and optional bio
3. **Publish Post** — Share what's happening (text pinned to IPFS)
4. **Engage** — Like posts, follow users, write replies
5. **Explore** — Browse the "For you" feed or "Following" tab

## 📊 Course Project Documentation

This project was completed as a **Blockchain Technology course project**. Detailed documentation and output screenshots are available in the `documentation/` folder:

```
documentation/
├── screenshots/          # Output screenshots from the project
├── reports/              # Word documents & project reports
└── diagrams/             # Architecture & workflow diagrams
```

### Screenshots included:
- Home feed view
- Profile page
- Post detail & thread
- MetaMask connection flow
- Blockchain explorer verification (BaseScan)

## 🌐 Live Demo

Deployed on **Vercel**: https://decentralized-social-media-platform-rho.vercel.app/

Connect your MetaMask wallet on **Base Sepolia** and start using OrbitX!

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Base Sepolia (Ethereum L2 Testnet) |
| Smart Contracts | Solidity ^0.8.20, Foundry |
| Frontend | Next.js 16 (App Router), TypeScript |
| Wallet | MetaMask, RainbowKit, Wagmi |
| Styling | Tailwind CSS, DaisyUI |
| Storage | IPFS (Infura/Pinata gateways) |
| Deployment | Vercel |

## 🤝 Contributing

This is a course project, but contributions and feedback are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>OrbitX</strong> — Connect Freely. Share Decentrally.<br>
  Built with ❤️ for the Blockchain Technology course
</p>
