# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Device Buy/Sell update
Purchase records and sales records are linked by the purchased device ID. Selling an in-stock purchase preserves the original purchase record, creates a separate sales record, and records purchase price, sale price, profit, purchase date, sale date, seller, and buyer.


## Genuine Fix V4 shop controls
- Accurate Nepal/local browser date and time with dynamic Good morning/afternoon/evening/night greeting.
- Device purchase supports multiple IMEI/Serial entries and optional seller citizenship number/photo.
- Device purchase bill and parts purchase bill generation from purchase history.
- Device sales remain linked to the original purchase; sale restore returns the device to In Stock and removes the linked sale bill.
- Parts/accessory sales validate available stock and deduct sold quantities automatically.
- Party/supplier-wise expense totals are shown separately for easier हिसाब.
- One-time integrity repair restores legacy purchase records marked Sold when no linked sale exists.

> Privacy: citizenship photos are stored in the browser's local storage as part of app data/backups. Protect backups and browser access because citizenship images are sensitive.
